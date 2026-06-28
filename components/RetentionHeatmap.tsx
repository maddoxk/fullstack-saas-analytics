import type { RetentionRow } from "@/lib/types";

function heatColor(v: number): string {
  // 0 -> dark, 1 -> indigo/cyan
  if (v <= 0) return "#161b27";
  const alpha = 0.12 + v * 0.85;
  return `rgba(99, 102, 241, ${alpha.toFixed(3)})`;
}

export function RetentionHeatmap({ data }: { data: RetentionRow[] }) {
  // Show the most recent ~14 cohorts that have a meaningful size.
  const rows = data.filter((r) => r.cohortSize >= 3).slice(-14);
  const dayCount = rows[0]?.values.length ?? 7;

  return (
    <div style={{ overflowX: "auto" }}>
      <table>
        <thead>
          <tr>
            <th>Cohort</th>
            <th className="num">Users</th>
            {Array.from({ length: dayCount }, (_, i) => (
              <th key={i} className="num">
                D{i}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.cohort}>
              <td>{r.cohort}</td>
              <td className="num">{r.cohortSize}</td>
              {r.values.map((v, i) => (
                <td key={i} className="num">
                  <span
                    className="heat"
                    style={{
                      background: heatColor(v),
                      color: v > 0.5 ? "#fff" : "var(--muted)",
                    }}
                  >
                    {Math.round(v * 100)}%
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="sub" style={{ marginTop: 10 }}>
        Each cell shows the % of a cohort active on day N after their first
        visit. D0 is always 100%.
      </div>
    </div>
  );
}
