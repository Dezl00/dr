import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db/prisma"
import { requireApiPermission } from "@/lib/auth/api-auth"

const updateSchema = z.object({
  name: z.string().trim().min(2).max(255).optional(),
  sku: z.string().trim().max(100).nullable().optional(),
  category: z.string().trim().max(100).nullable().optional(),
  unit: z.string().trim().min(1).max(50).optional(),
  minQuantity: z.number().int().nonnegative().optional(),
  costPrice: z.number().finite().nonnegative().nullable().optional(),
})

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "حدث خطأ غير متوقع"
  const status = message.includes("Unauthorized") ? 401 : message.includes("Forbidden") ? 403 : 500
  return NextResponse.json({ success: false, error: status === 500 ? "حدث خطأ أثناء معالجة الصنف" : message }, { status })
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { clinic } = await requireApiPermission(req, "patients.view")
    const { id } = await params
    const item = await prisma.inventoryItem.findFirst({ where: { id, clinicId: clinic.id }, include: { _count: { select: { transactions: true } } } })
    if (!item) return NextResponse.json({ success: false, error: "الصنف غير موجود" }, { status: 404 })
    return NextResponse.json({ success: true, data: item })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { clinic } = await requireApiPermission(req, "patients.update")
    const { id } = await params
    const data = updateSchema.parse(await req.json())
    const item = await prisma.inventoryItem.updateMany({ where: { id, clinicId: clinic.id }, data })
    if (!item.count) return NextResponse.json({ success: false, error: "الصنف غير موجود" }, { status: 404 })
    const updated = await prisma.inventoryItem.findUniqueOrThrow({ where: { id } })
    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ success: false, error: error.errors[0]?.message ?? "بيانات الصنف غير صحيحة" }, { status: 400 })
    return errorResponse(error)
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { clinic } = await requireApiPermission(req, "patients.update")
    const { id } = await params
    const result = await prisma.inventoryItem.deleteMany({ where: { id, clinicId: clinic.id } })
    if (!result.count) return NextResponse.json({ success: false, error: "الصنف غير موجود" }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (error) {
    return errorResponse(error)
  }
}
