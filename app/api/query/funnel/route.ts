import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { funnel } from "@/lib/analytics";
import { FUNNEL_STEPS } from "@/lib/mock-data";
import type { AnalyticsEvent } from "@/lib/types";

export async function GET(req: NextRequest) {
  const stepsParam = req.nextUrl.searchParams.get("steps");
  const steps = stepsParam ? stepsParam.split(",") : FUNNEL_STEPS;
  const rows = await prisma.event.findMany({
    select: { id: true, name: true, userId: true, timestamp: true },
  });
  const events: AnalyticsEvent[] = rows.map((r) => ({
    id: r.id,
    name: r.name,
    userId: r.userId,
    timestamp: r.timestamp.toISOString(),
  }));
  return NextResponse.json(funnel(events, steps));
}
