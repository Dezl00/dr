import { NextResponse } from 'next/server'
import { fromZonedTime } from 'date-fns-tz'

import { prisma } from '@/lib/db/prisma'
import { sendAppointmentSMS } from '@/lib/sms'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const beforeWindowMs = 5 * 60 * 1000
const afterWindowMs = 65 * 60 * 1000

function appointmentInstant(date: Date, startTime: string, timezone: string) {
  const datePart = date.toISOString().slice(0, 10)
  return fromZonedTime(`${datePart}T${startTime}:00`, timezone)
}

export async function GET(req: Request) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    console.error('CRON_SECRET is not configured')
    return NextResponse.json({ success: false, error: 'Cron is not configured' }, { status: 503 })
  }
  if (req.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const now = new Date()
    let sent = 0
    let failed = 0

    const clinics = await prisma.clinicSettings.findMany({
      where: { notifyAppointmentReminder: true },
      select: {
        clinicId: true,
        reminderHoursBefore: true,
        clinic: { select: { timezone: true } },
      },
    })

    for (const settings of clinics) {
      // The date filter limits the candidate set. The precise reminder window
      // below accounts for clinic timezone and the configured lead time.
      const endDate = new Date(now.getTime() + (settings.reminderHoursBefore * 60 * 60 * 1000) + afterWindowMs)
      // Date-only appointment fields are stored as UTC dates, while reminder
      // times follow each clinic's timezone. Keep a day on either side before
      // applying the exact timezone-aware time window below.
      const firstCandidateDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1))
      const lastCandidateDate = new Date(Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate() + 1))
      const appointments = await prisma.appointment.findMany({
        where: {
          clinicId: settings.clinicId,
          status: { in: ['SCHEDULED', 'CONFIRMED'] },
          reminderSentAt: null,
          date: { gte: firstCandidateDate, lte: lastCandidateDate },
        },
        select: { id: true, patientId: true, serviceId: true, date: true, startTime: true },
      })

      for (const appointment of appointments) {
        const millisecondsUntil = appointmentInstant(appointment.date, appointment.startTime, settings.clinic.timezone).getTime() - now.getTime()
        const target = settings.reminderHoursBefore * 60 * 60 * 1000
        if (millisecondsUntil < target - beforeWindowMs || millisecondsUntil > target + afterWindowMs) continue

        // Claim before delivery so concurrent cron invocations cannot send the
        // same reminder twice. A failed delivery releases the claim for retry.
        const claimed = await prisma.appointment.updateMany({
          where: { id: appointment.id, reminderSentAt: null, status: { in: ['SCHEDULED', 'CONFIRMED'] } },
          data: { reminderSentAt: now },
        })
        if (claimed.count !== 1) continue

        const result = await sendAppointmentSMS({
          clinicId: settings.clinicId,
          patientId: appointment.patientId,
          serviceId: appointment.serviceId,
          date: appointment.date,
          startTime: appointment.startTime,
          type: 'REMINDER',
        })
        if (result.success) {
          sent += 1
        } else {
          failed += 1
          await prisma.appointment.updateMany({
            where: { id: appointment.id, reminderSentAt: now },
            data: { reminderSentAt: null },
          })
          console.error('Automatic reminder was not sent', { appointmentId: appointment.id, reason: result.error })
        }
      }
    }

    return NextResponse.json({ success: true, sent, failed, processedAt: now.toISOString() })
  } catch (error) {
    console.error('Automatic reminder job failed:', error)
    return NextResponse.json({ success: false, error: 'Reminder job failed' }, { status: 500 })
  }
}
