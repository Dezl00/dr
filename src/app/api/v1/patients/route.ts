import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireApiAuth } from "@/lib/auth/api-auth";
import { z } from "zod";

// Zod schema for patient creation validation
const patientSchema = z.object({
  fullName: z.string().min(2, "الاسم يجب أن يكون أكثر من حرفين"),
  phone: z.string().min(8, "رقم الهاتف غير صحيح"),
  email: z.string().email("البريد الإلكتروني غير صحيح").optional().or(z.literal("")),
  gender: z.enum(["MALE", "FEMALE"]).optional(),
  dateOfBirth: z.string().optional(), // Expected ISO string
  notes: z.string().optional(),
});

export async function GET(req: Request) {
  try {
    const { clinic } = await requireApiAuth(req);
    
    // Parse query params for search and pagination
    const url = new URL(req.url);
    const search = url.searchParams.get("search") || "";
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where = {
      clinicId: clinic.id,
      ...(search
        ? {
            OR: [
              { fullName: { contains: search, mode: 'insensitive' as const } },
              { phone: { contains: search } },
            ],
          }
        : {}),
    };

    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          fullName: true,
          phone: true,
          gender: true,
          dateOfBirth: true,
          _count: {
            select: { appointments: true, invoices: { where: { status: "UNPAID" } } }
          }
        }
      }),
      prisma.patient.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      data: patients,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error: any) {
    if (error.message?.includes('Unauthorized') || error.message?.includes('Forbidden')) {
      return NextResponse.json({ success: false, error: error.message }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: "حدث خطأ أثناء جلب المرضى" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { clinic } = await requireApiAuth(req);
    const body = await req.json();

    const validatedData = patientSchema.parse(body);

    const newPatient = await prisma.patient.create({
      data: {
        clinicId: clinic.id,
        fullName: validatedData.fullName,
        phone: validatedData.phone,
        email: validatedData.email || null,
        gender: validatedData.gender,
        dateOfBirth: validatedData.dateOfBirth ? new Date(validatedData.dateOfBirth) : null,
        notes: validatedData.notes,
      },
    });

    return NextResponse.json({
      success: true,
      data: newPatient,
      message: "تم إضافة المريض بنجاح"
    }, { status: 201 });

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors[0].message }, { status: 400 });
    }
    if (error.message?.includes('Unauthorized') || error.message?.includes('Forbidden')) {
      return NextResponse.json({ success: false, error: error.message }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: "حدث خطأ أثناء إضافة المريض" }, { status: 500 });
  }
}
