'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'
import { hashPassword, verifyPassword } from '@/lib/auth/password'
import {
  generateSessionToken,
  createSession,
  setSessionCookie,
  deleteSessionCookie,
  invalidateSession,
} from '@/lib/auth/session'
import { createVerificationToken } from '@/lib/auth/tokens'
import { writeAuditLog } from '@/lib/security/audit'
import { loginSchema, signupSchema } from '@/lib/validators/auth'
import { validateSlug, isReservedSlug } from '@/lib/slug/arabic'
import { consumeOtpForUser, issueOtpForUser } from '@/lib/otp'
import { formatSmsPhone, phoneLookupVariants } from '@/lib/whysms'

// ─── HELPERS ───

async function getRequestMeta() {
  const headerList = await headers()
  return {
    ip: headerList.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1',
    userAgent: headerList.get('user-agent') || '',
  }
}

// ─── LOGIN ───

export async function loginAction(_prev: unknown, formData: FormData) {
  const raw = {
    email: (formData.get('email') as string) || '',
    password: (formData.get('password') as string) || '',
  }

  // Validate
  const result = loginSchema.safeParse(raw)
  if (!result.success) {
    return {
      error: result.error.errors[0]?.message || 'بيانات غير صالحة.',
    }
  }

  const { email, password } = result.data
  const { ip, userAgent } = await getRequestMeta()

  // Find user
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  })

  if (!user) {
    return { error: 'اسم المستخدم أو كلمة المرور غير صحيحة.' }
  }

  if (user.status !== 'ACTIVE') {
    return { error: 'تم تعليق هذا الحساب.' }
  }

  // Verify password
  const valid = await verifyPassword(user.passwordHash, password)
  if (!valid) {
    return { error: 'اسم المستخدم أو كلمة المرور غير صحيحة.' }
  }

  // Create session
  const token = generateSessionToken()
  const session = await createSession(token, user.id, ip, userAgent)
  await setSessionCookie(token, session.expiresAt)

  // Audit
  await writeAuditLog({
    actorId: user.id,
    action: 'LOGIN',
    ipAddress: ip,
    userAgent,
  })

  // Redirect based on role
  if (user.isAdmin) {
    redirect('/admin')
  }

  redirect('/dashboard')
}

// ─── SIGNUP ───

