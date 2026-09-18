import { cn } from '@/lib/utils'

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
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-section-title mb-4">مواعيد اليوم</h2>
        <p className="text-body text-muted-foreground py-8 text-center">
          لا توجد مواعيد اليوم
        </p>
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
