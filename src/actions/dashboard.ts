'use server'

import { requireAuth, getCurrentSession } from '@/lib/auth/dal'
import { prisma } from '@/lib/db/prisma'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { hashPassword, verifyPassword } from '@/lib/auth/password'
import { AppointmentStatus, Gender } from '@prisma/client'
import { sendAppointmentSMS } from '@/lib/sms'

async function getActiveClinicId(userId: string): Promise<string> {
  const { session } = await getCurrentSession()
  const user = await requireAuth()
  
  if (
    user.isAdmin &&
    session?.adminAccessClinicId &&
    session?.adminAccessExpiresAt &&
    new Date() < session.adminAccessExpiresAt
  ) {
    return session.adminAccessClinicId
  }
  
  const membership = await prisma.clinicMembership.findFirst({
    where: { userId, status: 'ACTIVE' },
  })
  
  if (!membership) {
    throw new Error('No active clinic found')
  }
  
  return membership.clinicId
}

export async function createDoctor(formData: FormData) {
  const user = await requireAuth()
  const clinicId = await getActiveClinicId(user.id)
  
  const fullName = formData.get('fullName') as string
  const specialty = formData.get('specialty') as string
  const phone = formData.get('phone') as string
  const email = formData.get('email') as string
  const imageUrl = formData.get('imageUrl') as string
  
  if (!fullName) {
    throw new Error('الاسم مطلوب')
  }

  await prisma.doctor.create({
    data: {
      clinicId,
      fullName,
      specialty,
      phone,
      email,
      imageUrl: imageUrl || null,
    },
  })

  revalidatePath('/dashboard/doctors')
  redirect('/dashboard/doctors')
}

export async function createService(formData: FormData) {
  const user = await requireAuth()
  const clinicId = await getActiveClinicId(user.id)
  
  const name = formData.get('name') as string
  const price = formData.get('price') as string
  const duration = formData.get('duration') as string
  const description = formData.get('description') as string
  const content = formData.get('content') as string
  const imageUrl = formData.get('imageUrl') as string
  
  if (!name) {
    throw new Error('الاسم مطلوب')
  }

  // Generate slug from name
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\u0621-\u064Aa-zA-Z0-9-]/g, '') || undefined

  await prisma.service.create({
    data: {
      clinicId,
      name,
      slug,
      price: price ? parseFloat(price) : null,
      duration: duration ? parseInt(duration, 10) : null,
      description: description || null,
      content: content || null,
      imageUrl: imageUrl || null,
    },
  })

  revalidatePath('/dashboard/services')
  redirect('/dashboard/services')
}

export async function createAppointment(formData: FormData) {
  const user = await requireAuth()
  const clinicId = await getActiveClinicId(user.id)
  
  const patientId = formData.get('patientId') as string
  const doctorId = formData.get('doctorId') as string
  const serviceId = formData.get('serviceId') as string
  const date = formData.get('date') as string
  const startTime = formData.get('startTime') as string
  const notes = formData.get('notes') as string
  const status = formData.get('status') as any || 'SCHEDULED'
  
  if (!patientId || !doctorId || !date || !startTime) {
    throw new Error('البيانات المطلوبة مفقودة')
  }

  await prisma.appointment.create({
    data: {
      clinicId,
      patientId,
      doctorId,
      serviceId: serviceId || null,
      date: new Date(date),
      startTime,
      notes,
      status,
    },
  })

  // Trigger SMS synchronously
  try {
    if (status === 'CONFIRMED' || status === 'SCHEDULED') {
      await sendAppointmentSMS({ clinicId, patientId, serviceId: serviceId || undefined, date: new Date(date), startTime, type: 'CONFIRMATION' })
    } else if (status === 'COMPLETED') {
      await sendAppointmentSMS({ clinicId, patientId, serviceId: serviceId || undefined, date: new Date(date), startTime, type: 'COMPLETED' })
    }
  } catch (error) {
    console.error('SMS Error:', error)
  }

  revalidatePath('/dashboard/appointments')
  redirect('/dashboard/appointments')
}

