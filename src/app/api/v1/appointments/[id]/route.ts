import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db/prisma"
import { requireApiPermission } from "@/lib/auth/api-auth"

const updateSchema = z.object({
  patientId: z.string().min(1).optional(),
  doctorId: z.string().min(1).optional(),
  serviceId: z.string().min(1).nullable().optional(),
  date: z.string().optional(),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).nullable().optional(),
  notes: z.string().max(10_000).nullable().optional(),
}).refine((data) => Object.keys(data).length > 0, "أرسل قيمة واحدة على الأقل للتحديث")

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "حدث خطأ غير متوقع"
  const status = message.includes("Unauthorized") ? 401 : message.includes("Forbidden") ? 403 : 500
  return NextResponse.json({ success: false, error: status === 500 ? "حدث خطأ أثناء تحديث الموعد" : message }, { status })
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { clinic } = await requireApiPermission(req, "appointments.view")
    const { id } = await params
    const appointment = await prisma.appointment.findFirst({
      where: { id, clinicId: clinic.id },
      include: {
        patient: { select: { id: true, fullName: true, phone: true } },
        doctor: { select: { id: true, fullName: true, specialty: true } },
        service: { select: { id: true, name: true } },
      },
    })
    if (!appointment) return NextResponse.json({ success: false, error: "الموعد غير موجود" }, { status: 404 })
    return NextResponse.json({ success: true, data: appointment })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { clinic } = await requireApiPermission(req, "appointments.update")
    const { id } = await params
    const data = updateSchema.parse(await req.json())
    const current = await prisma.appointment.findFirst({ where: { id, clinicId: clinic.id } })
    if (!current) return NextResponse.json({ success: false, error: "الموعد غير موجود" }, { status: 404 })

    const patientId = data.patientId ?? current.patientId
    const doctorId = data.doctorId ?? current.doctorId
    const serviceId = data.serviceId === undefined ? current.serviceId : data.serviceId
    const date = data.date ? new Date(data.date) : current.date
    if (Number.isNaN(date.getTime())) return NextResponse.json({ success: false, error: "تاريخ الموعد غير صحيح" }, { status: 400 })
    const startTime = data.startTime ?? current.startTime
    const [patient, doctor, service] = await Promise.all([
      prisma.patient.findFirst({ where: { id: patientId, clinicId: clinic.id }, select: { id: true } }),
      prisma.doctor.findFirst({ where: { id: doctorId, clinicId: clinic.id, isActive: true }, select: { id: true } }),
      serviceId ? prisma.service.findFirst({ where: { id: serviceId, clinicId: clinic.id, isActive: true }, select: { id: true } }) : Promise.resolve(null),
    ])
    if (!patient || !doctor || (serviceId && !service)) return NextResponse.json({ success: false, error: "بيانات الموعد لا تنتمي إلى العيادة" }, { status: 400 })
    const conflict = await prisma.appointment.findFirst({
      where: { clinicId: clinic.id, doctorId, date, startTime, status: { not: "CANCELLED" }, id: { not: current.id } },
      select: { id: true },
    })
    if (conflict) return NextResponse.json({ success: false, error: "الطبيب لديه موعد في هذا الوقت" }, { status: 409 })
    const appointment = await prisma.appointment.update({
      where: { id: current.id },
      data: {
        patientId,
        doctorId,
        serviceId,
        date,
        startTime,
        ...((data.date !== undefined || data.startTime !== undefined) ? { reminderSentAt: null } : {}),
        ...(data.endTime !== undefined ? { endTime: data.endTime } : {}),
        ...(data.notes !== undefined ? { notes: data.notes } : {}),
      },
      include: {
        patient: { select: { id: true, fullName: true, phone: true } },
        doctor: { select: { id: true, fullName: true } },
        service: { select: { id: true, name: true } },
      },
    })
    return NextResponse.json({ success: true, data: appointment })
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ success: false, error: error.errors[0]?.message ?? "بيانات الموعد غير صحيحة" }, { status: 400 })
    return errorResponse(error)
  }
}
