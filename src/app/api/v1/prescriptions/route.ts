import { NextResponse } from "next/server"
import { z } from "zod"
import { requireApiPermission } from "@/lib/auth/api-auth"
import { prisma } from "@/lib/db/prisma"

const medicationSchema = z.object({
  name: z.string().trim().min(1).max(200),
  dosage: z.string().trim().min(1).max(200),
  frequency: z.string().trim().min(1).max(200),
  duration: z.string().trim().max(200).optional(),
  notes: z.string().trim().max(2_000).optional(),
})

const prescriptionSchema = z.object({
  patientId: z.string().trim().min(1),
  appointmentId: z.string().trim().min(1).nullable().optional(),
  medications: z.array(medicationSchema).min(1).max(50),
  notes: z.string().trim().max(10_000).nullable().optional(),
})

function authError(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : ""
  const status = message.startsWith("Unauthorized") ? 401 : message.startsWith("Forbidden") ? 403 : 500
  return NextResponse.json({ success: false, error: status === 500 ? fallback : message }, { status })
}

export async function GET(req: Request) {
  try {
    const { clinic } = await requireApiPermission(req, "patients.view")
    const patientId = new URL(req.url).searchParams.get("patientId")

    if (!patientId) {
      return NextResponse.json({ success: false, error: "معرف المريض مطلوب" }, { status: 400 })
    }

    const patient = await prisma.patient.findFirst({
      where: { id: patientId, clinicId: clinic.id },
      select: { id: true },
    })

    if (!patient) {
      return NextResponse.json({ success: false, error: "المريض غير موجود" }, { status: 404 })
    }

    const prescriptions = await prisma.prescription.findMany({
      where: { clinicId: clinic.id, patientId },
      orderBy: { createdAt: "desc" },
      include: {
        doctor: { select: { fullName: true } },
        appointment: { select: { id: true, date: true, startTime: true } },
      },
    })

    return NextResponse.json({ success: true, data: prescriptions })
  } catch (error) {
    return authError(error, "تعذر جلب الوصفات الطبية")
  }
}

export async function POST(req: Request) {
  try {
    const { clinic, user } = await requireApiPermission(req, "patients.update")
    const body = await req.json().catch(() => null)
    const parsed = prescriptionSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "بيانات الوصفة غير صالحة" }, { status: 400 })
    }

    const patient = await prisma.patient.findFirst({
      where: { id: parsed.data.patientId, clinicId: clinic.id },
      select: { id: true },
    })

    if (!patient) {
      return NextResponse.json({ success: false, error: "المريض غير موجود" }, { status: 404 })
    }

    if (parsed.data.appointmentId) {
      const appointment = await prisma.appointment.findFirst({
        where: {
          id: parsed.data.appointmentId,
          clinicId: clinic.id,
          patientId: patient.id,
        },
        select: { id: true },
      })

      if (!appointment) {
        return NextResponse.json({ success: false, error: "الموعد لا يتبع لهذا المريض أو العيادة" }, { status: 400 })
      }
    }

    const doctor = await prisma.doctor.findFirst({
      where: { userId: user.id, clinicId: clinic.id, isActive: true },
      select: { id: true },
    })

    if (!doctor) {
      return NextResponse.json(
        { success: false, error: "يلزم ربط الحساب بطبيب نشط لإصدار وصفة" },
        { status: 403 },
      )
    }

    const prescription = await prisma.prescription.create({
      data: {
        clinicId: clinic.id,
        patientId: patient.id,
        doctorId: doctor.id,
        appointmentId: parsed.data.appointmentId ?? undefined,
        medications: parsed.data.medications,
        notes: parsed.data.notes?.trim() || null,
      },
      include: {
        doctor: { select: { fullName: true } },
        appointment: { select: { id: true, date: true, startTime: true } },
      },
    })

    return NextResponse.json({ success: true, data: prescription }, { status: 201 })
  } catch (error) {
    return authError(error, "تعذر حفظ الوصفة الطبية")
  }
}
