import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireSuperAdminApiAuth } from "@/lib/auth/api-auth";

export async function GET(req: Request) {
  try {
    await requireSuperAdminApiAuth(req);
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, fullName: true, email: true, status: true, isAdmin: true, createdAt: true }
    });
    return NextResponse.json({ success: true, data: users });
  } catch (error: any) {
    if (error.message?.includes('Unauthorized')) return NextResponse.json({ success: false, error: error.message }, { status: 401 });
    return NextResponse.json({ success: false, error: "حدث خطأ" }, { status: 500 });
  }
}
