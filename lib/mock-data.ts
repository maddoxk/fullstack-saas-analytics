// Deterministic realistic analytics event generator.
// Used by BOTH:
//   - prisma/seed.ts (to seed Postgres in full-stack mode)
//   - the bundled static demo dataset (so the GitHub Pages demo is fully
//     interactive with zero server)
import type { AnalyticsEvent } from "./types";

// Tiny seeded PRNG (mulberry32) so the dataset is reproducible.
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const FUNNEL_STEPS = [
  "pageview",
  "signup_started",
  "signup_completed",
  "checkout_started",
  "checkout_completed",
];

const OTHER_EVENTS = [
  "feature_used",
  "doc_viewed",
  "search_performed",
  "settings_changed",
  "invite_sent",
];

const PLANS = ["free", "pro", "enterprise"];
const COUNTRIES = ["US", "GB", "DE", "IN", "BR", "CA", "AU", "FR"];

export interface GenerateOptions {
  days?: number;
  users?: number;
  seed?: number;
  /** end date (defaults to "today" at build time) */
  endDate?: Date;
}

/**
 * Generate a realistic stream of analytics events with a believable funnel,
 * daily seasonality (weekday > weekend), new-user growth, and return visits
 * (so retention is non-trivial).
 */
export function generateEvents(opts: GenerateOptions = {}): AnalyticsEvent[] {
  const days = opts.days ?? 60;
  const userCount = opts.users ?? 1200;
  const rng = mulberry32(opts.seed ?? 42);
  const end = opts.endDate ?? new Date();
  const endUTC = Date.UTC(
    end.getUTCFullYear(),
    end.getUTCMonth(),
    end.getUTCDate()
  );
  const DAY = 24 * 60 * 60 * 1000;

  const events: AnalyticsEvent[] = [];
  let counter = 0;
  const id = () => `evt_${(counter++).toString(36)}`;

  // Assign each user a first-seen day (more users join later -> growth).
  const users = Array.from({ length: userCount }, (_, i) => {
    const joinBias = Math.pow(rng(), 0.6); // skew toward recent
    const firstDay = Math.floor(joinBias * (days - 1));
    return {
      userId: `user_${i.toString().padStart(4, "0")}`,
      firstDay,
      plan: PLANS[Math.floor(rng() * PLANS.length)],
      country: COUNTRIES[Math.floor(rng() * COUNTRIES.length)],
      stickiness: 0.15 + rng() * 0.6, // chance of returning on a later day
    };
  });

  for (const u of users) {
    for (let d = u.firstDay; d < days; d++) {
      // Will this user be active on day d?
      const active = d === u.firstDay || rng() < u.stickiness * weekdayFactor(endUTC - (days - 1 - d) * DAY);
      if (!active) continue;

      const dayStart = endUTC - (days - 1 - d) * DAY;
      const sessionStart = dayStart + Math.floor(rng() * DAY);
      let t = sessionStart;
      const props = { plan: u.plan, country: u.country } as Record<string, string>;

      const push = (name: string) => {
        t += Math.floor(rng() * 4 * 60 * 1000); // up to 4 min apart
        events.push({
          id: id(),
          name,
          userId: u.userId,
          timestamp: new Date(t).toISOString(),
          properties: { ...props },
        });
      };

      // Always a pageview.
      push("pageview");

      // Funnel progression with realistic drop-off — only on/after first day.
      if (rng() < 0.45) {
        push("signup_started");
        if (rng() < 0.7) {
          push("signup_completed");
          if (rng() < 0.5) {
            push("checkout_started");
            if (rng() < 0.6) push("checkout_completed");
          }
        }
      }

      // Some incidental product usage events.
      const extra = Math.floor(rng() * 4);
      for (let k = 0; k < extra; k++) {
        push(OTHER_EVENTS[Math.floor(rng() * OTHER_EVENTS.length)]);
      }
    }
  }

  events.sort((a, b) => +new Date(a.timestamp) - +new Date(b.timestamp));
  return events;
}

function weekdayFactor(ts: number): number {
  const dow = new Date(ts).getUTCDay(); // 0 Sun .. 6 Sat
  return dow === 0 || dow === 6 ? 0.6 : 1.0;
}
