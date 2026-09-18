'use server'

import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'
import { requireAuth, getCurrentSession } from '@/lib/auth/dal'
import { requirePermission } from '@/lib/permissions/service'
import { PERMISSIONS } from '@/lib/permissions/constants'
import { createPatientSchema } from '@/lib/validators/patient'

async function getClinicId() {
  const user = await requireAuth()
  const { session } = await getCurrentSession()
  if (user.isAdmin && session?.adminAccessClinicId) return { clinicId: session.adminAccessClinicId, userId: user.id }
  const membership = await prisma.clinicMembership.findFirst({
    where: { userId: user.id, status: 'ACTIVE' },
    select: { clinicId: true },
  })
  return { clinicId: membership?.clinicId || '', userId: user.id }
}

export async function createPatientAction(_prev: unknown, formData: FormData) {
  const { clinicId, userId } = await getClinicId()
  if (!clinicId) return { error: 'لا توجد عيادة نشطة.' }

  await requirePermission(userId, PERMISSIONS.PATIENTS_CREATE, clinicId)

  const raw = {
    fullName: formData.get('fullName') as string,
    phone: (formData.get('phone') as string) || undefined,
    email: (formData.get('email') as string) || undefined,
    dateOfBirth: (formData.get('dateOfBirth') as string) || undefined,
    gender: (formData.get('gender') as string) || undefined,
    address: (formData.get('address') as string) || undefined,
    notes: (formData.get('notes') as string) || undefined,
  }

  const result = createPatientSchema.safeParse(raw)
  if (!result.success) {
    return { error: result.error.errors[0]?.message || 'بيانات غير صالحة.' }
  }

  await prisma.patient.create({
    data: {
      clinicId,
      fullName: result.data.fullName,
      phone: result.data.phone || null,
      email: result.data.email || null,
      dateOfBirth: result.data.dateOfBirth ? new Date(result.data.dateOfBirth) : null,
      gender: result.data.gender as any || null,
      address: result.data.address || null,
      notes: result.data.notes || null,
    },
  })

  redirect('/dashboard/patients')
}
