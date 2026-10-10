import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireApiAuth } from "@/lib/auth/api-auth";

export async function GET(req: Request) {
  try {
    const { clinic } = await requireApiAuth(req);
    const doctors = await prisma.doctor.findMany({
      where: { clinicId: clinic.id },
      include: {
        services: {
          include: { service: { select: { name: true } } }
        }
      },
      orderBy: { sortOrder: 'asc' }
    });
    return NextResponse.json({ success: true, data: doctors });
  } catch (error: any) {
    if (error.message?.includes('Unauthorized')) return NextResponse.json({ success: false, error: error.message }, { status: 401 });
    return NextResponse.json({ success: false, error: "حدث خطأ" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { clinic } = await requireApiAuth(req);
    const body = await req.json();
    
    const doctor = await prisma.doctor.create({
      data: {
        clinicId: clinic.id,
        fullName: body.fullName,
        specialty: body.specialty,
        phone: body.phone,
        email: body.email,
        bio: body.bio,
        isActive: body.isActive ?? true,
        showOnWebsite: body.showOnWebsite ?? true,
      }
    });
    
    return NextResponse.json({ success: true, data: doctor }, { status: 201 });
  } catch (error: any) {
    if (error.message?.includes('Unauthorized')) return NextResponse.json({ success: false, error: error.message }, { status: 401 });
    return NextResponse.json({ success: false, error: "حدث خطأ" }, { status: 500 });
  }
}
