import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireApiAuth } from "@/lib/auth/api-auth";
import { z } from "zod";

const inventorySchema = z.object({
  name: z.string().min(2, "اسم العنصر مطلوب"),
  quantity: z.number().min(0, "الكمية غير صحيحة"),
  unit: z.string().min(1, "الوحدة مطلوبة"),
  minQuantity: z.number().optional(),
});

export async function GET(req: Request) {
  try {
    const { clinic } = await requireApiAuth(req);
    const url = new URL(req.url);
    const search = url.searchParams.get("search") || "";

    const items = await prisma.inventoryItem.findMany({
      where: { 
        clinicId: clinic.id,
        ...(search ? { name: { contains: search, mode: 'insensitive' } } : {})
      },
      orderBy: { name: "asc" }
    });

    return NextResponse.json({ success: true, data: items });
  } catch (error: any) {
    if (error.message?.includes('Unauthorized')) return NextResponse.json({ success: false, error: error.message }, { status: 401 });
    return NextResponse.json({ success: false, error: "حدث خطأ أثناء جلب المخزون" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { clinic } = await requireApiAuth(req);
    const body = await req.json();
    const data = inventorySchema.parse(body);

    const item = await prisma.inventoryItem.create({
      data: {
        clinicId: clinic.id,
        name: data.name,
        quantity: data.quantity,
        unit: data.unit,
        minQuantity: data.minQuantity ?? 5,
      }
    });
    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) return NextResponse.json({ success: false, error: error.errors[0].message }, { status: 400 });
    return NextResponse.json({ success: false, error: "حدث خطأ أثناء إضافة للمخزون" }, { status: 500 });
  }
}
