import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { createCommentSchema } from "@/lib/schemas/postSchema";

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id } = await params;
	const comments = await prisma.comment.findMany({
		where: { postId: id, isHidden: false },
		orderBy: { createdAt: "asc" },
	});
	return NextResponse.json({ success: true, data: comments });
}

export async function POST(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const session = await auth.api.getSession({ headers: req.headers });
	if (!session?.user)
		return NextResponse.json(
			{ success: false, error: "Unauthorised" },
			{ status: 401 },
		);

	const { id } = await params;
	const body = await req.json();
	const validation = createCommentSchema.safeParse(body);
	if (!validation.success)
		return NextResponse.json(
			{ success: false, error: validation.error.format() },
			{ status: 400 },
		);

	const comment = await prisma.comment.create({
		data: {
			postId: id,
			authorId: session.user.id!,
			body: validation.data.body,
		},
	});

	return NextResponse.json({ success: true, data: comment }, { status: 201 });
}

export async function PATCH(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const session = await auth.api.getSession({ headers: req.headers });
	if (!session?.user)
		return NextResponse.json(
			{ success: false, error: "Unauthorised" },
			{ status: 401 },
		);

	const role = (session.user.role as string) || "member";
	if (!["leader", "superadmin"].includes(role))
		return NextResponse.json(
			{ success: false, error: "Forbidden" },
			{ status: 403 },
		);

	const { id: postId } = await params;
	const body = await req.json();
	const commentId = typeof body.commentId === "string" ? body.commentId : null;
	const isHidden = typeof body.isHidden === "boolean" ? body.isHidden : null;

	if (!commentId || isHidden === null) {
		return NextResponse.json(
			{ success: false, error: "commentId and isHidden are required" },
			{ status: 400 },
		);
	}

	const existing = await prisma.comment.findFirst({
		where: { id: commentId, postId },
	});
	if (!existing)
		return NextResponse.json(
			{ success: false, error: "Not found" },
			{ status: 404 },
		);

	const updated = await prisma.comment.update({
		where: { id: commentId },
		data: { isHidden },
	});

	if (isHidden !== existing.isHidden) {
		const { extractNextRequestContext, logAudit } = await import("@/lib/services/auditService");
		const { ip, userAgent } = extractNextRequestContext(req as unknown as { headers: { get(k: string): string | null } });
		await logAudit({
			actorId: session.user.id!,
			actorRole: role,
			action: "COMMENT_HIDE",
			targetType: "Comment",
			targetId: commentId,
			metadata: { postId, isHidden, authorId: existing.authorId },
			ip,
			userAgent,
		});
	}

	return NextResponse.json({ success: true, data: updated });
}
