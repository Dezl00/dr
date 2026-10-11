import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db/prisma"
import { requireApiPermission } from "@/lib/auth/api-auth"
import { expenseSchema } from "@/lib/validators/expense"

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "حدث خطأ غير متوقع"
  const status = message.includes("Unauthorized") ? 401 : message.includes("Forbidden") ? 403 : 500
  return NextResponse.json({ success: false, error: status === 500 ? "حدث خطأ أثناء معالجة المصروفات" : message }, { status })
}

export async function GET(req: Request) {
  try {
    const { clinic } = await requireApiPermission(req, "patients.view")
    const url = new URL(req.url)
    const page = Math.max(1, Number(url.searchParams.get("page") ?? 1) || 1)
    const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") ?? 20) || 20))
    const where = { clinicId: clinic.id }
    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({ where, orderBy: { expenseDate: "desc" }, skip: (page - 1) * limit, take: limit }),
      prisma.expense.count({ where }),
    ])
    return NextResponse.json({ success: true, data: expenses, meta: { total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) } })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function POST(req: Request) {
  try {
    const { clinic } = await requireApiPermission(req, "patients.update")
    const data = expenseSchema.parse(await req.json())
    const expenseDate = new Date(data.expenseDate)
    if (Number.isNaN(expenseDate.getTime())) return NextResponse.json({ success: false, error: "تاريخ المصروف غير صحيح" }, { status: 400 })
    const expense = await prisma.expense.create({ data: { clinicId: clinic.id, ...data, expenseDate } })
    return NextResponse.json({ success: true, data: expense }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ success: false, error: error.errors[0]?.message ?? "بيانات المصروف غير صحيحة" }, { status: 400 })
    return errorResponse(error)
  }
}
