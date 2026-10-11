import { NextResponse } from "next/server"
import { z } from "zod"
import { requireApiPermission } from "@/lib/auth/api-auth"
import { prisma } from "@/lib/db/prisma"

const validTeeth = new Set([
  11, 12, 13, 14, 15, 16, 17, 18,
  21, 22, 23, 24, 25, 26, 27, 28,
  31, 32, 33, 34, 35, 36, 37, 38,
  41, 42, 43, 44, 45, 46, 47, 48,
])

const dentalRecordSchema = z.object({
  toothNumber: z.number().int().refine((value) => validTeeth.has(value), "Invalid FDI tooth number"),
  condition: z.enum(["SOUND", "DECAYED", "FILLED", "CROWNED", "MISSING"]),
  notes: z.string().trim().max(10_000).nullable().optional(),
})

function authError(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : ""
  const status = message.startsWith("Unauthorized") ? 401 : message.startsWith("Forbidden") ? 403 : 500
  return NextResponse.json({ success: false, error: status === 500 ? fallback : message }, { status })
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { clinic } = await requireApiPermission(req, "patients.view")
    const { id } = await params
    const patient = await prisma.patient.findFirst({
      where: { id, clinicId: clinic.id },
      select: { id: true },
    })

    if (!patient) {
      return NextResponse.json({ success: false, error: "المريض غير موجود" }, { status: 404 })
    }

    const records = await prisma.dentalRecord.findMany({
      where: { patientId: id },
      orderBy: { toothNumber: "asc" },
    })

    return NextResponse.json({ success: true, data: records })
  } catch (error) {
    return authError(error, "تعذر جلب سجل الأسنان")
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { clinic } = await requireApiPermission(req, "patients.update")
    const { id } = await params
    const body = await req.json().catch(() => null)
    const parsed = dentalRecordSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "بيانات السن غير صالحة" }, { status: 400 })
    }

    const patient = await prisma.patient.findFirst({
      where: { id, clinicId: clinic.id },
      select: { id: true },
    })

    if (!patient) {
      return NextResponse.json({ success: false, error: "المريض غير موجود" }, { status: 404 })
    }

    const record = await prisma.dentalRecord.upsert({
      where: {
        patientId_toothNumber: {
          patientId: id,
          toothNumber: parsed.data.toothNumber,
        },
      },
      update: {
        condition: parsed.data.condition,
        notes: parsed.data.notes?.trim() || null,
      },
      create: {
        patientId: id,
        toothNumber: parsed.data.toothNumber,
        condition: parsed.data.condition,
        notes: parsed.data.notes?.trim() || null,
      },
    })

    return NextResponse.json({ success: true, data: record })
  } catch (error) {
    return authError(error, "تعذر حفظ حالة السن")
  }
}
