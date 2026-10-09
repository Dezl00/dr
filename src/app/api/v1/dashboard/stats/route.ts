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
      pendingInvoicesTotal
    ] = await Promise.all([
      // Count today's appointments for this clinic
      prisma.appointment.count({
        where: {
          clinicId: clinic.id,
          date: {
            gte: today,
            lt: tomorrow
          }
        }
      }),
      // Count total active patients
      prisma.patient.count({
        where: {
          clinicId: clinic.id
        }
      }),
      // Sum pending/unpaid invoices
      prisma.invoice.aggregate({
        where: {
          clinicId: clinic.id,
          status: { in: ['UNPAID', 'PARTIAL'] }
        },
        _sum: {
          total: true
        }
      })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        todaysAppointments,
        totalPatients,
        pendingRevenue: pendingInvoicesTotal._sum.total || 0,
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
