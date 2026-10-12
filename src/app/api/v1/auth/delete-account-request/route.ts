import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, reason, notes } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "يرجى إدخال عنوان بريد إلكتروني صحيح" },
        { status: 400 }
      );
    }

    if (!reason || typeof reason !== "string") {
      return NextResponse.json(
        { success: false, error: "يرجى تحديد سبب طلب حذف الحساب" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, email: true },
    });

    // 15 days grace period
    const scheduledDeletionDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);

    // Record deletion request in AuditLog
    await prisma.auditLog.create({
      data: {
        action: "USER_DELETED",
        resource: "User",
        resourceId: user ? user.id : null,
        actorId: user ? user.id : null,
        metadata: {
          type: "WEB_ACCOUNT_DELETION_REQUEST",
          requestedEmail: normalizedEmail,
          userFound: !!user,
          reason,
          notes: notes || "",
          requestedAt: new Date().toISOString(),
          scheduledDeletionAt: scheduledDeletionDate.toISOString(),
          gracePeriodDays: 15,
          status: "PENDING_15_DAYS",
        },
      },
    });

    // Invalidate sessions if user exists
    if (user) {
      await prisma.session.deleteMany({
        where: { userId: user.id },
      });
    }

    return NextResponse.json({
      success: true,
      message: "تم استلام طلب حذف الحساب بنجاح. سيتم مراجعة الطلب وحذف البيانات نهائياً خلال 15 يوماً.",
      scheduledDeletionAt: scheduledDeletionDate.toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "حدث خطأ أثناء إرسال طلب حذف الحساب. يرجى المحاولة لاحقاً." },
      { status: 500 }
    );
  }
}