export async function signupAction(_prev: unknown, formData: FormData) {
  const raw = {
    fullName: (formData.get('fullName') as string) || '',
    email: (formData.get('email') as string) || '',
    phone: (formData.get('phone') as string) || '',
    password: (formData.get('password') as string) || '',
    confirmPassword: (formData.get('confirmPassword') as string) || '',
    clinicName: (formData.get('clinicName') as string) || '',
    slug: (formData.get('slug') as string) || '',
  }

  // Validate
  const result = signupSchema.safeParse(raw)
  if (!result.success) {
    return {
      error: result.error.errors[0]?.message || 'بيانات غير صالحة.',
    }
  }

  const { fullName, email, phone: submittedPhone, password, clinicName, slug } = result.data
  const phone = formatSmsPhone(submittedPhone)
  if (!phone) {
    return { error: 'رقم الهاتف غير صالح.' }
  }
  const phoneVariants = phoneLookupVariants(submittedPhone)
  const { ip, userAgent } = await getRequestMeta()

  // Validate slug format
  const slugValidation = validateSlug(slug)
  if (!slugValidation.valid) {
    return { error: slugValidation.error }
  }

  // Check reserved slug
  if (isReservedSlug(slug)) {
    return { error: 'هذا العنوان محجوز. يرجى اختيار عنوان آخر.' }
  }

  // Legacy accounts can still use the local Egyptian phone-number form, so
  // compare the safe equivalent forms before creating a new account.
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email: email.toLowerCase().trim() },
        { phone: { in: phoneVariants } },
      ],
    },
  })
  if (existingUser) {
    return { error: 'هذا البريد الإلكتروني مستخدم بالفعل.' }
  }

  // Check slug uniqueness
  const existingClinic = await prisma.clinic.findUnique({
    where: { slug },
  })
  if (existingClinic) {
    return { error: 'هذا العنوان مستخدم بالفعل. يرجى اختيار عنوان آخر.' }
  }

  // Hash password
  const passwordHash = await hashPassword(password)

  // Get the Owner role (system default)
  const ownerRole = await prisma.role.findFirst({
    where: { name: 'Owner', clinicId: null, isSystem: true },
  })

  if (!ownerRole) {
    return { error: 'حدث خطأ في إعداد النظام. يرجى المحاولة لاحقًا.' }
  }

  // Get free plan
  const freePlan = await prisma.plan.findUnique({
    where: { slug: 'free' },
  })

  // Get default theme
  const defaultTheme = await prisma.websiteTheme.findFirst({
    where: { slug: 'modern-dental' },
  })

  // ─── TRANSACTION: Create everything ───
  const { user, clinic } = await prisma.$transaction(async (tx) => {
    // Create user
    const user = await tx.user.create({
      data: {
        email: email.toLowerCase().trim(),
        passwordHash,
        fullName,
        phone,
      },
    })

    // Create clinic
    const clinic = await tx.clinic.create({
      data: {
        name: clinicName,
        slug,
      },
    })

    // Create clinic settings
    await tx.clinicSettings.create({
      data: {
        clinicId: clinic.id,
      },
    })

    // Create membership (Owner)
    await tx.clinicMembership.create({
      data: {
        userId: user.id,
        clinicId: clinic.id,
        roleId: ownerRole.id,
      },
    })

    // Create website
    const website = await tx.website.create({
      data: {
        clinicId: clinic.id,
        themeId: defaultTheme?.id || null,
      },
    })

    // Create default website sections
    const defaultSections = [
      { type: 'HERO' as const, title: 'مرحبًا بكم', sortOrder: 0, isEnabled: true },
      { type: 'ABOUT' as const, title: 'من نحن', sortOrder: 1, isEnabled: true },
      { type: 'SERVICES' as const, title: 'خدماتنا', sortOrder: 2, isEnabled: true },
      { type: 'DOCTORS' as const, title: 'أطباؤنا', sortOrder: 3, isEnabled: true },
      { type: 'CONTACT' as const, title: 'تواصل معنا', sortOrder: 4, isEnabled: true },
      { type: 'BOOKING' as const, title: 'احجز موعدك', sortOrder: 5, isEnabled: true },
      { type: 'FAQ' as const, title: 'الأسئلة الشائعة', sortOrder: 6, isEnabled: false },
      { type: 'GALLERY' as const, title: 'معرض الصور', sortOrder: 7, isEnabled: false },
      { type: 'TESTIMONIALS' as const, title: 'آراء المرضى', sortOrder: 8, isEnabled: false },
      { type: 'WHY_CHOOSE_US' as const, title: 'لماذا تختارنا', sortOrder: 9, isEnabled: false },
    ]

    for (const section of defaultSections) {
      await tx.websiteSection.create({
        data: {
          websiteId: website.id,
          ...section,
        },
      })
    }

    // Create website settings
    await tx.websiteSettings.create({
      data: {
        websiteId: website.id,
        metaTitle: clinicName,
      },
    })

    // Create platform subdomain domain record
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000'
    await tx.domain.create({
      data: {
        clinicId: clinic.id,
        domain: `${slug}.${rootDomain.replace(/:\d+$/, '')}`,
        type: 'PLATFORM_SUBDOMAIN',
        status: 'ACTIVE',
        isPrimary: true,
        verifiedAt: new Date(),
      },
    })

    // Create subscription (free plan)
    if (freePlan) {
      await tx.subscription.create({
        data: {
          clinicId: clinic.id,
          planId: freePlan.id,
        },
      })
    }

    return { user, clinic }
  })

  // Create session (outside transaction)
  const token = generateSessionToken()
  const session = await createSession(token, user.id, ip, userAgent)
  await setSessionCookie(token, session.expiresAt)

  // Create email verification token
  createVerificationToken(user.id, user.email).catch(console.error)

  const otpResult = await issueOtpForUser(user.id, phone)
  if (!otpResult.success) {
    return { error: 'تعذر إرسال رمز التحقق. تحقق من إعدادات SMS ثم أعد المحاولة.' }
  }

  // Audit
  await writeAuditLog({
    actorId: user.id,
    clinicId: clinic.id,
    action: 'SIGNUP',
    resource: 'clinic',
    resourceId: clinic.id,
    metadata: { clinicName, slug },
    ipAddress: ip,
    userAgent,
  })

  redirect('/verify-otp')
}

// ─── LOGOUT ───

