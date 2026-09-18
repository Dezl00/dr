import { prisma } from '@/lib/db/prisma'
import { requireAuth, getCurrentSession } from '@/lib/auth/dal'
import Link from 'next/link'
import { Plus, UsersRound } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'الفريق | DRS',
}

async function getClinicId() {
  const user = await requireAuth()
  const { session } = await getCurrentSession()
  if (user.isAdmin && session?.adminAccessClinicId) return session.adminAccessClinicId
  const membership = await prisma.clinicMembership.findFirst({
    where: { userId: user.id, status: 'ACTIVE' },
    select: { clinicId: true },
  })
  return membership?.clinicId || ''
}

export default async function TeamPage() {
  const clinicId = await getClinicId()

  const members = await prisma.clinicMembership.findMany({
    where: { clinicId, status: 'ACTIVE' },
    include: {
      user: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
      role: { select: { name: true, nameAr: true } },
    },
    orderBy: { createdAt: 'asc' },
  })

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-page-title">الفريق والمستخدمون</h1>
          <p className="mt-1 text-small text-muted-foreground">{members.length} عضو</p>
        </div>
        <Link
          href="/dashboard/team/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" strokeWidth={1.5} />
          إضافة عضو
        </Link>
      </div>

      {members.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <UsersRound className="mx-auto mb-3 h-8 w-8 text-muted-foreground" strokeWidth={1} />
          <p className="text-body text-muted-foreground">لا يوجد أعضاء</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">العضو</th>
                <th className="hidden px-4 py-3 text-start text-xs font-medium text-muted-foreground sm:table-cell">البريد</th>
                <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">الدور</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {members.map((member) => (
                <tr key={member.id} className="transition-colors hover:bg-accent/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                        {member.user.fullName.charAt(0)}
                      </div>
                      <span className="text-sm font-medium">{member.user.fullName}</span>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-sm text-muted-foreground sm:table-cell" dir="ltr">
                    {member.user.email}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium">
                      {member.role.nameAr}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
