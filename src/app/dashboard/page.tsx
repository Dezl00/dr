import { Suspense } from 'react'
import { prisma } from '@/lib/db/prisma'
import { requireAuth, getCurrentSession } from '@/lib/auth/dal'
import { StatsGrid } from '@/components/dashboard/stats-grid'
import { TodaysAppointments } from '@/components/dashboard/todays-appointments'
import { UpcomingAppointments } from '@/components/dashboard/upcoming-appointments'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { StatsSkeleton, AppointmentsSkeleton, ChartSkeleton } from '@/components/dashboard/dashboard-skeleton'

async function getClinicId(): Promise<string> {
  const user = await requireAuth()
  const { session } = await getCurrentSession()

  // Check admin access
  if (
    user.isAdmin &&
    session?.adminAccessClinicId &&
    session?.adminAccessExpiresAt &&
    new Date() < session.adminAccessExpiresAt
  ) {
    return session.adminAccessClinicId
  }

  const membership = await prisma.clinicMembership.findFirst({
    where: { userId: user.id, status: 'ACTIVE' },
    select: { clinicId: true },
  })

  return membership?.clinicId || ''
}

async function DashboardStats({ clinicId }: { clinicId: string }) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const [todayCount, activePatients, completedCount, upcomingCount] = await Promise.all([
    prisma.appointment.count({
      where: { clinicId, date: { gte: today, lt: tomorrow } },
    }),
    prisma.patient.count({
      where: { clinicId },
    }),
    prisma.appointment.count({
      where: { clinicId, status: 'COMPLETED', date: { gte: today, lt: tomorrow } },
    }),
    prisma.appointment.count({
      where: {
        clinicId,
        status: { in: ['SCHEDULED', 'CONFIRMED'] },
        date: { gte: today },
      },
    }),
  ])

  return (
    <StatsGrid
      todayAppointments={todayCount}
      activeCases={activePatients}
      completedAppointments={completedCount}
      upcomingAppointments={upcomingCount}
    />
  )
}

async function TodaysAppointmentsList({ clinicId }: { clinicId: string }) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const appointments = await prisma.appointment.findMany({
    where: {
      clinicId,
      date: { gte: today, lt: tomorrow },
    },
    include: {
      patient: { select: { fullName: true } },
      doctor: { select: { fullName: true } },
      service: { select: { name: true } },
    },
    orderBy: { startTime: 'asc' },
  })

  const now = new Date()
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  return (
    <TodaysAppointments
      appointments={appointments}
      currentTime={currentTime}
    />
  )
}

async function UpcomingList({ clinicId }: { clinicId: string }) {
  const now = new Date()

  const appointments = await prisma.appointment.findMany({
    where: {
      clinicId,
      status: { in: ['SCHEDULED', 'CONFIRMED'] },
      date: { gte: now },
    },
    include: {
      patient: { select: { fullName: true } },
      doctor: { select: { fullName: true } },
      service: { select: { name: true } },
    },
    orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    take: 5,
  })

  // Simple relative time calculation
  const withRelativeTime = appointments.map((apt) => {
    const aptDate = new Date(apt.date)
    const isToday = aptDate.toDateString() === now.toDateString()
    const isTomorrow =
      aptDate.toDateString() ===
      new Date(now.getTime() + 86400000).toDateString()

    let relativeTime = ''
    if (isToday) {
      const [h, m] = apt.startTime.split(':').map(Number)
      const diff = (h * 60 + m) - (now.getHours() * 60 + now.getMinutes())
      if (diff <= 0) relativeTime = 'الآن'
      else if (diff < 60) relativeTime = `بعد ${diff} دقيقة`
      else relativeTime = `بعد ${Math.floor(diff / 60)} ساعة`
    } else if (isTomorrow) {
      relativeTime = `غدًا ${apt.startTime}`
    } else {
      relativeTime = aptDate.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'short' }) + ` ${apt.startTime}`
    }

    return {
      ...apt,
      date: apt.date.toISOString(),
      relativeTime,
    }
  })

  return <UpcomingAppointments appointments={withRelativeTime} />
}

export default async function DashboardPage() {
  const clinicId = await getClinicId()

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <Suspense fallback={<StatsSkeleton />}>
        <DashboardStats clinicId={clinicId} />
      </Suspense>

      {/* Today's operations */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Suspense fallback={<AppointmentsSkeleton />}>
            <TodaysAppointmentsList clinicId={clinicId} />
          </Suspense>
        </div>
        <div>
          <Suspense fallback={<AppointmentsSkeleton />}>
            <UpcomingList clinicId={clinicId} />
          </Suspense>
        </div>
      </div>

      {/* Analytics placeholder - will be lazy loaded */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Suspense fallback={<ChartSkeleton />}>
          <div className="rounded-xl border border-border bg-card p-4">
            <h2 className="text-section-title mb-4">المواعيد خلال آخر 7 أيام</h2>
            <p className="text-body text-muted-foreground py-12 text-center">
              سيتم تحميل الرسم البياني...
            </p>
          </div>
        </Suspense>
        <Suspense fallback={<ChartSkeleton />}>
          <div className="rounded-xl border border-border bg-card p-4">
            <h2 className="text-section-title mb-4">حالة المواعيد</h2>
            <p className="text-body text-muted-foreground py-12 text-center">
              سيتم تحميل الرسم البياني...
            </p>
          </div>
        </Suspense>
      </div>

      {/* Recent activity */}
      <RecentActivity activities={[]} />
    </div>
  )
}
