import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireApiAuth } from '@/lib/auth/api-auth';
import { sendSms } from '@/lib/whysms';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { clinic } = await requireApiAuth(req);
    const { id } = await params;

    const appointment = await prisma.appointment.findFirst({
      where: { id, clinicId: clinic.id },
      include: { patient: true }
    });

    if (!appointment) {
      return NextResponse.json({ success: false, error: 'الموعد غير موجود' }, { status: 404 });
    }

    if (!appointment.patient.phone) {
      return NextResponse.json({ success: false, error: 'لا يوجد رقم هاتف للمريض' }, { status: 400 });
    }

    const timeParts = appointment.startTime.split(':');
    let formattedTime = appointment.startTime;
    if (timeParts.length >= 2) {
      let hours = parseInt(timeParts[0], 10);
      const minutes = timeParts[1];
      const ampm = hours >= 12 ? 'مساءً' : 'صباحاً';
      hours = hours % 12;
      hours = hours ? hours : 12; 
      formattedTime = `${hours}:${minutes} ${ampm}`;
    }
    const message = `مرحباً ${appointment.patient.fullName}، نذكركم بموعدكم في عيادة ${clinic.name} غداً الساعة ${formattedTime}.`;

    const smsResult = await sendSms(appointment.patient.phone, message);

    if (smsResult.success) {
      return NextResponse.json({ success: true, message: 'تم الإرسال بنجاح' });
    } else {
      return NextResponse.json({ success: false, error: smsResult.error }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Reminder Error:', error);
    return NextResponse.json({ success: false, error: 'حدث خطأ داخلي' }, { status: 500 });
  }
}
