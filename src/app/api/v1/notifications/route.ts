import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { requireApiPermission } from "@/lib/auth/api-auth"

function getLimit(value: string | null) {
  const parsed = Number.parseInt(value ?? "20", 10)
  if (Number.isNaN(parsed)) return 20
  return Math.min(Math.max(parsed, 1), 50)
}

/**
 * The web dashboard currently represents notifications as recently-created
 * appointments. Expose the same feed to mobile until a durable notification
 * model is introduced, while keeping the feed scoped to the active clinic.
 */
export async function GET(req: Request) {
  try {
    const { clinic } = await requireApiPermission(req, "appointments.view")
    const url = new URL(req.url)
    const limit = getLimit(url.searchParams.get("limit"))
    const since = new Date()
    since.setDate(since.getDate() - 30)

    const appointments = await prisma.appointment.findMany({
      where: {
        clinicId: clinic.id,
        createdAt: { gte: since },
      },
      include: {
        patient: { select: { fullName: true } },
        doctor: { select: { fullName: true } },
        service: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    })

    const data = appointments.map((appointment) => ({
      id: `appointment:${appointment.id}`,
      type: "APPOINTMENT_CREATED",
      appointmentId: appointment.id,
      title: "حجز موعد جديد",
      body: `${appointment.patient.fullName} — ${appointment.doctor.fullName}`,
      createdAt: appointment.createdAt,
      appointment: {
        id: appointment.id,
        date: appointment.date,
        startTime: appointment.startTime,
        status: appointment.status,
        patientName: appointment.patient.fullName,
        doctorName: appointment.doctor.fullName,
        serviceName: appointment.service?.name ?? null,
      },
    }))

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    if (error.message?.includes("Unauthorized")) {
      return NextResponse.json({ success: false, error: error.message }, { status: 401 })
    }
    if (error.message?.includes("Forbidden")) {
      return NextResponse.json({ success: false, error: error.message }, { status: 403 })
    }

    console.error("Mobile notifications error:", error)
    return NextResponse.json(
      { success: false, error: "Unable to load notifications" },
      { status: 500 },
    )
  }
}
