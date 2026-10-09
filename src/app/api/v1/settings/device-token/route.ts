import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireApiAuth } from "@/lib/auth/api-auth";

export async function PUT(req: Request) {
  try {
    const { user } = await requireApiAuth(req);
    const body = await req.json();
    const { fcmToken } = body;

    if (!fcmToken) {
      return NextResponse.json({ success: false, error: "Token is required" }, { status: 400 });
    }

    // Add token if not already present
    const currentUser = await prisma.user.findUnique({ where: { id: user.id } });
    const tokens = currentUser?.deviceTokens || [];
    
    if (!tokens.includes(fcmToken)) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          deviceTokens: {
            push: fcmToken
          }
        }
      });
    }

    return NextResponse.json({ success: true, message: "Token registered" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
