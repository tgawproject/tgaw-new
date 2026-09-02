import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: NextRequest) {
	const session = await auth.api.getSession({ headers: req.headers });
	if (!session?.user)
		return NextResponse.json(
			{ success: false, error: "Unauthorised" },
			{ status: 401 },
		);

	const { searchParams } = new URL(req.url);
	const filter = searchParams.get("filter") || "all"; // all | unread | archived

	const where: Record<string, unknown> = { userId: session.user.id };

	if (filter === "unread") {
		where.isRead = false;
	}

	const notifications = await prisma.notification.findMany({
		where,
		orderBy: { createdAt: "desc" },
		take: 50,
	});

	return NextResponse.json({ success: true, data: notifications });
}

export async function POST(req: NextRequest) {
	const session = await auth.api.getSession({ headers: req.headers });
	if (!session?.user)
		return NextResponse.json(
			{ success: false, error: "Unauthorised" },
			{ status: 401 },
		);

	const body = await req.json();

	if (body.action === "markAllRead") {
		await prisma.notification.updateMany({
			where: { userId: session.user.id, isRead: false },
			data: { isRead: true },
		});
		return NextResponse.json({ success: true });
	}

	return NextResponse.json(
		{ success: false, error: "Invalid action" },
		{ status: 400 },
	);
}
