export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              <div className="h-3 w-20 animate-pulse rounded bg-muted" />
              <div className="h-7 w-12 animate-pulse rounded bg-muted" />
            </div>
            <div className="h-8 w-8 animate-pulse rounded-lg bg-muted" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function AppointmentsSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-4 h-5 w-28 animate-pulse rounded bg-muted" />
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg px-3 py-2.5">
            <div className="h-4 w-10 animate-pulse rounded bg-muted" />
            <div className="h-8 w-px bg-border" />
            <div className="flex-1 space-y-1">
              <div className="h-3.5 w-28 animate-pulse rounded bg-muted" />
              <div className="h-3 w-40 animate-pulse rounded bg-muted" />
            </div>
            <div className="h-5 w-12 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function ChartSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-4 h-5 w-36 animate-pulse rounded bg-muted" />
      <div className="h-48 w-full animate-pulse rounded bg-muted" />
    </div>
  )
}
