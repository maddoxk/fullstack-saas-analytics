import { NextRequest, NextResponse } from "next/server";
import { funnel } from "@/lib/analytics";
import { FUNNEL_STEPS } from "@/lib/mock-data";
import type { AnalyticsEvent } from "@/lib/types";

// Static-demo mode renders an empty stub; full-stack mode queries Postgres.
export const dynamic =
  process.env.NEXT_PUBLIC_STATIC_DEMO === "true" ? "force-static" : "force-dynamic";

export async function GET(req: NextRequest) {
  if (process.env.NEXT_PUBLIC_STATIC_DEMO === "true") {
    return NextResponse.json([]);
  }
  const { prisma } = await import("@/lib/db");
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
