import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'
import { requireApiPermission } from '@/lib/auth/api-auth'
import { doctorSchema } from '@/lib/validators/doctor'

function failure(error: unknown) {
  if (error instanceof z.ZodError) return NextResponse.json({ success: false, error: error.issues[0]?.message }, { status: 400 })
  const message = error instanceof Error ? error.message : ''
  if (message.includes('Unauthorized')) return NextResponse.json({ success: false, error: message }, { status: 401 })
  if (message.includes('Forbidden')) return NextResponse.json({ success: false, error: message }, { status: 403 })
  return NextResponse.json({ success: false, error: 'حدث خطأ أثناء معالجة الأطباء' }, { status: 500 })
}

export async function GET(req: Request) {
  try {
    const { clinic } = await requireApiPermission(req, 'doctors.view')
    const doctors = await prisma.doctor.findMany({
      where: { clinicId: clinic.id },
      include: { services: { include: { service: { select: { id: true, name: true } } } } },
      orderBy: { sortOrder: 'asc' },
    })
    return NextResponse.json({ success: true, data: doctors })
  } catch (error) { return failure(error) }
}

export async function POST(req: Request) {
  try {
    const { clinic } = await requireApiPermission(req, 'doctors.manage')
    const { serviceIds, ...data } = doctorSchema.parse(await req.json())
    if (serviceIds?.length) {
      const count = await prisma.service.count({ where: { id: { in: serviceIds }, clinicId: clinic.id } })
      if (count !== serviceIds.length) return NextResponse.json({ success: false, error: 'توجد خدمة غير صالحة' }, { status: 400 })
    }
    const doctor = await prisma.doctor.create({ data: { clinicId: clinic.id, ...data, services: serviceIds?.length ? { create: serviceIds.map((serviceId) => ({ serviceId })) } : undefined }, include: { services: { include: { service: true } } } })
    return NextResponse.json({ success: true, data: doctor }, { status: 201 })
  } catch (error) { return failure(error) }
}
