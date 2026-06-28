// Event ingestion endpoint (full-stack/server mode only).
// POST /api/events  { name, userId, properties? }  with header x-api-key
//
// NOTE: this route is excluded from the static export. When building the
// GitHub Pages demo (NEXT_PUBLIC_STATIC_DEMO=true) the whole /api tree is not
// emitted because `output: export` skips route handlers.
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
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
