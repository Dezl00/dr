import { prisma } from '@/lib/db/prisma'
import { requireAdmin } from '@/lib/auth/dal'
import { notFound } from 'next/navigation'
import { openClinicAsAdmin } from '@/actions/admin'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default async function AdminClinicDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()
  const { id } = await params

  const clinic = await prisma.clinic.findUnique({
    where: { id },
    include: {
      settings: true,
      _count: { select: { memberships: true, patients: true, appointments: true, doctors: true, services: true } },
      subscription: { include: { plan: true } },
      domains: true,
      memberships: {
        include: {
          user: { select: { fullName: true, email: true } },
          role: { select: { nameAr: true } },
        },
      },
    },
  })

  if (!clinic) notFound()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-page-title">{clinic.name}</h1>
          <p className="mt-1 text-small text-muted-foreground" dir="ltr">{clinic.slug}</p>
        </div>
        <form action={openClinicAsAdmin}>
          <input type="hidden" name="clinicId" value={clinic.id} />
          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            فتح العيادة
          </button>
        </form>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <p className="text-stat">{clinic._count.patients}</p>
          <p className="text-xs text-muted-foreground">مرضى</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <p className="text-stat">{clinic._count.appointments}</p>
          <p className="text-xs text-muted-foreground">مواعيد</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <p className="text-stat">{clinic._count.doctors}</p>
          <p className="text-xs text-muted-foreground">أطباء</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <p className="text-stat">{clinic._count.services}</p>
          <p className="text-xs text-muted-foreground">خدمات</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <p className="text-stat">{clinic._count.memberships}</p>
          <p className="text-xs text-muted-foreground">أعضاء</p>
        </div>
      </div>

      {/* Domains */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-section-title mb-3">النطاقات</h2>
        <div className="space-y-2">
          {clinic.domains.map((domain) => (
            <div key={domain.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
              <span className="text-sm" dir="ltr">{domain.domain}</span>
              <span className={cn(
                'rounded-md px-2 py-0.5 text-xs font-medium',
                domain.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
              )}>
                {domain.status === 'ACTIVE' ? 'نشط' : domain.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Members */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-section-title mb-3">الأعضاء</h2>
        <div className="space-y-2">
          {clinic.memberships.map((m) => (
            <div key={m.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
              <div>
                <p className="text-sm font-medium">{m.user.fullName}</p>
                <p className="text-xs text-muted-foreground" dir="ltr">{m.user.email}</p>
              </div>
              <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium">{m.role.nameAr}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
