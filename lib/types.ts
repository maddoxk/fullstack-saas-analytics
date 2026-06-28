// Shared analytics domain types used by both the server (API/Prisma) path
// and the static client-side demo path.

export interface AnalyticsEvent {
  id: string;
  /** event name, e.g. "pageview", "signup_started", "checkout_completed" */
  name: string;
  /** anonymous or identified user id */
  userId: string;
  /** ISO 8601 timestamp */
  timestamp: string;
  /** arbitrary key/value properties */
  properties?: Record<string, string | number | boolean>;
}

export interface TimeSeriesPoint {
  date: string; // YYYY-MM-DD
  count: number;
  uniqueUsers: number;
}

export interface TopEvent {
  name: string;
  count: number;
  uniqueUsers: number;
  share: number; // 0..1 share of total events
}

export interface FunnelStep {
  name: string;
  users: number;
  conversionFromPrev: number; // 0..1
  conversionFromStart: number; // 0..1
}

export interface RetentionRow {
  cohort: string; // YYYY-MM-DD cohort (first-seen day)
  cohortSize: number;
  values: number[]; // retention fraction per day offset (index 0 == day 0)
}

export interface DashboardSummary {
  totalEvents: number;
  uniqueUsers: number;
  eventsToday: number;
  avgEventsPerUser: number;
}
