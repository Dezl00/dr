import { StatsSkeleton, AppointmentsSkeleton, ChartSkeleton } from '@/components/dashboard/dashboard-skeleton'

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <StatsSkeleton />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AppointmentsSkeleton />
        </div>
        <div>
          <AppointmentsSkeleton />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    </div>
  )
}
