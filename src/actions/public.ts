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
        status: 'CONFIRMED',
      },
    })

    try {
      const clinicUsers = await prisma.clinicMembership.findMany({
        where: { clinicId },
        include: { user: true }
      });

      const tokens: string[] = [];
      for (const m of clinicUsers) {
        if (m.user.deviceTokens && m.user.deviceTokens.length > 0) {
          tokens.push(...m.user.deviceTokens);
        }
      }

      const uniqueTokens = Array.from(new Set(tokens));

      if (uniqueTokens.length > 0) {
        const { getAdminMessaging } = await import("@/lib/firebase-admin");
        const messaging = getAdminMessaging();
        if (messaging) {
          await messaging.sendEachForMulticast({
            notification: {
              title: "حجز موعد جديد 📅",
              body: `تم حجز موعد للمريض ${validated.fullName} الساعة ${validated.startTime}`,
            },
            tokens: uniqueTokens,
          });
        }
      }
    } catch (pushErr) {
      console.error("Failed to send push notification:", pushErr);
    }

    // Trigger SMS synchronously
    try {
      const { sendAppointmentSMS } = await import('@/lib/sms')
      await sendAppointmentSMS({
        clinicId,
        patientId: patient.id,
        serviceId: validated.serviceId || undefined,
        date: new Date(validated.date),
        startTime: validated.startTime,
        type: 'CONFIRMATION'
      })
    } catch (error) {
      console.error('SMS Error:', error)
    }

    return { success: true, appointment }
  } catch (error: any) {
    console.error('Booking error:', error)
    return { success: false, error: error.message || 'Something went wrong' }
  }
}
