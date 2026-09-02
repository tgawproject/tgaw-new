import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";

interface NotificationPrefs {
	email?: Record<string, boolean>;
	push?: Record<string, boolean>;
}

export async function GET(req: NextRequest) {
	const session = await auth.api.getSession({ headers: req.headers });
	if (!session?.user)
		return NextResponse.json(
			{ success: false, error: "Unauthorised" },
			{ status: 401 },
		);

	const user = await prisma.user.findUnique({
		where: { id: session.user.id! },
		select: { notificationPrefs: true },
	});

	const defaultPrefs: NotificationPrefs = {
		email: {},
		push: {},
	};

	return NextResponse.json({
		success: true,
		data: (user?.notificationPrefs as NotificationPrefs) ?? defaultPrefs,
	});
}

export async function PUT(req: NextRequest) {
	const session = await auth.api.getSession({ headers: req.headers });
	if (!session?.user)
		return NextResponse.json(
			{ success: false, error: "Unauthorised" },
			{ status: 401 },
		);

	const body = await req.json();

	await prisma.user.update({
		where: { id: session.user.id! },
		data: { notificationPrefs: body as Prisma.InputJsonValue },
	});

	return NextResponse.json({ success: true });
}
