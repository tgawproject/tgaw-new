import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

export async function GET() {
  const started = Date.now()
  try {
    await prisma.$runCommandRaw({ ping: 1 })
    return NextResponse.json({ success: true, status: "ok", db: "up", latencyMs: Date.now() - started, timestamp: new Date().toISOString() })
  } catch (e) {
    return NextResponse.json({ success: false, status: "degraded", db: "down", error: e instanceof Error ? e.message : String(e) }, { status: 503 })
  }
}
