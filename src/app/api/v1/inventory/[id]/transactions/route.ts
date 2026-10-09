import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireApiAuth } from "@/lib/auth/api-auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { clinic } = await requireApiAuth(req);
    const { id } = await params;
    
    const transactions = await prisma.stockTransaction.findMany({
      where: { inventoryItemId: id },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { fullName: true } }
      }
    });
    
    return NextResponse.json({ success: true, data: transactions });
  } catch (error: any) {
    if (error.message?.includes('Unauthorized')) return NextResponse.json({ success: false, error: error.message }, { status: 401 });
    return NextResponse.json({ success: false, error: "حدث خطأ" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { clinic, user } = await requireApiAuth(req);
    const { id } = await params;
    const body = await req.json();
    
    const { type, quantity, notes } = body; // type: IN, OUT, ADJUSTMENT

    const transaction = await prisma.stockTransaction.create({
      data: {
        inventoryItemId: id,
        type,
        quantity,
        notes,
        createdByUserId: user.id
      }
    });

    // Update main inventory quantity
    const currentItem = await prisma.inventoryItem.findUnique({ where: { id } });
    if (currentItem) {
      let newQuantity = currentItem.quantity;
      if (type === 'IN') newQuantity += quantity;
      if (type === 'OUT') newQuantity -= quantity;
      if (type === 'ADJUSTMENT') newQuantity = quantity; // Using ADJUSTMENT to set absolute value

      await prisma.inventoryItem.update({
        where: { id },
        data: { quantity: newQuantity }
      });
    }
    
    return NextResponse.json({ success: true, data: transaction });
  } catch (error: any) {
    if (error.message?.includes('Unauthorized')) return NextResponse.json({ success: false, error: error.message }, { status: 401 });
    return NextResponse.json({ success: false, error: "حدث خطأ" }, { status: 500 });
  }
}
