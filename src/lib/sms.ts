import { prisma } from './db/prisma'

interface SMSServiceProps {
  clinicId: string
  patientId: string
  doctorId?: string
  serviceId?: string
  date: Date
  startTime: string
  type: 'CONFIRMATION' | 'REMINDER' | 'CANCELLATION' | 'COMPLETED'
}

export async function sendAppointmentSMS({ clinicId, patientId, doctorId, serviceId, date, startTime, type }: SMSServiceProps) {
  try {
    const settings = await prisma.clinicSettings.findUnique({
      where: { clinicId }
    })

    // Default settings if the clinic hasn't configured them yet
    const notifyBookingConfirmation = settings?.notifyBookingConfirmation ?? true
    const notifyAppointmentReminder = settings?.notifyAppointmentReminder ?? true
    const notifyBookingCancellation = settings?.notifyBookingCancellation ?? true
    const notifyVisitCompletion = settings?.notifyVisitCompletion ?? true

    // Check if notification is enabled for this type
    if (type === 'CONFIRMATION' && !notifyBookingConfirmation) return { success: false, error: 'مغلق من الإعدادات' }
    if (type === 'REMINDER' && !notifyAppointmentReminder) return { success: false, error: 'مغلق من الإعدادات' }
    if (type === 'CANCELLATION' && !notifyBookingCancellation) return { success: false, error: 'مغلق من الإعدادات' }
    if (type === 'COMPLETED' && !notifyVisitCompletion) return { success: false, error: 'مغلق من الإعدادات' }

    const clinic = await prisma.clinic.findUnique({ where: { id: clinicId } })
    const patient = await prisma.patient.findUnique({ where: { id: patientId } })
    
    if (!patient?.phone) return { success: false, error: 'المريض لا يملك رقم هاتف' }
    if (!clinic) return { success: false, error: 'العيادة غير موجودة' }

    const service = serviceId ? await prisma.service.findUnique({ where: { id: serviceId } }) : null

    let message = ''
    const formattedDate = date.toISOString().split('T')[0]
    const serviceName = service ? service.name : 'استشارة'

    switch (type) {
      case 'CONFIRMATION':
        message = `مرحباً ${patient.fullName}، تم تأكيد حجزك في ${clinic.name} لخدمة (${serviceName}) يوم ${formattedDate} الساعة ${startTime}.`
        break
      case 'REMINDER':
        message = `تذكير: لديك موعد قادم في ${clinic.name} يوم ${formattedDate} الساعة ${startTime}.`
        break
      case 'CANCELLATION':
        message = `مرحباً ${patient.fullName}، تم إلغاء موعدك في ${clinic.name} يوم ${formattedDate}.`
        break
      case 'COMPLETED':
        message = `مرحباً ${patient.fullName}، شكراً لزيارتك ${clinic.name}. نتمنى لك دوام الصحة والعافية.`
        break
    }

    // Call WhySMS API
    const { sendSms } = await import('./whysms')
    const result = await sendSms(patient.phone, message)
    
    if (result.success) {
      console.log(`[SMS Gateway] Sent to ${patient.phone}: ${message}`)
    }
    
    return result

  } catch (error: any) {
    console.error('Failed to send SMS:', error)
    return { success: false, error: error.message }
  }
}
