"use client";

import { useMemo, useState } from "react";
import { getDemoEvents } from "@/lib/data-source";
import {
  summarize,
  timeSeries,
  topEvents,
  funnel,
  retention,
} from "@/lib/analytics";
import { FUNNEL_STEPS } from "@/lib/mock-data";
import { KpiCards } from "./KpiCards";
import { TimeSeriesChart } from "./TimeSeriesChart";
import { TopEventsCard } from "./TopEventsCard";
import { FunnelChart } from "./FunnelChart";
import { RetentionHeatmap } from "./RetentionHeatmap";

export default function Dashboard() {
  const events = useMemo(() => getDemoEvents(), []);
  const [seriesEvent, setSeriesEvent] = useState<string>("__all__");

  const eventNames = useMemo(() => {
    const s = new Set(events.map((e) => e.name));
    return ["__all__", ...[...s].sort()];
  }, [events]);

  const summary = useMemo(() => summarize(events), [events]);
  const series = useMemo(
    () =>
      timeSeries(events, {
        eventName: seriesEvent === "__all__" ? undefined : seriesEvent,
      }),
    [events, seriesEvent]
  );
  const top = useMemo(() => topEvents(events, 8), [events]);
  const funnelData = useMemo(() => funnel(events, FUNNEL_STEPS), [events]);
  const retentionData = useMemo(() => retention(events, 7), [events]);

  return (
    <div className="grid" style={{ gap: 18, paddingTop: 6 }}>
      <KpiCards summary={summary} />

      <div className="card">
        <div className="card-title">
          <span>Events over time</span>
          <div className="controls">
            <select
              value={seriesEvent}
              onChange={(e) => setSeriesEvent(e.target.value)}
              aria-label="Filter time series by event"
            >
              {eventNames.map((n) => (
                <option key={n} value={n}>
                  {n === "__all__" ? "All events" : n}
                </option>
              ))}
            </select>
          </div>
        </div>
        <TimeSeriesChart data={series} />
      </div>

      <div className="grid two-col">
        <div className="card">
          <div className="card-title">Conversion funnel</div>
          <FunnelChart data={funnelData} />
        </div>
        <TopEventsCard data={top} />
      </div>

      <div className="card">
        <div className="card-title">Weekly retention by cohort (first-seen day)</div>
        <RetentionHeatmap data={retentionData} />
      </div>
    </div>
  );
}
