import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireApiAuth } from "@/lib/auth/api-auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { clinic } = await requireApiAuth(req);
    const { id } = await params;
    
    const records = await prisma.dentalRecord.findMany({
      where: { patientId: id }
    });
    
    return NextResponse.json({ success: true, data: records });
  } catch (error: any) {
    if (error.message?.includes('Unauthorized')) return NextResponse.json({ success: false, error: error.message }, { status: 401 });
    return NextResponse.json({ success: false, error: "حدث خطأ" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { clinic } = await requireApiAuth(req);
    const { id } = await params;
    const body = await req.json();
    
    // Expects toothNumber and condition
    const { toothNumber, condition, notes } = body;

    if (!toothNumber || !condition) {
      return NextResponse.json({ success: false, error: "رقم السن والحالة مطلوبة" }, { status: 400 });
    }

    const record = await prisma.dentalRecord.upsert({
      where: {
        patientId_toothNumber: {
          patientId: id,
          toothNumber: parseInt(toothNumber)
        }
      },
      update: {
        condition,
        notes
      },
      create: {
        patientId: id,
        toothNumber: parseInt(toothNumber),
        condition,
        notes
      }
    });
    
    return NextResponse.json({ success: true, data: record });
  } catch (error: any) {
    if (error.message?.includes('Unauthorized')) return NextResponse.json({ success: false, error: error.message }, { status: 401 });
    return NextResponse.json({ success: false, error: "حدث خطأ" }, { status: 500 });
  }
}
