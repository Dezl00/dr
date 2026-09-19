import { prisma } from '@/lib/db/prisma'
import { requireAuth, getCurrentSession } from '@/lib/auth/dal'
import Link from 'next/link'
import { Plus, Stethoscope } from 'lucide-react'
import Image from 'next/image'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'الأطباء | DRS',
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

export default async function DoctorsPage() {
  const clinicId = await getClinicId()

  const doctors = await prisma.doctor.findMany({
    where: { clinicId },
    orderBy: { sortOrder: 'asc' },
  })

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">الأطباء</h1>
          <p className="mt-1 text-sm text-muted-foreground">{doctors.length} طبيب</p>
        </div>
        <Link
          href="/dashboard/doctors/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors duration-150 hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" strokeWidth={1.5} />
          إضافة طبيب
        </Link>
      </div>

      {doctors.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <Stethoscope className="mx-auto mb-3 h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
          <p className="text-base text-muted-foreground">لم يتم إضافة أطباء بعد</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {doctors.map((doctor) => (
            <Link
              key={doctor.id}
              href={`/dashboard/doctors/${doctor.id}`}
              className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 transition-colors duration-150 hover:border-primary/50 hover:bg-accent/30"
            >
              <div className="flex items-center gap-4">
                {doctor.imageUrl ? (
                  <Image
                    src={doctor.imageUrl}
                    alt={doctor.fullName}
                    width={48}
                    height={48}
                    className="h-12 w-12 shrink-0 rounded-full object-cover border border-border"
                  />
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent text-base font-medium text-foreground border border-border">
                    {doctor.fullName.charAt(0)}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-base font-medium truncate text-foreground">{doctor.fullName}</p>
                  <p className="mt-0.5 inline-block rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground truncate border border-border">
                    {doctor.specialty || 'طبيب عام'}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 border-t border-border pt-4">
                <span className={`inline-flex rounded-md px-2 py-1 text-xs font-medium border ${doctor.isActive ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-400' : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400'}`}>
                  {doctor.isActive ? 'نشط' : 'غير نشط'}
                </span>
                {doctor.showOnWebsite && (
                  <span className="inline-flex rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-400">
                    ظاهر على الموقع
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
