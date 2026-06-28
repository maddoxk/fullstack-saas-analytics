// Client-safe data source. In the static demo (NEXT_PUBLIC_STATIC_DEMO=true)
// we generate the dataset in the browser from the deterministic generator, so
// the dashboard is fully interactive with no server. In full-stack mode the
// dashboard would instead call the /api/query endpoints (see app/api/*).
import { generateEvents } from "./mock-data";
import type { AnalyticsEvent } from "./types";

export const IS_STATIC_DEMO =
  process.env.NEXT_PUBLIC_STATIC_DEMO === "true";

let cache: AnalyticsEvent[] | null = null;

/** Returns the demo dataset (cached). Deterministic, ~60 days, ~1200 users. */
export function getDemoEvents(): AnalyticsEvent[] {
  if (cache) return cache;
  cache = generateEvents({ days: 60, users: 1200, seed: 42 });
  return cache;
}
