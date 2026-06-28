// Pure analytics aggregation functions.
// These are framework-agnostic and fully unit-tested (see __tests__/analytics.test.ts).
// They operate on an in-memory array of events; on the server the events come from
// Prisma/Postgres, in the static demo they come from a bundled JSON dataset.

import type {
  AnalyticsEvent,
  TimeSeriesPoint,
  TopEvent,
  FunnelStep,
  RetentionRow,
  DashboardSummary,
} from './types';

const DAY_MS = 24 * 60 * 60 * 1000;

export function dayKey(ts: string | number | Date): string {
  const d = new Date(ts);
  return d.toISOString().slice(0, 10);
}

/** Total events, unique users, events today, avg events/user. */
export function summarize(events: AnalyticsEvent[], today?: string): DashboardSummary {
  const users = new Set<string>();
  const todayKey = today ?? dayKey(new Date());
  let eventsToday = 0;
  for (const e of events) {
    users.add(e.userId);
    if (dayKey(e.timestamp) === todayKey) eventsToday++;
  }
  const uniqueUsers = users.size;
  return {
    totalEvents: events.length,
    uniqueUsers,
    eventsToday,
    avgEventsPerUser: uniqueUsers === 0 ? 0 : round(events.length / uniqueUsers, 2),
  };
}

/** Daily time-series of event count + unique users between two dates (inclusive). */
export function timeSeries(
  events: AnalyticsEvent[],
  opts?: { eventName?: string; from?: string; to?: string }
): TimeSeriesPoint[] {
  const filtered = opts?.eventName
    ? events.filter((e) => e.name === opts.eventName)
    : events;

  const byDay = new Map<string, { count: number; users: Set<string> }>();
  for (const e of filtered) {
    const k = dayKey(e.timestamp);
    if (opts?.from && k < opts.from) continue;
    if (opts?.to && k > opts.to) continue;
    let bucket = byDay.get(k);
    if (!bucket) {
      bucket = { count: 0, users: new Set() };
      byDay.set(k, bucket);
    }
    bucket.count++;
    bucket.users.add(e.userId);
  }

  return [...byDay.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([date, b]) => ({ date, count: b.count, uniqueUsers: b.users.size }));
}

/** Top N events by count, with unique-user count and share of total. */
export function topEvents(events: AnalyticsEvent[], limit = 10): TopEvent[] {
  const map = new Map<string, { count: number; users: Set<string> }>();
  for (const e of events) {
    let bucket = map.get(e.name);
    if (!bucket) {
      bucket = { count: 0, users: new Set() };
      map.set(e.name, bucket);
    }
    bucket.count++;
    bucket.users.add(e.userId);
  }
  const total = events.length || 1;
  return [...map.entries()]
    .map(([name, b]) => ({
      name,
      count: b.count,
      uniqueUsers: b.users.size,
      share: round(b.count / total, 4),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Ordered-funnel analysis. A user converts a step if they performed that step
 * event AT OR AFTER the timestamp of their previous completed step.
 */
export function funnel(events: AnalyticsEvent[], steps: string[]): FunnelStep[] {
  // Group events per user, sorted by time.
  const byUser = new Map<string, AnalyticsEvent[]>();
  for (const e of events) {
    if (!steps.includes(e.name)) continue;
    let arr = byUser.get(e.userId);
    if (!arr) {
      arr = [];
      byUser.set(e.userId, arr);
    }
    arr.push(e);
  }
  for (const arr of byUser.values()) {
    arr.sort((a, b) => +new Date(a.timestamp) - +new Date(b.timestamp));
  }

  const stepUsers = new Array(steps.length).fill(0);
  for (const arr of byUser.values()) {
    let cursor = -Infinity;
    let stepIdx = 0;
    for (const e of arr) {
      if (stepIdx >= steps.length) break;
      if (e.name === steps[stepIdx] && +new Date(e.timestamp) >= cursor) {
        stepUsers[stepIdx]++;
        cursor = +new Date(e.timestamp);
        stepIdx++;
      }
    }
  }

  const start = stepUsers[0] || 1;
  return steps.map((name, i) => ({
    name,
    users: stepUsers[i],
    conversionFromPrev:
      i === 0 ? 1 : round(stepUsers[i] / (stepUsers[i - 1] || 1), 4),
    conversionFromStart: round(stepUsers[i] / start, 4),
  }));
}

/**
 * Day-by-day retention. Cohort = the day a user was first seen. values[k] is the
 * fraction of the cohort that returned (had any event) on cohort-day + k.
 */
export function retention(events: AnalyticsEvent[], maxDays = 7): RetentionRow[] {
  // First-seen day per user + the set of active days per user.
  const firstSeen = new Map<string, number>();
  const activeDays = new Map<string, Set<string>>();
  for (const e of events) {
    const t = +new Date(e.timestamp);
    const prev = firstSeen.get(e.userId);
    if (prev === undefined || t < prev) firstSeen.set(e.userId, t);
    let s = activeDays.get(e.userId);
    if (!s) {
      s = new Set();
      activeDays.set(e.userId, s);
    }
    s.add(dayKey(e.timestamp));
  }

  // Bucket users into cohorts by first-seen day.
  const cohorts = new Map<string, string[]>();
  for (const [userId, t] of firstSeen) {
    const c = dayKey(t);
    let arr = cohorts.get(c);
    if (!arr) {
      arr = [];
      cohorts.set(c, arr);
    }
    arr.push(userId);
  }

  return [...cohorts.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([cohort, userIds]) => {
      const cohortStart = +new Date(cohort + "T00:00:00.000Z");
      const values: number[] = [];
      for (let k = 0; k < maxDays; k++) {
        const targetDay = dayKey(cohortStart + k * DAY_MS);
        let returned = 0;
        for (const uid of userIds) {
          if (activeDays.get(uid)?.has(targetDay)) returned++;
        }
        values.push(round(returned / userIds.length, 4));
      }
      return { cohort, cohortSize: userIds.length, values };
    });
}

function round(n: number, places: number): number {
  const f = Math.pow(10, places);
  return Math.round(n * f) / f;
}
