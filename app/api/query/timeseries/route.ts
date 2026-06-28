import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { timeSeries } from "@/lib/analytics";
import type { AnalyticsEvent } from "@/lib/types";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const eventName = sp.get("event") ?? undefined;
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
