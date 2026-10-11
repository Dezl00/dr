import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db/prisma"
import { requireApiPermission } from "@/lib/auth/api-auth"

const paymentSchema = z.object({
  amount: z.number().finite().positive(),
  method: z.enum(["CASH", "CARD", "BANK_TRANSFER", "INSURANCE", "INSTALLMENT"]),
  referenceCode: z.string().trim().max(255).nullable().optional(),
  notes: z.string().max(10_000).nullable().optional(),
})

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "حدث خطأ غير متوقع"
  const status = message.includes("Unauthorized") ? 401 : message.includes("Forbidden") ? 403 : 500
  return NextResponse.json({ success: false, error: status === 500 ? "حدث خطأ أثناء تسجيل الدفعة" : message }, { status })
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { clinic } = await requireApiPermission(req, "patients.view")
    const { id } = await params
    const invoice = await prisma.invoice.findFirst({ where: { id, clinicId: clinic.id }, select: { id: true } })
    if (!invoice) return NextResponse.json({ success: false, error: "الفاتورة غير موجودة" }, { status: 404 })

    const payments = await prisma.payment.findMany({ where: { invoiceId: invoice.id, clinicId: clinic.id }, orderBy: { paymentDate: "desc" } })
    return NextResponse.json({ success: true, data: payments })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { clinic } = await requireApiPermission(req, "patients.update")
    const { id } = await params
    const data = paymentSchema.parse(await req.json())

    const payment = await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findFirst({ where: { id, clinicId: clinic.id }, include: { payments: true } })
      if (!invoice) throw new Error("NotFound: Invoice")
      if (invoice.status === "CANCELLED") throw new Error("Conflict: Cancelled invoice")

      const paid = invoice.payments.reduce((sum, entry) => sum + Number(entry.amount), 0)
      const remaining = Number(invoice.total) - paid
      if (data.amount > remaining) throw new Error("Conflict: Payment exceeds remaining balance")

      const created = await tx.payment.create({
        data: {
          clinicId: clinic.id,
          invoiceId: invoice.id,
          amount: data.amount,
          method: data.method,
          referenceCode: data.referenceCode ?? null,
          notes: data.notes ?? null,
        },
      })
      const newPaid = paid + data.amount
      await tx.invoice.update({ where: { id: invoice.id }, data: { status: newPaid >= Number(invoice.total) ? "PAID" : "PARTIAL" } })
      return created
    })

    return NextResponse.json({ success: true, data: payment }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : ""
    if (message.startsWith("NotFound")) return NextResponse.json({ success: false, error: "الفاتورة غير موجودة" }, { status: 404 })
    if (message.startsWith("Conflict")) return NextResponse.json({ success: false, error: "قيمة الدفعة غير صالحة" }, { status: 409 })
    if (error instanceof z.ZodError) return NextResponse.json({ success: false, error: error.errors[0]?.message ?? "بيانات الدفعة غير صحيحة" }, { status: 400 })
    return errorResponse(error)
  }
}
