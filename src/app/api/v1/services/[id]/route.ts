import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'
import { requireApiPermission } from '@/lib/auth/api-auth'

const updateSchema = z.object({
  name: z.string().trim().min(2).max(200).optional(),
  nameEn: z.string().trim().max(200).nullable().optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  content: z.string().trim().max(50000).nullable().optional(),
  price: z.number().nonnegative().nullable().optional(),
  duration: z.number().int().positive().max(1440).nullable().optional(),
  imageUrl: z.string().url().nullable().optional(),
  isActive: z.boolean().optional(),
  showOnWebsite: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
})

async function ownedService(id: string, clinicId: string) {
  return prisma.service.findFirst({ where: { id, clinicId } })
}

function failure(error: unknown) {
  if (error instanceof z.ZodError) return NextResponse.json({ success: false, error: error.issues[0]?.message }, { status: 400 })
  const message = error instanceof Error ? error.message : ''
  if (message.includes('Unauthorized')) return NextResponse.json({ success: false, error: message }, { status: 401 })
  if (message.includes('Forbidden')) return NextResponse.json({ success: false, error: message }, { status: 403 })
  return NextResponse.json({ success: false, error: 'حدث خطأ أثناء معالجة الخدمة' }, { status: 500 })
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { clinic } = await requireApiPermission(req, 'services.view')
    const { id } = await params
    const service = await ownedService(id, clinic.id)
    if (!service) return NextResponse.json({ success: false, error: 'الخدمة غير موجودة' }, { status: 404 })
    return NextResponse.json({ success: true, data: service })
  } catch (error) { return failure(error) }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { clinic } = await requireApiPermission(req, 'services.manage')
    const { id } = await params
    if (!await ownedService(id, clinic.id)) return NextResponse.json({ success: false, error: 'الخدمة غير موجودة' }, { status: 404 })
    const service = await prisma.service.update({ where: { id }, data: updateSchema.parse(await req.json()) })
    return NextResponse.json({ success: true, data: service })
  } catch (error) { return failure(error) }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { clinic } = await requireApiPermission(req, 'services.manage')
    const { id } = await params
    if (!await ownedService(id, clinic.id)) return NextResponse.json({ success: false, error: 'الخدمة غير موجودة' }, { status: 404 })
    await prisma.service.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) { return failure(error) }
}
