import { randomInt } from 'crypto'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { hashPassword } from '@/lib/auth/password'
import { signRegistrationToken } from '@/lib/auth/api-auth'
import { formatSmsPhone, phoneLookupVariants, sendOtpSms } from '@/lib/whysms'
import { validateSlug, isReservedSlug } from '@/lib/slug/arabic'
import { signupSchema } from '@/lib/validators/auth'

export async function POST(req: Request) {
  try {
    const parsed = signupSchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0]?.message ?? 'بيانات غير صالحة' }, { status: 400 })
    }

    const { fullName, email, phone: submittedPhone, password, clinicName, slug } = parsed.data
    const phone = formatSmsPhone(submittedPhone)
    if (!phone) {
      return NextResponse.json({ success: false, error: 'رقم الهاتف غير صالح' }, { status: 400 })
    }
    const phoneVariants = phoneLookupVariants(submittedPhone)
    const slugValidation = validateSlug(slug)
    if (!slugValidation.valid || isReservedSlug(slug)) {
      return NextResponse.json({ success: false, error: slugValidation.error ?? 'رابط العيادة غير متاح' }, { status: 400 })
    }

    const [existingUser, existingClinic, ownerRole] = await Promise.all([
      prisma.user.findFirst({ where: { OR: [{ email }, { phone: { in: phoneVariants } }] }, select: { id: true } }),
      prisma.clinic.findUnique({ where: { slug }, select: { id: true } }),
      prisma.role.findFirst({ where: { name: 'Owner', clinicId: null, isSystem: true }, select: { id: true } }),
    ])

    if (existingUser) return NextResponse.json({ success: false, error: 'البريد الإلكتروني أو رقم الهاتف مستخدم بالفعل' }, { status: 409 })
    if (existingClinic) return NextResponse.json({ success: false, error: 'رابط العيادة مستخدم بالفعل' }, { status: 409 })
    if (!ownerRole) return NextResponse.json({ success: false, error: 'تعذر تجهيز دور مالك العيادة' }, { status: 500 })

    const passwordHash = await hashPassword(password)
    const code = randomInt(100000, 1000000).toString()
    const otpHash = await hashPassword(code)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)
    const payload = { email, phone, passwordHash, fullName, clinicName, slug, roleId: ownerRole.id }

    // There is one active mobile-registration record per phone/email. This also
    // makes a later resend invalidate the earlier code rather than accepting both.
    const pending = await prisma.$transaction(async (tx) => {
      await tx.pendingRegistration.deleteMany({ where: { OR: [{ phone: { in: phoneVariants } }, { email }] } })
      return tx.pendingRegistration.create({ data: { phone, email, otpCode: otpHash, payload, expiresAt } })
    })

    const delivery = await sendOtpSms(phone, code)
    if (!delivery.success) {
      await prisma.pendingRegistration.delete({ where: { id: pending.id } }).catch(() => undefined)
      return NextResponse.json({ success: false, error: 'تعذر إرسال رمز التحقق. تحقق من إعدادات SMS ثم أعد المحاولة.' }, { status: 503 })
    }

    const registrationToken = await signRegistrationToken({ pendingRegistrationId: pending.id })
    return NextResponse.json({ success: true, message: 'تم إرسال رمز التحقق', registrationToken })
  } catch (error) {
    console.error('Mobile registration error:', error)
    return NextResponse.json({ success: false, error: 'حدث خطأ داخلي أثناء إنشاء طلب التسجيل' }, { status: 500 })
  }
}
