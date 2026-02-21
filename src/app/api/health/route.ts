import { NextResponse } from "next/server";

const startTime = Date.now();

export async function GET() {
  const health: {
    status: string;
    uptime: number;
    timestamp: string;
    database: string;
  } = {
    status: "ok",
    uptime: Math.floor((Date.now() - startTime) / 1000),
    timestamp: new Date().toISOString(),
    database: "unknown",
  };

  try {
    const { db } = await import("@/lib/db");
    await db.$queryRaw`SELECT 1`;
    health.database = "connected";
  } catch {
    health.database = "disconnected";
  }

  const statusCode = health.database === "connected" ? 200 : 503;
  return NextResponse.json(health, { status: statusCode });
}
