import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireApiAuth } from "@/lib/auth/api-auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(req: Request) {
  try {
    const { clinic } = await requireApiAuth(req);
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string;
    const patientId = formData.get("patientId") as string;
    
    if (!file) {
      return NextResponse.json({ success: false, error: "لم يتم العثور على ملف" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Save locally to public/uploads
    const uploadDir = join(process.cwd(), "public", "uploads");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }
    
    const uniqueName = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
    const filePath = join(uploadDir, uniqueName);
    await writeFile(filePath, buffer);
    
    const url = `/uploads/${uniqueName}`;

    const media = await prisma.mediaAsset.create({
      data: {
        clinicId: clinic.id,
        fileUrl: url,
        fileName: file.name,
        fileSize: buffer.length,
        mimeType: file.type || 'application/octet-stream',
        category: type || 'DOCUMENT',
      }
    });
    
    return NextResponse.json({ success: true, data: media });
  } catch (error: any) {
    if (error.message?.includes('Unauthorized')) return NextResponse.json({ success: false, error: error.message }, { status: 401 });
    return NextResponse.json({ success: false, error: "فشل رفع الملف" }, { status: 500 });
  }
}
