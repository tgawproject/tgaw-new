import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/prisma"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session?.user) return NextResponse.json({ success: false, error: "Unauthorised" }, { status: 401 })

  const group = await prisma.group.findUnique({ where: { id } })
  if (!group) return NextResponse.json({ success: false, error: "Group not found" }, { status: 404 })

  // must be member or public?
  const isMember = await prisma.groupMember.findFirst({ where: { groupId: id, userId: session.user.id! } })
  if (!isMember && group.isPrivate) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

  let conv = await prisma.conversation.findFirst({ where: { type: "GROUP", groupId: id } })
  if (!conv) {
    // create GROUP conversation with all members
    const members = await prisma.groupMember.findMany({ where: { groupId: id }, select: { userId: true } })
    const memberIds = members.map((m) => m.userId)
    if (!memberIds.includes(session.user.id!)) memberIds.push(session.user.id!)
    conv = await prisma.conversation.create({ data: { type: "GROUP", groupId: id, memberIds } })
  }
  return NextResponse.json({ success: true, data: conv })
}
