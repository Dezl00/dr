'use server'

import { prisma } from '@/lib/db/prisma'
import { requireAuth } from '@/lib/auth/dal'

export async function searchGlobal(query: string, clinicId: string) {
  if (!query || query.length < 2) return { patients: [], doctors: [], services: [] }
  
  await requireAuth()

  const [patients, doctors, services] = await Promise.all([
    prisma.patient.findMany({
      where: {
        clinicId,
        OR: [
          { fullName: { contains: query } },
          { phone: { contains: query } }
        ]
      },
      take: 5,
      select: { id: true, fullName: true, phone: true }
    }),
    prisma.doctor.findMany({
      where: {
        clinicId,
        OR: [
          { fullName: { contains: query } },
          { phone: { contains: query } },
          { specialty: { contains: query } }
        ]
      },
      take: 5,
      select: { id: true, fullName: true, specialty: true }
    }),
    prisma.service.findMany({
      where: {
        clinicId,
        name: { contains: query }
      },
      take: 5,
      select: { id: true, name: true, price: true }
    })
  ])

  return { patients, doctors, services }
}
