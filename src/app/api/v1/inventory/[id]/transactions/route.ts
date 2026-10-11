import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db/prisma"
import { requireApiPermission } from "@/lib/auth/api-auth"

const transactionSchema = z.object({
  type: z.enum(["IN", "OUT", "ADJUSTMENT"]),
  quantity: z.number().int().nonnegative(),
  notes: z.string().trim().max(1_000).nullable().optional(),
})

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "حدث خطأ غير متوقع"
  const status = message.includes("Unauthorized") ? 401 : message.includes("Forbidden") ? 403 : 500
  return NextResponse.json({ success: false, error: status === 500 ? "حدث خطأ أثناء تسجيل حركة المخزون" : message }, { status })
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { clinic } = await requireApiPermission(req, "patients.view")
    const { id } = await params
    const item = await prisma.inventoryItem.findFirst({ where: { id, clinicId: clinic.id }, select: { id: true } })
    if (!item) return NextResponse.json({ success: false, error: "الصنف غير موجود" }, { status: 404 })
    const transactions = await prisma.stockTransaction.findMany({
      where: { inventoryItemId: item.id },
      include: { user: { select: { fullName: true } } },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json({ success: true, data: transactions })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { clinic, user } = await requireApiPermission(req, "patients.update")
    const { id } = await params
    const data = transactionSchema.parse(await req.json())
    if (data.type !== "ADJUSTMENT" && data.quantity === 0) {
      return NextResponse.json({ success: false, error: "الكمية يجب أن تكون أكبر من صفر" }, { status: 400 })
    }

    const transaction = await prisma.$transaction(async (tx) => {
      const item = await tx.inventoryItem.findFirst({ where: { id, clinicId: clinic.id } })
      if (!item) throw new Error("NotFound: Inventory item")
      const nextQuantity = data.type === "IN" ? item.quantity + data.quantity : data.type === "OUT" ? item.quantity - data.quantity : data.quantity
      if (nextQuantity < 0) throw new Error("Conflict: Insufficient stock")
      const created = await tx.stockTransaction.create({
        data: { inventoryItemId: item.id, type: data.type, quantity: data.quantity, notes: data.notes ?? null, createdByUserId: user.id },
      })
      await tx.inventoryItem.update({ where: { id: item.id }, data: { quantity: nextQuantity } })
      return created
    })
    return NextResponse.json({ success: true, data: transaction }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : ""
    if (message.startsWith("NotFound")) return NextResponse.json({ success: false, error: "الصنف غير موجود" }, { status: 404 })
    if (message.startsWith("Conflict")) return NextResponse.json({ success: false, error: "لا توجد كمية كافية في المخزون" }, { status: 409 })
    if (error instanceof z.ZodError) return NextResponse.json({ success: false, error: error.errors[0]?.message ?? "بيانات الحركة غير صحيحة" }, { status: 400 })
    return errorResponse(error)
  }
}
