import { prisma } from '@/lib/db/prisma'
import { cn } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'سجل المراجعة | إدارة المنصة',
}

export default async function AuditLogsPage() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      actor: { select: { fullName: true, email: true } },
      clinic: { select: { name: true } },
    },
  })

  return (
    <div>
      <h1 className="text-page-title mb-6">سجل المراجعة</h1>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">الوقت</th>
              <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">المستخدم</th>
              <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">الإجراء</th>
              <th className="hidden px-4 py-3 text-start text-xs font-medium text-muted-foreground sm:table-cell">العيادة</th>
              <th className="hidden px-4 py-3 text-start text-xs font-medium text-muted-foreground md:table-cell">IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {logs.map((log) => (
              <tr key={log.id} className="transition-colors hover:bg-accent/50">
                <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                  {log.createdAt.toLocaleString('ar-EG')}
                </td>
                <td className="px-4 py-3 text-sm">{log.actor?.fullName || 'النظام'}</td>
                <td className="px-4 py-3">
                  <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium">
                    {log.action}
                  </span>
                </td>
                <td className="hidden px-4 py-3 text-sm text-muted-foreground sm:table-cell">
                  {log.clinic?.name || '—'}
                </td>
                <td className="hidden px-4 py-3 text-xs text-muted-foreground md:table-cell" dir="ltr">
                  {log.ipAddress || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
