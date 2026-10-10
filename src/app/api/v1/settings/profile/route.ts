import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireApiAuth } from "@/lib/auth/api-auth";
import { verifyPassword, hashPassword } from "@/lib/auth/password";

export async function GET(req: Request) {
  try {
    const { user } = await requireApiAuth(req);
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, fullName: true, email: true, phone: true, avatarUrl: true }
    });
    return NextResponse.json({ success: true, data: fullUser });
  } catch (error: any) {
    if (error.message?.includes('Unauthorized')) return NextResponse.json({ success: false, error: error.message }, { status: 401 });
    return NextResponse.json({ success: false, error: "حدث خطأ داخلي" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { user } = await requireApiAuth(req);
    const body = await req.json();

    const updateData: any = {};
    if (body.fullName !== undefined) updateData.fullName = body.fullName;
    if (body.phone !== undefined) updateData.phone = body.phone;
    
    // Password update
    if (body.currentPassword && body.newPassword) {
      const fullUser = await prisma.user.findUnique({ where: { id: user.id } });
      if (!fullUser || !fullUser.passwordHash) {
         return NextResponse.json({ success: false, error: "لا توجد كلمة مرور حالية" }, { status: 400 });
      }
      const isValid = await verifyPassword(fullUser.passwordHash, body.currentPassword);
      if (!isValid) {
        return NextResponse.json({ success: false, error: "كلمة المرور الحالية غير صحيحة" }, { status: 400 });
      }
      const hashed = await hashPassword(body.newPassword);
      updateData.passwordHash = hashed;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: true, data: user });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        avatarUrl: true,
      }
    });

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error: any) {
    if (error.message?.includes('Unauthorized')) return NextResponse.json({ success: false, error: error.message }, { status: 401 });
    console.error('Profile update error:', error);
    return NextResponse.json({ success: false, error: "حدث خطأ داخلي" }, { status: 500 });
  }
}
