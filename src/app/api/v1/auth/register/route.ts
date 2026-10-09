import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { hashPassword } from '@/lib/auth/password';
import { signupSchema } from '@/lib/validators/auth';
import { validateSlug, isReservedSlug } from '@/lib/slug/arabic';
import { sendOtpSms } from '@/lib/whysms';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const result = signupSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error.errors[0]?.message || 'بيانات غير صالحة' }, { status: 400 });
    }

    const { fullName, email, phone, password, clinicName, slug } = result.data;

    const slugValidation = validateSlug(slug);
    if (!slugValidation.valid) return NextResponse.json({ success: false, error: slugValidation.error }, { status: 400 });
    if (isReservedSlug(slug)) return NextResponse.json({ success: false, error: 'هذا الرابط محجوز' }, { status: 400 });

    const existingUser = await prisma.user.findFirst({ where: { OR: [{ email }, { phone }] } });
    if (existingUser) return NextResponse.json({ success: false, error: 'البريد الإلكتروني أو رقم الهاتف مستخدم بالفعل' }, { status: 400 });

    const existingClinic = await prisma.clinic.findUnique({ where: { slug } });
    if (existingClinic) return NextResponse.json({ success: false, error: 'هذا الرابط مستخدم بالفعل' }, { status: 400 });

    const ownerRole = await prisma.role.findFirst({
      where: { name: 'Owner', clinicId: null, isSystem: true },
    });
    
    if (!ownerRole) {
      return NextResponse.json({ success: false, error: 'حدث خطأ في النظام' }, { status: 500 });
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.$transaction(async (tx) => {
      const u = await tx.user.create({
        data: {
          email,
          phone,
          passwordHash: hashedPassword,
          fullName,
          phoneVerified: false,
        }
      });
      
      const c = await tx.clinic.create({
        data: {
          name: clinicName,
          slug,
          status: 'ACTIVE',
        }
      });
      
      await tx.clinicSettings.create({
        data: { clinicId: c.id }
      });
      
      await tx.clinicMembership.create({
        data: {
          userId: u.id,
          clinicId: c.id,
          roleId: ownerRole.id,
          status: 'ACTIVE'
        }
      });
      
      return u;
    });

    // Generate OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.phoneOtp.create({
      data: {
        userId: user.id,
        phone: user.phone!,
        code: otpCode,
        expiresAt,
      }
    });

    // Send SMS (non-blocking)
    sendOtpSms(user.phone!, otpCode).catch(console.error);

    return NextResponse.json({ success: true, message: 'تم إرسال رمز التحقق (OTP)', userId: user.id });
  } catch (error: any) {
    console.error('Registration Error:', error);
    return NextResponse.json({ success: false, error: 'حدث خطأ داخلي' }, { status: 500 });
  }
}
