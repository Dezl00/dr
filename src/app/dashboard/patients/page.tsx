import { prisma } from '@/lib/db/prisma'
import { requireAuth, getCurrentSession } from '@/lib/auth/dal'
import Link from 'next/link'
import { Plus, Search } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'المرضى | DRS',
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

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>
}) {
  const clinicId = await getClinicId()
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page || '1'))
  const query = params.q || ''
  const perPage = 20

  const where = {
    clinicId,
    ...(query ? {
      OR: [
        { fullName: { contains: query, mode: 'insensitive' as const } },
        { phone: { contains: query } },
        { email: { contains: query, mode: 'insensitive' as const } },
      ],
    } : {}),
  }

  const [patients, total] = await Promise.all([
    prisma.patient.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: perPage,
      skip: (page - 1) * perPage,
    }),
    prisma.patient.count({ where }),
  ])

  const totalPages = Math.ceil(total / perPage)

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-page-title">المرضى</h1>
          <p className="mt-1 text-small text-muted-foreground">{total} مريض</p>
        </div>
        <Link
          href="/dashboard/patients/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" strokeWidth={1.5} />
          إضافة مريض
        </Link>
      </div>

      {/* Search */}
      <form className="mb-4">
        <div className="relative">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
          <input
            name="q"
            type="search"
            defaultValue={query}
            placeholder="بحث بالاسم أو الهاتف أو البريد..."
            className="w-full rounded-lg border border-border bg-background py-2 pe-3 ps-9 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:max-w-sm"
          />
        </div>
      </form>

      {/* Table (desktop) / Cards (mobile) */}
      {patients.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <p className="text-body text-muted-foreground">لا توجد نتائج</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-xl border border-border bg-card sm:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">الاسم</th>
                  <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">الهاتف</th>
                  <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">البريد</th>
                  <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">النوع</th>
                  <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">تاريخ التسجيل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {patients.map((patient) => (
                  <tr key={patient.id} className="transition-colors hover:bg-accent/50">
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/patients/${patient.id}`} className="text-sm font-medium hover:text-primary">
                        {patient.fullName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground" dir="ltr">{patient.phone || '—'}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground" dir="ltr">{patient.email || '—'}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{patient.gender === 'MALE' ? 'ذكر' : patient.gender === 'FEMALE' ? 'أنثى' : '—'}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{patient.createdAt.toLocaleDateString('ar-EG')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-2 sm:hidden">
            {patients.map((patient) => (
              <Link
                key={patient.id}
                href={`/dashboard/patients/${patient.id}`}
                className="block rounded-xl border border-border bg-card p-3 transition-colors hover:bg-accent/50"
              >
                <p className="text-sm font-medium">{patient.fullName}</p>
                <p className="mt-1 text-xs text-muted-foreground" dir="ltr">
                  {patient.phone || patient.email || '—'}
                </p>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              {page > 1 && (
                <Link
                  href={`/dashboard/patients?page=${page - 1}${query ? `&q=${query}` : ''}`}
                  className="rounded-lg border border-border px-3 py-1.5 text-sm transition-colors hover:bg-accent"
                >
                  السابق
                </Link>
              )}
              <span className="text-sm text-muted-foreground">
                {page} من {totalPages}
              </span>
              {page < totalPages && (
                <Link
                  href={`/dashboard/patients?page=${page + 1}${query ? `&q=${query}` : ''}`}
                  className="rounded-lg border border-border px-3 py-1.5 text-sm transition-colors hover:bg-accent"
                >
                  التالي
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
