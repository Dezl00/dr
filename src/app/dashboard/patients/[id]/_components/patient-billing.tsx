'use client'

import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export function PatientBilling({ invoices }: { invoices: any[] }) {
  if (!invoices || invoices.length === 0) {
    return (
      <div className="p-12 text-center text-muted-foreground border rounded-xl bg-card">
        <p className="mb-4">لا توجد فواتير أو سجلات مالية لهذا المريض.</p>
        <Link
          href="/dashboard/financials/invoices/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" strokeWidth={1.5} />
          إنشاء فاتورة جديدة
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">سجل الفواتير والمدفوعات</h3>
        <Link
          href="/dashboard/financials/invoices/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" strokeWidth={1.5} />
          فاتورة جديدة
        </Link>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-5 py-3.5 text-start font-medium text-muted-foreground">رقم الفاتورة</th>
              <th className="px-5 py-3.5 text-start font-medium text-muted-foreground">التاريخ</th>
              <th className="px-5 py-3.5 text-start font-medium text-muted-foreground">المبلغ الإجمالي</th>
              <th className="px-5 py-3.5 text-start font-medium text-muted-foreground">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="transition-colors hover:bg-accent/50">
                <td className="px-5 py-3.5 font-medium">
                  <Link href={`/dashboard/financials/invoices/${invoice.id}`} className="hover:underline text-primary">
                    {invoice.invoiceNumber}
                  </Link>
                </td>
                <td className="px-5 py-3.5">
                  {format(new Date(invoice.createdAt), 'dd MMMM yyyy', { locale: ar })}
                </td>
                <td className="px-5 py-3.5 font-medium" dir="ltr">{Number(invoice.total).toLocaleString('en-US')} EGP</td>
                <td className="px-5 py-3.5">
                  <Badge variant={
                    invoice.status === 'PAID' ? 'default' : 
                    invoice.status === 'PARTIAL' ? 'secondary' : 
                    'destructive'
                  }>
                    {invoice.status === 'PAID' ? 'مدفوعة' : 
                     invoice.status === 'PARTIAL' ? 'جزء مدفوع' : 'غير مدفوعة'}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
