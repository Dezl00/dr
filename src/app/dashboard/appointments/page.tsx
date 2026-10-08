import { prisma } from '@/lib/db/prisma'
import { requireAuth, getCurrentSession } from '@/lib/auth/dal'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Metadata } from 'next'
import { ActionLink } from '@/components/ui/action-link'
import { AppointmentStatusSelect } from '@/components/dashboard/appointment-status-select'
import { AppointmentDetailsModal } from '@/components/dashboard/appointment-details-modal'


export const metadata: Metadata = {
  title: 'المواعيد | DRS',
}

const STATUS_MAP: Record<string, { label: string; class: string }> = {
  SCHEDULED: { label: 'مجدول', class: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-400' },
  CONFIRMED: { label: 'مؤكد', class: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-400' },
  COMPLETED: { label: 'مكتمل', class: 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400' },
  CANCELLED: { label: 'ملغي', class: 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400' },
  NO_SHOW: { label: 'لم يحضر', class: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-400' },
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
        patient: { select: { fullName: true, phone: true } },
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
          <h1 className="text-xl font-semibold">المواعيد</h1>
          <p className="mt-1 text-sm text-muted-foreground">{total} موعد</p>
        </div>
        <ActionLink
          href="/dashboard/appointments/new"
          icon={<Plus className="w-4 h-4" strokeWidth={1.5} />}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors duration-150 hover:bg-primary/90 disabled:opacity-50"
        >
          موعد جديد
        </ActionLink>
      </div>

      {/* Status filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        <Link prefetch={true}
          href="/dashboard/appointments"
          className={cn(
            'rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-200',
            !statusFilter
              ? 'border-blue-600 bg-blue-600 text-white'
              : 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          )}
        >
          الكل
        </Link>
        {Object.entries(STATUS_MAP).map(([key, { label }]) => (
          <Link prefetch={true}
            key={key}
            href={`/dashboard/appointments?status=${key}`}
            className={cn(
              'rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-200',
              statusFilter === key
                ? 'border-blue-600 bg-blue-600 text-white'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            )}
          >
            {label}
          </Link>
        ))}
      </div>

      {appointments.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <p className="text-base text-muted-foreground">لا توجد مواعيد</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-xl border border-border bg-card sm:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-5 py-3.5 text-start font-medium text-muted-foreground">التاريخ</th>
                  <th className="px-5 py-3.5 text-start font-medium text-muted-foreground">الوقت</th>
                  <th className="px-5 py-3.5 text-start font-medium text-muted-foreground">المريض</th>
                  <th className="px-5 py-3.5 text-start font-medium text-muted-foreground">الطبيب</th>
                  <th className="px-5 py-3.5 text-start font-medium text-muted-foreground">الخدمة</th>
                  <th className="px-5 py-3.5 text-start font-medium text-muted-foreground">الحالة</th>
                  <th className="px-5 py-3.5 text-start font-medium text-muted-foreground"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {appointments.map((apt) => {
                  const status = STATUS_MAP[apt.status] || STATUS_MAP.SCHEDULED
                  return (
                    <tr key={apt.id} className="transition-colors duration-150 hover:bg-accent/50">
                      <td className="px-5 py-3.5 text-foreground">{apt.date.toLocaleDateString('en-GB')}</td>
                      <td className="px-5 py-3.5 text-foreground font-medium" dir="ltr">{apt.startTime}</td>
                      <td className="px-5 py-3.5 font-medium text-foreground">{apt.patient.fullName}</td>
                      <td className="px-5 py-3.5 text-muted-foreground">{apt.doctor.fullName}</td>
                      <td className="px-5 py-3.5 text-muted-foreground">
                        {apt.service?.name ? (
                          <span className="inline-flex rounded-md bg-muted px-2 py-1 text-xs border border-border">
                            {apt.service.name}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-5 py-3.5">
                        <AppointmentStatusSelect appointmentId={apt.id} currentStatus={apt.status} />
                      </td>
                      <td className="px-5 py-3.5 text-end">
                        <AppointmentDetailsModal 
                          appointmentId={apt.id}
                          patientName={apt.patient.fullName}
                          patientPhone={apt.patient.phone}
                          doctorName={apt.doctor.fullName}
                          serviceName={apt.service?.name || 'استشارة'}
                          dateStr={apt.date.toLocaleDateString('en-GB')}
                          timeStr={apt.startTime}
                          notes={apt.notes}
                          statusLabel={status.label}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 sm:hidden">
            {appointments.map((apt) => {
              const status = STATUS_MAP[apt.status] || STATUS_MAP.SCHEDULED
              return (
                <div key={apt.id} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{apt.patient.fullName}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {apt.doctor.fullName} {apt.service && <span className="mx-1">•</span>} {apt.service?.name}
                      </p>
                    </div>
                    <AppointmentStatusSelect appointmentId={apt.id} currentStatus={apt.status} />
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <span>{apt.date.toLocaleDateString('en-GB')}</span>
                      <span className="font-medium text-foreground" dir="ltr">{apt.startTime}</span>
                    </p>
                    <AppointmentDetailsModal 
                      appointmentId={apt.id}
                      patientName={apt.patient.fullName}
                      patientPhone={apt.patient.phone}
                      doctorName={apt.doctor.fullName}
                      serviceName={apt.service?.name || 'استشارة'}
                      dateStr={apt.date.toLocaleDateString('en-GB')}
                      timeStr={apt.startTime}
                      notes={apt.notes}
                      statusLabel={status.label}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              {page > 1 && (
                <Link href={`/dashboard/appointments?page=${page - 1}${statusFilter ? `&status=${statusFilter}` : ''}`} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-foreground">السابق</Link>
              )}
              <span className="px-2 text-sm font-medium text-muted-foreground">{page} من {totalPages}</span>
              {page < totalPages && (
                <Link href={`/dashboard/appointments?page=${page + 1}${statusFilter ? `&status=${statusFilter}` : ''}`} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-foreground">التالي</Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
