import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

const createReportSchema = z.object({
	targetType: z.enum(["POST", "COMMENT", "USER"]),
	targetId: z.string().min(1),
	reason: z.string().min(1, "Reason is required"),
});

const resolveReportSchema = z.object({
	reportId: z.string().min(1, "Report ID is required"),
	status: z.enum(["OPEN", "RESOLVED"]).default("RESOLVED"),
});

export async function GET(req: NextRequest) {
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

	const reports = await prisma.report.findMany({
		where: { status: "OPEN" },
		orderBy: { createdAt: "desc" },
	});

	return NextResponse.json({ success: true, data: reports });
}

export async function POST(req: NextRequest) {
	const session = await auth.api.getSession({ headers: req.headers });
	if (!session?.user)
		return NextResponse.json(
			{ success: false, error: "Unauthorised" },
			{ status: 401 },
		);

	const body = await req.json();
	const validation = createReportSchema.safeParse(body);
	if (!validation.success)
		return NextResponse.json(
			{ success: false, error: validation.error.format() },
			{ status: 400 },
		);

	const report = await prisma.report.create({
		data: {
			...validation.data,
			reporterId: session.user.id!,
		},
	});

	return NextResponse.json({ success: true, data: report }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
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

	const body = await req.json();
	const validation = resolveReportSchema.safeParse(body);
	if (!validation.success)
		return NextResponse.json(
			{ success: false, error: validation.error.format() },
			{ status: 400 },
		);

	const { reportId, status } = validation.data;
	const existing = await prisma.report.findUnique({ where: { id: reportId } });
	if (!existing)
		return NextResponse.json(
			{ success: false, error: "Report not found" },
			{ status: 404 },
		);

	const updated = await prisma.report.update({
		where: { id: reportId },
		data: { status },
	});

	if (status === "RESOLVED" && existing.status !== "RESOLVED") {
		const { extractNextRequestContext, logAudit } = await import("@/lib/services/auditService");
		const { ip, userAgent } = extractNextRequestContext(req as unknown as { headers: { get(k: string): string | null } });
		await logAudit({
			actorId: session.user.id!,
			actorRole: role,
			action: "REPORT_RESOLVE",
			targetType: "Report",
			targetId: reportId,
			metadata: { targetType: existing.targetType, targetId: existing.targetId, status },
			ip,
			userAgent,
		});
	}

	return NextResponse.json({ success: true, data: updated });
}