export async function logoutAction() {
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  const cookieName = process.env.NODE_ENV === 'production' ? '__Host-session' : 'session'
  const token = cookieStore.get(cookieName)?.value

  if (token) {
    const { ip, userAgent } = await getRequestMeta()

    // Get user before invalidating
    const { validateSessionToken } = await import('@/lib/auth/session')
    const { user } = await validateSessionToken(token)

    await invalidateSession(token)

    if (user) {
      await writeAuditLog({
        actorId: user.id,
        action: 'LOGOUT',
        ipAddress: ip,
        userAgent,
      })
    }
  }

  await deleteSessionCookie()
  redirect('/login')
}

// ─── SLUG AVAILABILITY CHECK ───

export async function checkSlugAvailability(slug: string) {
  // Validate format
  const validation = validateSlug(slug)
  if (!validation.valid) {
    return { available: false, error: validation.error }
  }

  // Check reserved
  if (isReservedSlug(slug)) {
    return { available: false, error: 'هذا العنوان محجوز.' }
  }

  // Check database
  const existing = await prisma.clinic.findUnique({
    where: { slug },
    select: { id: true },
  })

  if (existing) {
    return { available: false, error: 'هذا العنوان مستخدم بالفعل.' }
  }

  return { available: true }
}

// ─── VERIFY OTP ───

export async function verifyOtpAction(_prev: unknown, formData: FormData) {
  const code = (formData.get('code') as string) || ''
  
  if (!code || code.length !== 6) {
    return { error: 'الرمز غير صحيح، يجب أن يتكون من 6 أرقام.' }
  }

  // Get current user session
  const { getCurrentUser } = await import('@/lib/auth/dal')
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  const verified = await consumeOtpForUser(user.id, code)

  if (!verified) {
    return { error: 'الرمز غير صحيح أو منتهي الصلاحية.' }
  }

  await prisma.user.update({ where: { id: user.id }, data: { phoneVerified: true } })

  redirect('/dashboard')
}

export async function resendOtpAction() {
  const { getCurrentUser } = await import('@/lib/auth/dal')
  const user = await getCurrentUser()

  if (!user || !user.phone) {
    return { error: 'حدث خطأ غير متوقع' }
  }

  const otpResult = await issueOtpForUser(user.id, user.phone)
  if (!otpResult.success) return { error: otpResult.error }

  return { success: 'تم إرسال رمز جديد بنجاح' }
}

// ─── FORGOT PASSWORD ───

export async function forgotPasswordAction(_prev: unknown, formData: FormData) {
  const phone = (formData.get('phone') as string) || ''
  
  if (!phone) {
    return { error: 'الرجاء إدخال رقم الهاتف' }
  }

  const user = await prisma.user.findFirst({
    where: { phone: { in: phoneLookupVariants(phone) } },
  })

  if (!user || !user.phone) {
    return { error: 'رقم الهاتف غير مسجل لدينا' }
  }

  const otpResult = await issueOtpForUser(user.id, user.phone)
  if (!otpResult.success) return { error: otpResult.error }

  redirect(`/reset-password?phone=${encodeURIComponent(user.phone)}`)
}

// ─── RESET PASSWORD ───

export async function resetPasswordAction(_prev: unknown, formData: FormData) {
  const phone = (formData.get('phone') as string) || ''
  const code = (formData.get('code') as string) || ''
  const newPassword = (formData.get('newPassword') as string) || ''
  const confirmPassword = (formData.get('confirmPassword') as string) || ''

  if (!phone || !code || !newPassword || !confirmPassword) {
    return { error: 'الرجاء إكمال جميع الحقول' }
  }

  if (newPassword !== confirmPassword) {
    return { error: 'كلمتا المرور غير متطابقتين' }
  }

  if (newPassword.length < 8) {
    return { error: 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل' }
  }

  const user = await prisma.user.findFirst({
    where: { phone: { in: phoneLookupVariants(phone) } },
  })

  if (!user) {
    return { error: 'المستخدم غير موجود' }
  }

  const verified = await consumeOtpForUser(user.id, code)

  if (!verified) {
    return { error: 'رمز التحقق غير صحيح أو منتهي الصلاحية' }
  }

  const { hashPassword } = await import('@/lib/auth/password')
  const passwordHash = await hashPassword(newPassword)

  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } })

  redirect('/login?reset=success')
}
