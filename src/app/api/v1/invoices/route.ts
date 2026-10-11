import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db/prisma"
import { requireApiPermission } from "@/lib/auth/api-auth"

const invoiceItemSchema = z.object({
  serviceId: z.string().min(1).nullable().optional(),
  description: z.string().trim().min(1).max(500),
  quantity: z.number().int().positive(),
  unitPrice: z.number().finite().nonnegative(),
  toothNumber: z.number().int().positive().nullable().optional(),
})

const invoiceSchema = z.object({
  patientId: z.string().min(1),
  appointmentId: z.string().min(1).nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
  discount: z.number().finite().nonnegative().optional(),
  tax: z.number().finite().nonnegative().optional(),
  notes: z.string().max(10_000).nullable().optional(),
  items: z.array(invoiceItemSchema).min(1),
  initialPayment: z.number().finite().nonnegative().optional(),
  paymentMethod: z.enum(["CASH", "CARD", "BANK_TRANSFER", "INSURANCE", "INSTALLMENT"]).optional(),
})

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "حدث خطأ غير متوقع"
  const status = message.includes("Unauthorized") ? 401 : message.includes("Forbidden") ? 403 : 500
  return NextResponse.json({ success: false, error: status === 500 ? "حدث خطأ أثناء معالجة الفواتير" : message }, { status })
}

export async function GET(req: Request) {
  try {
    const { clinic } = await requireApiPermission(req, "patients.view")
    const url = new URL(req.url)
    const status = url.searchParams.get("status")
    const patientId = url.searchParams.get("patientId")
    const page = Math.max(1, Number(url.searchParams.get("page") ?? 1) || 1)
    const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") ?? 20) || 20))
    const where = {
      clinicId: clinic.id,
      ...(status ? { status: status as "DRAFT" | "UNPAID" | "PARTIAL" | "PAID" | "CANCELLED" } : {}),
      ...(patientId ? { patientId } : {}),
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          patient: { select: { id: true, fullName: true, phone: true } },
          appointment: { select: { id: true, date: true, startTime: true } },
          _count: { select: { items: true, payments: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.invoice.count({ where }),
    ])

    return NextResponse.json({ success: true, data: invoices, meta: { total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) } })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function POST(req: Request) {
  try {
    const { clinic } = await requireApiPermission(req, "patients.update")
    const payload = invoiceSchema.parse(await req.json())
    const discount = payload.discount ?? 0
    const tax = payload.tax ?? 0

    const [patient, appointment, services] = await Promise.all([
      prisma.patient.findFirst({ where: { id: payload.patientId, clinicId: clinic.id }, select: { id: true } }),
      payload.appointmentId
        ? prisma.appointment.findFirst({
            where: { id: payload.appointmentId, clinicId: clinic.id },
            select: { id: true, patientId: true },
          })
        : null,
      prisma.service.findMany({
        where: {
          clinicId: clinic.id,
          id: { in: payload.items.flatMap((item) => (item.serviceId ? [item.serviceId] : [])) },
        },
        select: { id: true },
      }),
    ])

    if (!patient) {
      return NextResponse.json({ success: false, error: "المريض غير موجود في العيادة" }, { status: 404 })
    }
    if (payload.appointmentId && (!appointment || appointment.patientId !== patient.id)) {
      return NextResponse.json({ success: false, error: "الموعد غير صالح لهذا المريض" }, { status: 400 })
    }

    const serviceIds = new Set(services.map((service) => service.id))
    if (payload.items.some((item) => item.serviceId && !serviceIds.has(item.serviceId))) {
      return NextResponse.json({ success: false, error: "إحدى الخدمات لا تخص العيادة" }, { status: 400 })
    }

    const subtotal = payload.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
    const total = Math.max(0, subtotal - discount + tax)
    const initialPayment = payload.initialPayment ?? 0
    if (initialPayment > total) {
      return NextResponse.json({ success: false, error: "الدفعة الأولى لا يمكن أن تتجاوز إجمالي الفاتورة" }, { status: 400 })
    }

    const invoice = await prisma.$transaction(async (tx) => {
      const created = await tx.invoice.create({
        data: {
          clinicId: clinic.id,
          patientId: patient.id,
          appointmentId: appointment?.id,
          invoiceNumber: `INV-${Date.now()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
          subtotal,
          discount,
          tax,
          total,
          status: initialPayment === 0 ? "UNPAID" : initialPayment === total ? "PAID" : "PARTIAL",
          dueDate: payload.dueDate ? new Date(payload.dueDate) : null,
          notes: payload.notes ?? null,
          items: {
            create: payload.items.map((item) => ({
              serviceId: item.serviceId ?? null,
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.quantity * item.unitPrice,
              toothNumber: item.toothNumber ?? null,
            })),
          },
        },
      })

      if (initialPayment > 0) {
        await tx.payment.create({
          data: {
            clinicId: clinic.id,
            invoiceId: created.id,
            amount: initialPayment,
            method: payload.paymentMethod ?? "CASH",
          },
        })
      }

      return tx.invoice.findUniqueOrThrow({
        where: { id: created.id },
        include: {
          patient: { select: { id: true, fullName: true, phone: true } },
          items: { include: { service: { select: { id: true, name: true } } } },
          payments: true,
        },
      })
    })

    return NextResponse.json({ success: true, data: invoice }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors[0]?.message ?? "بيانات الفاتورة غير صحيحة" }, { status: 400 })
    }
    return errorResponse(error)
  }
}
