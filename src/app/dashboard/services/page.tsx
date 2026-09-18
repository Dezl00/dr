import { prisma } from '@/lib/db/prisma'
import { requireAuth, getCurrentSession } from '@/lib/auth/dal'
import Link from 'next/link'
import { Plus, ListChecks } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'الخدمات | DRS',
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

export default async function ServicesPage() {
  const clinicId = await getClinicId()

  const services = await prisma.service.findMany({
    where: { clinicId },
    orderBy: { sortOrder: 'asc' },
  })

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-page-title">الخدمات</h1>
          <p className="mt-1 text-small text-muted-foreground">{services.length} خدمة</p>
        </div>
        <Link
          href="/dashboard/services/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" strokeWidth={1.5} />
          إضافة خدمة
        </Link>
      </div>

      {services.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <ListChecks className="mx-auto mb-3 h-8 w-8 text-muted-foreground" strokeWidth={1} />
          <p className="text-body text-muted-foreground">لم يتم إضافة خدمات بعد</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">الخدمة</th>
                <th className="hidden px-4 py-3 text-start text-xs font-medium text-muted-foreground sm:table-cell">السعر</th>
                <th className="hidden px-4 py-3 text-start text-xs font-medium text-muted-foreground sm:table-cell">المدة</th>
                <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {services.map((service) => (
                <tr key={service.id} className="transition-colors hover:bg-accent/50">
                  <td className="px-4 py-3">
                    <Link href={`/dashboard/services/${service.id}`} className="text-sm font-medium hover:text-primary">
                      {service.name}
                    </Link>
                    {service.description && (
                      <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{service.description}</p>
                    )}
                  </td>
                  <td className="hidden px-4 py-3 text-sm text-muted-foreground sm:table-cell">
                    {service.price ? `${service.price} ج.م` : '—'}
                  </td>
                  <td className="hidden px-4 py-3 text-sm text-muted-foreground sm:table-cell">
                    {service.duration ? `${service.duration} دقيقة` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${service.isActive ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-400'}`}>
                      {service.isActive ? 'نشط' : 'غير نشط'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
