'use server'

import { prisma } from '@/lib/db/prisma'
import { requireAuth } from '@/lib/auth/dal'

export async function getRecentNotifications(clinicId: string) {
  await requireAuth()

  // Fetch appointments created in the last 24 hours
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  const appointments = await prisma.appointment.findMany({
    where: {
      clinicId,
      createdAt: { gte: yesterday }
    },
    include: {
      patient: { select: { fullName: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: 5
  })

  return appointments.map(apt => ({
    id: apt.id,
    patientName: apt.patient.fullName,
    date: apt.date.toLocaleDateString('ar-EG-u-nu-latn', { weekday: 'long', day: 'numeric', month: 'short' }),
    time: apt.startTime,
    status: apt.status,
    createdAt: apt.createdAt
  }))
}
