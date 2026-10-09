import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireApiAuth } from "@/lib/auth/api-auth";

export async function GET(req: Request) {
  try {
    const { clinic } = await requireApiAuth(req);
    const team = await prisma.clinicMembership.findMany({
      where: { clinicId: clinic.id, status: 'ACTIVE' },
      include: {
        user: { select: { id: true, fullName: true, email: true, phone: true } },
        role: { select: { name: true, nameAr: true } }
      }
    });
    return NextResponse.json({ success: true, data: team });
  } catch (error: any) {
    if (error.message?.includes('Unauthorized')) return NextResponse.json({ success: false, error: error.message }, { status: 401 });
    return NextResponse.json({ success: false, error: "حدث خطأ" }, { status: 500 });
  }
}
