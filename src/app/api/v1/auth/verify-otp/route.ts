import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyRegistrationToken } from '@/lib/auth/api-auth';
import { verifyPassword } from '@/lib/auth/password';

export async function POST(req: Request) {
  try {
    const { token, code } = await req.json();

    if (!token || !code) {
      return NextResponse.json({ success: false, error: 'بيانات غير مكتملة' }, { status: 400 });
    }

    const payload = await verifyRegistrationToken(token);
    if (!payload) {
      return NextResponse.json({ success: false, error: 'انتهت صلاحية الجلسة، يرجى التسجيل مرة أخرى' }, { status: 400 });
    }

    const isMatch = await verifyPassword(payload.otpHash, code);
    if (!isMatch) {
      return NextResponse.json({ success: false, error: 'الرمز غير صحيح' }, { status: 400 });
    }

    const { email, phone, passwordHash, fullName, clinicName, slug, roleId } = payload.registrationData;

    // Check if somehow created in the meantime
    const existingUser = await prisma.user.findFirst({ where: { OR: [{ email }, { phone }] } });
    if (existingUser) return NextResponse.json({ success: false, error: 'البريد الإلكتروني أو رقم الهاتف مستخدم بالفعل' }, { status: 400 });

    const existingClinic = await prisma.clinic.findUnique({ where: { slug } });
    if (existingClinic) return NextResponse.json({ success: false, error: 'هذا الرابط مستخدم بالفعل' }, { status: 400 });

    // Create everything
    const user = await prisma.$transaction(async (tx) => {
      const u = await tx.user.create({
        data: {
          email,
          phone,
          passwordHash,
          fullName,
          phoneVerified: true, // Auto verify since they just entered OTP
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
          roleId,
          status: 'ACTIVE'
        }
      });
      
      const w = await tx.website.create({
        data: {
          clinicId: c.id,
          isPublished: false,
        }
      });

      await tx.websiteSettings.create({
        data: { websiteId: w.id }
      });

      // Default Website Sections
      const defaultSections = [
        { type: "HERO" as const, title: "الرئيسية", titleEn: "Hero", sortOrder: 0 },
        { type: "ABOUT" as const, title: "من نحن", titleEn: "About", sortOrder: 1 },
        { type: "SERVICES" as const, title: "خدماتنا", titleEn: "Services", sortOrder: 2 },
        { type: "DOCTORS" as const, title: "أطبائنا", titleEn: "Doctors", sortOrder: 3 },
        { type: "CONTACT" as const, title: "اتصل بنا", titleEn: "Contact", sortOrder: 4 },
        { type: "BOOKING" as const, title: "احجز موعد", titleEn: "Booking", sortOrder: 5 },
      ];

      for (const section of defaultSections) {
        await tx.websiteSection.create({
          data: {
            websiteId: w.id,
            type: section.type,
            title: section.title,
            titleEn: section.titleEn,
            sortOrder: section.sortOrder,
            isEnabled: true,
          }
        });
      }
      
      return u;
    });

    return NextResponse.json({ success: true, message: 'تم التحقق وإنشاء الحساب بنجاح' });
  } catch (error: any) {
    console.error('Verify OTP Error:', error);
    return NextResponse.json({ success: false, error: 'حدث خطأ داخلي' }, { status: 500 });
  }
}

