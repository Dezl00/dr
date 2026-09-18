import { cn } from '@/lib/utils'

interface Activity {
  id: string
  description: string
  time: string
  type: 'appointment' | 'patient' | 'general'
}

interface RecentActivityProps {
  activities: Activity[]
}

const TYPE_COLORS = {
  appointment: 'bg-blue-500',
  patient: 'bg-emerald-500',
  general: 'bg-slate-400',
}

export function RecentActivity({ activities }: RecentActivityProps) {
  if (activities.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-section-title mb-4">آخر النشاطات</h2>
        <p className="text-body text-muted-foreground py-4 text-center">
          لا توجد نشاطات حديثة
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h2 className="text-section-title mb-4">آخر النشاطات</h2>
      <div className="space-y-3">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3">
            <div className={cn('mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full', TYPE_COLORS[activity.type])} />
            <div className="min-w-0 flex-1">
              <p className="text-sm">{activity.description}</p>
              <p className="text-xs text-muted-foreground">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
