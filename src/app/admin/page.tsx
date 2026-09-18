import { prisma } from '@/lib/db/prisma'
import { Building2, Users, CreditCard, Globe } from 'lucide-react'
import { StatsCard } from '@/components/dashboard/stats-card'

export default async function AdminOverviewPage() {
  const [clinicsCount, usersCount, activeSubscriptions, domainsCount] = await Promise.all([
    prisma.clinic.count({ where: { status: 'ACTIVE' } }),
    prisma.user.count({ where: { status: 'ACTIVE' } }),
    prisma.subscription.count({ where: { status: 'ACTIVE' } }),
    prisma.domain.count({ where: { status: 'ACTIVE' } }),
  ])

  const recentAuditLogs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: {
      actor: { select: { fullName: true, email: true } },
      clinic: { select: { name: true } },
    },
  })

  return (
    <div className="space-y-6">
      <h1 className="text-page-title">نظرة عامة</h1>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="العيادات" value={clinicsCount} icon={Building2} />
        <StatsCard title="المستخدمون" value={usersCount} icon={Users} />
        <StatsCard title="الاشتراكات النشطة" value={activeSubscriptions} icon={CreditCard} />
        <StatsCard title="النطاقات" value={domainsCount} icon={Globe} />
      </div>

      {/* Recent audit logs */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-section-title mb-4">آخر الأحداث</h2>
        {recentAuditLogs.length === 0 ? (
          <p className="text-body text-muted-foreground py-4 text-center">لا توجد أحداث</p>
        ) : (
          <div className="space-y-2">
            {recentAuditLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 rounded-lg px-3 py-2 text-sm">
                <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <div className="min-w-0 flex-1">
                  <p>
                    <span className="font-medium">{log.actor?.fullName || 'النظام'}</span>
                    {' • '}
                    <span className="text-muted-foreground">{log.action}</span>
                    {log.clinic && (
                      <span className="text-muted-foreground"> • {log.clinic.name}</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {log.createdAt.toLocaleString('ar-EG')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
