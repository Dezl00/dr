import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db/prisma"
import { requireApiPermission } from "@/lib/auth/api-auth"

const updateSchema = z.object({
  notes: z.string().max(10_000).nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
  discount: z.number().finite().nonnegative().optional(),
  tax: z.number().finite().nonnegative().optional(),
  status: z.enum(["CANCELLED"]).optional(),
}).refine((data) => Object.keys(data).length > 0, "أرسل قيمة واحدة على الأقل للتحديث")

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "حدث خطأ غير متوقع"
  const status = message.includes("Unauthorized") ? 401 : message.includes("Forbidden") ? 403 : 500
  return NextResponse.json({ success: false, error: status === 500 ? "حدث خطأ أثناء معالجة الفاتورة" : message }, { status })
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { clinic } = await requireApiPermission(req, "patients.view")
    const { id } = await params
    const invoice = await prisma.invoice.findFirst({
      where: { id, clinicId: clinic.id },
      include: {
        patient: { select: { id: true, fullName: true, phone: true } },
        appointment: { select: { id: true, date: true, startTime: true } },
        items: { include: { service: { select: { id: true, name: true } } } },
        payments: { orderBy: { paymentDate: "desc" } },
      },
    })
    if (!invoice) return NextResponse.json({ success: false, error: "الفاتورة غير موجودة" }, { status: 404 })
    return NextResponse.json({ success: true, data: invoice })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { clinic } = await requireApiPermission(req, "patients.update")
    const { id } = await params
    const data = updateSchema.parse(await req.json())

    const invoice = await prisma.$transaction(async (tx) => {
      const current = await tx.invoice.findFirst({ where: { id, clinicId: clinic.id }, include: { items: true, payments: true } })
      if (!current) throw new Error("NotFound: Invoice")
      if (current.status === "CANCELLED" && data.status !== "CANCELLED") throw new Error("Conflict: Cancelled invoice")

      if (data.status === "CANCELLED") {
        return tx.invoice.update({ where: { id: current.id }, data: { status: "CANCELLED" } })
      }

      const discount = data.discount ?? Number(current.discount)
      const tax = data.tax ?? Number(current.tax)
      const subtotal = current.items.reduce((sum, item) => sum + Number(item.total), 0)
      const total = Math.max(0, subtotal - discount + tax)
      const paid = current.payments.reduce((sum, payment) => sum + Number(payment.amount), 0)
      return tx.invoice.update({
        where: { id: current.id },
        data: {
          ...(data.notes !== undefined ? { notes: data.notes } : {}),
          ...(data.dueDate !== undefined ? { dueDate: data.dueDate ? new Date(data.dueDate) : null } : {}),
          discount,
          tax,
          total,
          status: paid === 0 ? "UNPAID" : paid >= total ? "PAID" : "PARTIAL",
        },
      })
    })

    return NextResponse.json({ success: true, data: invoice })
  } catch (error) {
    const message = error instanceof Error ? error.message : ""
    if (message.startsWith("NotFound")) return NextResponse.json({ success: false, error: "الفاتورة غير موجودة" }, { status: 404 })
    if (message.startsWith("Conflict")) return NextResponse.json({ success: false, error: "لا يمكن تعديل فاتورة ملغاة" }, { status: 409 })
    if (error instanceof z.ZodError) return NextResponse.json({ success: false, error: error.errors[0]?.message ?? "بيانات الفاتورة غير صحيحة" }, { status: 400 })
    return errorResponse(error)
  }
}
