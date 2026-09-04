import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/prisma"
import type { AuditAction } from "@prisma/client"

const LEADER_ALLOWED: ReadonlySet<string> = new Set([
  "SLOT_ASSIGN",
  "SLOT_ADMIN_CANCEL",
  "SLOT_ADMIN_BOOK",
  "BOOKING_CONFIG_CHANGE",
  "MEETING_LINK_UPSERT",
  "MEETING_LINK_DELETE",
  "SLOTS_GENERATE",
  "EVENT_CREATE",
  "EVENT_DELETE",
  "POST_HIDE",
  "POST_UNHIDE",
  "COMMENT_HIDE",
  "REPORT_RESOLVE",
  "BROADCAST_CREATE",
  "GROUP_CREATE",
  "GROUP_DELETE",
  "GROUP_MEMBER_ROLE_CHANGE",
  "AUTH_LOGIN_SUCCESS",
  "AUTH_LOGIN_FAILURE",
  "AUTH_LOGOUT",
  "AUTH_PASSWORD_CHANGE",
])

function encodeCursor(log: { createdAt: Date; id: string }): string {
  return Buffer.from(JSON.stringify({ createdAt: log.createdAt.toISOString(), id: log.id })).toString("base64url")
}
function decodeCursor(cursor: string | null): { createdAt: Date; id: string } | null {
  if (!cursor) return null
  try {
    const o = JSON.parse(Buffer.from(cursor, "base64url").toString("utf-8"))
    return { createdAt: new Date(o.createdAt), id: o.id }
  } catch {
    return null
  }
}

export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  const role = (session?.user as { role?: string } | undefined)?.role
  if (!session?.user || !role) return NextResponse.json({ success: false, error: "Unauthorised" }, { status: 401 })
  const isSuperadmin = role === "superadmin"
  const isLeader = role === "leader"
  if (!isSuperadmin && !isLeader) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const actor = searchParams.get("actor")?.trim() || null
  const action = searchParams.get("action")?.trim() as AuditAction | null
  const targetType = searchParams.get("targetType")?.trim() || null
  const level = searchParams.get("level")?.trim() || null
  const search = searchParams.get("search")?.trim() || null
  const from = searchParams.get("from")?.trim() || null
  const to = searchParams.get("to")?.trim() || null
  const cursor = searchParams.get("cursor")
  const limitRaw = searchParams.get("limit")
  const limit = Math.min(50, Math.max(1, Number(limitRaw ?? 30) || 30))

  const where: Record<string, unknown> = {}

  if (actor) where.actorId = actor
  if (action) where.action = action
  if (targetType) where.targetType = targetType

  // leader scoping: hide critical RBAC actions
  if (isLeader && !isSuperadmin) {
    const banned: string[] = ["USER_ROLE_CHANGE", "USER_BAN", "USER_UNBAN", "USER_DELETE", "COORDINATOR_ASSIGN"]
    if (action && banned.includes(action)) {
      return NextResponse.json({ success: true, data: [], nextCursor: null })
    }
    where.NOT = { action: { in: banned } }
  }

  if (from || to) {
    const createdAt: Record<string, Date> = {}
    if (from) {
      const d = new Date(from)
      if (!isNaN(d.getTime())) createdAt.gte = d
    }
    if (to) {
      const d = new Date(to)
      if (!isNaN(d.getTime())) createdAt.lte = d
    }
    if (Object.keys(createdAt).length) where.createdAt = createdAt
  }

  // level filter maps to action sets via service
  if (level && level !== "all") {
    const { ACTION_LEVEL } = await import("@/lib/services/auditService")
    const allowed = Object.entries(ACTION_LEVEL).filter(([, l]) => l === level).map(([a]) => a)
    if (allowed.length === 0) {
      return NextResponse.json({ success: true, data: [], nextCursor: null })
    }
    // merge with existing action filter if present
    if (action) {
      if (!allowed.includes(action)) return NextResponse.json({ success: true, data: [], nextCursor: null })
    } else {
      where.action = { in: allowed }
    }
  }

  if (search) {
    // Mongo text search not configured — do OR on targetId and actorId prefix; metadata search done client-side for now
    // Keep where simple; apply search as post-filter for now via regex on targetId
    // Use Prisma string contains on targetId
    where.OR = [
      { targetId: { contains: search, mode: "insensitive" as const } },
      { actorId: { contains: search, mode: "insensitive" as const } },
    ]
  }

  const decoded = decodeCursor(cursor)
  let prismaCursor: { id: string } | undefined
  if (decoded) {
    // Verify cursor log exists to get correct ordering
    const cursorLog = await prisma.auditLog.findUnique({ where: { id: decoded.id } })
    if (cursorLog) {
      prismaCursor = { id: cursorLog.id }
    }
  }

  const logs = await prisma.auditLog.findMany({
    where,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit + 1,
    ...(prismaCursor ? { cursor: prismaCursor, skip: 1 } : {}),
  })

  const hasMore = logs.length > limit
  const data = hasMore ? logs.slice(0, limit) : logs
  const nextCursor = hasMore ? encodeCursor({ createdAt: data[data.length - 1]!.createdAt, id: data[data.length - 1]!.id }) : null

  return NextResponse.json({ success: true, data, nextCursor })
}
