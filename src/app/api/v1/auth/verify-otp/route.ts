import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function POST(req: Request) {
  try {
    const { userId, code } = await req.json();

    if (!userId || !code) {
      return NextResponse.json({ success: false, error: 'بيانات غير مكتملة' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
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

    await prisma.$transaction([
      prisma.phoneOtp.update({
        where: { id: otpRecord.id },
        data: { usedAt: new Date() }
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { phoneVerified: true }
      })
    ]);

    return NextResponse.json({ success: true, message: 'تم التحقق بنجاح' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'حدث خطأ داخلي' }, { status: 500 });
  }
}
