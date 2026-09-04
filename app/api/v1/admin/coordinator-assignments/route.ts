import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/prisma"
import { extractNextRequestContext, logAudit } from "@/lib/services/auditService"

const putSchema = z.object({
  userId: z.string().min(1),
  timezones: z.array(z.string().min(1)).max(20),
})

export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  const role = (session?.user as { role?: string } | undefined)?.role
  if (!session?.user || role !== "superadmin") {
    return NextResponse.json({ success: false, error: "Unauthorised" }, { status: 401 })
  }
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get("userId")
  if (!userId) return NextResponse.json({ success: false, error: "userId required" }, { status: 400 })
  const rows = await prisma.coordinatorAssignment.findMany({ where: { userId } })
  return NextResponse.json({ success: true, data: rows })
}

export async function PUT(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  const role = (session?.user as { role?: string } | undefined)?.role
  if (!session?.user || role !== "superadmin") {
    return NextResponse.json({ success: false, error: "Unauthorised" }, { status: 401 })
  }
  const body = await req.json()
  const parsed = putSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.flatten() }, { status: 400 })
  }
  const { userId, timezones } = parsed.data

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } })
  if (!user) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })

  const invalid = timezones.filter((tz) => {
    try {
      new Intl.DateTimeFormat("en", { timeZone: tz })
      return false
    } catch {
      return true
    }
  })
  if (invalid.length) {
    return NextResponse.json({ success: false, error: `Invalid timezones: ${invalid.join(", ")}` }, { status: 400 })
  }

  const before = await prisma.coordinatorAssignment.findMany({ where: { userId } })
  await prisma.coordinatorAssignment.deleteMany({ where: { userId } })
  if (timezones.length > 0) {
    await prisma.coordinatorAssignment.createMany({
      data: timezones.map((tz) => ({ userId, timezone: tz })),
    })
  }
  const rows = await prisma.coordinatorAssignment.findMany({ where: { userId } })
  const { ip, userAgent } = extractNextRequestContext(req as unknown as { headers: { get(k: string): string | null } })
  await logAudit({
    actorId: session.user.id,
    actorRole: role,
    action: "COORDINATOR_ASSIGN",
    targetType: "CoordinatorAssignment",
    targetId: userId,
    metadata: { before: before.map((r) => r.timezone), after: timezones, count: rows.length },
    ip,
    userAgent,
  })
  return NextResponse.json({ success: true, data: rows })
}
