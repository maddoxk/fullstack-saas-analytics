import Link from "next/link";

export default function Home() {
  return (
    <>
      <div className="topbar">
        <div className="brand">
          <span className="dot" /> Insightly
          <span className="badge">product analytics</span>
        </div>
        <Link className="cta" href="/dashboard" style={{ padding: "8px 16px" }}>
          Open dashboard →
        </Link>
      </div>

      <div className="container">
        <section className="hero">
          <h1>Understand what your users actually do.</h1>
          <p>
            Insightly is a self-hostable product-analytics platform (a mini
            PostHog). Ingest events, then explore funnels, retention cohorts,
            time-series trends and your top events — all in one dashboard.
          </p>
          <Link className="cta" href="/dashboard">
            Explore the live demo →
          </Link>
          <p style={{ fontSize: 13, marginTop: 18 }}>
            The live demo runs entirely in your browser on a bundled, seeded
            dataset (~60 days, ~1,200 users). No server required.
          </p>
        </section>

        <section className="features">
          <div className="card">
            <div className="card-title">Event ingestion</div>
            <p style={{ color: "var(--muted)", fontSize: 14, margin: 0 }}>
              A typed <code>POST /api/events</code> endpoint backed by Prisma +
              Postgres, with per-project API keys.
            </p>
          </div>
          <div className="card">
            <div className="card-title">Funnels &amp; retention</div>
            <p style={{ color: "var(--muted)", fontSize: 14, margin: 0 }}>
              Ordered funnel conversion and day-by-day cohort retention computed
              by pure, unit-tested aggregation functions.
            </p>
          </div>
          <div className="card">
            <div className="card-title">Trends &amp; top events</div>
            <p style={{ color: "var(--muted)", fontSize: 14, margin: 0 }}>
              Interactive time-series of events and unique users, plus a ranked
              breakdown of your highest-volume events.
            </p>
          </div>
        </section>

        <div className="foot">
          Built with Next.js 14, TypeScript, Prisma, Postgres &amp; Recharts ·
          MIT © 2026 Maddox Krape
        </div>
      </div>
    </>
  );
}
