import { prisma } from '@/lib/db/prisma'
import { requireAuth, getCurrentSession } from '@/lib/auth/dal'
import Link from 'next/link'
import { Plus, ListChecks, ImageIcon } from 'lucide-react'
import Image from 'next/image'
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
          <h1 className="text-xl font-semibold">الخدمات</h1>
          <p className="mt-1 text-sm text-muted-foreground">{services.length} خدمة</p>
        </div>
        <Link
          href="/dashboard/services/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors duration-150 hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" strokeWidth={1.5} />
          إضافة خدمة
        </Link>
      </div>

      {services.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <ListChecks className="mx-auto mb-3 h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
          <p className="text-base text-muted-foreground">لم يتم إضافة خدمات بعد</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-5 py-3.5 text-start font-medium text-muted-foreground">الخدمة</th>
                <th className="hidden px-5 py-3.5 text-start font-medium text-muted-foreground sm:table-cell">السعر</th>
                <th className="hidden px-5 py-3.5 text-start font-medium text-muted-foreground sm:table-cell">المدة</th>
                <th className="px-5 py-3.5 text-start font-medium text-muted-foreground">الظهور</th>
                <th className="px-5 py-3.5 text-start font-medium text-muted-foreground">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {services.map((service) => (
                <tr key={service.id} className="transition-colors duration-150 hover:bg-accent/50">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      {service.imageUrl ? (
                        <Image 
                          src={service.imageUrl} 
                          alt={service.name} 
                          width={40} 
                          height={40} 
                          className="h-10 w-10 shrink-0 rounded-md object-cover border border-border"
                        />
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted border border-border">
                          <ImageIcon className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
                        </div>
                      )}
                      <div>
                        <Link href={`/dashboard/services/${service.id}`} className="font-medium transition-colors hover:text-primary">
                          {service.name}
                        </Link>
                        {service.description && (
                          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1 max-w-[200px] sm:max-w-xs">{service.description}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-5 py-3.5 text-muted-foreground sm:table-cell">
                    {service.price ? <span className="font-medium text-foreground">{service.price.toString()} ج.م</span> : '—'}
                  </td>
                  <td className="hidden px-5 py-3.5 text-muted-foreground sm:table-cell">
                    {service.duration ? `${service.duration} دقيقة` : '—'}
                  </td>
                  <td className="px-5 py-3.5">
                    {service.showOnWebsite ? (
                      <span className="inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-400">
                        ظاهرة على الموقع
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium border ${service.isActive ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-400' : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400'}`}>
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
