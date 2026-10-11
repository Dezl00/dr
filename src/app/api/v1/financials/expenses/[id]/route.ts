import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db/prisma"
import { requireApiPermission } from "@/lib/auth/api-auth"
import { expenseSchema } from "@/lib/validators/expense"

const updateSchema = expenseSchema.partial().refine((data) => Object.keys(data).length > 0, "أرسل قيمة واحدة على الأقل للتحديث")

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "حدث خطأ غير متوقع"
  const status = message.includes("Unauthorized") ? 401 : message.includes("Forbidden") ? 403 : 500
  return NextResponse.json({ success: false, error: status === 500 ? "حدث خطأ أثناء معالجة المصروف" : message }, { status })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { clinic } = await requireApiPermission(req, "patients.update")
    const { id } = await params
    const data = updateSchema.parse(await req.json())
    const expenseDate = data.expenseDate === undefined ? undefined : new Date(data.expenseDate)
    if (expenseDate && Number.isNaN(expenseDate.getTime())) return NextResponse.json({ success: false, error: "تاريخ المصروف غير صحيح" }, { status: 400 })
    const { expenseDate: _, ...rest } = data
    const result = await prisma.expense.updateMany({ where: { id, clinicId: clinic.id }, data: { ...rest, ...(expenseDate ? { expenseDate } : {}) } })
    if (!result.count) return NextResponse.json({ success: false, error: "المصروف غير موجود" }, { status: 404 })
    return NextResponse.json({ success: true, data: await prisma.expense.findUniqueOrThrow({ where: { id } }) })
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ success: false, error: error.errors[0]?.message ?? "بيانات المصروف غير صحيحة" }, { status: 400 })
    return errorResponse(error)
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { clinic } = await requireApiPermission(req, "patients.update")
    const { id } = await params
    const result = await prisma.expense.deleteMany({ where: { id, clinicId: clinic.id } })
    if (!result.count) return NextResponse.json({ success: false, error: "المصروف غير موجود" }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (error) {
    return errorResponse(error)
  }
}
