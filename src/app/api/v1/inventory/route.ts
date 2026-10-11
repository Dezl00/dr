import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db/prisma"
import { requireApiPermission } from "@/lib/auth/api-auth"

const inventorySchema = z.object({
  name: z.string().trim().min(2).max(255),
  sku: z.string().trim().max(100).nullable().optional(),
  category: z.string().trim().max(100).nullable().optional(),
  quantity: z.number().int().nonnegative(),
  unit: z.string().trim().min(1).max(50),
  minQuantity: z.number().int().nonnegative().optional(),
  costPrice: z.number().finite().nonnegative().nullable().optional(),
})

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "حدث خطأ غير متوقع"
  const status = message.includes("Unauthorized") ? 401 : message.includes("Forbidden") ? 403 : 500
  return NextResponse.json({ success: false, error: status === 500 ? "حدث خطأ أثناء معالجة المخزون" : message }, { status })
}

export async function GET(req: Request) {
  try {
    const { clinic } = await requireApiPermission(req, "patients.view")
    const url = new URL(req.url)
    const search = url.searchParams.get("search")?.trim() ?? ""
    const lowStock = url.searchParams.get("lowStock") === "true"
    const items = await prisma.inventoryItem.findMany({
      where: {
        clinicId: clinic.id,
        ...(search ? { OR: [{ name: { contains: search, mode: "insensitive" } }, { sku: { contains: search, mode: "insensitive" } }] } : {}),
      },
      orderBy: { name: "asc" },
    })
    return NextResponse.json({ success: true, data: lowStock ? items.filter((item) => item.quantity <= item.minQuantity) : items })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function POST(req: Request) {
  try {
    const { clinic, user } = await requireApiPermission(req, "patients.update")
    const data = inventorySchema.parse(await req.json())
    const item = await prisma.$transaction(async (tx) => {
      const created = await tx.inventoryItem.create({
        data: {
          clinicId: clinic.id,
          name: data.name,
          sku: data.sku ?? null,
          category: data.category ?? null,
          quantity: data.quantity,
          unit: data.unit,
          minQuantity: data.minQuantity ?? 5,
          costPrice: data.costPrice ?? null,
        },
      })
      if (data.quantity > 0) {
        await tx.stockTransaction.create({
          data: { inventoryItemId: created.id, type: "IN", quantity: data.quantity, notes: "الرصيد الافتتاحي", createdByUserId: user.id },
        })
      }
      return created
    })
    return NextResponse.json({ success: true, data: item }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ success: false, error: error.errors[0]?.message ?? "بيانات الصنف غير صحيحة" }, { status: 400 })
    return errorResponse(error)
  }
}
