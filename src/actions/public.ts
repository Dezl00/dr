'use server'

import { prisma } from '@/lib/db/prisma'
import { resolveTenant } from '@/lib/tenant/resolver'
import { z } from 'zod'

const bookingSchema = z.object({
  domain: z.string(),
  serviceId: z.string().optional(),
  doctorId: z.string(),
  date: z.string(),
  startTime: z.string(),
  fullName: z.string().min(2, "Name is too short"),
  phone: z.string().min(8, "Phone is too short"),
})

export async function bookAppointment(data: z.infer<typeof bookingSchema>) {
  try {
    const validated = bookingSchema.parse(data)
    
    // Resolve tenant
    const tenant = await resolveTenant(validated.domain)
    if (!tenant) {
      return { success: false, error: 'Clinic not found' }
    }

    const { clinicId } = tenant

    // Find or create patient
    let patient = await prisma.patient.findFirst({
      where: {
        clinicId,
        phone: validated.phone,
      },
    })

    if (!patient) {
      patient = await prisma.patient.create({
        data: {
          clinicId,
          fullName: validated.fullName,
          phone: validated.phone,
        },
      })
    }

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        clinicId,
        patientId: patient.id,
        doctorId: validated.doctorId,
        serviceId: validated.serviceId || null,
        date: new Date(validated.date),
        startTime: validated.startTime,
        status: 'SCHEDULED',
      },
    })

    return { success: true, appointment }
  } catch (error: any) {
    console.error('Booking error:', error)
    return { success: false, error: error.message || 'Something went wrong' }
  }
}
