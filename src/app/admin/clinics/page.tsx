import { prisma } from '@/lib/db/prisma'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'العيادات | إدارة المنصة',
}

const STATUS_MAP: Record<string, { label: string; class: string }> = {
  ACTIVE: { label: 'نشط', class: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' },
  SUSPENDED: { label: 'معلق', class: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300' },
  ARCHIVED: { label: 'مؤرشف', class: 'bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-400' },
  DELETED: { label: 'محذوف', class: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300' },
}

export default async function AdminClinicsPage() {
  const clinics = await prisma.clinic.findMany({
    include: {
      settings: { select: { primaryColor: true } },
      _count: { select: { memberships: true, patients: true } },
      subscription: { include: { plan: { select: { nameAr: true } } } },
      domains: { where: { type: 'PLATFORM_SUBDOMAIN', status: 'ACTIVE' }, take: 1 },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <h1 className="text-page-title mb-6">العيادات</h1>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">العيادة</th>
              <th className="hidden px-4 py-3 text-start text-xs font-medium text-muted-foreground sm:table-cell">النطاق</th>
              <th className="hidden px-4 py-3 text-start text-xs font-medium text-muted-foreground md:table-cell">الخطة</th>
              <th className="hidden px-4 py-3 text-start text-xs font-medium text-muted-foreground md:table-cell">الأعضاء</th>
              <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">الحالة</th>
              <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {clinics.map((clinic) => {
              const status = STATUS_MAP[clinic.status] || STATUS_MAP.ACTIVE
              return (
                <tr key={clinic.id} className="transition-colors hover:bg-accent/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div 
                        className="h-3 w-3 shrink-0 rounded-full border border-border" 
                        style={{ backgroundColor: clinic.settings?.primaryColor || '#2563EB' }}
                      />
                      <div>
                        <p className="text-sm font-medium">{clinic.name}</p>
                        <p className="text-xs text-muted-foreground">{clinic.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-sm text-muted-foreground sm:table-cell" dir="ltr">
                    {clinic.domains[0]?.domain || clinic.slug}
                  </td>
                  <td className="hidden px-4 py-3 text-sm text-muted-foreground md:table-cell">
                    {clinic.subscription?.plan.nameAr || '—'}
                  </td>
                  <td className="hidden px-4 py-3 text-sm text-muted-foreground md:table-cell">
                    {clinic._count.memberships}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('rounded-md px-2 py-0.5 text-xs font-medium', status.class)}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/clinics/${clinic.id}`}
                      className="text-sm text-primary hover:underline"
                    >
                      عرض
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
