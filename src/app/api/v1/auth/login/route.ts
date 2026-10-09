import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { signMobileToken } from "@/lib/auth/api-auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, clinicId } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "البريد الإلكتروني وكلمة المرور مطلوبان" },
        { status: 400 }
      );
    }

    // 1. Find the user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        memberships: {
          where: { status: 'ACTIVE' },
          include: {
            clinic: {
              select: { id: true, name: true, slug: true, status: true }
            },
            role: {
              select: { id: true, name: true, nameAr: true }
            }
          }
        }
      }
    });

    if (!user || user.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: "بيانات الدخول غير صحيحة أو الحساب غير نشط" },
        { status: 401 }
      );
    }

    // 2. Verify Password
    const isValidPassword = await verifyPassword(user.passwordHash, password);
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: "بيانات الدخول غير صحيحة" },
        { status: 401 }
      );
    }

    // 3. Optional: Ensure Phone is Verified (Depends on business logic)
    // if (!user.phoneVerified) {
    //   return NextResponse.json({ success: false, error: "يرجى توثيق رقم الهاتف أولاً" }, { status: 403 });
    // }

    // 4. Handle Clinic Selection
    if (user.memberships.length === 0) {
      return NextResponse.json(
        { success: false, error: "لا تملك صلاحية الدخول لأي عيادة" },
        { status: 403 }
      );
    }

    // If clinicId is not provided, and user has multiple clinics, return a prompt to select a clinic
    if (!clinicId && user.memberships.length > 1) {
      return NextResponse.json({
        success: true,
        requireClinicSelection: true,
        clinics: user.memberships.map(m => ({
          id: m.clinic.id,
          name: m.clinic.name,
          role: m.role.nameAr
        }))
      });
    }

    // Determine the target membership
    const targetMembership = clinicId 
      ? user.memberships.find(m => m.clinic.id === clinicId)
      : user.memberships[0];

    if (!targetMembership || targetMembership.clinic.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: "العيادة غير متاحة أو موقوفة" },
        { status: 403 }
      );
    }

    // 5. Generate JWT Token
    const token = await signMobileToken({
      userId: user.id,
      email: user.email,
      clinicId: targetMembership.clinic.id,
      roleId: targetMembership.role.id,
    });

    // 6. Return Data
    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
      clinic: {
        id: targetMembership.clinic.id,
        name: targetMembership.clinic.name,
        slug: targetMembership.clinic.slug,
      },
      role: {
        id: targetMembership.role.id,
        nameAr: targetMembership.role.nameAr,
      }
    });

  } catch (error) {
    console.error("Mobile Login API error:", error);
    return NextResponse.json(
      { success: false, error: "حدث خطأ في الخادم، يرجى المحاولة لاحقاً" },
      { status: 500 }
    );
  }
}
