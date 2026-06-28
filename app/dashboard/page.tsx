import Dashboard from "@/components/Dashboard";
import Link from "next/link";

export const metadata = { title: "Dashboard — Insightly" };

export default function DashboardPage() {
  return (
    <>
      <div className="topbar">
        <div className="brand">
          <span className="dot" /> Insightly
          <span className="badge">demo dataset · seeded</span>
        </div>
        <Link href="/" style={{ fontSize: 14 }}>
          ← Home
        </Link>
      </div>
      <div className="container">
        <Dashboard />
      </div>
    </>
  );
}
