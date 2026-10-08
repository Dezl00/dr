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

    if (!settings) return

    // Check if notification is enabled for this type
    if (type === 'CONFIRMATION' && !settings.notifyBookingConfirmation) return
    if (type === 'REMINDER' && !settings.notifyAppointmentReminder) return
    if (type === 'CANCELLATION' && !settings.notifyBookingCancellation) return
    if (type === 'COMPLETED' && !settings.notifyVisitCompletion) return

    const clinic = await prisma.clinic.findUnique({ where: { id: clinicId } })
    const patient = await prisma.patient.findUnique({ where: { id: patientId } })
    
    if (!patient?.phone || !clinic) return

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

  } catch (error) {
    console.error('Failed to send SMS:', error)
  }
}
