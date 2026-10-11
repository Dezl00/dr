import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'
import { hashPassword } from '@/lib/auth/password'
import { requireApiPermission } from '@/lib/auth/api-auth'

const memberSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  email: z.string().email(),
  phone: z.string().trim().min(8).max(30).optional().nullable(),
  password: z.string().min(8).max(128),
  roleId: z.string().min(1),
})

function failure(error: unknown) {
  if (error instanceof z.ZodError) return NextResponse.json({ success: false, error: error.issues[0]?.message }, { status: 400 })
  const message = error instanceof Error ? error.message : ''
  if (message.includes('Unauthorized')) return NextResponse.json({ success: false, error: message }, { status: 401 })
  if (message.includes('Forbidden')) return NextResponse.json({ success: false, error: message }, { status: 403 })
  if (message.includes('already exists')) return NextResponse.json({ success: false, error: message }, { status: 409 })
  return NextResponse.json({ success: false, error: 'حدث خطأ أثناء معالجة الفريق' }, { status: 500 })
}

export async function GET(req: Request) {
  try {
    const { clinic } = await requireApiPermission(req, 'users.view')
    const [members, roles] = await Promise.all([
      prisma.clinicMembership.findMany({
        where: { clinicId: clinic.id, status: 'ACTIVE' },
        include: { user: { select: { id: true, fullName: true, email: true, phone: true, avatarUrl: true } }, role: { select: { id: true, name: true, nameAr: true } } },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.role.findMany({ where: { OR: [{ clinicId: clinic.id }, { clinicId: null }] }, select: { id: true, name: true, nameAr: true }, orderBy: { name: 'asc' } }),
    ])
    return NextResponse.json({ success: true, data: members, meta: { roles } })
  } catch (error) { return failure(error) }
}

export async function POST(req: Request) {
  try {
    const { clinic } = await requireApiPermission(req, 'users.manage')
    const data = memberSchema.parse(await req.json())
    const role = await prisma.role.findFirst({ where: { id: data.roleId, OR: [{ clinicId: clinic.id }, { clinicId: null }] } })
    if (!role) return NextResponse.json({ success: false, error: 'الدور غير صالح' }, { status: 400 })

    const email = data.email.toLowerCase().trim()
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      const membership = await prisma.clinicMembership.findUnique({ where: { userId_clinicId: { userId: existing.id, clinicId: clinic.id } } })
      if (membership) throw new Error('هذا المستخدم موجود بالفعل في الفريق')
      const created = await prisma.clinicMembership.create({ data: { userId: existing.id, clinicId: clinic.id, roleId: role.id, status: 'ACTIVE' }, include: { user: { select: { id: true, fullName: true, email: true, phone: true } }, role: { select: { id: true, name: true, nameAr: true } } } })
      return NextResponse.json({ success: true, data: created }, { status: 201 })
    }

    const passwordHash = await hashPassword(data.password)
    const member = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({ data: { fullName: data.fullName, email, phone: data.phone || null, passwordHash } })
      return tx.clinicMembership.create({ data: { userId: user.id, clinicId: clinic.id, roleId: role.id, status: 'ACTIVE' }, include: { user: { select: { id: true, fullName: true, email: true, phone: true } }, role: { select: { id: true, name: true, nameAr: true } } } })
    })
    return NextResponse.json({ success: true, data: member }, { status: 201 })
  } catch (error) { return failure(error) }
}
