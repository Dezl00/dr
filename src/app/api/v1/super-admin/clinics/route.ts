import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireSuperAdminApiAuth } from "@/lib/auth/api-auth";

export async function GET(req: Request) {
  try {
    // 1. Verify Super Admin Token
    await requireSuperAdminApiAuth(req);
    
    const url = new URL(req.url);
    const search = url.searchParams.get("search") || "";

    // 2. Fetch all clinics with basic stats
    const clinics = await prisma.clinic.findMany({
      where: search ? { name: { contains: search, mode: 'insensitive' } } : {},
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { patients: true, doctors: true, appointments: true }
        }
      }
    });

    return NextResponse.json({ success: true, data: clinics });
  } catch (error: any) {
    if (error.message?.includes('Unauthorized') || error.message?.includes('Forbidden')) {
      return NextResponse.json({ success: false, error: error.message }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: "حدث خطأ أثناء جلب العيادات" }, { status: 500 });
  }
}
