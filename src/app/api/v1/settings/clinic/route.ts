import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireApiAuth } from "@/lib/auth/api-auth";

export async function PUT(req: Request) {
  try {
    const { clinic } = await requireApiAuth(req);
    const body = await req.json();
    
    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.address !== undefined) updateData.address = body.address;
    if (body.taxNumber !== undefined) updateData.taxNumber = body.taxNumber;
    if (body.logo !== undefined) updateData.logo = body.logo;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: true, data: clinic });
    }

    // Check slug uniqueness
    if (updateData.slug && updateData.slug !== clinic.slug) {
      const existing = await prisma.clinic.findUnique({ where: { slug: updateData.slug } });
      if (existing) {
        return NextResponse.json({ success: false, error: "هذا الرابط مستخدم بالفعل" }, { status: 400 });
      }
    }

    const updatedClinic = await prisma.clinic.update({
      where: { id: clinic.id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: updatedClinic });
  } catch (error: any) {
    if (error.message?.includes('Unauthorized')) return NextResponse.json({ success: false, error: error.message }, { status: 401 });
    console.error('Clinic update error:', error);
    return NextResponse.json({ success: false, error: "حدث خطأ" }, { status: 500 });
  }
}
