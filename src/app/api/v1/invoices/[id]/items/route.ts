import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireApiAuth } from "@/lib/auth/api-auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { clinic } = await requireApiAuth(req);
    const { id } = await params;
    
    const items = await prisma.invoiceItem.findMany({
      where: { invoiceId: id },
      include: { service: { select: { name: true } } }
    });
    
    return NextResponse.json({ success: true, data: items });
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
    
    const { serviceId, description, quantity, unitPrice, toothNumber } = body;

    const item = await prisma.invoiceItem.create({
      data: {
        invoiceId: id,
        serviceId,
        description,
        quantity: quantity || 1,
        unitPrice,
        total: (quantity || 1) * unitPrice,
        toothNumber
      }
    });

    // We should ideally update the invoice totals here, but keeping it simple for the MVP endpoint
    // We can fetch items and recalculate
    const allItems = await prisma.invoiceItem.findMany({ where: { invoiceId: id } });
    const newTotal = allItems.reduce((acc, curr) => acc + Number(curr.total), 0);
    
    await prisma.invoice.update({
      where: { id },
      data: {
        subtotal: newTotal,
        total: newTotal // minus discount plus tax in real scenario
      }
    });
    
    return NextResponse.json({ success: true, data: item });
  } catch (error: any) {
    if (error.message?.includes('Unauthorized')) return NextResponse.json({ success: false, error: error.message }, { status: 401 });
    return NextResponse.json({ success: false, error: "حدث خطأ" }, { status: 500 });
  }
}
