import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireApiAuth } from "@/lib/auth/api-auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { clinic } = await requireApiAuth(req);
    const { id } = await params;
    
    const payments = await prisma.payment.findMany({
      where: { invoiceId: id }
    });
    
    return NextResponse.json({ success: true, data: payments });
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
    
    const { amount, method, referenceCode, notes } = body;

    const payment = await prisma.payment.create({
      data: {
        clinicId: clinic.id,
        invoiceId: id,
        amount,
        method,
        referenceCode,
        notes
      }
    });

    // Update invoice status logic (UNPAID -> PARTIAL -> PAID)
    const invoice = await prisma.invoice.findUnique({ where: { id }, include: { payments: true } });
    if (invoice) {
      const totalPaid = invoice.payments.reduce((acc, curr) => acc + Number(curr.amount), 0);
      let status = "PARTIAL";
      if (totalPaid >= Number(invoice.total)) {
        status = "PAID";
      }
      if (totalPaid === 0) {
        status = "UNPAID";
      }

      await prisma.invoice.update({
        where: { id },
        data: { status: status as any }
      });
    }
    
    return NextResponse.json({ success: true, data: payment });
  } catch (error: any) {
    if (error.message?.includes('Unauthorized')) return NextResponse.json({ success: false, error: error.message }, { status: 401 });
    return NextResponse.json({ success: false, error: "حدث خطأ" }, { status: 500 });
  }
}
