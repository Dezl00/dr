import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireApiAuth } from "@/lib/auth/api-auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { clinic } = await requireApiAuth(req);
    const { id } = await params;
    const body = await req.json();
    
    if (!body.status) {
      return NextResponse.json({ success: false, error: "الحالة مطلوبة" }, { status: 400 });
    }

    const appointment = await prisma.appointment.update({
      where: { id, clinicId: clinic.id },
      data: { status: body.status }
    });
    
    return NextResponse.json({ success: true, data: appointment });
  } catch (error: any) {
    if (error.message?.includes('Unauthorized')) return NextResponse.json({ success: false, error: error.message }, { status: 401 });
    return NextResponse.json({ success: false, error: "حدث خطأ أثناء التحديث" }, { status: 500 });
  }
}
