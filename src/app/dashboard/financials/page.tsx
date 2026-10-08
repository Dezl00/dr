import { requireAuth, getCurrentSession } from '@/lib/auth/dal'
import { prisma } from '@/lib/db/prisma'
import Link from 'next/link'
import { Plus, Search, DollarSign, ArrowUpRight, ArrowDownRight, CreditCard } from 'lucide-react'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { ActionLink } from '@/components/ui/action-link'

export const metadata = {
  title: 'المالية | DRS',
}

async function getClinicId() {
  const user = await requireAuth()
  const { session } = await getCurrentSession()
  if (user.isAdmin && session?.adminAccessClinicId) return session.adminAccessClinicId
  const membership = await prisma.clinicMembership.findFirst({
    where: { userId: user.id, status: 'ACTIVE' },
    select: { clinicId: true },
  })
  return membership?.clinicId || ''
}

export default async function FinancialsPage() {
  const clinicId = await getClinicId()

  const [invoices, totalRevenue, unpaidInvoices] = await Promise.all([
    prisma.invoice.findMany({
      where: { clinicId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { patient: true }
    }),
    prisma.payment.aggregate({
      where: { clinicId },
      _sum: { amount: true }
    }),
    prisma.invoice.aggregate({
      where: { clinicId, status: { in: ['UNPAID', 'PARTIAL'] } },
      _sum: { total: true }
    })
  ])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">الإدارة المالية</h1>
          <p className="mt-1 text-sm text-muted-foreground">نظرة عامة على الإيرادات والفواتير والمصروفات</p>
        </div>
        <div className="flex gap-2">
          <ActionLink
            href="/dashboard/financials/expenses/new"
            icon={ArrowDownRight}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-50"
          >
            إضافة مصروف
          </ActionLink>
          <ActionLink
            href="/dashboard/financials/invoices/new"
            icon={Plus}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            إنشاء فاتورة
          </ActionLink>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10 text-green-500">
              <ArrowUpRight className="h-6 w-6" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">إجمالي الإيرادات المحصلة</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground" dir="ltr">
                {Number(totalRevenue._sum.amount || 0).toLocaleString()} EGP
              </h3>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
              <DollarSign className="h-6 w-6" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">مستحقات غير محصلة</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground" dir="ltr">
                {Number(unpaidInvoices._sum.total || 0).toLocaleString()} EGP
              </h3>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
              <CreditCard className="h-6 w-6" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">الفواتير المعلقة</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">
                {invoices.filter(i => i.status === 'UNPAID' || i.status === 'PARTIAL').length} فاتورة
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Invoices */}
      <div>
        <h2 className="text-lg font-semibold mb-4">أحدث الفواتير</h2>
        {invoices.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <p className="text-base text-muted-foreground">لا توجد فواتير بعد</p>
          </div>
        ) : (
          <div className="hidden overflow-hidden rounded-xl border border-border bg-card sm:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-5 py-3.5 text-start font-medium text-muted-foreground">رقم الفاتورة</th>
                  <th className="px-5 py-3.5 text-start font-medium text-muted-foreground">المريض</th>
                  <th className="px-5 py-3.5 text-start font-medium text-muted-foreground">التاريخ</th>
                  <th className="px-5 py-3.5 text-start font-medium text-muted-foreground">المبلغ</th>
                  <th className="px-5 py-3.5 text-start font-medium text-muted-foreground">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="transition-colors duration-150 hover:bg-accent/50">
                    <td className="px-5 py-3.5 font-medium">
                      <Link href={`/dashboard/financials/invoices/${invoice.id}`} className="hover:underline text-primary">
                        {invoice.invoiceNumber}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">{invoice.patient?.fullName}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {format(new Date(invoice.createdAt), 'dd MMMM yyyy', { locale: ar })}
                    </td>
                    <td className="px-5 py-3.5 font-medium" dir="ltr">{Number(invoice.total).toLocaleString()}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        invoice.status === 'PAID' ? 'bg-green-100 text-green-700' :
                        invoice.status === 'PARTIAL' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {invoice.status === 'PAID' ? 'مدفوعة' : invoice.status === 'PARTIAL' ? 'جزء مدفوع' : 'غير مدفوعة'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
