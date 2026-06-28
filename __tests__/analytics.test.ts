import { describe, it, expect } from 'vitest';
import {
  summarize,
  timeSeries,
  topEvents,
  funnel,
  retention,
  dayKey,
} from '../lib/analytics';
import type { AnalyticsEvent } from '../lib/types';

function ev(
  name: string,
  userId: string,
  timestamp: string,
  id = `${name}-${userId}-${timestamp}`
): AnalyticsEvent {
  return { id, name, userId, timestamp };
}

const sample: AnalyticsEvent[] = [
  ev('pageview', 'u1', '2026-01-01T10:00:00.000Z'),
  ev('signup', 'u1', '2026-01-01T10:05:00.000Z'),
  ev('pageview', 'u2', '2026-01-01T11:00:00.000Z'),
  ev('pageview', 'u1', '2026-01-02T09:00:00.000Z'),
  ev('checkout', 'u1', '2026-01-02T09:10:00.000Z'),
  ev('pageview', 'u3', '2026-01-03T12:00:00.000Z'),
];

describe('dayKey', () => {
  it('extracts the UTC day', () => {
    expect(dayKey('2026-01-01T23:59:00.000Z')).toBe('2026-01-01');
  });
});

describe('summarize', () => {
  it('counts totals, unique users and avg', () => {
    const s = summarize(sample, '2026-01-03');
    expect(s.totalEvents).toBe(6);
    expect(s.uniqueUsers).toBe(3);
    expect(s.eventsToday).toBe(1); // only u3 pageview on 2026-01-03
    expect(s.avgEventsPerUser).toBe(2); // 6 / 3
  });

  it('handles empty input', () => {
    const s = summarize([], '2026-01-01');
    expect(s.totalEvents).toBe(0);
    expect(s.uniqueUsers).toBe(0);
    expect(s.avgEventsPerUser).toBe(0);
  });
});

describe('timeSeries', () => {
  it('buckets events by day with unique users', () => {
    const ts = timeSeries(sample);
    expect(ts).toHaveLength(3);
    expect(ts[0]).toEqual({ date: '2026-01-01', count: 3, uniqueUsers: 2 });
    expect(ts[1]).toEqual({ date: '2026-01-02', count: 2, uniqueUsers: 1 });
  });

  it('filters by event name', () => {
    const ts = timeSeries(sample, { eventName: 'pageview' });
    const total = ts.reduce((a, b) => a + b.count, 0);
    expect(total).toBe(4);
  });

  it('respects from/to bounds', () => {
    const ts = timeSeries(sample, { from: '2026-01-02', to: '2026-01-02' });
    expect(ts).toHaveLength(1);
    expect(ts[0].date).toBe('2026-01-02');
  });
});

describe('topEvents', () => {
  it('ranks by count with share', () => {
    const top = topEvents(sample);
    expect(top[0].name).toBe('pageview');
    expect(top[0].count).toBe(4);
    expect(top[0].share).toBeCloseTo(4 / 6, 3);
    expect(top[0].uniqueUsers).toBe(3);
  });

  it('respects the limit', () => {
    expect(topEvents(sample, 1)).toHaveLength(1);
  });
});

describe('funnel', () => {
  it('computes ordered conversion', () => {
    const steps = ['pageview', 'signup', 'checkout'];
    const f = funnel(sample, steps);
    expect(f[0].users).toBe(3); // u1,u2,u3 had pageview
    expect(f[1].users).toBe(1); // only u1 signed up after pageview
    expect(f[2].users).toBe(1); // u1 checked out after signup
    expect(f[0].conversionFromStart).toBe(1);
    expect(f[1].conversionFromStart).toBeCloseTo(1 / 3, 3);
    expect(f[1].conversionFromPrev).toBeCloseTo(1 / 3, 3);
  });

  it('does not count out-of-order steps', () => {
    // user does checkout BEFORE signup -> should not convert step 2/3 in order
    const odd: AnalyticsEvent[] = [
      ev('pageview', 'x', '2026-02-01T10:00:00.000Z'),
      ev('checkout', 'x', '2026-02-01T10:01:00.000Z'),
      ev('signup', 'x', '2026-02-01T10:02:00.000Z'),
    ];
    const f = funnel(odd, ['pageview', 'signup', 'checkout']);
    expect(f[0].users).toBe(1);
    expect(f[1].users).toBe(1); // signup after pageview ok
    expect(f[2].users).toBe(0); // checkout happened before signup -> no convert
  });
});

describe('retention', () => {
  it('computes day-0 retention as 1 for every cohort', () => {
    const r = retention(sample, 3);
    for (const row of r) {
      expect(row.values[0]).toBe(1);
    }
  });

  it('tracks returning users', () => {
    // u1 first seen 2026-01-01, active again on 2026-01-02 (day 1)
    const r = retention(sample, 3);
    const cohort = r.find((c) => c.cohort === '2026-01-01');
    expect(cohort).toBeDefined();
    expect(cohort!.cohortSize).toBe(2); // u1, u2
    // day1: only u1 returned of the 2 -> 0.5
    expect(cohort!.values[1]).toBe(0.5);
  });
});
