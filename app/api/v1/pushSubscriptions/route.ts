import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

const pushSubscriptionSchema = z.object({
	endpoint: z.string().url(),
	keys: z.object({
		p256dh: z.string().min(1),
		auth: z.string().min(1),
	}),
	// some clients send flat p256dh/auth
	p256dh: z.string().optional(),
	auth: z.string().optional(),
	expirationTime: z.number().nullable().optional(),
});

const deleteSchema = z.object({
	endpoint: z.string().url(),
});

export async function GET(req: NextRequest) {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session?.user) {
		return NextResponse.json({ success: false, error: "Unauthorised" }, { status: 401 });
	}
	const subs = await prisma.pushSubscription.findMany({
		where: { userId: session.user.id },
		orderBy: { createdAt: "desc" },
	});
	return NextResponse.json({ success: true, data: subs });
}

export async function POST(req: NextRequest) {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session?.user) {
		return NextResponse.json({ success: false, error: "Unauthorised" }, { status: 401 });
	}
	let body: unknown;
	try {
		body = await req.json();
	} catch {
		return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
	}

	// Support both { endpoint, keys: {p256dh, auth}} and { endpoint, p256dh, auth }
	const raw = body as Record<string, unknown>;
	let normalized: unknown = raw;
	if (raw && typeof raw === "object" && !raw.keys && (raw.p256dh || raw.auth)) {
		normalized = {
			endpoint: raw.endpoint,
			keys: { p256dh: raw.p256dh, auth: raw.auth },
		};
	}

	const validation = pushSubscriptionSchema.safeParse(normalized);
	if (!validation.success) {
		return NextResponse.json({ success: false, error: validation.error.format() }, { status: 400 });
	}

	const { endpoint, keys } = validation.data;
	const p256dh = keys.p256dh;
	const authKey = keys.auth;

	try {
		const sub = await prisma.pushSubscription.upsert({
			where: { endpoint },
			update: { userId: session.user.id, p256dh, auth: authKey },
			create: { userId: session.user.id, endpoint, p256dh, auth: authKey },
		});
		return NextResponse.json({ success: true, data: sub }, { status: 201 });
	} catch (e) {
		// unique constraint race — try find
		const existing = await prisma.pushSubscription.findUnique({ where: { endpoint } });
		if (existing) {
			return NextResponse.json({ success: true, data: existing });
		}
		return NextResponse.json({ success: false, error: e instanceof Error ? e.message : String(e) }, { status: 500 });
	}
}

export async function DELETE(req: NextRequest) {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session?.user) {
		return NextResponse.json({ success: false, error: "Unauthorised" }, { status: 401 });
	}
	const { searchParams } = new URL(req.url);
	let endpoint = searchParams.get("endpoint");
	let bodyEndpoint: string | undefined;
	if (!endpoint) {
		try {
			const body = await req.json();
			const parsed = deleteSchema.safeParse(body);
			if (parsed.success) endpoint = parsed.data.endpoint;
			bodyEndpoint = (body as Record<string, string>)?.endpoint;
		} catch {
			// no body
		}
	}
	const target = endpoint ?? bodyEndpoint;
	if (!target) {
		return NextResponse.json({ success: false, error: "endpoint required" }, { status: 400 });
	}
	// Only allow deleting own subscription
	const existing = await prisma.pushSubscription.findUnique({ where: { endpoint: target } });
	if (!existing) {
		return NextResponse.json({ success: true, data: null });
	}
	if (existing.userId !== session.user.id) {
		return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
	}
	await prisma.pushSubscription.delete({ where: { endpoint: target } });
	return NextResponse.json({ success: true, data: null });
}
