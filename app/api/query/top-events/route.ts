import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { topEvents } from "@/lib/analytics";
import type { AnalyticsEvent } from "@/lib/types";

export async function GET(req: NextRequest) {
  const limit = Number(req.nextUrl.searchParams.get("limit") ?? 10);
  const rows = await prisma.event.findMany({
    select: { id: true, name: true, userId: true, timestamp: true },
  });
  const events: AnalyticsEvent[] = rows.map((r) => ({
    id: r.id,
    name: r.name,
    userId: r.userId,
    timestamp: r.timestamp.toISOString(),
  }));
  return NextResponse.json(topEvents(events, limit));
}
