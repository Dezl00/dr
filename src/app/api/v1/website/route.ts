import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db/prisma"
import { requireApiPermission } from "@/lib/auth/api-auth"

const websiteSchema = z.object({
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9-]+$/).min(2).max(63).optional(),
  isPublished: z.boolean().optional(),
})

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "حدث خطأ غير متوقع"
  const status = message.includes("Unauthorized") ? 401 : message.includes("Forbidden") ? 403 : 500
  return NextResponse.json({ success: false, error: status === 500 ? "حدث خطأ أثناء معالجة إعدادات الموقع" : message }, { status })
}

export async function GET(req: Request) {
  try {
    const { clinic } = await requireApiPermission(req, "website.view")
    const website = await prisma.website.findUnique({
      where: { clinicId: clinic.id },
      include: {
        theme: { select: { id: true, name: true, nameAr: true } },
        settings: true,
        sections: { orderBy: { sortOrder: "asc" } },
      },
    })
    return NextResponse.json({ success: true, data: { clinic: { id: clinic.id, name: clinic.name, slug: clinic.slug }, website } })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function PUT(req: Request) {
  try {
    const { clinic } = await requireApiPermission(req, "website.manage")
    const data = websiteSchema.parse(await req.json())
    if (data.slug && data.slug !== clinic.slug) {
      const existing = await prisma.clinic.findUnique({ where: { slug: data.slug }, select: { id: true } })
      if (existing && existing.id !== clinic.id) return NextResponse.json({ success: false, error: "النطاق الفرعي مستخدم بالفعل" }, { status: 409 })
    }

    const [updatedClinic, website] = await prisma.$transaction([
      prisma.clinic.update({ where: { id: clinic.id }, data: data.slug ? { slug: data.slug } : {}, select: { id: true, name: true, slug: true } }),
      prisma.website.upsert({ where: { clinicId: clinic.id }, create: { clinicId: clinic.id, isPublished: data.isPublished ?? false }, update: data.isPublished === undefined ? {} : { isPublished: data.isPublished } }),
    ])
    return NextResponse.json({ success: true, data: { clinic: updatedClinic, website } })
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ success: false, error: error.errors[0]?.message ?? "بيانات الموقع غير صحيحة" }, { status: 400 })
    return errorResponse(error)
  }
}
