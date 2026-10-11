import { NextResponse } from "next/server"
import { z } from "zod"
import { requireApiPermission } from "@/lib/auth/api-auth"
import { prisma } from "@/lib/db/prisma"

const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const
const optionalText = z.string().trim().max(10_000).nullable().optional()

const medicalHistorySchema = z.object({
  allergies: optionalText,
  chronicDiseases: optionalText,
  medications: optionalText,
  bloodType: z.enum(bloodTypes).nullable().optional(),
  notes: optionalText,
})

function textOrNull(value: string | null | undefined) {
  return value?.trim() || null
}

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

    const history = await prisma.medicalHistory.findUnique({ where: { patientId: id } })
    return NextResponse.json({ success: true, data: history })
  } catch (error) {
    return authError(error, "تعذر جلب التاريخ الطبي")
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { clinic } = await requireApiPermission(req, "patients.update")
    const { id } = await params
    const body = await req.json().catch(() => null)
    const parsed = medicalHistorySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "بيانات التاريخ الطبي غير صالحة" }, { status: 400 })
    }

    const patient = await prisma.patient.findFirst({
      where: { id, clinicId: clinic.id },
      select: { id: true },
    })

    if (!patient) {
      return NextResponse.json({ success: false, error: "المريض غير موجود" }, { status: 404 })
    }

    const data = {
      allergies: textOrNull(parsed.data.allergies),
      chronicDiseases: textOrNull(parsed.data.chronicDiseases),
      medications: textOrNull(parsed.data.medications),
      bloodType: parsed.data.bloodType ?? null,
      notes: textOrNull(parsed.data.notes),
    }

    const history = await prisma.medicalHistory.upsert({
      where: { patientId: id },
      update: data,
      create: { patientId: id, ...data },
    })

    return NextResponse.json({ success: true, data: history })
  } catch (error) {
    return authError(error, "تعذر حفظ التاريخ الطبي")
  }
}
