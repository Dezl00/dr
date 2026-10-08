import { requireAuth, getCurrentSession } from '@/lib/auth/dal'
import { prisma } from '@/lib/db/prisma'
import Link from 'next/link'
import { Plus, Search, AlertTriangle, PackageOpen, Package } from 'lucide-react'

export const metadata = {
  title: 'المخازن | DRS',
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

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const clinicId = await getClinicId()
  const params = await searchParams
  const query = params.q || ''

  const where = {
    clinicId,
    ...(query ? {
      OR: [
        { name: { contains: query, mode: 'insensitive' as const } },
        { sku: { contains: query } },
      ],
    } : {}),
  }

  const items = await prisma.inventoryItem.findMany({
    where,
    orderBy: { name: 'asc' },
  })

  const lowStockItems = items.filter(i => i.quantity <= i.minQuantity)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">إدارة المخازن</h1>
          <p className="mt-1 text-sm text-muted-foreground">{items.length} صنف في المخزن</p>
        </div>
        <Link
          href="/dashboard/inventory/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" strokeWidth={1.5} />
          إضافة صنف جديد
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-6 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
            <Package className="h-6 w-6" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">إجمالي الأصناف</p>
            <h3 className="text-2xl font-bold mt-1 text-foreground">{items.length}</h3>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
            <AlertTriangle className="h-6 w-6" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">نواقص (أقل من الحد الأدنى)</p>
            <h3 className="text-2xl font-bold mt-1 text-foreground text-red-500">{lowStockItems.length}</h3>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10 text-green-500">
            <PackageOpen className="h-6 w-6" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">الرصيد الإجمالي ككميات</p>
            <h3 className="text-2xl font-bold mt-1 text-foreground">
              {items.reduce((acc, curr) => acc + curr.quantity, 0)}
            </h3>
          </div>
        </div>
      </div>

      {/* Search */}
      <form className="mb-6">
        <div className="relative">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
          <input
            name="q"
            type="search"
            defaultValue={query}
            placeholder="بحث في الأصناف بالكود (SKU) أو الاسم..."
            className="w-full rounded-xl border border-border bg-background py-2.5 pe-3 ps-10 text-sm placeholder:text-muted-foreground transition-colors duration-150 focus:border-primary focus:outline-none sm:max-w-md"
          />
        </div>
      </form>

      {/* Table */}
      {items.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <p className="text-base text-muted-foreground">المخزن فارغ أو لا توجد نتائج للبحث</p>
        </div>
      ) : (
        <div className="hidden overflow-hidden rounded-xl border border-border bg-card sm:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-5 py-3.5 text-start font-medium text-muted-foreground">الكود (SKU)</th>
                <th className="px-5 py-3.5 text-start font-medium text-muted-foreground">اسم الصنف</th>
                <th className="px-5 py-3.5 text-start font-medium text-muted-foreground">التصنيف</th>
                <th className="px-5 py-3.5 text-start font-medium text-muted-foreground">الكمية الحالية</th>
                <th className="px-5 py-3.5 text-start font-medium text-muted-foreground">الوحدة</th>
                <th className="px-5 py-3.5 text-start font-medium text-muted-foreground">تنبيه النواقص</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((item) => {
                const isLow = item.quantity <= item.minQuantity;
                return (
                  <tr key={item.id} className="transition-colors duration-150 hover:bg-accent/50">
                    <td className="px-5 py-3.5 text-muted-foreground" dir="ltr">{item.sku || '—'}</td>
                    <td className="px-5 py-3.5 font-medium">
                      <Link href={`/dashboard/inventory/${item.id}`} className="hover:underline text-primary">
                        {item.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">{item.category || '—'}</td>
                    <td className={`px-5 py-3.5 font-bold ${isLow ? 'text-red-500' : 'text-foreground'}`}>
                      {item.quantity}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">{item.unit}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{item.minQuantity}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
