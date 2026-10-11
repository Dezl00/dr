import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db/prisma"
import { requireApiPermission } from "@/lib/auth/api-auth"

const clinicSchema = z.object({
  name: z.string().trim().min(2).max(150).optional(),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9-]+$/).min(2).max(63).optional(),
}).refine((data) => Object.keys(data).length > 0, "أرسل قيمة واحدة على الأقل للتحديث")

export async function PUT(req: Request) {
  try {
    const { clinic } = await requireApiPermission(req, "settings.manage")
    const data = clinicSchema.parse(await req.json())
    if (data.slug && data.slug !== clinic.slug) {
      const existing = await prisma.clinic.findUnique({ where: { slug: data.slug }, select: { id: true } })
      if (existing && existing.id !== clinic.id) return NextResponse.json({ success: false, error: "هذا الرابط مستخدم بالفعل" }, { status: 409 })
    }
    const updated = await prisma.clinic.update({ where: { id: clinic.id }, data, select: { id: true, name: true, slug: true, timezone: true } })
    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ success: false, error: error.errors[0]?.message ?? "بيانات العيادة غير صحيحة" }, { status: 400 })
    const message = error instanceof Error ? error.message : "حدث خطأ غير متوقع"
    const status = message.includes("Unauthorized") ? 401 : message.includes("Forbidden") ? 403 : 500
    return NextResponse.json({ success: false, error: status === 500 ? "تعذر حفظ إعدادات العيادة" : message }, { status })
  }
}
