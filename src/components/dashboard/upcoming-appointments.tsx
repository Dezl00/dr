interface UpcomingAppointment {
  id: string
  date: string
  startTime: string
  relativeTime: string // e.g., "بعد 20 دقيقة", "غدًا 10:30"
  patient: { fullName: string }
  doctor: { fullName: string }
  service?: { name: string } | null
}

interface UpcomingAppointmentsProps {
  appointments: UpcomingAppointment[]
}

export function UpcomingAppointments({ appointments }: UpcomingAppointmentsProps) {
  if (appointments.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-section-title mb-4">المواعيد القادمة</h2>
        <p className="text-body text-muted-foreground py-4 text-center">
          لا توجد مواعيد قادمة
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h2 className="text-section-title mb-4">المواعيد القادمة</h2>
      <div className="space-y-3">
        {appointments.map((apt) => (
          <div key={apt.id} className="flex items-start gap-3">
            <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-primary font-medium">{apt.relativeTime}</p>
              <p className="text-sm font-medium truncate">{apt.patient.fullName}</p>
              <p className="text-xs text-muted-foreground truncate">
                {apt.doctor.fullName}
                {apt.service && ` · ${apt.service.name}`}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
