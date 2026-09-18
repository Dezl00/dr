import { prisma } from '@/lib/db/prisma'
import { requireAuth, getCurrentSession } from '@/lib/auth/dal'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'المواعيد | DRS',
}

const STATUS_MAP: Record<string, { label: string; class: string }> = {
  SCHEDULED: { label: 'مجدول', class: 'status-scheduled' },
  CONFIRMED: { label: 'مؤكد', class: 'status-confirmed' },
  COMPLETED: { label: 'مكتمل', class: 'status-completed' },
  CANCELLED: { label: 'ملغي', class: 'status-cancelled' },
  NO_SHOW: { label: 'لم يحضر', class: 'status-noshow' },
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

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>
}) {
  const clinicId = await getClinicId()
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page || '1'))
  const statusFilter = params.status || ''
  const perPage = 20

  const where = {
    clinicId,
    ...(statusFilter ? { status: statusFilter as any } : {}),
  }

  const [appointments, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      include: {
        patient: { select: { fullName: true } },
        doctor: { select: { fullName: true } },
        service: { select: { name: true } },
      },
      orderBy: [{ date: 'desc' }, { startTime: 'desc' }],
      take: perPage,
      skip: (page - 1) * perPage,
    }),
    prisma.appointment.count({ where }),
  ])

  const totalPages = Math.ceil(total / perPage)

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-page-title">المواعيد</h1>
          <p className="mt-1 text-small text-muted-foreground">{total} موعد</p>
        </div>
        <Link
          href="/dashboard/appointments/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" strokeWidth={1.5} />
          موعد جديد
        </Link>
      </div>

      {/* Status filters */}
      <div className="mb-4 flex flex-wrap gap-2">
        <Link
          href="/dashboard/appointments"
          className={cn(
            'rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
            !statusFilter
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-border hover:bg-accent'
          )}
        >
          الكل
        </Link>
        {Object.entries(STATUS_MAP).map(([key, { label }]) => (
          <Link
            key={key}
            href={`/dashboard/appointments?status=${key}`}
            className={cn(
              'rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
              statusFilter === key
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border hover:bg-accent'
            )}
          >
            {label}
          </Link>
        ))}
      </div>

      {appointments.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <p className="text-body text-muted-foreground">لا توجد مواعيد</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-xl border border-border bg-card sm:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">التاريخ</th>
                  <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">الوقت</th>
                  <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">المريض</th>
                  <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">الطبيب</th>
                  <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">الخدمة</th>
                  <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {appointments.map((apt) => {
                  const status = STATUS_MAP[apt.status] || STATUS_MAP.SCHEDULED
                  return (
                    <tr key={apt.id} className="transition-colors hover:bg-accent/50">
                      <td className="px-4 py-3 text-sm">{apt.date.toLocaleDateString('ar-EG')}</td>
                      <td className="px-4 py-3 text-sm" dir="ltr">{apt.startTime}</td>
                      <td className="px-4 py-3 text-sm font-medium">{apt.patient.fullName}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{apt.doctor.fullName}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{apt.service?.name || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={cn('rounded-md px-2 py-0.5 text-xs font-medium', status.class)}>
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-2 sm:hidden">
            {appointments.map((apt) => {
              const status = STATUS_MAP[apt.status] || STATUS_MAP.SCHEDULED
              return (
                <div key={apt.id} className="rounded-xl border border-border bg-card p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium">{apt.patient.fullName}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {apt.doctor.fullName} {apt.service && `· ${apt.service.name}`}
                      </p>
                    </div>
                    <span className={cn('rounded-md px-2 py-0.5 text-xs font-medium', status.class)}>
                      {status.label}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground" dir="ltr">
                    {apt.date.toLocaleDateString('ar-EG')} · {apt.startTime}
                  </p>
                </div>
              )
            })}
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              {page > 1 && (
                <Link href={`/dashboard/appointments?page=${page - 1}${statusFilter ? `&status=${statusFilter}` : ''}`} className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-accent">السابق</Link>
              )}
              <span className="text-sm text-muted-foreground">{page} من {totalPages}</span>
              {page < totalPages && (
                <Link href={`/dashboard/appointments?page=${page + 1}${statusFilter ? `&status=${statusFilter}` : ''}`} className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-accent">التالي</Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
