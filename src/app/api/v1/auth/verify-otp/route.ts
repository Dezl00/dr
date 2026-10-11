import { NextResponse } from 'next/server'

import { prisma } from '@/lib/db/prisma'
import { verifyPassword } from '@/lib/auth/password'
import { verifyRegistrationToken } from '@/lib/auth/api-auth'
import { phoneLookupVariants } from '@/lib/whysms'

type RegistrationData = {
  email: string
  phone: string
  passwordHash: string
  fullName: string
  clinicName: string
  slug: string
  roleId: string
}

function isRegistrationData(value: unknown): value is RegistrationData {
  if (!value || typeof value !== 'object') return false
  const data = value as Record<string, unknown>
  return ['email', 'phone', 'passwordHash', 'fullName', 'clinicName', 'slug', 'roleId']
    .every((key) => typeof data[key] === 'string' && data[key])
}

export async function POST(req: Request) {
  try {
    const { token, code } = await req.json()
    if (typeof token !== 'string' || typeof code !== 'string' || !/^\d{6}$/.test(code)) {
      return NextResponse.json({ success: false, error: 'رمز التحقق غير صالح' }, { status: 400 })
    }

    const tokenPayload = await verifyRegistrationToken(token)
    if (!tokenPayload?.pendingRegistrationId) {
      return NextResponse.json({ success: false, error: 'انتهت جلسة التسجيل، أعد إنشاء الحساب.' }, { status: 400 })
    }

    const pending = await prisma.pendingRegistration.findFirst({
      where: { id: tokenPayload.pendingRegistrationId, expiresAt: { gt: new Date() } },
    })
    if (!pending || !isRegistrationData(pending.payload)) {
      return NextResponse.json({ success: false, error: 'انتهت صلاحية رمز التحقق، أعد إنشاء الحساب.' }, { status: 400 })
    }

    const matches = await verifyPassword(pending.otpCode, code)
    if (!matches) return NextResponse.json({ success: false, error: 'رمز التحقق غير صحيح' }, { status: 400 })

    const registration = pending.payload
    await prisma.$transaction(async (tx) => {
      // Atomically consume this registration record. A concurrent retry or an
      // older resend token cannot create a second clinic.
      const consumed = await tx.pendingRegistration.deleteMany({
        where: { id: pending.id, otpCode: pending.otpCode, expiresAt: { gt: new Date() } },
      })
      if (consumed.count !== 1) throw new Error('Verification code has already been used')

      const [existingUser, existingClinic] = await Promise.all([
        tx.user.findFirst({
          where: { OR: [{ email: registration.email }, { phone: { in: phoneLookupVariants(registration.phone) } }] },
          select: { id: true },
        }),
        tx.clinic.findUnique({ where: { slug: registration.slug }, select: { id: true } }),
      ])
      if (existingUser || existingClinic) throw new Error('Registration data is no longer available')

      const user = await tx.user.create({
        data: {
          email: registration.email,
          phone: registration.phone,
          passwordHash: registration.passwordHash,
          fullName: registration.fullName,
          phoneVerified: true,
        },
      })
      const clinic = await tx.clinic.create({ data: { name: registration.clinicName, slug: registration.slug, status: 'ACTIVE' } })
      await tx.clinicSettings.create({ data: { clinicId: clinic.id } })
      await tx.clinicMembership.create({ data: { userId: user.id, clinicId: clinic.id, roleId: registration.roleId, status: 'ACTIVE' } })

      const website = await tx.website.create({ data: { clinicId: clinic.id, isPublished: false } })
      await tx.websiteSettings.create({ data: { websiteId: website.id, metaTitle: registration.clinicName } })
      await tx.websiteSection.createMany({
        data: [
          { websiteId: website.id, type: 'HERO', title: 'الرئيسية', titleEn: 'Hero', sortOrder: 0, isEnabled: true },
          { websiteId: website.id, type: 'ABOUT', title: 'من نحن', titleEn: 'About', sortOrder: 1, isEnabled: true },
          { websiteId: website.id, type: 'SERVICES', title: 'خدماتنا', titleEn: 'Services', sortOrder: 2, isEnabled: true },
          { websiteId: website.id, type: 'DOCTORS', title: 'أطباؤنا', titleEn: 'Doctors', sortOrder: 3, isEnabled: true },
          { websiteId: website.id, type: 'CONTACT', title: 'اتصل بنا', titleEn: 'Contact', sortOrder: 4, isEnabled: true },
          { websiteId: website.id, type: 'BOOKING', title: 'احجز موعداً', titleEn: 'Booking', sortOrder: 5, isEnabled: true },
        ],
      })
    })

    return NextResponse.json({ success: true, message: 'تم التحقق وإنشاء الحساب بنجاح' })
  } catch (error) {
    const message = error instanceof Error ? error.message : ''
    if (message === 'Verification code has already been used' || message === 'Registration data is no longer available') {
      return NextResponse.json({ success: false, error: 'تعذر إكمال التسجيل، أعد المحاولة ببيانات جديدة.' }, { status: 409 })
    }
    console.error('Mobile OTP verification error:', error)
    return NextResponse.json({ success: false, error: 'حدث خطأ داخلي أثناء التحقق' }, { status: 500 })
  }
}
