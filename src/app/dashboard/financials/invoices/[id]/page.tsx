import { requireAuth, getCurrentSession } from '@/lib/auth/dal'
import { prisma } from '@/lib/db/prisma'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { CreditCard, Building2, Phone, Mail } from 'lucide-react'
import { PaymentForm } from './_components/payment-form'
import { PrintButton } from './_components/print-button'
import { BackButton } from '@/components/ui/back-button'

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
      items: true,
      clinic: {
        include: { settings: true }
      },
      payments: {
        orderBy: { paymentDate: 'desc' }
      }
    }
  })
  
  if (!invoice) notFound()

  const totalPaid = invoice.payments.reduce((acc, curr) => acc + Number(curr.amount), 0)
  const remaining = Number(invoice.total) - totalPaid

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="print:hidden">
        <BackButton label="العودة للإدارة المالية" />
      </div>
      {/* Header Controls - Hidden in print */}
      <div className="flex items-center justify-between border-b border-border pb-6 print:hidden">
        <div>
          <h1 className="text-2xl font-bold">فاتورة {invoice.invoiceNumber}</h1>
          <p className="text-muted-foreground mt-1">تاريخ الإصدار: {format(new Date(invoice.createdAt), 'dd MMMM yyyy', { locale: ar })}</p>
        </div>
        <PrintButton />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Invoice Printable Area */}
        <div className="lg:col-span-2 relative">
          
          <div id="printable-invoice" className="bg-card text-foreground border border-border rounded-xl p-8 shadow-sm print:absolute print:left-0 print:top-0 print:w-full print:border-none print:shadow-none print:z-[9999] print:bg-white print:text-black print:m-0 print:p-0">
            {/* Invoice Header */}
            <div className="flex justify-between items-start border-b pb-6 mb-6 border-slate-200 print:border-black">
              <div>
                <h2 className="text-3xl font-bold text-slate-800 print:text-black">{invoice.clinic.name}</h2>
                <div className="text-slate-500 print:text-black mt-2 space-y-1 text-sm">
                  {invoice.clinic.settings?.address && (
                    <p className="flex items-center gap-2"><Building2 className="w-4 h-4 print:hidden" /> {invoice.clinic.settings.address}</p>
                  )}
                  {invoice.clinic.settings?.phone && (
                    <p className="flex items-center gap-2"><Phone className="w-4 h-4 print:hidden" /> {invoice.clinic.settings.phone}</p>
                  )}
                  {invoice.clinic.settings?.email && (
                    <p className="flex items-center gap-2"><Mail className="w-4 h-4 print:hidden" /> {invoice.clinic.settings.email}</p>
                  )}
                </div>
              </div>
              <div className="text-left rtl:text-right bg-slate-50 print:bg-transparent p-4 rounded-lg print:p-0">
                <h1 className="text-2xl font-bold text-slate-400 print:text-black mb-2 uppercase tracking-widest">INVOICE</h1>
                <p className="text-slate-600 print:text-black font-medium">رقم الفاتورة: <span className="text-slate-900 print:text-black">{invoice.invoiceNumber}</span></p>
                <p className="text-slate-600 print:text-black font-medium">التاريخ: <span className="text-slate-900 print:text-black">{format(new Date(invoice.createdAt), 'dd/MM/yyyy')}</span></p>
              </div>
            </div>

            {/* Patient Info */}
            <div className="mb-8 p-4 rounded-lg bg-slate-50 print:bg-transparent border border-slate-100 print:border-none print:p-0">
              <h3 className="text-sm font-bold text-slate-400 print:text-black uppercase tracking-wider mb-2">فاتورة إلى / Billed To:</h3>
              <p className="text-lg font-bold text-slate-800 print:text-black">{invoice.patient.fullName}</p>
              <p className="text-slate-600 print:text-black" dir="ltr">{invoice.patient.phone}</p>
            </div>

            {/* Invoice Items Table */}
            <div className="mb-8">
              <table className="w-full text-sm text-right print:text-black">
                <thead>
                  <tr className="border-b-2 border-slate-200 print:border-black text-slate-600 print:text-black">
                    <th className="pb-3 font-bold">البيان / الوصف</th>
                    <th className="pb-3 font-bold text-center">الكمية</th>
                    <th className="pb-3 font-bold text-center">سعر الوحدة</th>
                    <th className="pb-3 font-bold text-left rtl:text-left">الإجمالي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 print:divide-black">
                  {invoice.items.map(item => (
                    <tr key={item.id}>
                      <td className="py-4 text-slate-800 print:text-black font-medium">{item.description}</td>
                      <td className="py-4 text-center text-slate-600 print:text-black">{item.quantity}</td>
                      <td className="py-4 text-center text-slate-600 print:text-black" dir="ltr">{Number(item.unitPrice).toLocaleString()} EGP</td>
                      <td className="py-4 text-left font-bold text-slate-800 print:text-black" dir="ltr">{Number(item.total).toLocaleString()} EGP</td>
                    </tr>
                  ))}
                  {invoice.items.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-slate-500 print:text-black">لا توجد بنود مفصلة (فاتورة مبدئية)</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end border-t-2 border-slate-200 print:border-black pt-6">
              <div className="w-full max-w-sm space-y-3 text-sm print:text-black">
                <div className="flex justify-between items-center text-slate-600 print:text-black">
                  <span>الإجمالي (Subtotal)</span>
                  <span className="font-medium" dir="ltr">{Number(invoice.total).toLocaleString()} EGP</span>
                </div>
                <div className="flex justify-between items-center text-green-600 print:text-black border-b border-slate-200 print:border-black pb-3">
                  <span>إجمالي المدفوع (Paid)</span>
                  <span className="font-medium" dir="ltr">- {totalPaid.toLocaleString()} EGP</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold text-slate-800 print:text-black pt-1">
                  <span>المتبقي (Balance Due)</span>
                  <span dir="ltr">{remaining.toLocaleString()} EGP</span>
                </div>
              </div>
            </div>

            {/* Footer / Notes */}
            <div className="mt-16 pt-8 border-t border-slate-200 print:border-black text-slate-500 print:text-black text-sm">
              {invoice.notes && (
                <div className="mb-4">
                  <span className="font-bold">ملاحظات: </span>
                  {invoice.notes}
                </div>
              )}
              <p className="text-center">نتمنى لكم دوام الصحة والعافية.</p>
            </div>
            
            <style dangerouslySetInnerHTML={{__html: `
              @media print {
                body * {
                  visibility: hidden;
                }
                #printable-invoice, #printable-invoice * {
                  visibility: visible;
                }
                #printable-invoice {
                  position: absolute;
                  left: 0;
                  top: 0;
                  width: 100%;
                  margin: 0;
                  padding: 20px;
                  background-color: white !important;
                  color: black !important;
                }
              }
            `}} />
          </div>
        </div>

        {/* Sidebar Actions - Hidden in print */}
        <div className="lg:col-span-1 space-y-6 print:hidden">
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
                      <p className="font-medium text-foreground" dir="ltr">{Number(payment.amount).toLocaleString()} EGP</p>
                      <p className="text-xs text-muted-foreground mt-1">{format(new Date(payment.paymentDate), 'dd MMM yyyy')}</p>
                    </div>
                    <span className="px-2 py-1 rounded-md bg-muted text-xs font-medium border border-border">
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
