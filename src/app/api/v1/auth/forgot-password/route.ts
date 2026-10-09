import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { sendOtpSms } from '@/lib/whysms';

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json({ success: false, error: 'الرجاء إدخال رقم الهاتف' }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: { phone }
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'رقم الهاتف غير مسجل لدينا' }, { status: 404 });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.phoneOtp.create({
      data: {
        userId: user.id,
        phone: user.phone!,
        code: otpCode,
        expiresAt,
      }
    });

    sendOtpSms(user.phone!, otpCode).catch(console.error);

    return NextResponse.json({ success: true, message: 'تم إرسال رمز التحقق' });
  } catch (error: any) {
    console.error('Forgot Password API Error:', error);
    return NextResponse.json({ success: false, error: 'حدث خطأ داخلي' }, { status: 500 });
  }
}
