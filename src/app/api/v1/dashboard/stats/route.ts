import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireApiAuth } from "@/lib/auth/api-auth";

export async function GET(req: Request) {
  try {
    // 1. Authenticate the mobile request
    const authResult = await requireApiAuth(req);
    const { clinic } = authResult;

    // 2. Fetch basic stats for the dashboard
    // Example: Today's appointments, Total Patients, Pending Invoices
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      todaysAppointments,
      totalPatients,
      completedCount,
      upcomingCount,
      todaysList,
      upcomingList,
    ] = await Promise.all([
      prisma.appointment.count({
        where: { clinicId: clinic.id, date: { gte: today, lt: tomorrow } }
      }),
      prisma.patient.count({
        where: { clinicId: clinic.id }
      }),
      prisma.appointment.count({
        where: { clinicId: clinic.id, status: 'COMPLETED', date: { gte: today, lt: tomorrow } }
      }),
      prisma.appointment.count({
        where: {
          clinicId: clinic.id,
          status: { in: ['SCHEDULED', 'CONFIRMED'] },
          date: { gte: today },
        }
      }),
      prisma.appointment.findMany({
        where: { clinicId: clinic.id, date: { gte: today, lt: tomorrow } },
        include: {
          patient: { select: { fullName: true } },
          doctor: { select: { fullName: true } },
          service: { select: { name: true } },
        },
        orderBy: { startTime: 'asc' },
      }),
      prisma.appointment.findMany({
        where: {
          clinicId: clinic.id,
          status: { in: ['SCHEDULED', 'CONFIRMED'] },
          date: { gte: new Date() },
        },
        include: {
          patient: { select: { fullName: true } },
          doctor: { select: { fullName: true } },
          service: { select: { name: true } },
        },
        orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
        take: 5,
      })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          todaysAppointments,
          totalPatients,
          completedCount,
          upcomingCount,
        },
        todaysList,
        upcomingList,
      }
    });

  } catch (error: any) {
    console.error("Dashboard Stats API error:", error);
    
    // Check if it's an auth error to return 401
    if (error.message && (error.message.includes('Unauthorized') || error.message.includes('Forbidden'))) {
      return NextResponse.json({ success: false, error: error.message }, { status: 401 });
    }

    return NextResponse.json(
      { success: false, error: "حدث خطأ أثناء جلب الإحصائيات" },
      { status: 500 }
    );
  }
}
