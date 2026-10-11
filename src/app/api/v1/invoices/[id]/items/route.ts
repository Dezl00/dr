import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db/prisma"
import { requireApiPermission } from "@/lib/auth/api-auth"

const itemSchema = z.object({
  serviceId: z.string().min(1).nullable().optional(),
  description: z.string().trim().min(1).max(500),
  quantity: z.number().int().positive(),
  unitPrice: z.number().finite().nonnegative(),
  toothNumber: z.number().int().positive().nullable().optional(),
})

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "حدث خطأ غير متوقع"
  const status = message.includes("Unauthorized") ? 401 : message.includes("Forbidden") ? 403 : 500
  return NextResponse.json({ success: false, error: status === 500 ? "حدث خطأ أثناء معالجة بنود الفاتورة" : message }, { status })
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { clinic } = await requireApiPermission(req, "patients.view")
    const { id } = await params
    const invoice = await prisma.invoice.findFirst({ where: { id, clinicId: clinic.id }, select: { id: true } })
    if (!invoice) return NextResponse.json({ success: false, error: "الفاتورة غير موجودة" }, { status: 404 })

    const items = await prisma.invoiceItem.findMany({
      where: { invoiceId: invoice.id },
      include: { service: { select: { id: true, name: true } } },
      orderBy: { id: "asc" },
    })
    return NextResponse.json({ success: true, data: items })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { clinic } = await requireApiPermission(req, "patients.update")
    const { id } = await params
    const data = itemSchema.parse(await req.json())

    const item = await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findFirst({ where: { id, clinicId: clinic.id }, include: { items: true, payments: true } })
      if (!invoice) throw new Error("NotFound: Invoice")
      if (invoice.status === "CANCELLED") throw new Error("Conflict: Cancelled invoice")

      if (data.serviceId) {
        const service = await tx.service.findFirst({ where: { id: data.serviceId, clinicId: clinic.id }, select: { id: true } })
        if (!service) throw new Error("Invalid: Service")
      }

      const created = await tx.invoiceItem.create({
        data: {
          invoiceId: invoice.id,
          serviceId: data.serviceId ?? null,
          description: data.description,
          quantity: data.quantity,
          unitPrice: data.unitPrice,
          total: data.quantity * data.unitPrice,
          toothNumber: data.toothNumber ?? null,
        },
      })
      const subtotal = invoice.items.reduce((sum, entry) => sum + Number(entry.total), data.quantity * data.unitPrice)
      const total = Math.max(0, subtotal - Number(invoice.discount) + Number(invoice.tax))
      const paid = invoice.payments.reduce((sum, entry) => sum + Number(entry.amount), 0)
      await tx.invoice.update({
        where: { id: invoice.id },
        data: { subtotal, total, status: paid === 0 ? "UNPAID" : paid >= total ? "PAID" : "PARTIAL" },
      })
      return created
    })

    return NextResponse.json({ success: true, data: item }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : ""
    if (message.startsWith("NotFound")) return NextResponse.json({ success: false, error: "الفاتورة غير موجودة" }, { status: 404 })
    if (message.startsWith("Conflict")) return NextResponse.json({ success: false, error: "لا يمكن تعديل فاتورة ملغاة" }, { status: 409 })
    if (message.startsWith("Invalid")) return NextResponse.json({ success: false, error: "الخدمة لا تخص العيادة" }, { status: 400 })
    if (error instanceof z.ZodError) return NextResponse.json({ success: false, error: error.errors[0]?.message ?? "بيانات البند غير صحيحة" }, { status: 400 })
    return errorResponse(error)
  }
}
