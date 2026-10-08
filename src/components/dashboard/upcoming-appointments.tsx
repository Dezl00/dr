import { User, Calendar } from 'lucide-react'

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
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-section-title mb-4">المواعيد القادمة</h2>
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <Calendar className="h-10 w-10 text-slate-300 mb-3" strokeWidth={1.5} />
          <p className="text-sm font-medium text-slate-500">
            لا توجد مواعيد قادمة
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h2 className="text-section-title mb-4">المواعيد القادمة</h2>
      <div className="flex flex-col gap-3">
        {appointments.map((apt) => (
          <div key={apt.id} className="group flex items-start gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <User className="h-5 w-5" strokeWidth={1.5} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold text-slate-900 truncate">{apt.patient.fullName}</p>
                <span className="shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-600 text-white shadow-sm">
                  {apt.relativeTime}
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate">
                د. {apt.doctor.fullName}
                {apt.service && <span className="mr-1 text-slate-400">· {apt.service.name}</span>}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
