import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireApiAuth } from "@/lib/auth/api-auth";

export async function GET(req: Request) {
  try {
    const { clinic } = await requireApiAuth(req);
    const url = new URL(req.url);
    const patientId = url.searchParams.get("patientId");

    if (!patientId) {
      return NextResponse.json({ success: false, error: "معرف المريض مطلوب" }, { status: 400 });
    }

    const prescriptions = await prisma.prescription.findMany({
      where: { clinicId: clinic.id, patientId },
      orderBy: { createdAt: "desc" },
      include: {
        doctor: { select: { user: { select: { fullName: true } } } }
      }
    });

    return NextResponse.json({ success: true, data: prescriptions });
  } catch (error: any) {
    if (error.message?.includes('Unauthorized')) return NextResponse.json({ success: false, error: error.message }, { status: 401 });
    return NextResponse.json({ success: false, error: "حدث خطأ أثناء جلب الوصفات الطبية" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { clinic, user } = await requireApiAuth(req);
    const body = await req.json();
    const { patientId, medications, notes, appointmentId } = body;

    if (!patientId || !medications || !Array.isArray(medications)) {
      return NextResponse.json({ success: false, error: "البيانات غير مكتملة" }, { status: 400 });
    }

    // Find the doctor record for the current user in this clinic
    const doctor = await prisma.doctor.findFirst({
      where: { userId: user.id, clinicId: clinic.id }
    });

    if (!doctor) {
      return NextResponse.json({ success: false, error: "المستخدم الحالي غير مسجل كطبيب" }, { status: 403 });
    }

    const prescription = await prisma.prescription.create({
      data: {
        clinicId: clinic.id,
        patientId,
        doctorId: doctor.id,
        appointmentId,
        medications, // Prisma JSON handles arrays
        notes
      }
    });

    return NextResponse.json({ success: true, data: prescription }, { status: 201 });
  } catch (error: any) {
    if (error.message?.includes('Unauthorized')) return NextResponse.json({ success: false, error: error.message }, { status: 401 });
    return NextResponse.json({ success: false, error: "حدث خطأ أثناء حفظ الوصفة" }, { status: 500 });
  }
}