export async function updateAppointmentStatus(appointmentId: string, newStatus: any) {
  const user = await requireAuth()
  const clinicId = await getActiveClinicId(user.id)
  
  const apt = await prisma.appointment.findUnique({
    where: { id: appointmentId, clinicId }
  })
  
  if (!apt) throw new Error('Appointment not found')
  if (apt.status === newStatus) return

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: newStatus }
  })

  // Trigger SMS synchronously
  try {
    if (newStatus === 'CONFIRMED' || newStatus === 'SCHEDULED') {
      await sendAppointmentSMS({ clinicId, patientId: apt.patientId, serviceId: apt.serviceId || undefined, date: apt.date, startTime: apt.startTime, type: 'CONFIRMATION' })
    } else if (newStatus === 'COMPLETED') {
      await sendAppointmentSMS({ clinicId, patientId: apt.patientId, serviceId: apt.serviceId || undefined, date: apt.date, startTime: apt.startTime, type: 'COMPLETED' })
    } else if (newStatus === 'CANCELLED') {
      await sendAppointmentSMS({ clinicId, patientId: apt.patientId, serviceId: apt.serviceId || undefined, date: apt.date, startTime: apt.startTime, type: 'CANCELLATION' })
    }
  } catch (error) {
    console.error('SMS Error:', error)
  }

  revalidatePath('/dashboard/appointments')
}

export async function sendManualReminder(appointmentId: string) {
  const user = await requireAuth()
  const clinicId = await getActiveClinicId(user.id)
  
  const apt = await prisma.appointment.findUnique({
    where: { id: appointmentId, clinicId }
  })
  
  if (!apt) return { success: false, error: 'Appointment not found' }
  
  try {
    const { sendAppointmentSMS } = await import('@/lib/sms')
    const result = await sendAppointmentSMS({ 
      clinicId, 
      patientId: apt.patientId, 
      serviceId: apt.serviceId || undefined, 
      date: apt.date, 
      startTime: apt.startTime, 
      type: 'REMINDER' 
    })
    return result || { success: true }
  } catch (error: any) {
    console.error('Manual Reminder SMS Error:', error)
    return { success: false, error: error.message || 'حدث خطأ غير معروف' }
  }
}

export async function updateProfile(formData: FormData) {
  const user = await requireAuth()
  
  const fullName = formData.get('fullName') as string
  const phone = formData.get('phone') as string
  
  if (!fullName) throw new Error('الاسم مطلوب')

  await prisma.user.update({
    where: { id: user.id },
    data: { fullName, phone: phone || null }
  })

  revalidatePath('/dashboard/settings/profile')
}

export async function changePassword(formData: FormData) {
  const user = await requireAuth()
  
  const currentPassword = formData.get('currentPassword') as string
  const newPassword = formData.get('newPassword') as string
  const confirmPassword = formData.get('confirmPassword') as string
  
  if (!currentPassword || !newPassword || !confirmPassword) {
    throw new Error('جميع الحقول مطلوبة')
  }
  
  if (newPassword !== confirmPassword) {
    throw new Error('كلمة المرور الجديدة غير متطابقة')
  }
  
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
  if (!dbUser) throw new Error('مستخدم غير موجود')
  
  const isValid = await verifyPassword(dbUser.passwordHash, currentPassword)
  if (!isValid) {
    throw new Error('كلمة المرور الحالية غير صحيحة')
  }
  
  const newHash = await hashPassword(newPassword)
  
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: newHash }
  })
  
  revalidatePath('/dashboard/settings/security')
}

export async function updateClinicSettings(formData: FormData) {
  const user = await requireAuth()
  const clinicId = await getActiveClinicId(user.id)
  
  const name = formData.get('name') as string
  const phone = formData.get('phone') as string
  const email = formData.get('email') as string
  const address = formData.get('address') as string
  
  if (!name) throw new Error('اسم العيادة مطلوب')

  await prisma.clinic.update({
    where: { id: clinicId },
    data: { name }
  })
  
  await prisma.clinicSettings.upsert({
    where: { clinicId },
    create: {
      clinicId,
      phone,
      email,
      address,
    },
    update: {
      phone,
      email,
      address,
    }
  })
  
  revalidatePath('/dashboard/settings/clinic')
}

export async function inviteTeamMember(formData: FormData) {
  const user = await requireAuth()
  const clinicId = await getActiveClinicId(user.id)
  
  const email = formData.get('email') as string
  const fullName = formData.get('fullName') as string
  const password = formData.get('password') as string
  const roleId = formData.get('roleId') as string
  
  if (!email || !fullName || !password || !roleId) {
    throw new Error('جميع الحقول مطلوبة')
  }
  
  const passwordHash = await hashPassword(password)
  
  let targetUser = await prisma.user.findUnique({ where: { email } })
  if (!targetUser) {
    targetUser = await prisma.user.create({
      data: {
        email,
        fullName,
        passwordHash,
      }
    })
  }
  
  await prisma.clinicMembership.create({
    data: {
      userId: targetUser.id,
      clinicId,
      roleId,
    }
  })
  
  revalidatePath('/dashboard/team')
  redirect('/dashboard/team')
}

