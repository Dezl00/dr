import { cn } from '@/lib/utils'
import Link from 'next/link'

interface Appointment {
  id: string
  startTime: string
  patient: { fullName: string }
  doctor: { fullName: string }
  service?: { name: string } | null
  status: string
}

interface TodaysAppointmentsProps {
  appointments: Appointment[]
  currentTime?: string // HH:mm format
}

const STATUS_MAP: Record<string, { label: string; class: string }> = {
  SCHEDULED: { label: 'مجدول', class: 'status-scheduled' },
  CONFIRMED: { label: 'مؤكد', class: 'status-confirmed' },
  COMPLETED: { label: 'مكتمل', class: 'status-completed' },
  CANCELLED: { label: 'ملغي', class: 'status-cancelled' },
  NO_SHOW: { label: 'لم يحضر', class: 'status-noshow' },
}

export function TodaysAppointments({ appointments, currentTime }: TodaysAppointmentsProps) {
  if (appointments.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-section-title mb-4">مواعيد اليوم</h2>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-blue-600 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-6">لا توجد مواعيد اليوم</h3>
          <Link href="/dashboard/appointments/new" className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-blue-700 hover:shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            إضافة موعد جديد
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h2 className="text-section-title mb-4">مواعيد اليوم</h2>
      <div className="space-y-2">
        {appointments.map((apt, idx) => {
          const statusInfo = STATUS_MAP[apt.status] || STATUS_MAP.SCHEDULED
          const isNext = currentTime && apt.startTime > currentTime && apt.status !== 'COMPLETED' && apt.status !== 'CANCELLED'
          const isPast = currentTime && apt.startTime < currentTime

          return (
            <div
              key={apt.id}
              className={cn(
                'flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors',
                isNext && idx === appointments.findIndex(a => a.startTime > (currentTime || '') && a.status !== 'COMPLETED' && a.status !== 'CANCELLED')
                  ? 'border-primary/30 bg-primary/5'
                  : 'border-transparent hover:bg-accent/50',
                isPast && apt.status !== 'COMPLETED' && 'opacity-60'
              )}
            >
              {/* Time */}
              <div className="w-12 shrink-0 text-center">
                <span className="text-sm font-medium" dir="ltr">{apt.startTime}</span>
              </div>

              {/* Divider */}
              <div className="h-8 w-px bg-border" />

              {/* Details */}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{apt.patient.fullName}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {apt.doctor.fullName}
                  {apt.service && ` · ${apt.service.name}`}
                </p>
              </div>

              {/* Status badge */}
              <span className={cn('shrink-0 rounded-md px-2 py-0.5 text-xs font-medium', statusInfo.class)}>
                {statusInfo.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
