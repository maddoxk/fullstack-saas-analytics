// Event ingestion endpoint (full-stack/server mode only).
// POST /api/events  { name, userId, properties? }  with header x-api-key
//
// In static-demo mode (NEXT_PUBLIC_STATIC_DEMO=true) there is no server; the
// route is rendered as a static stub and ingestion is a no-op.
import { NextRequest, NextResponse } from "next/server";

export const dynamic =
  process.env.NEXT_PUBLIC_STATIC_DEMO === "true" ? "force-static" : "force-dynamic";

export async function POST(req: NextRequest) {
  if (process.env.NEXT_PUBLIC_STATIC_DEMO === "true") {
    return NextResponse.json(
      { error: "ingestion is disabled in the static demo" },
      { status: 501 }
    );
  }
  const { prisma } = await import("@/lib/db");
  const apiKey = req.headers.get("x-api-key");
  if (!apiKey) {
    return NextResponse.json({ error: "missing x-api-key" }, { status: 401 });
  }
  const project = await prisma.project.findUnique({ where: { apiKey } });
  if (!project) {
    return NextResponse.json({ error: "invalid api key" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body?.name || !body?.userId) {
    return NextResponse.json(
      { error: "name and userId are required" },
      { status: 400 }
    );
  }

  const event = await prisma.event.create({
    data: {
      projectId: project.id,
      name: String(body.name),
      userId: String(body.userId),
      properties: body.properties ?? {},
      timestamp: body.timestamp ? new Date(body.timestamp) : undefined,
    },
  });

  return NextResponse.json({ id: event.id }, { status: 201 });
}
