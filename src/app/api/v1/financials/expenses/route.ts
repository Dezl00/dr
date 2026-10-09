import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireApiAuth } from "@/lib/auth/api-auth";
import { z } from "zod";

const expenseSchema = z.object({
  category: z.enum(["SALARIES", "RENT", "SUPPLIES", "UTILITIES", "MARKETING", "MAINTENANCE", "OTHER"]),
  amount: z.number().positive("المبلغ يجب أن يكون أكبر من صفر"),
  description: z.string().min(2, "الوصف مطلوب"),
  expenseDate: z.string(), // YYYY-MM-DD
});

export async function GET(req: Request) {
  try {
    const { clinic } = await requireApiAuth(req);
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where: { clinicId: clinic.id },
        orderBy: { expenseDate: "desc" },
        skip,
        take: limit,
      }),
      prisma.expense.count({ where: { clinicId: clinic.id } })
    ]);

    return NextResponse.json({ success: true, data: expenses, meta: { total, page, limit } });
  } catch (error: any) {
    if (error.message?.includes('Unauthorized')) return NextResponse.json({ success: false, error: error.message }, { status: 401 });
    return NextResponse.json({ success: false, error: "حدث خطأ أثناء جلب المصروفات" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { clinic } = await requireApiAuth(req);
    const body = await req.json();
    const data = expenseSchema.parse(body);

    const expense = await prisma.expense.create({
      data: {
        clinicId: clinic.id,
        category: data.category,
        amount: data.amount,
        description: data.description,
        expenseDate: new Date(data.expenseDate),
      }
    });
    return NextResponse.json({ success: true, data: expense }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) return NextResponse.json({ success: false, error: error.errors[0].message }, { status: 400 });
    return NextResponse.json({ success: false, error: "حدث خطأ أثناء إضافة المصروف" }, { status: 500 });
  }
}
