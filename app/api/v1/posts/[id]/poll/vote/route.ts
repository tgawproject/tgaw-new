import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/prisma"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session?.user) return NextResponse.json({ success: false, error: "Unauthorised" }, { status: 401 })
  const body = await req.json().catch(() => null) as { optionId?: string } | null
  const optionId = body?.optionId
  if (!optionId) return NextResponse.json({ success: false, error: "optionId required" }, { status: 400 })

  const post = await prisma.post.findUnique({ where: { id }, include: { poll: { include: { options: true } } } })
  if (!post?.poll) return NextResponse.json({ success: false, error: "No poll for this post" }, { status: 404 })
  if (post.poll.closesAt && new Date(post.poll.closesAt) < new Date()) return NextResponse.json({ success: false, error: "Poll closed" }, { status: 400 })

  const userId = session.user.id!
  // Remove previous vote from all options
  for (const opt of post.poll.options) {
    if (opt.voterIds.includes(userId)) {
      await prisma.pollOption.update({ where: { id: opt.id }, data: { voterIds: { set: opt.voterIds.filter((v) => v !== userId) } } })
    }
  }
  const target = post.poll.options.find((o) => o.id === optionId)
  if (!target) return NextResponse.json({ success: false, error: "Option not found" }, { status: 404 })
  if (!target.voterIds.includes(userId)) {
    await prisma.pollOption.update({ where: { id: optionId }, data: { voterIds: { push: userId } } })
  }
  return NextResponse.json({ success: true, data: { voted: optionId } })
}
