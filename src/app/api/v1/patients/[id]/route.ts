import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'
import { requireApiPermission } from '@/lib/auth/api-auth'

const patientUpdateSchema = z.object({
  fullName: z.string().trim().min(2).max(200).optional(),
  phone: z.string().trim().min(8).max(30).optional(),
  email: z.string().email().nullable().optional(),
  gender: z.enum(['MALE', 'FEMALE']).nullable().optional(),
  dateOfBirth: z.string().datetime().nullable().optional(),
  address: z.string().trim().max(1000).nullable().optional(),
  notes: z.string().trim().max(10000).nullable().optional(),
})

async function ownedPatient(id: string, clinicId: string) {
  return prisma.patient.findFirst({
    where: { id, clinicId },
    include: {
      medicalHistory: true,
      _count: { select: { appointments: true, invoices: { where: { status: 'UNPAID' } } } },
    },
  })
}

function responseFor(error: unknown) {
  if (error instanceof z.ZodError) return NextResponse.json({ success: false, error: error.issues[0]?.message }, { status: 400 })
  const message = error instanceof Error ? error.message : ''
  if (message.includes('Unauthorized')) return NextResponse.json({ success: false, error: message }, { status: 401 })
  if (message.includes('Forbidden')) return NextResponse.json({ success: false, error: message }, { status: 403 })
  return NextResponse.json({ success: false, error: 'حدث خطأ أثناء معالجة بيانات المريض' }, { status: 500 })
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { clinic } = await requireApiPermission(req, 'patients.view')
    const { id } = await params
    const patient = await ownedPatient(id, clinic.id)
    if (!patient) return NextResponse.json({ success: false, error: 'المريض غير موجود' }, { status: 404 })
    return NextResponse.json({ success: true, data: patient })
  } catch (error) { return responseFor(error) }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { clinic } = await requireApiPermission(req, 'patients.update')
    const { id } = await params
    if (!await ownedPatient(id, clinic.id)) return NextResponse.json({ success: false, error: 'المريض غير موجود' }, { status: 404 })
    const parsed = patientUpdateSchema.parse(await req.json())
    const patient = await prisma.patient.update({
      where: { id },
      data: { ...parsed, dateOfBirth: parsed.dateOfBirth === undefined ? undefined : parsed.dateOfBirth ? new Date(parsed.dateOfBirth) : null },
    })
    return NextResponse.json({ success: true, data: patient })
  } catch (error) { return responseFor(error) }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { clinic } = await requireApiPermission(req, 'patients.delete')
    const { id } = await params
    if (!await ownedPatient(id, clinic.id)) return NextResponse.json({ success: false, error: 'المريض غير موجود' }, { status: 404 })
    await prisma.patient.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) { return responseFor(error) }
}
