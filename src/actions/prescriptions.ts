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

export async function createPrescription(patientId: string, prevState: any, formData: FormData) {
  try {
    const user = await requireAuth()
    const clinicId = await getClinicId(user.id)
    if (!clinicId) throw new Error('Unauthorized')

    const notes = formData.get('notes') as string
    
    // Parse dynamic medications
    const medications = []
    let i = 0
    while (formData.has(`medications[${i}][name]`)) {
      medications.push({
        name: formData.get(`medications[${i}][name]`) as string,
        dosage: formData.get(`medications[${i}][dosage]`) as string,
        frequency: formData.get(`medications[${i}][frequency]`) as string,
      })
      i++
    }

    if (medications.length === 0) {
      return { error: 'يجب إضافة دواء واحد على الأقل' }
    }

    // Find doctor id associated with this user
    const doctor = await prisma.doctor.findFirst({
      where: { userId: user.id, clinicId }
    })

    if (!doctor) {
      return { error: 'لا تملك صلاحية كتابة روشتة (يجب أن يكون حسابك مسجل كطبيب)' }
    }

    await prisma.prescription.create({
      data: {
        clinicId,
        patientId,
        doctorId: doctor.id,
        medications,
        notes
      }
    })

    revalidatePath(`/dashboard/patients/${patientId}`)
    return { success: true }
  } catch (error) {
    return { error: 'حدث خطأ أثناء حفظ الروشتة' }
  }
}
