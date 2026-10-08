'use server'

import { requireAuth, getCurrentSession } from '@/lib/auth/dal'
import { prisma } from '@/lib/db/prisma'
import { revalidatePath } from 'next/cache'

async function getClinicId(userId: string) {
  const { session } = await getCurrentSession()
  if (session?.adminAccessClinicId) return session.adminAccessClinicId
  const membership = await prisma.clinicMembership.findFirst({
    where: { userId, status: 'ACTIVE' },
  })
  return membership?.clinicId
}

export async function updateMedicalHistory(patientId: string, formData: FormData) {
  try {
    const user = await requireAuth()
    const clinicId = await getClinicId(user.id)
    if (!clinicId) throw new Error('Unauthorized')

    // Verify patient belongs to clinic
    const patient = await prisma.patient.findUnique({
      where: { id: patientId, clinicId }
    })
    if (!patient) throw new Error('Patient not found')

    const data = {
      bloodType: formData.get('bloodType') as string,
      allergies: formData.get('allergies') as string,
      medications: formData.get('medications') as string,
      notes: formData.get('notes') as string,
    }

    await prisma.medicalHistory.upsert({
      where: { patientId },
      update: data,
      create: { patientId, ...data }
    })

    revalidatePath(`/dashboard/patients/${patientId}`)
    return { success: true }
  } catch (error) {
    return { error: 'حدث خطأ أثناء حفظ السجل الطبي' }
  }
}

export async function updateDentalRecord(patientId: string, toothNumber: number, condition: string, notes?: string) {
  try {
    const user = await requireAuth()
    const clinicId = await getClinicId(user.id)
    if (!clinicId) throw new Error('Unauthorized')

    await prisma.dentalRecord.upsert({
      where: {
        patientId_toothNumber: { patientId, toothNumber }
      },
      update: { condition, notes },
      create: { patientId, toothNumber, condition, notes }
    })

    revalidatePath(`/dashboard/patients/${patientId}`)
    return { success: true }
  } catch (error) {
    return { error: 'حدث خطأ أثناء تحديث حالة السن' }
  }
}
