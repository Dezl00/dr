import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'
import { requireApiPermission } from '@/lib/auth/api-auth'
import { doctorSchema } from '@/lib/validators/doctor'

const updateSchema = doctorSchema.partial()

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { clinic } = await requireApiPermission(req, 'doctors.manage')
    const { id } = await params
    if (!await prisma.doctor.findFirst({ where: { id, clinicId: clinic.id } })) return NextResponse.json({ success: false, error: 'الطبيب غير موجود' }, { status: 404 })
    const { serviceIds, ...data } = updateSchema.parse(await req.json())
    if (serviceIds) {
      const count = await prisma.service.count({ where: { id: { in: serviceIds }, clinicId: clinic.id } })
      if (count !== serviceIds.length) return NextResponse.json({ success: false, error: 'توجد خدمة غير صالحة' }, { status: 400 })
    }
    const doctor = await prisma.doctor.update({
      where: { id },
      data: { ...data, ...(serviceIds ? { services: { deleteMany: {}, create: serviceIds.map((serviceId) => ({ serviceId })) } } : {}) },
      include: { services: { include: { service: true } } },
    })
    return NextResponse.json({ success: true, data: doctor })
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ success: false, error: error.issues[0]?.message }, { status: 400 })
    const message = error instanceof Error ? error.message : ''
    return NextResponse.json({ success: false, error: message.includes('Forbidden') ? message : 'حدث خطأ أثناء تحديث الطبيب' }, { status: message.includes('Unauthorized') ? 401 : message.includes('Forbidden') ? 403 : 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { clinic } = await requireApiPermission(req, 'doctors.manage')
    const { id } = await params
    if (!await prisma.doctor.findFirst({ where: { id, clinicId: clinic.id } })) return NextResponse.json({ success: false, error: 'الطبيب غير موجود' }, { status: 404 })
    await prisma.doctor.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : ''
    return NextResponse.json({ success: false, error: message.includes('Forbidden') ? message : 'حدث خطأ أثناء حذف الطبيب' }, { status: message.includes('Unauthorized') ? 401 : message.includes('Forbidden') ? 403 : 500 })
  }
}
