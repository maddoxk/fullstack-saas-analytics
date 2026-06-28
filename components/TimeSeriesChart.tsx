"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import type { TimeSeriesPoint } from "@/lib/types";

export function TimeSeriesChart({ data }: { data: TimeSeriesPoint[] }) {
  return (
    <div style={{ width: "100%", height: 280 }}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 6, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gCount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity={0.7} />
              <stop offset="100%" stopColor="#6366f1" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="gUsers" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.6} />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#232a3a" />
          <XAxis
            dataKey="date"
            tick={{ fill: "#8b95a8", fontSize: 11 }}
            tickFormatter={(d) => String(d).slice(5)}
            minTickGap={24}
          />
          <YAxis tick={{ fill: "#8b95a8", fontSize: 11 }} width={44} />
          <Tooltip
            contentStyle={{
              background: "#131722",
              border: "1px solid #232a3a",
              borderRadius: 8,
              color: "#e6e9ef",
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: "#8b95a8" }} />
          <Area
            type="monotone"
            dataKey="count"
            name="Events"
            stroke="#6366f1"
            fill="url(#gCount)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="uniqueUsers"
            name="Unique users"
            stroke="#22d3ee"
            fill="url(#gUsers)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
