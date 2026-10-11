import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireApiPermission } from "@/lib/auth/api-auth";

export async function GET(req: Request) {
  try {
    const { clinic } = await requireApiPermission(req, "settings.view");
    const settings = await prisma.clinicSettings.findUnique({
      where: { clinicId: clinic.id }
    });
    return NextResponse.json({ 
      success: true, 
      data: {
        ...settings,
        name: clinic.name,
        slug: clinic.slug,
        domain: clinic.slug
      } 
    });
  } catch (error: any) {
    if (error.message?.includes('Unauthorized') || error.message?.includes('Forbidden')) return NextResponse.json({ success: false, error: error.message }, { status: error.message.includes('Forbidden') ? 403 : 401 });
    return NextResponse.json({ success: false, error: "حدث خطأ" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { clinic } = await requireApiPermission(req, "settings.manage");
    const body = await req.json();
    
    // Allow updating these fields safely
    const data: any = {};
    const allowedFields = [
      'primaryColor', 'secondaryColor', 'accentColor', 
      'phone', 'email', 'address', 'city', 'country',
      'socialFacebook', 'socialInstagram', 'socialTwitter', 'socialWhatsapp',
      'notifyBookingConfirmation', 'notifyBookingCancellation', 
      'notifyVisitCompletion', 'notifyAppointmentReminder', 'reminderHoursBefore'
    ];
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        data[field] = body[field];
      }
    }

    const updatedSettings = await prisma.clinicSettings.upsert({
      where: { clinicId: clinic.id },
      update: data,
      create: {
        clinicId: clinic.id,
        ...data,
      },
    });

    return NextResponse.json({ success: true, data: updatedSettings });
  } catch (error: any) {
    if (error.message?.includes('Unauthorized') || error.message?.includes('Forbidden')) return NextResponse.json({ success: false, error: error.message }, { status: error.message.includes('Forbidden') ? 403 : 401 });
    console.error('Settings PUT error:', error);
    return NextResponse.json({ success: false, error: "حدث خطأ" }, { status: 500 });
  }
}
