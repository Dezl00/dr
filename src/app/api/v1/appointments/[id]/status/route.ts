import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireApiAuth } from "@/lib/auth/api-auth";
import { sendSms } from "@/lib/whysms";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { clinic } = await requireApiAuth(req);
    const { id } = await params;
    const body = await req.json();
    
    if (!body.status) {
      return NextResponse.json({ success: false, error: "الحالة مطلوبة" }, { status: 400 });
    }

    const appointment = await prisma.appointment.update({
      where: { id, clinicId: clinic.id },
      data: { status: body.status },
      include: { patient: true }
    });

    // Send SMS notification to patient about status change
    if (appointment.patient.phone) {
      const statusMessages: Record<string, string> = {
        CONFIRMED: `مرحباً ${appointment.patient.fullName}، تم تأكيد موعدك في عيادة ${clinic.name} بنجاح.`,
        CANCELLED: `مرحباً ${appointment.patient.fullName}، تم إلغاء موعدك في عيادة ${clinic.name}.`,
        COMPLETED: `مرحباً ${appointment.patient.fullName}، تم إتمام زيارتك في عيادة ${clinic.name}. شكراً لكم.`,
        NO_SHOW: `مرحباً ${appointment.patient.fullName}، لم نتمكن من استقبالك في موعدك المحدد. يمكنك حجز موعد جديد.`,
      };

      const message = statusMessages[body.status];
      if (message) {
        try {
          await sendSms(appointment.patient.phone, message);
        } catch (smsErr) {
          console.error('SMS send error on status change:', smsErr);
          // Don't fail the status update if SMS fails
        }
      }
    }
    
    return NextResponse.json({ success: true, data: appointment });
  } catch (error: any) {
    if (error.message?.includes('Unauthorized')) return NextResponse.json({ success: false, error: error.message }, { status: 401 });
    return NextResponse.json({ success: false, error: "حدث خطأ أثناء التحديث" }, { status: 500 });
  }
}
