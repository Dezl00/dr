import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'
import { requireApiPermission } from '@/lib/auth/api-auth'

const serviceSchema = z.object({
  name: z.string().trim().min(2).max(200),
  nameEn: z.string().trim().max(200).optional().nullable(),
  description: z.string().trim().max(2000).optional().nullable(),
  content: z.string().trim().max(50000).optional().nullable(),
  price: z.number().nonnegative().optional().nullable(),
  duration: z.number().int().positive().max(1440).optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  isActive: z.boolean().optional(),
  showOnWebsite: z.boolean().optional(),
})

function createSlug(name: string) {
  const slug = name
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s-]+/g, '-')

  return slug || undefined
}

function apiError(error: unknown) {
  if (error instanceof z.ZodError) return NextResponse.json({ success: false, error: error.issues[0]?.message }, { status: 400 })
  const message = error instanceof Error ? error.message : ''
  if (message.includes('Unauthorized')) return NextResponse.json({ success: false, error: message }, { status: 401 })
  if (message.includes('Forbidden')) return NextResponse.json({ success: false, error: message }, { status: 403 })
  return NextResponse.json({ success: false, error: 'حدث خطأ أثناء معالجة الخدمات' }, { status: 500 })
}

export async function GET(req: Request) {
  try {
    const { clinic } = await requireApiPermission(req, 'services.view')
    const includeInactive = new URL(req.url).searchParams.get('includeInactive') === 'true'
    const services = await prisma.service.findMany({
      where: { clinicId: clinic.id, ...(includeInactive ? {} : { isActive: true }) },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    })
    return NextResponse.json({ success: true, data: services })
  } catch (error) { return apiError(error) }
}

export async function POST(req: Request) {
  try {
    const { clinic } = await requireApiPermission(req, 'services.manage')
    const data = serviceSchema.parse(await req.json())
    const service = await prisma.service.create({
      data: {
        clinicId: clinic.id,
        ...data,
        slug: createSlug(data.name),
      },
    })
    return NextResponse.json({ success: true, data: service }, { status: 201 })
  } catch (error) { return apiError(error) }
}
