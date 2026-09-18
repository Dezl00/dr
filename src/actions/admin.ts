'use server'

import { redirect } from 'next/navigation'
import { cookies, headers } from 'next/headers'
import { prisma } from '@/lib/db/prisma'
import { requireAdmin, getCurrentSession } from '@/lib/auth/dal'
import { hashSessionToken } from '@/lib/auth/session'
import { writeAuditLog } from '@/lib/security/audit'

export async function openClinicAsAdmin(formData: FormData) {
  const admin = await requireAdmin()
  const clinicId = formData.get('clinicId') as string

  if (!clinicId) {
    return { error: 'العيادة غير محددة.' }
  }

  // Verify clinic exists
  const clinic = await prisma.clinic.findUnique({
    where: { id: clinicId },
    select: { id: true, name: true },
  })

  if (!clinic) {
    return { error: 'العيادة غير موجودة.' }
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
