import { NextResponse } from 'next/server'
import { z } from 'zod'

import { prisma } from '@/lib/db/prisma'
import { requireApiPermission } from '@/lib/auth/api-auth'
import { sendAppointmentSMS, type AppointmentSmsType } from '@/lib/sms'

const statusSchema = z.object({
  status: z.enum(['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']),
})

const smsTypeForStatus: Record<string, AppointmentSmsType> = {
  SCHEDULED: 'CONFIRMATION',
  CONFIRMED: 'CONFIRMATION',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLATION',
  NO_SHOW: 'NO_SHOW',
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { clinic } = await requireApiPermission(req, 'appointments.update')
    const { id } = await params
    const parsed = statusSchema.safeParse(await req.json())
    if (!parsed.success) return NextResponse.json({ success: false, error: 'حالة الموعد غير صالحة' }, { status: 400 })

    const existing = await prisma.appointment.findFirst({ where: { id, clinicId: clinic.id } })
    if (!existing) return NextResponse.json({ success: false, error: 'الموعد غير موجود' }, { status: 404 })

    const appointment = await prisma.appointment.update({ where: { id: existing.id }, data: { status: parsed.data.status } })
    let sms: { sent: boolean; reason?: string } = { sent: false }

    if (existing.status !== appointment.status) {
      const result = await sendAppointmentSMS({
        clinicId: clinic.id,
        patientId: appointment.patientId,
        serviceId: appointment.serviceId,
        date: appointment.date,
        startTime: appointment.startTime,
        type: smsTypeForStatus[appointment.status],
      })
      sms = result.success ? { sent: true } : { sent: false, reason: result.error }
      if (!result.success && result.error !== 'Disabled in clinic settings') {
        console.error('Appointment status SMS was not sent', { appointmentId: appointment.id, status: appointment.status, reason: result.error })
      }
    }

    return NextResponse.json({ success: true, data: appointment, sms })
  } catch (error) {
    const message = error instanceof Error ? error.message : ''
    if (message.includes('Unauthorized') || message.includes('Forbidden')) {
      return NextResponse.json({ success: false, error: message }, { status: message.includes('Forbidden') ? 403 : 401 })
    }
    console.error('Appointment status update failed:', error)
    return NextResponse.json({ success: false, error: 'حدث خطأ أثناء تحديث حالة الموعد' }, { status: 500 })
  }
}
