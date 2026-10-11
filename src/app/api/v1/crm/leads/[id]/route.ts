import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'
import { requireApiPermission } from '@/lib/auth/api-auth'

const updateSchema = z.object({
  fullName: z.string().trim().min(2).max(200).optional(),
  phone: z.string().trim().min(8).max(30).optional(),
  source: z.string().trim().max(100).nullable().optional(),
  notes: z.string().trim().max(5000).nullable().optional(),
  status: z.enum(['NEW', 'CONTACTED', 'CONVERTED', 'LOST']).optional(),
})

function failure(error: unknown) {
  if (error instanceof z.ZodError) return NextResponse.json({ success: false, error: error.issues[0]?.message }, { status: 400 })
  const message = error instanceof Error ? error.message : ''
  if (message.includes('Unauthorized')) return NextResponse.json({ success: false, error: message }, { status: 401 })
  if (message.includes('Forbidden')) return NextResponse.json({ success: false, error: message }, { status: 403 })
  return NextResponse.json({ success: false, error: 'حدث خطأ أثناء معالجة العميل المحتمل' }, { status: 500 })
}

async function ownedLead(id: string, clinicId: string) {
  return prisma.lead.findFirst({ where: { id, clinicId } })
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { clinic } = await requireApiPermission(req, 'patients.view')
    const { id } = await params
    const lead = await ownedLead(id, clinic.id)
    if (!lead) return NextResponse.json({ success: false, error: 'العميل المحتمل غير موجود' }, { status: 404 })
    return NextResponse.json({ success: true, data: lead })
  } catch (error) {
    return failure(error)
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { clinic } = await requireApiPermission(req, 'patients.update')
    const { id } = await params
    if (!await ownedLead(id, clinic.id)) {
      return NextResponse.json({ success: false, error: 'العميل المحتمل غير موجود' }, { status: 404 })
    }
    const lead = await prisma.lead.update({ where: { id }, data: updateSchema.parse(await req.json()) })
    return NextResponse.json({ success: true, data: lead })
  } catch (error) {
    return failure(error)
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { clinic } = await requireApiPermission(req, 'patients.delete')
    const { id } = await params
    if (!await ownedLead(id, clinic.id)) {
      return NextResponse.json({ success: false, error: 'العميل المحتمل غير موجود' }, { status: 404 })
    }
    await prisma.lead.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return failure(error)
  }
}
