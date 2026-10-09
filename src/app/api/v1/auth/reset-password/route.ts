import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { hashPassword } from '@/lib/auth/password';

export async function POST(req: Request) {
  try {
    const { phone, code, newPassword } = await req.json();

    if (!phone || !code || !newPassword) {
      return NextResponse.json({ success: false, error: 'بيانات غير مكتملة' }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: { phone }
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'المستخدم غير موجود' }, { status: 404 });
    }

    const otpRecord = await prisma.phoneOtp.findFirst({
      where: {
        userId: user.id,
        code,
        usedAt: null,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!otpRecord) {
      return NextResponse.json({ success: false, error: 'الرمز غير صحيح أو منتهي الصلاحية' }, { status: 400 });
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.$transaction([
      prisma.phoneOtp.update({
        where: { id: otpRecord.id },
        data: { usedAt: new Date() }
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { passwordHash }
      })
    ]);

    return NextResponse.json({ success: true, message: 'تم إعادة تعيين كلمة المرور بنجاح' });
  } catch (error: any) {
    console.error('Reset Password API Error:', error);
    return NextResponse.json({ success: false, error: 'حدث خطأ داخلي' }, { status: 500 });
  }
}
