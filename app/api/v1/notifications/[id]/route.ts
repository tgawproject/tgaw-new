import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

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

	const { id } = await params;
	const body = await req.json();

	const notification = await prisma.notification.findUnique({ where: { id } });
	if (!notification)
		return NextResponse.json(
			{ success: false, error: "Not found" },
			{ status: 404 },
		);

	if (notification.userId !== session.user.id)
		return NextResponse.json(
			{ success: false, error: "Unauthorised" },
			{ status: 403 },
		);

	const updated = await prisma.notification.update({
		where: { id },
		data: {
			isRead: body.isRead ?? !notification.isRead,
		},
	});

	return NextResponse.json({ success: true, data: updated });
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

	const notification = await prisma.notification.findUnique({ where: { id } });
	if (!notification)
		return NextResponse.json(
			{ success: false, error: "Not found" },
			{ status: 404 },
		);

	if (notification.userId !== session.user.id)
		return NextResponse.json(
			{ success: false, error: "Unauthorised" },
			{ status: 403 },
		);

	await prisma.notification.update({
		where: { id },
		data: { isRead: true },
	});

	return NextResponse.json({ success: true });
}
