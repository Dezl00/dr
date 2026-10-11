import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db/prisma"
import { requireApiPermission } from "@/lib/auth/api-auth"

const orderSchema = z.object({ sections: z.array(z.object({ id: z.string().min(1), sortOrder: z.number().int().nonnegative() })).min(1) })

export async function PUT(req: Request) {
  try {
    const { clinic } = await requireApiPermission(req, "website.manage")
    const data = orderSchema.parse(await req.json())
    const website = await prisma.website.findUnique({ where: { clinicId: clinic.id }, select: { id: true } })
    if (!website) return NextResponse.json({ success: false, error: "الموقع غير موجود" }, { status: 404 })
    const ids = data.sections.map((section) => section.id)
    const count = await prisma.websiteSection.count({ where: { websiteId: website.id, id: { in: ids } } })
    if (count !== ids.length) return NextResponse.json({ success: false, error: "لا يمكن تعديل قسم من موقع آخر" }, { status: 400 })
    await prisma.$transaction(data.sections.map((section) => prisma.websiteSection.update({ where: { id: section.id }, data: { sortOrder: section.sortOrder } })))
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ success: false, error: "ترتيب الأقسام غير صحيح" }, { status: 400 })
    const message = error instanceof Error ? error.message : "حدث خطأ غير متوقع"
    const status = message.includes("Unauthorized") ? 401 : message.includes("Forbidden") ? 403 : 500
    return NextResponse.json({ success: false, error: status === 500 ? "تعذر ترتيب الأقسام" : message }, { status })
  }
}
