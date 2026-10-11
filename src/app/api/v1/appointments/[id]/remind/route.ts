import { NextResponse } from 'next/server'

import { prisma } from '@/lib/db/prisma'
import { requireApiPermission } from '@/lib/auth/api-auth'
import { sendAppointmentSMS } from '@/lib/sms'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { clinic } = await requireApiPermission(req, 'appointments.update')
    const { id } = await params
    const appointment = await prisma.appointment.findFirst({ where: { id, clinicId: clinic.id } })
    if (!appointment) return NextResponse.json({ success: false, error: 'الموعد غير موجود' }, { status: 404 })
    if (appointment.status === 'CANCELLED' || (appointment.status as string)?.toUpperCase() === 'CANCELLED') {
      return NextResponse.json({ success: false, error: 'لا يمكن إرسال تذكير لموعد ملغى' }, { status: 400 })
    }

    const result = await sendAppointmentSMS({
      clinicId: clinic.id,
      patientId: appointment.patientId,
      serviceId: appointment.serviceId,
      date: appointment.date,
      startTime: appointment.startTime,
      type: 'REMINDER',
      status: appointment.status,
    })
    if (!result.success) {
      const status = result.error === 'Disabled in clinic settings' ? 409 : 503
      return NextResponse.json({ success: false, error: result.error }, { status })
    }
    return NextResponse.json({ success: true, message: 'تم إرسال رسالة التذكير بنجاح' })
  } catch (error) {
    const message = error instanceof Error ? error.message : ''
    if (message.includes('Unauthorized') || message.includes('Forbidden')) {
      return NextResponse.json({ success: false, error: message }, { status: message.includes('Forbidden') ? 403 : 401 })
    }
    console.error('Manual appointment reminder failed:', error)
    return NextResponse.json({ success: false, error: 'تعذر إرسال رسالة التذكير' }, { status: 500 })
  }
}