export async function updateWebsiteSettings(formData: FormData) {
  const user = await requireAuth()
  const clinicId = await getActiveClinicId(user.id)
  
  const isPublished = formData.get('isPublished') === 'on'
  const slug = formData.get('slug') as string

  if (slug) {
    const validSlug = /^[a-z0-9-]+$/.test(slug)
    if (validSlug) {
      const existing = await prisma.clinic.findUnique({ where: { slug } })
      if (!existing || existing.id === clinicId) {
        await prisma.clinic.update({
          where: { id: clinicId },
          data: { slug }
        })
      }
    }
  }
  
  await prisma.website.upsert({
    where: { clinicId },
    create: { clinicId, isPublished },
    update: { isPublished }
  })
  
  revalidatePath('/dashboard/website')
}

export async function updatePatient(id: string, prevState: any, formData: FormData) {
  try {
    const user = await requireAuth()
    const clinicId = await getActiveClinicId(user.id)
    
    const fullName = formData.get('fullName') as string
    const phone = formData.get('phone') as string
    const email = formData.get('email') as string
    const address = formData.get('address') as string
    
    if (!fullName) return { error: 'الاسم مطلوب' }
    
    await prisma.patient.update({
      where: { id, clinicId },
      data: { fullName, phone, email, address }
    })
    
    revalidatePath(`/dashboard/patients/${id}`)
    return { success: true }
  } catch (error) {
    return { error: 'حدث خطأ أثناء حفظ البيانات' }
  }
}

export async function updateAppointment(id: string, formData: FormData) {
  const user = await requireAuth()
  const clinicId = await getActiveClinicId(user.id)
  
  const status = formData.get('status') as AppointmentStatus
  const date = formData.get('date') as string
  const startTime = formData.get('startTime') as string
  
  await prisma.appointment.update({
    where: { id, clinicId },
    data: { 
      status, 
      date: new Date(date), 
      startTime 
    }
  })
  
  revalidatePath(`/dashboard/appointments/${id}`)
  redirect('/dashboard/appointments')
}

export async function updateDoctor(id: string, formData: FormData) {
  const user = await requireAuth()
  const clinicId = await getActiveClinicId(user.id)
  
  const fullName = formData.get('fullName') as string
  const specialty = formData.get('specialty') as string
  const phone = formData.get('phone') as string
  const imageUrl = formData.get('imageUrl') as string
  
  await prisma.doctor.update({
    where: { id, clinicId },
    data: { fullName, specialty, phone, imageUrl: imageUrl || null }
  })
  
  revalidatePath(`/dashboard/doctors/${id}`)
  redirect('/dashboard/doctors')
}

export async function updateService(id: string, formData: FormData) {
  const user = await requireAuth()
  const clinicId = await getActiveClinicId(user.id)
  
  const name = formData.get('name') as string
  const price = formData.get('price') as string
  const duration = formData.get('duration') as string
  const description = formData.get('description') as string
  const content = formData.get('content') as string
  const imageUrl = formData.get('imageUrl') as string
  
  await prisma.service.update({
    where: { id, clinicId },
    data: { 
      name, 
      price: price ? parseFloat(price) : null,
      duration: duration ? parseInt(duration, 10) : null,
      description: description || null,
      content: content || null,
      imageUrl: imageUrl || null,
    }
  })
  
  revalidatePath(`/dashboard/services/${id}`)
  redirect('/dashboard/services')
}

export async function updateSectionOrder(sections: {id: string, sortOrder: number}[]) {
  const user = await requireAuth();
  const clinicId = await getActiveClinicId(user.id);
  const website = await prisma.website.findUnique({ where: { clinicId } });
  if (!website) throw new Error('Website not found');
  
  await prisma.$transaction(
    sections.map(section => 
      prisma.websiteSection.update({ 
        where: { id: section.id, websiteId: website.id }, 
        data: { sortOrder: section.sortOrder } 
      })
    )
  );
  
  revalidatePath('/dashboard/website');
}

export async function toggleSectionVisibility(id: string, isEnabled: boolean) {
  const user = await requireAuth();
  const clinicId = await getActiveClinicId(user.id);
  const website = await prisma.website.findUnique({ where: { clinicId } });
  if (!website) throw new Error('Website not found');

  await prisma.websiteSection.update({
    where: { id, websiteId: website.id },
    data: { isEnabled }
  });

  revalidatePath('/dashboard/website');
}

export async function updateSectionContent(id: string, content: any) {
  const user = await requireAuth();
  const clinicId = await getActiveClinicId(user.id);
  const website = await prisma.website.findUnique({ where: { clinicId } });
  if (!website) throw new Error('Website not found');

  await prisma.websiteSection.update({
    where: { id, websiteId: website.id },
    data: { content }
  });

  revalidatePath('/dashboard/website');
}