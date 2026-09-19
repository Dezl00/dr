'use server'

import { redirect } from 'next/navigation'
import { cookies, headers } from 'next/headers'
import { prisma } from '@/lib/db/prisma'
import { requireAdmin, requireSuperAdmin, getCurrentSession } from '@/lib/auth/dal'
import { hashSessionToken } from '@/lib/auth/session'
import { writeAuditLog } from '@/lib/security/audit'

export async function openClinicAsAdmin(formData: FormData) {
  const admin = await requireAdmin()
  const clinicId = formData.get('clinicId') as string

  if (!clinicId) {
    throw new Error('العيادة غير محددة.')
  }

  // Verify clinic exists
  const clinic = await prisma.clinic.findUnique({
    where: { id: clinicId },
    select: { id: true, name: true },
  })

  if (!clinic) {
    throw new Error('العيادة غير موجودة.')
  }

  // Get current session
  const cookieStore = await cookies()
  const cookieName = process.env.NODE_ENV === 'production' ? '__Host-session' : 'session'
  const token = cookieStore.get(cookieName)?.value

  if (!token) {
    redirect('/login')
  }

  const sessionId = hashSessionToken(token)

  // Update session with admin tenant access
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60) // 1 hour
  await prisma.session.update({
    where: { id: sessionId },
    data: {
      adminAccessClinicId: clinicId,
      adminAccessStartedAt: new Date(),
      adminAccessExpiresAt: expiresAt,
    },
  })

  // Audit log
  const headerList = await headers()
  await writeAuditLog({
    actorId: admin.id,
    clinicId,
    action: 'ADMIN_CLINIC_ACCESS',
    resource: 'clinic',
    resourceId: clinicId,
    metadata: { clinicName: clinic.name },
    ipAddress: headerList.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1',
    userAgent: headerList.get('user-agent') || '',
  })

  redirect('/dashboard')
}

export async function exitClinicAsAdmin() {
  const admin = await requireAdmin()

  const cookieStore = await cookies()
  const cookieName = process.env.NODE_ENV === 'production' ? '__Host-session' : 'session'
  const token = cookieStore.get(cookieName)?.value

  if (!token) {
    redirect('/login')
  }

  const sessionId = hashSessionToken(token)

  // Get current clinic for audit
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: { adminAccessClinicId: true },
  })

  // Clear admin access
  await prisma.session.update({
    where: { id: sessionId },
    data: {
      adminAccessClinicId: null,
      adminAccessStartedAt: null,
      adminAccessExpiresAt: null,
    },
  })

  // Audit
  if (session?.adminAccessClinicId) {
    const headerList = await headers()
    await writeAuditLog({
      actorId: admin.id,
      clinicId: session.adminAccessClinicId,
      action: 'ADMIN_CLINIC_EXIT',
      ipAddress: headerList.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1',
      userAgent: headerList.get('user-agent') || '',
    })
  }

  redirect('/admin/clinics')
}

export async function savePlan(formData: FormData, id?: string) {
  const admin = await requireSuperAdmin()

  const name = formData.get('name') as string
  const nameAr = formData.get('nameAr') as string
  const slug = formData.get('slug') as string
  const description = formData.get('description') as string
  const priceMonthly = formData.get('priceMonthly') ? Number(formData.get('priceMonthly')) : null
  const priceYearly = formData.get('priceYearly') ? Number(formData.get('priceYearly')) : null
  const isActive = formData.get('isActive') === 'on'
  const sortOrder = parseInt(formData.get('sortOrder') as string) || 0

  if (!name || !nameAr || !slug) {
    return { error: 'الرجاء ملء جميع الحقول المطلوبة' }
  }

  try {
    if (id) {
      await prisma.plan.update({
        where: { id },
        data: { name, nameAr, slug, description, priceMonthly, priceYearly, isActive, sortOrder },
      })
    } else {
      await prisma.plan.create({
        data: { name, nameAr, slug, description, priceMonthly, priceYearly, isActive, sortOrder },
      })
    }
  } catch (error: any) {
    return { error: 'حدث خطأ أثناء الحفظ. تأكد من أن الرابط اللطيف غير مكرر.' }
  }

  return { success: true }
}

export async function verifyDomain(domainId: string) {
  const admin = await requireSuperAdmin()
  
  await prisma.domain.update({
    where: { id: domainId },
    data: { 
      status: 'VERIFIED',
      verifiedAt: new Date()
    }
  })

  const { revalidatePath } = await import('next/cache')
  revalidatePath('/admin/domains')
  
  return { success: true }
}

export async function savePlatformSettings(formData: FormData) {
  const admin = await requireSuperAdmin()

  const platformName = formData.get('platformName') as string
  const primaryColor = (formData.get('primaryColorText') || formData.get('primaryColor')) as string
  const accentColor = (formData.get('accentColorText') || formData.get('accentColor')) as string
  const defaultRadius = formData.get('defaultRadius') as string

  const settings = await prisma.platformSettings.findFirst()

  if (settings) {
    await prisma.platformSettings.update({
      where: { id: settings.id },
      data: { platformName, primaryColor, accentColor, defaultRadius }
    })
  } else {
    await prisma.platformSettings.create({
      data: { platformName, primaryColor, accentColor, defaultRadius }
    })
  }

  const { revalidatePath } = await import('next/cache')
  revalidatePath('/admin/settings')

  return { success: true }
}

export async function updateClinicColors(clinicId: string, formData: FormData) {
  await requireAdmin()
  
  const primaryColor = (formData.get('primaryColorText') as string) || (formData.get('primaryColor') as string) || '#2563EB'
  const secondaryColor = (formData.get('secondaryColorText') as string) || (formData.get('secondaryColor') as string) || '#1E40AF'
  const accentColor = (formData.get('accentColorText') as string) || (formData.get('accentColor') as string) || '#3B82F6'

  await prisma.clinicSettings.upsert({
    where: { clinicId },
    update: { primaryColor, secondaryColor, accentColor },
    create: { clinicId, primaryColor, secondaryColor, accentColor }
  })

  const { revalidatePath } = await import('next/cache')
  revalidatePath(`/admin/clinics/${clinicId}`)
  revalidatePath('/admin/clinics')

  return { success: true }
}
