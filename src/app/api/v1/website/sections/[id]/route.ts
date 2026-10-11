import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { z } from "zod"
import { prisma } from "@/lib/db/prisma"
import { requireApiPermission } from "@/lib/auth/api-auth"

const sectionSchema = z.object({
  title: z.string().trim().max(255).nullable().optional(),
  titleEn: z.string().trim().max(255).nullable().optional(),
  content: z.record(z.unknown()).optional(),
  isEnabled: z.boolean().optional(),
})

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { clinic } = await requireApiPermission(req, "website.manage")
    const { id } = await params
    const data = sectionSchema.parse(await req.json())
    const website = await prisma.website.findUnique({ where: { clinicId: clinic.id }, select: { id: true } })
    if (!website) return NextResponse.json({ success: false, error: "الموقع غير موجود" }, { status: 404 })
    const updateData = {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.titleEn !== undefined ? { titleEn: data.titleEn } : {}),
      ...(data.content !== undefined ? { content: data.content as Prisma.InputJsonValue } : {}),
      ...(data.isEnabled !== undefined ? { isEnabled: data.isEnabled } : {}),
    }
    const result = await prisma.websiteSection.updateMany({ where: { id, websiteId: website.id }, data: updateData })
    if (!result.count) return NextResponse.json({ success: false, error: "القسم غير موجود" }, { status: 404 })
    const section = await prisma.websiteSection.findUniqueOrThrow({ where: { id } })
    return NextResponse.json({ success: true, data: section })
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ success: false, error: "بيانات القسم غير صحيحة" }, { status: 400 })
    const message = error instanceof Error ? error.message : "حدث خطأ غير متوقع"
    const status = message.includes("Unauthorized") ? 401 : message.includes("Forbidden") ? 403 : 500
    return NextResponse.json({ success: false, error: status === 500 ? "تعذر تحديث القسم" : message }, { status })
  }
}
