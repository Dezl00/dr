import { prisma } from './db/prisma'
import { sendSms, type SmsResult } from './whysms'

export type AppointmentSmsType = 'CONFIRMATION' | 'REMINDER' | 'CANCELLATION' | 'COMPLETED' | 'NO_SHOW'

interface SmsServiceProps {
  clinicId: string
  patientId: string
  serviceId?: string | null
  date: Date
  startTime: string
  type: AppointmentSmsType
}

function dateLabel(date: Date, timezone: string) {
  return new Intl.DateTimeFormat('ar-EG', {
    calendar: 'gregory',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: timezone,
  }).format(date)
}

export async function sendAppointmentSMS({ clinicId, patientId, serviceId, date, startTime, type }: SmsServiceProps): Promise<SmsResult> {
  try {
    const [settings, clinic, patient, service] = await Promise.all([
      prisma.clinicSettings.findUnique({ where: { clinicId } }),
      prisma.clinic.findUnique({ where: { id: clinicId }, select: { id: true, name: true, timezone: true } }),
      prisma.patient.findFirst({ where: { id: patientId, clinicId }, select: { fullName: true, phone: true } }),
      serviceId ? prisma.service.findFirst({ where: { id: serviceId, clinicId }, select: { name: true } }) : null,
    ])

    if (!clinic) return { success: false, error: 'Clinic not found' }
    if (!patient?.phone) return { success: false, error: 'Patient has no phone number' }

    if (type === 'CONFIRMATION' && settings?.notifyBookingConfirmation === false) return { success: false, error: 'Disabled in clinic settings' }
    if (type === 'REMINDER' && settings?.notifyAppointmentReminder === false) return { success: false, error: 'Disabled in clinic settings' }
    if (type === 'CANCELLATION' && settings?.notifyBookingCancellation === false) return { success: false, error: 'Disabled in clinic settings' }
    if ((type === 'COMPLETED' || type === 'NO_SHOW') && settings?.notifyVisitCompletion === false) return { success: false, error: 'Disabled in clinic settings' }

    const appointmentDate = dateLabel(date, clinic.timezone || 'Africa/Cairo')
    const serviceName = service?.name ?? 'الاستشارة'
    const message = (() => {
      switch (type) {
        case 'CONFIRMATION':
          return `مرحباً ${patient.fullName}، تم تأكيد حجزك في ${clinic.name} لخدمة ${serviceName} يوم ${appointmentDate} الساعة ${startTime}.`
        case 'REMINDER':
          return `تذكير من ${clinic.name}: لديك موعد يوم ${appointmentDate} الساعة ${startTime}.`
        case 'CANCELLATION':
          return `مرحباً ${patient.fullName}، تم إلغاء موعدك في ${clinic.name} يوم ${appointmentDate}.`
        case 'COMPLETED':
          return `مرحباً ${patient.fullName}، نشكرك لزيارتك ${clinic.name}. نتمنى لك دوام الصحة والعافية.`
        case 'NO_SHOW':
          return `مرحباً ${patient.fullName}، فاتنا استقبالكم في موعد ${clinic.name} يوم ${appointmentDate}. يمكنكم التواصل معنا لحجز موعد جديد.`
      }
    })()

    const result = await sendSms(patient.phone, message)
    if (!result.success) console.error('Appointment SMS failed', { clinicId, patientId, type, reason: result.error })
    return result
  } catch (error) {
    console.error('Appointment SMS failed unexpectedly', { clinicId, patientId, type })
    return { success: false, error: 'Unable to send appointment SMS' }
  }
}
