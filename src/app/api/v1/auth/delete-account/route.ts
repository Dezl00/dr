import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireApiAuth } from "@/lib/auth/api-auth";

export async function POST(req: Request) {
  try {
    const { user } = await requireApiAuth(req);
    const body = await req.json().catch(() => ({}));
    const reason = body.reason || "لم يحدد سبب";
    const notes = body.notes || "";

    // 15 days grace period
    const scheduledDeletionDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);

    // Record deletion request in AuditLog
    await prisma.auditLog.create({
      data: {
        action: "USER_DELETED",
        resource: "User",
        resourceId: user.id,
        actorId: user.id,
        metadata: {
          type: "ACCOUNT_DELETION_SCHEDULED",
          userEmail: user.email,
          reason,
          notes,
          requestedAt: new Date().toISOString(),
          scheduledDeletionAt: scheduledDeletionDate.toISOString(),
          gracePeriodDays: 15,
          status: "PENDING_15_DAYS",
        },
      },
    });

    // Invalidate all active sessions for this user so they are signed out
    await prisma.session.deleteMany({
      where: { userId: user.id },
    });

    return NextResponse.json({
      success: true,
      message: "تم تسجيل طلب حذف الحساب بنجاح. سيتم حذف حسابك وبيانات عيادتك نهائياً خلال 15 يوماً ما لم تسجل الدخول مرة أخرى.",
      scheduledDeletionAt: scheduledDeletionDate.toISOString(),
    });
  } catch (error: any) {
    if (error.message?.includes("Unauthorized") || error.message?.includes("Forbidden")) {
      return NextResponse.json({ success: false, error: error.message }, { status: 401 });
    }
    return NextResponse.json(
      { success: false, error: "حدث خطأ أثناء معالجة طلب حذف الحساب" },
      { status: 500 }
    );
  }
}
