import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { addGroupMemberSchema } from "@/lib/schemas/groupSchema";
import { extractNextRequestContext, logAudit } from "@/lib/services/auditService";

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id } = await params;
	const members = await prisma.groupMember.findMany({
		where: { groupId: id },
	});
	return NextResponse.json({ success: true, data: members });
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
	const validation = addGroupMemberSchema.safeParse(body);
	if (!validation.success)
		return NextResponse.json(
			{ success: false, error: validation.error.format() },
			{ status: 400 },
		);

	const member = await prisma.groupMember.create({
		data: {
			groupId: id,
			userId: validation.data.userId,
			role: validation.data.role,
		},
	});

	const { ip, userAgent } = extractNextRequestContext(req as unknown as { headers: { get(k: string): string | null } });
	await logAudit({
		actorId: session.user.id!,
		actorRole: (session.user.role as string) ?? null,
		action: "GROUP_MEMBER_ROLE_CHANGE",
		targetType: "GroupMember",
		targetId: member.id,
		metadata: { groupId: id, targetUserId: member.userId, role: member.role },
		ip,
		userAgent,
	});

	return NextResponse.json({ success: true, data: member }, { status: 201 });
}
