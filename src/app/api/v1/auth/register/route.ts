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
    
    // Generate OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await hashPassword(otpCode);

    // Sign registration token
    const { signRegistrationToken } = await import('@/lib/auth/api-auth');
    const token = await signRegistrationToken({
      registrationData: {
        email,
        phone,
        passwordHash: hashedPassword,
        fullName,
        clinicName,
        slug,
        roleId: ownerRole.id
      },
      otpHash,
    });

    // Send SMS (await it so Vercel doesn't kill the lambda)
    await sendOtpSms(phone, otpCode);

    return NextResponse.json({ success: true, message: 'تم إرسال رمز التحقق (OTP)', registrationToken: token });
  } catch (error: any) {
    console.error('Registration Error:', error);
    return NextResponse.json({ success: false, error: 'حدث خطأ داخلي' }, { status: 500 });
  }
}
