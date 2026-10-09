import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireApiAuth } from "@/lib/auth/api-auth";

export async function GET(req: Request) {
  try {
    const { clinic } = await requireApiAuth(req);
    const services = await prisma.service.findMany({
      where: { clinicId: clinic.id, isActive: true },
      orderBy: { name: 'asc' }
    });
    return NextResponse.json({ success: true, data: services });
  } catch (error: any) {
    if (error.message?.includes('Unauthorized')) return NextResponse.json({ success: false, error: error.message }, { status: 401 });
    return NextResponse.json({ success: false, error: "حدث خطأ" }, { status: 500 });
  }
}
