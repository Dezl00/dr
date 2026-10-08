import { prisma } from '@/lib/db/prisma'
import { AppointmentsOverviewChart, AppointmentStatusChart, NewPatientsChart } from '@/components/dashboard/charts'

export async function DashboardAnalytics({ clinicId }: { clinicId: string }) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // Last 7 days dates
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (6 - i))
    return d
  })

  const sevenDaysAgo = new Date(today)
  sevenDaysAgo.setDate(today.getDate() - 6)

  const [appointments, statuses, patients] = await Promise.all([
    // Fetch all appointments in the last 7 days
    prisma.appointment.findMany({
      where: {
        clinicId,
        date: { gte: sevenDaysAgo }
      },
      select: { date: true }
    }),
    // Status breakdown for upcoming/today
    prisma.appointment.groupBy({
      by: ['status'],
      where: { clinicId, date: { gte: today } },
      _count: { status: true }
    }),
    // Fetch all new patients in the last 7 days
    prisma.patient.findMany({
      where: {
        clinicId,
        createdAt: { gte: sevenDaysAgo }
      },
      select: { createdAt: true }
    })
  ])

  const appointmentsByDay = days.map((day) => {
    const nextDay = new Date(day)
    nextDay.setDate(nextDay.getDate() + 1)
    const count = appointments.filter(a => a.date >= day && a.date < nextDay).length
    return { day: day.toLocaleDateString('ar-EG-u-nu-latn', { weekday: 'short' }), count }
  })

  const newPatients = days.map((day) => {
    const nextDay = new Date(day)
    nextDay.setDate(nextDay.getDate() + 1)
    const count = patients.filter(p => p.createdAt >= day && p.createdAt < nextDay).length
    return { day: day.toLocaleDateString('ar-EG-u-nu-latn', { weekday: 'short' }), count }
  })

  // Mapping statuses
  const STATUS_MAP_AR: Record<string, string> = {
    SCHEDULED: 'مجدول',
    CONFIRMED: 'مؤكد',
    COMPLETED: 'مكتمل',
    CANCELLED: 'ملغي',
    NO_SHOW: 'لم يحضر',
  }
  
  const statusData = statuses.map(s => ({
    name: STATUS_MAP_AR[s.status] || s.status,
    value: s._count.status,
    color: '' // Handled by chart component colors
  }))
  
  // If no upcoming appointments, provide dummy state
  const finalStatusData = statusData.length > 0 ? statusData : [
    { name: 'مجدول', value: 0, color: '#e2e8f0' },
    { name: 'مؤكد', value: 0, color: '#e2e8f0' },
    { name: 'مكتمل', value: 0, color: '#e2e8f0' }
  ]

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <AppointmentsOverviewChart data={appointmentsByDay} />
      <AppointmentStatusChart data={finalStatusData} />
      <NewPatientsChart data={newPatients} />
    </div>
  )
}
