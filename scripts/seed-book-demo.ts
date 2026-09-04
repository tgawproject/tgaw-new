import { prisma } from "../lib/db/prisma"
import { logAudit } from "../lib/services/auditService"
const user = await prisma.user.findFirst({ where: { role: "superadmin" } })
if (!user) { console.log('no user'); process.exit(1) }
await logAudit({ actorId: user.id, actorRole: user.role, action: "SLOT_BOOK" as const, targetType: "Slot" as const, targetId: "demo_slot_book_1", metadata: { slotIds: ["demo1","demo2"], count: 2, demo: true }, ip: "127.0.0.1", userAgent: "demo" })
await logAudit({ actorId: user.id, actorRole: user.role, action: "SLOT_CANCEL" as const, targetType: "Slot" as const, targetId: "demo_slot_cancel_1", metadata: { slotId: "demo1", demo: true }, ip: "127.0.0.1", userAgent: "demo" })
console.log('seeded booking logs')
const count = await prisma.auditLog.count({ where: { action: { in: ["SLOT_BOOK","SLOT_CANCEL"] } } })
console.log('booking logs count', count)
