import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireApiAuth } from "@/lib/auth/api-auth";
import { z } from "zod";

const appointmentSchema = z.object({
  patientId: z.string().min(1, "المريض مطلوب"),
  doctorId: z.string().min(1, "الطبيب مطلوب"),
  serviceId: z.string().optional(),
  date: z.string(), // ISO String or YYYY-MM-DD
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "صيغة الوقت غير صحيحة"),
  endTime: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(req: Request) {
  try {
    const { clinic } = await requireApiAuth(req);
    const url = new URL(req.url);
    
    // Default to today if no date provided
    const dateParam = url.searchParams.get("date");
    const whereClause: any = {
      clinicId: clinic.id,
    };

    if (dateParam) {
      const targetDate = new Date(dateParam);
      targetDate.setUTCHours(0, 0, 0, 0);
      whereClause.date = targetDate;
    }

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      orderBy: {
        startTime: 'asc'
      },
      include: {
        patient: {
          select: { id: true, fullName: true, phone: true }
        },
        doctor: {
          select: { id: true, user: { select: { fullName: true } } }
        },
        service: {
          select: { id: true, name: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: appointments,
      meta: {
        date: dateParam || 'ALL'
      }
    });
  } catch (error: any) {
    if (error.message?.includes('Unauthorized') || error.message?.includes('Forbidden')) {
      return NextResponse.json({ success: false, error: error.message }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: "حدث خطأ أثناء جلب المواعيد" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { clinic } = await requireApiAuth(req);
    const body = await req.json();

    const validatedData = appointmentSchema.parse(body);

    const newAppointment = await prisma.appointment.create({
      data: {
        clinicId: clinic.id,
        patientId: validatedData.patientId,
        doctorId: validatedData.doctorId,
        serviceId: validatedData.serviceId,
        date: new Date(validatedData.date),
        startTime: validatedData.startTime,
        endTime: validatedData.endTime,
        notes: validatedData.notes,
        status: "SCHEDULED"
      },
      include: {
        patient: { select: { fullName: true } }
      }
    });

    try {
      // Fetch users in this clinic to send push notifications
      const clinicUsers = await prisma.clinicMembership.findMany({
        where: { clinicId: clinic.id },
        include: { user: true }
      });

      const tokens: string[] = [];
      for (const m of clinicUsers) {
        if (m.user.deviceTokens && m.user.deviceTokens.length > 0) {
          tokens.push(...m.user.deviceTokens);
        }
      }

      // De-duplicate tokens
      const uniqueTokens = Array.from(new Set(tokens));

      if (uniqueTokens.length > 0) {
        const { getFirebaseAdminApp } = await import("@/lib/firebase-admin");
        const firebaseAdmin = getFirebaseAdminApp();
        await firebaseAdmin.messaging().sendEachForMulticast({
          notification: {
            title: "حجز موعد جديد 📅",
            body: `تم حجز موعد للمريض ${newAppointment.patient?.fullName} الساعة ${validatedData.startTime}`,
          },
          tokens: uniqueTokens,
        });
      }
    } catch (pushErr) {
      console.error("Failed to send push notification:", pushErr);
    }

    return NextResponse.json({
      success: true,
      data: newAppointment,
      message: "تم حجز الموعد بنجاح"
    }, { status: 201 });

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors[0].message }, { status: 400 });
    }
    if (error.message?.includes('Unauthorized') || error.message?.includes('Forbidden')) {
      return NextResponse.json({ success: false, error: error.message }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: "حدث خطأ أثناء حجز الموعد" }, { status: 500 });
  }
}
