'use server'

import { requireAuth, getCurrentSession } from '@/lib/auth/dal'
import { prisma } from '@/lib/db/prisma'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

async function getActiveClinicId(userId: string): Promise<string> {
  const { session } = await getCurrentSession()
  const user = await requireAuth()
  
  if (
    user.isAdmin &&
    session?.adminAccessClinicId &&
    session?.adminAccessExpiresAt &&
    new Date() < session.adminAccessExpiresAt
  ) {
    return session.adminAccessClinicId
  }
  
  const membership = await prisma.clinicMembership.findFirst({
    where: { userId, status: 'ACTIVE' },
  })
  
  if (!membership) {
    throw new Error('No active clinic found')
  }
  
  return membership.clinicId
}

export async function createDoctor(formData: FormData) {
  const user = await requireAuth()
  const clinicId = await getActiveClinicId(user.id)
  
  const fullName = formData.get('fullName') as string
  const specialty = formData.get('specialty') as string
  const phone = formData.get('phone') as string
  const email = formData.get('email') as string
  
  if (!fullName) {
    throw new Error('Name is required')
  }

  await prisma.doctor.create({
    data: {
      clinicId,
      fullName,
      specialty,
      phone,
      email,
    },
  })

  revalidatePath('/dashboard/doctors')
  redirect('/dashboard/doctors')
}

export async function createService(formData: FormData) {
  const user = await requireAuth()
  const clinicId = await getActiveClinicId(user.id)
  
  const name = formData.get('name') as string
  const price = formData.get('price') as string
  const duration = formData.get('duration') as string
  
  if (!name) {
    throw new Error('Name is required')
  }

  await prisma.service.create({
    data: {
      clinicId,
      name,
      price: price ? parseFloat(price) : null,
      duration: duration ? parseInt(duration, 10) : null,
    },
  })

  revalidatePath('/dashboard/services')
  redirect('/dashboard/services')
}

export async function createAppointment(formData: FormData) {
  const user = await requireAuth()
  const clinicId = await getActiveClinicId(user.id)
  
  const patientId = formData.get('patientId') as string
  const doctorId = formData.get('doctorId') as string
  const serviceId = formData.get('serviceId') as string
  const date = formData.get('date') as string
  const startTime = formData.get('startTime') as string
  const notes = formData.get('notes') as string
  
  if (!patientId || !doctorId || !date || !startTime) {
    throw new Error('Missing required fields')
  }

  await prisma.appointment.create({
    data: {
      clinicId,
      patientId,
      doctorId,
      serviceId: serviceId || null,
      date: new Date(date),
      startTime,
      notes,
    },
  })

  revalidatePath('/dashboard/appointments')
  redirect('/dashboard/appointments')
}
