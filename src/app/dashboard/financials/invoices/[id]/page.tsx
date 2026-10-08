import { requireAuth, getCurrentSession } from '@/lib/auth/dal'
import { prisma } from '@/lib/db/prisma'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { Printer, CreditCard } from 'lucide-react'
import { PaymentForm } from './_components/payment-form'

async function getClinicId(userId: string) {
  const { session } = await getCurrentSession()
  if (session?.adminAccessClinicId) return session.adminAccessClinicId
  const membership = await prisma.clinicMembership.findFirst({
    where: { userId, status: 'ACTIVE' },
  })
  return membership?.clinicId || ''
}

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth()
  const clinicId = await getClinicId(user.id)
  
  const { id } = await params

  const invoice = await prisma.invoice.findUnique({
    where: { id, clinicId },
    include: {
      patient: true,
      payments: {
        orderBy: { paymentDate: 'desc' }
      }
    }
  })
  
  if (!invoice) notFound()

  const totalPaid = invoice.payments.reduce((acc, curr) => acc + Number(curr.amount), 0)
  const remaining = Number(invoice.total) - totalPaid

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold">فاتورة رقم {invoice.invoiceNumber}</h1>
          <p className="text-muted-foreground mt-1">تاريخ الإصدار: {format(new Date(invoice.createdAt), 'dd MMMM yyyy', { locale: ar })}</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg border bg-card px-4 py-2 text-sm font-medium hover:bg-accent transition-colors">
          <Printer className="h-4 w-4" /> طباعة
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold mb-4 text-muted-foreground border-b border-border pb-2">بيانات المريض</h3>
            <p className="font-medium text-lg">{invoice.patient.fullName}</p>
            <p className="text-muted-foreground" dir="ltr">{invoice.patient.phone}</p>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <h3 className="font-semibold p-4 text-muted-foreground bg-muted/30 border-b border-border">تفاصيل الحساب</h3>
            <div className="p-4 space-y-4">
              <div className="flex justify-between items-center py-2">
                <span className="font-medium">المبلغ الإجمالي للفاتورة</span>
                <span className="font-bold text-lg" dir="ltr">{Number(invoice.total).toLocaleString()} EGP</span>
              </div>
              <div className="flex justify-between items-center py-2 text-green-600">
                <span className="font-medium">إجمالي المدفوع</span>
                <span className="font-bold text-lg" dir="ltr">- {totalPaid.toLocaleString()} EGP</span>
              </div>
              <div className="flex justify-between items-center py-2 border-t border-border pt-4">
                <span className="font-bold text-lg">المتبقي (المديونية)</span>
                <span className="font-bold text-xl text-red-500" dir="ltr">{remaining.toLocaleString()} EGP</span>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-1 space-y-6">
          {remaining > 0 && (
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4 text-primary">
                <CreditCard className="h-5 w-5" />
                <h3 className="font-semibold">تسجيل دفعة جديدة</h3>
              </div>
              <PaymentForm invoiceId={invoice.id} remaining={remaining} />
            </div>
          )}

          {invoice.payments.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold mb-4 border-b border-border pb-2 text-muted-foreground">سجل الدفعات</h3>
              <div className="space-y-4">
                {invoice.payments.map(payment => (
                  <div key={payment.id} className="flex justify-between items-center text-sm">
                    <div>
                      <p className="font-medium" dir="ltr">{Number(payment.amount).toLocaleString()} EGP</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(payment.paymentDate), 'dd MMM yyyy')}</p>
                    </div>
                    <span className="px-2 py-1 rounded-md bg-muted text-xs">
                      {payment.method === 'CASH' ? 'كاش' : payment.method === 'CARD' ? 'بطاقة' : 'تحويل'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
