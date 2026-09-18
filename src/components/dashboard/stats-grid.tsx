import { Calendar, Activity, CheckCircle2, Clock } from 'lucide-react'
import { StatsCard } from './stats-card'

interface StatsGridProps {
  todayAppointments: number
  activeCases: number
  completedAppointments: number
  upcomingAppointments: number
  todayChange?: string
  todayChangePositive?: boolean
}

export function StatsGrid({
  todayAppointments,
  activeCases,
  completedAppointments,
  upcomingAppointments,
  todayChange,
  todayChangePositive,
}: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="مواعيد اليوم"
        value={todayAppointments}
        change={
          todayChange
            ? { value: todayChange, positive: todayChangePositive ?? true }
            : undefined
        }
        icon={Calendar}
      />
      <StatsCard
        title="الحالات النشطة"
        value={activeCases}
        icon={Activity}
      />
      <StatsCard
        title="المواعيد المكتملة"
        value={completedAppointments}
        icon={CheckCircle2}
      />
      <StatsCard
        title="المواعيد القادمة"
        value={upcomingAppointments}
        icon={Clock}
      />
    </div>
  )
}
