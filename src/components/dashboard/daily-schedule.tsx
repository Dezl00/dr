'use client'

import { cn } from '@/lib/utils'

interface TimeSlot {
  time: string // "09:00"
  appointments: {
    id: string
    startTime: string
    endTime?: string | null
    patient: { fullName: string }
    doctor: { fullName: string }
    service?: { name: string } | null
    status: string
  }[]
}

interface DailyScheduleProps {
  slots: TimeSlot[]
  startHour?: number // Default 8
  endHour?: number   // Default 18
}

const STATUS_COLORS: Record<string, string> = {
  SCHEDULED: 'border-s-blue-500',
  CONFIRMED: 'border-s-emerald-500',
  COMPLETED: 'border-s-slate-400',
  CANCELLED: 'border-s-red-400',
  NO_SHOW: 'border-s-amber-500',
}

export function DailySchedule({ slots, startHour = 8, endHour = 18 }: DailyScheduleProps) {
  // Generate time slots from startHour to endHour
  const hours: string[] = []
  for (let h = startHour; h <= endHour; h++) {
    hours.push(`${String(h).padStart(2, '0')}:00`)
    hours.push(`${String(h).padStart(2, '0')}:30`)
  }

  // Map appointments to time slots
  const slotMap = new Map<string, TimeSlot['appointments']>()
  for (const slot of slots) {
    for (const apt of slot.appointments) {
      const key = apt.startTime.substring(0, 5) // "09:00"
      const existing = slotMap.get(key) || []
      existing.push(apt)
      slotMap.set(key, existing)
    }
  }

  const now = new Date()
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h2 className="text-section-title mb-4">الجدول الزمني</h2>
      <div className="relative space-y-0">
        {hours.map((time) => {
          const apts = slotMap.get(time) || []
          const isCurrentSlot = currentTime >= time && currentTime < (hours[hours.indexOf(time) + 1] || '23:59')
          const isHalfHour = time.endsWith(':30')

          return (
            <div
              key={time}
              className={cn(
                'flex items-stretch gap-3',
                isHalfHour ? 'min-h-[2rem]' : 'min-h-[2.5rem]'
              )}
            >
              {/* Time label */}
              <div className={cn(
                'w-12 shrink-0 pt-0.5 text-end',
                isHalfHour ? 'text-[10px] text-muted-foreground/50' : 'text-xs text-muted-foreground'
              )}>
                <span dir="ltr">{isHalfHour ? '' : time}</span>
              </div>

              {/* Timeline line */}
              <div className="relative flex w-px flex-col items-center">
                <div className={cn(
                  'h-full w-px',
                  isCurrentSlot ? 'bg-primary' : 'bg-border'
                )} />
                {!isHalfHour && (
                  <div className={cn(
                    'absolute top-0.5 h-1.5 w-1.5 rounded-full',
                    isCurrentSlot ? 'bg-primary' : 'bg-border'
                  )} />
                )}
              </div>

              {/* Appointments */}
              <div className="flex-1 pb-1">
                {apts.map((apt) => (
                  <div
                    key={apt.id}
                    className={cn(
                      'rounded-md border border-border border-s-2 bg-card px-2.5 py-1.5 text-sm',
                      STATUS_COLORS[apt.status] || STATUS_COLORS.SCHEDULED
                    )}
                  >
                    <p className="font-medium text-sm">{apt.patient.fullName}</p>
                    <p className="text-xs text-muted-foreground">
                      {apt.doctor.fullName}
                      {apt.service && ` · ${apt.service.name}`}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
