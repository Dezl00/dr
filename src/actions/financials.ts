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

export async function createInvoice(formData: FormData) {
  try {
    const user = await requireAuth()
    const clinicId = await getClinicId(user.id)
    if (!clinicId) throw new Error('Unauthorized')

    const patientId = formData.get('patientId') as string
    const total = parseFloat(formData.get('total') as string)
    const notes = formData.get('notes') as string
    
    // Generate unique invoice number
    const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    await prisma.invoice.create({
      data: {
        clinicId,
        patientId,
        invoiceNumber,
        subtotal: total,
        total,
        status: 'UNPAID',
        notes
      }
    })

    revalidatePath('/dashboard/financials')
    revalidatePath(`/dashboard/patients/${patientId}`)
    return { success: true }
  } catch (error) {
    return { error: 'حدث خطأ أثناء إنشاء الفاتورة' }
  }
}

export async function recordPayment(invoiceId: string, amount: number, method: any) {
  try {
    const user = await requireAuth()
    const clinicId = await getClinicId(user.id)
    if (!clinicId) throw new Error('Unauthorized')

    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId, clinicId } })
    if (!invoice) throw new Error('Invoice not found')

    await prisma.$transaction([
      prisma.payment.create({
        data: {
          clinicId,
          invoiceId,
          amount,
          method
        }
      }),
      prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          status: Number(invoice.total) <= amount ? 'PAID' : 'PARTIAL' // Simplistic logic for demonstration
        }
      })
    ])

    revalidatePath('/dashboard/financials')
    revalidatePath(`/dashboard/patients/${invoice.patientId}`)
    return { success: true }
  } catch (error) {
    return { error: 'حدث خطأ أثناء تسجيل الدفعة' }
  }
}

export async function recordExpense(formData: FormData) {
  try {
    const user = await requireAuth()
    const clinicId = await getClinicId(user.id)
    if (!clinicId) throw new Error('Unauthorized')

    const category = formData.get('category') as any
    const amount = parseFloat(formData.get('amount') as string)
    const description = formData.get('description') as string
    const expenseDate = new Date(formData.get('expenseDate') as string)

    await prisma.expense.create({
      data: {
        clinicId,
        category,
        amount,
        description,
        expenseDate
      }
    })

    revalidatePath('/dashboard/financials')
    return { success: true }
  } catch (error) {
    return { error: 'حدث خطأ أثناء تسجيل المصروف' }
  }
}
