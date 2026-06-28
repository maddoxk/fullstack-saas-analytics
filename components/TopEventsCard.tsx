import type { TopEvent } from "@/lib/types";

export function TopEventsCard({ data }: { data: TopEvent[] }) {
  const max = data[0]?.count ?? 1;
  return (
    <div className="card">
      <div className="card-title">Top events</div>
      <table>
        <thead>
          <tr>
            <th>Event</th>
            <th className="num">Count</th>
            <th className="num">Users</th>
            <th style={{ width: "30%" }}>Share</th>
          </tr>
        </thead>
        <tbody>
          {data.map((e) => (
            <tr key={e.name}>
              <td><code>{e.name}</code></td>
              <td className="num">{e.count.toLocaleString("en-US")}</td>
              <td className="num">{e.uniqueUsers.toLocaleString("en-US")}</td>
              <td>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{ width: `${(e.count / max) * 100}%` }}
                  />
                </div>
                <div className="sub">{(e.share * 100).toFixed(1)}%</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
