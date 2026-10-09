import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireApiAuth } from "@/lib/auth/api-auth";
import * as bcrypt from "bcrypt";

export async function PUT(req: Request) {
  try {
    const { user } = await requireApiAuth(req);
    const body = await req.json();

    const updateData: any = {};
    if (body.fullName !== undefined) updateData.fullName = body.fullName;
    if (body.phone !== undefined) updateData.phone = body.phone;
    
    // Password update
    if (body.currentPassword && body.newPassword) {
      const isValid = await bcrypt.compare(body.currentPassword, user.passwordHash);
      if (!isValid) {
        return NextResponse.json({ success: false, error: "كلمة المرور الحالية غير صحيحة" }, { status: 400 });
      }
      const hashed = await bcrypt.hash(body.newPassword, 10);
      updateData.passwordHash = hashed;
    } else if (body.newPassword) {
      // If setting password without current (maybe via admin force? For safety, we require currentPassword usually)
      // but let's just skip it if currentPassword is not provided unless explicitly allowed.
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
    return NextResponse.json({ success: false, error: "حدث خطأ" }, { status: 500 });
  }
}
