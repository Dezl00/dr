import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  change?: {
    value: string
    positive: boolean
  }
  icon: LucideIcon
  className?: string
}

export function StatsCard({ title, value, change, icon: Icon, className }: StatsCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card p-4',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-small text-muted-foreground">{title}</p>
          <p className="mt-1 text-stat">{value}</p>
          {change && (
            <p
              className={cn(
                'mt-1 text-xs',
                change.positive
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-600 dark:text-red-400'
              )}
            >
              {change.positive ? '↑' : '↓'} {change.value}
            </p>
          )}
        </div>
        <div className="rounded-lg bg-primary/5 p-2">
          <Icon className="h-4 w-4 text-primary" strokeWidth={1.5} />
        </div>
      </div>
    </div>
  )
}
