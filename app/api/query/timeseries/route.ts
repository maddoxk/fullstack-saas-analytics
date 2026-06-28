import { NextRequest, NextResponse } from "next/server";
import { timeSeries } from "@/lib/analytics";
import type { AnalyticsEvent } from "@/lib/types";

// In static-demo mode (GitHub Pages export) there is no server, so this route
// is rendered statically as an empty stub. In full-stack mode it queries Postgres.
export const dynamic =
  process.env.NEXT_PUBLIC_STATIC_DEMO === "true" ? "force-static" : "force-dynamic";

export async function GET(req: NextRequest) {
  if (process.env.NEXT_PUBLIC_STATIC_DEMO === "true") {
    return NextResponse.json([]);
  }
  const { prisma } = await import("@/lib/db");
  const eventName = req.nextUrl.searchParams.get("event") ?? undefined;
  const rows = await prisma.event.findMany({
    select: { id: true, name: true, userId: true, timestamp: true },
    orderBy: { timestamp: "asc" },
  });
  const events: AnalyticsEvent[] = rows.map((r) => ({
    id: r.id,
    name: r.name,
    userId: r.userId,
    timestamp: r.timestamp.toISOString(),
  }));
  return NextResponse.json(timeSeries(events, { eventName }));
}
