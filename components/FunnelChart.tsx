"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  LabelList,
} from "recharts";
import type { FunnelStep } from "@/lib/types";

const COLORS = ["#6366f1", "#7c6cf0", "#9466ee", "#22d3ee", "#34d399"];

export function FunnelChart({ data }: { data: FunnelStep[] }) {
  const chartData = data.map((s, i) => ({
    ...s,
    label: s.name,
    pct: Math.round(s.conversionFromStart * 100),
    color: COLORS[i % COLORS.length],
  }));

  return (
    <>
      <div style={{ width: "100%", height: 230 }}>
        <ResponsiveContainer>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 4, right: 40, left: 8, bottom: 0 }}
          >
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="label"
              tick={{ fill: "#c3cad8", fontSize: 12 }}
              width={130}
            />
            <Tooltip
              cursor={{ fill: "rgba(99,102,241,0.08)" }}
              contentStyle={{
                background: "#131722",
                border: "1px solid #232a3a",
                borderRadius: 8,
                color: "#e6e9ef",
              }}
              formatter={(v: number, _n, p: any) => [
                `${v.toLocaleString("en-US")} users (${p.payload.pct}% of start)`,
                "Reached",
              ]}
            />
            <Bar dataKey="users" radius={[0, 6, 6, 0]}>
              {chartData.map((d, i) => (
                <Cell key={i} fill={d.color} />
              ))}
              <LabelList
                dataKey="pct"
                position="right"
                formatter={(v: number) => `${v}%`}
                style={{ fill: "#8b95a8", fontSize: 12 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="sub" style={{ marginTop: 8 }}>
        Overall conversion (first → last step):{" "}
        <strong style={{ color: "var(--green)" }}>
          {(data[data.length - 1]?.conversionFromStart * 100 || 0).toFixed(1)}%
        </strong>
      </div>
    </>
  );
}
