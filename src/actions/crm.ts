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

export async function createLead(prevState: any, formData: FormData) {
  try {
    const user = await requireAuth()
    const clinicId = await getClinicId(user.id)
    if (!clinicId) throw new Error('Unauthorized')

    const fullName = formData.get('fullName') as string
    const phone = formData.get('phone') as string
    const source = formData.get('source') as string
    const notes = formData.get('notes') as string

    if (!fullName || !phone) {
      return { error: 'الاسم ورقم الهاتف حقول مطلوبة' }
    }

    await prisma.lead.create({
      data: {
        clinicId,
        fullName,
        phone,
        source: source || 'MANUAL',
        notes,
        status: 'NEW'
      }
    })

    revalidatePath('/dashboard/crm')
    return { success: true }
  } catch (error) {
    return { error: 'حدث خطأ أثناء حفظ العميل المحتمل' }
  }
}
