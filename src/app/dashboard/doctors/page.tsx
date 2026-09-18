import { prisma } from '@/lib/db/prisma'
import { requireAuth, getCurrentSession } from '@/lib/auth/dal'
import Link from 'next/link'
import { Plus, Stethoscope } from 'lucide-react'
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
          <h1 className="text-page-title">الأطباء</h1>
          <p className="mt-1 text-small text-muted-foreground">{doctors.length} طبيب</p>
        </div>
        <Link
          href="/dashboard/doctors/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" strokeWidth={1.5} />
          إضافة طبيب
        </Link>
      </div>

      {doctors.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <Stethoscope className="mx-auto mb-3 h-8 w-8 text-muted-foreground" strokeWidth={1} />
          <p className="text-body text-muted-foreground">لم يتم إضافة أطباء بعد</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {doctors.map((doctor) => (
            <Link
              key={doctor.id}
              href={`/dashboard/doctors/${doctor.id}`}
              className="rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent/50"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                  {doctor.fullName.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{doctor.fullName}</p>
                  <p className="text-xs text-muted-foreground truncate">{doctor.specialty || 'طبيب عام'}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${doctor.isActive ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-400'}`}>
                  {doctor.isActive ? 'نشط' : 'غير نشط'}
                </span>
                {doctor.showOnWebsite && (
                  <span className="text-xs text-muted-foreground">معروض على الموقع</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
