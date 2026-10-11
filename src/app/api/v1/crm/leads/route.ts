import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'
import { requireApiPermission } from '@/lib/auth/api-auth'

const leadSchema = z.object({
  fullName: z.string().trim().min(2).max(200),
  phone: z.string().trim().min(8).max(30),
  source: z.string().trim().max(100).optional().nullable(),
  notes: z.string().trim().max(5000).optional().nullable(),
  status: z.enum(['NEW', 'CONTACTED', 'CONVERTED', 'LOST']).optional(),
})

function failure(error: unknown) {
  if (error instanceof z.ZodError) return NextResponse.json({ success: false, error: error.issues[0]?.message }, { status: 400 })
  const message = error instanceof Error ? error.message : ''
  if (message.includes('Unauthorized')) return NextResponse.json({ success: false, error: message }, { status: 401 })
  if (message.includes('Forbidden')) return NextResponse.json({ success: false, error: message }, { status: 403 })
  return NextResponse.json({ success: false, error: 'حدث خطأ أثناء معالجة العملاء المحتملين' }, { status: 500 })
}

export async function GET(req: Request) {
  try {
    const { clinic } = await requireApiPermission(req, 'patients.view')
    const url = new URL(req.url)
    const status = url.searchParams.get('status')
    const query = url.searchParams.get('query')?.trim()
    const leads = await prisma.lead.findMany({
      where: {
        clinicId: clinic.id,
        ...(status && ['NEW', 'CONTACTED', 'CONVERTED', 'LOST'].includes(status) ? { status } : {}),
        ...(query
          ? {
              OR: [
                { fullName: { contains: query, mode: 'insensitive' } },
                { phone: { contains: query } },
                { source: { contains: query, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { updatedAt: 'desc' },
    })
    return NextResponse.json({ success: true, data: leads })
  } catch (error) { return failure(error) }
}

export async function POST(req: Request) {
  try {
    const { clinic } = await requireApiPermission(req, 'patients.create')
    const lead = await prisma.lead.create({ data: { clinicId: clinic.id, ...leadSchema.parse(await req.json()) } })
    return NextResponse.json({ success: true, data: lead }, { status: 201 })
  } catch (error) { return failure(error) }
}
