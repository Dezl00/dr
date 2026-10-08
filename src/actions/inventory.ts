'use server'

import { requireAuth, getCurrentSession } from '@/lib/auth/dal'
import { prisma } from '@/lib/db/prisma'
import { revalidatePath } from 'next/cache'

async function getClinicId(userId: string) {
  const { session } = await getCurrentSession()
  if (session?.adminAccessClinicId) return session.adminAccessClinicId
  const membership = await prisma.clinicMembership.findFirst({
    where: { userId, status: 'ACTIVE' },
  })
  return membership?.clinicId
}

export async function addInventoryItem(formData: FormData) {
  try {
    const user = await requireAuth()
    const clinicId = await getClinicId(user.id)
    if (!clinicId) throw new Error('Unauthorized')

    const name = formData.get('name') as string
    const sku = formData.get('sku') as string
    const category = formData.get('category') as string
    const quantity = parseInt(formData.get('quantity') as string)
    const minQuantity = parseInt(formData.get('minQuantity') as string)
    const unit = formData.get('unit') as string

    await prisma.inventoryItem.create({
      data: {
        clinicId,
        name,
        sku,
        category,
        quantity,
        minQuantity,
        unit
      }
    })

    revalidatePath('/dashboard/inventory')
    return { success: true }
  } catch (error) {
    return { error: 'حدث خطأ أثناء إضافة الصنف للمخزن' }
  }
}

export async function adjustStock(itemId: string, quantityChange: number, notes: string) {
  try {
    const user = await requireAuth()
    const clinicId = await getClinicId(user.id)
    if (!clinicId) throw new Error('Unauthorized')

    const item = await prisma.inventoryItem.findUnique({ where: { id: itemId, clinicId } })
    if (!item) throw new Error('Item not found')

    await prisma.$transaction([
      prisma.inventoryItem.update({
        where: { id: itemId },
        data: { quantity: item.quantity + quantityChange }
      }),
      prisma.stockTransaction.create({
        data: {
          inventoryItemId: itemId,
          type: quantityChange > 0 ? 'IN' : 'OUT',
          quantity: Math.abs(quantityChange),
          notes,
          createdByUserId: user.id
        }
      })
    ])

    revalidatePath('/dashboard/inventory')
    return { success: true }
  } catch (error) {
    return { error: 'حدث خطأ أثناء تسوية المخزون' }
  }
}
