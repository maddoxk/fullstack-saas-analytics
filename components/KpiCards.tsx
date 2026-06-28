import type { DashboardSummary } from "@/lib/types";

function fmt(n: number): string {
  return n.toLocaleString("en-US");
}

export function KpiCards({ summary }: { summary: DashboardSummary }) {
  const cards = [
    { label: "Total events", value: fmt(summary.totalEvents), sub: "across the dataset" },
    { label: "Unique users", value: fmt(summary.uniqueUsers), sub: "distinct user ids" },
    { label: "Events today", value: fmt(summary.eventsToday), sub: "current UTC day" },
    { label: "Avg events / user", value: summary.avgEventsPerUser.toFixed(2), sub: "engagement depth" },
  ];
  return (
    <div className="grid kpis">
      {cards.map((c) => (
        <div className="card" key={c.label}>
          <h3>{c.label}</h3>
          <div className="big">{c.value}</div>
          <div className="sub">{c.sub}</div>
        </div>
      ))}
    </div>
  );
}
