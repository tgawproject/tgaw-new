import { prisma } from "../lib/db/prisma"

const actions = [
  { action: "USER_ROLE_CHANGE", targetType: "User", level: "warn", service: "admin" },
  { action: "USER_BAN", targetType: "User", level: "error", service: "admin" },
  { action: "COORDINATOR_ASSIGN", targetType: "CoordinatorAssignment", level: "warn", service: "admin" },
  { action: "SLOT_ASSIGN", targetType: "Slot", level: "info", service: "booking" },
  { action: "SLOT_ADMIN_CANCEL", targetType: "Slot", level: "error", service: "booking" },
  { action: "BOOKING_CONFIG_CHANGE", targetType: "BookingConfig", level: "warn", service: "booking" },
  { action: "MEETING_LINK_UPSERT", targetType: "MeetingLink", level: "info", service: "booking" },
  { action: "EVENT_CREATE", targetType: "Event", level: "info", service: "booking" },
  { action: "POST_HIDE", targetType: "Post", level: "warn", service: "moderation" },
  { action: "REPORT_RESOLVE", targetType: "Report", level: "info", service: "moderation" },
  { action: "GROUP_CREATE", targetType: "Group", level: "info", service: "groups" },
  { action: "AUTH_LOGIN_SUCCESS", targetType: "Auth", level: "info", service: "auth" },
  { action: "AUTH_LOGIN_FAILURE", targetType: "Auth", level: "warn", service: "auth" },
  { action: "SLOTS_GENERATE", targetType: "Slot", level: "debug", service: "booking" },
] as const

async function main() {
  const actor = await prisma.user.findFirst({ where: { role: "superadmin" } }) ?? await prisma.user.findFirst()
  if (!actor) {
    console.error("No user found to act as actor")
    process.exit(1)
  }
  console.log(`Seeding 30 audit logs as ${actor.email} (${actor.role})`)

  // Clear existing demo logs (optional)
  // await prisma.auditLog.deleteMany({})

  const now = Date.now()
  const logs = []
  for (let i = 0; i < 30; i++) {
    const tpl = actions[i % actions.length]!
    const createdAt = new Date(now - i * 1000 * 60 * 37 - Math.floor(Math.random() * 60000)) // 37min apart + jitter
    const isCritical = ["USER_ROLE_CHANGE", "USER_BAN", "USER_DELETE", "COORDINATOR_ASSIGN", "SLOT_ADMIN_CANCEL"].includes(tpl.action)
    const expiresAt = isCritical ? null : new Date(createdAt.getTime() + 90 * 24 * 60 * 60 * 1000)
    // Build metadata per action
    let metadata: Record<string, unknown> = {}
    if (tpl.action === "USER_ROLE_CHANGE") metadata = { before: "member", after: "coordinator", targetEmail: `user${i}@example.com` }
    else if (tpl.action === "BOOKING_CONFIG_CHANGE") metadata = { before: { maxBibleSlotsPerDay: 2 }, after: { maxBibleSlotsPerDay: 6 } }
    else if (tpl.action === "SLOT_ASSIGN") metadata = { slotId: `slot_${i}`, targetUserId: actor.id, date: "2026-09-03", startTime: "08:00" }
    else if (tpl.action === "SLOT_ADMIN_CANCEL") metadata = { slotId: `slot_${i}`, reason: "No-show policy" }
    else if (tpl.action === "MEETING_LINK_UPSERT") metadata = { type: "BIBLE", date: "2026-09-03", url: "https://zoom.us/j/89234156701" }
    else if (tpl.action === "POST_HIDE") metadata = { reason: "Off-topic", postId: `post_${i}` }
    else if (tpl.action === "AUTH_LOGIN_FAILURE") metadata = { email: `attacker${i}@example.com`, reason: "Invalid password" }
    else metadata = { detail: `Demo log ${i + 1} for ${tpl.action}`, requestId: `req_${Math.random().toString(36).slice(2, 8)}` }

    logs.push({
      actorId: actor.id,
      actorRole: actor.role,
      action: tpl.action as never,
      targetType: tpl.targetType as never,
      targetId: `demo_${tpl.targetType.toLowerCase()}_${i}_${Date.now()}`,
      createdAt,
      metadata,
      ip: `192.168.1.${(i % 254) + 1}`,
      userAgent: "Mozilla/5.0 (demo)",
      expiresAt,
    })
  }

  // Insert in batches
  for (const log of logs) {
    await prisma.auditLog.create({ data: log as never })
  }
  console.log(`Seeded ${logs.length} logs`)
  const count = await prisma.auditLog.count()
  console.log(`Total audit logs in DB: ${count}`)

  // Create TTL index
  try {
    const { MongoClient } = await import("mongodb")
    const client = new MongoClient(process.env.DATABASE_URL!)
    await client.connect()
    const col = client.db().collection("AuditLog")
    await col.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0, background: true })
    console.log("Ensured TTL index on expiresAt")
    await client.close()
  } catch (e) {
    console.error("TTL index failed", e)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
