import { requireAuth, getCurrentSession } from '@/lib/auth/dal'
import { prisma } from '@/lib/db/prisma'
import { notFound } from 'next/navigation'
import { ArrowUp, ArrowDown, Package, History } from 'lucide-react'
import { StockAdjustmentForm } from './_components/stock-form'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { BackButton } from '@/components/ui/back-button'

async function getClinicId(userId: string) {
  const { session } = await getCurrentSession()
  if (session?.adminAccessClinicId) return session.adminAccessClinicId
  const membership = await prisma.clinicMembership.findFirst({
    where: { userId, status: 'ACTIVE' },
  })
  return membership?.clinicId || ''
}

export default async function InventoryItemPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth()
  const clinicId = await getClinicId(user.id)
  
  const { id } = await params

  const item = await prisma.inventoryItem.findUnique({
    where: { id, clinicId },
    include: {
      transactions: {
        orderBy: { createdAt: 'desc' },
        take: 20
      }
    }
  })
  
  if (!item) notFound()

  return (
    <div className="space-y-6">
      <BackButton label="العودة للمخزون" />
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Package className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">{item.name}</h1>
            <p className="text-muted-foreground mt-1">كود (SKU): {item.sku || 'لا يوجد'} • تصنيف: {item.category}</p>
          </div>
        </div>
        <div className="text-center bg-card border border-border px-6 py-3 rounded-xl">
          <p className="text-sm text-muted-foreground">الرصيد الحالي</p>
          <p className="text-2xl font-semibold mt-1" dir="ltr">{item.quantity} <span className="text-sm font-normal text-muted-foreground">{item.unit}</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          {/* Adjustment Form */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold mb-4">تسوية المخزون (صرف / إضافة)</h3>
            <StockAdjustmentForm itemId={item.id} currentQuantity={item.quantity} />
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border flex items-center gap-2">
              <History className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold">سجل حركة الصنف (آخر 20 حركة)</h3>
            </div>
            {item.transactions.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                لا توجد حركات مسجلة لهذا الصنف بعد.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="px-4 py-3 text-start font-medium text-muted-foreground">التاريخ</th>
                    <th className="px-4 py-3 text-start font-medium text-muted-foreground">الحركة</th>
                    <th className="px-4 py-3 text-start font-medium text-muted-foreground">الكمية</th>
                    <th className="px-4 py-3 text-start font-medium text-muted-foreground">البيان / ملاحظات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {item.transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-accent/50 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground">
                        {format(new Date(tx.createdAt), 'dd MMMM yyyy HH:mm', { locale: ar })}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${tx.type === 'IN' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {tx.type === 'IN' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                          {tx.type === 'IN' ? 'إضافة (وارد)' : 'صرف (منصرف)'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold" dir="ltr">{tx.quantity}</td>
                      <td className="px-4 py-3 text-muted-foreground">{tx.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
