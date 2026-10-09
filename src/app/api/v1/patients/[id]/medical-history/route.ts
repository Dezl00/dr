import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireApiAuth } from "@/lib/auth/api-auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { clinic } = await requireApiAuth(req);
    const { id } = await params;
    
    const history = await prisma.medicalHistory.findUnique({
      where: { patientId: id }
    });
    
    return NextResponse.json({ success: true, data: history });
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

    const history = await prisma.medicalHistory.upsert({
      where: { patientId: id },
      update: {
        allergies: body.allergies,
        chronicDiseases: body.chronicDiseases,
        medications: body.medications,
        bloodType: body.bloodType,
        notes: body.notes,
      },
      create: {
        patientId: id,
        allergies: body.allergies,
        chronicDiseases: body.chronicDiseases,
        medications: body.medications,
        bloodType: body.bloodType,
        notes: body.notes,
      }
    });
    
    return NextResponse.json({ success: true, data: history });
  } catch (error: any) {
    if (error.message?.includes('Unauthorized')) return NextResponse.json({ success: false, error: error.message }, { status: 401 });
    return NextResponse.json({ success: false, error: "حدث خطأ" }, { status: 500 });
  }
}
