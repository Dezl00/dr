import { prisma } from '@/lib/db/prisma'
import { requireAuth, getCurrentSession } from '@/lib/auth/dal'
import Link from 'next/link'
import { ExternalLink, Palette, LayoutList } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'الموقع الإلكتروني | DRS',
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

export default async function WebsitePage() {
  const clinicId = await getClinicId()

  const [website, domains, clinic] = await Promise.all([
    prisma.website.findUnique({
      where: { clinicId },
      include: {
        theme: { select: { name: true, nameAr: true } },
        sections: { orderBy: { sortOrder: 'asc' } },
      },
    }),
    prisma.domain.findMany({
      where: { clinicId, status: 'ACTIVE' },
    }),
    prisma.clinic.findUnique({
      where: { id: clinicId },
      select: { slug: true },
    }),
  ])

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000'
  const siteUrl = `${clinic?.slug}.${rootDomain.replace(/:\d+$/, '')}`
  const enabledSections = website?.sections.filter(s => s.isEnabled).length || 0
  const totalSections = website?.sections.length || 0

  return (
    <div>
      <h1 className="text-page-title mb-6">الموقع الإلكتروني</h1>

      {/* Site URL */}
      <div className="mb-6 rounded-xl border border-border bg-card p-4">
        <p className="text-small text-muted-foreground mb-1">عنوان الموقع</p>
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium" dir="ltr">{siteUrl}</p>
          <a
            href={`http://${siteUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary"
          >
            <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.5} />
          </a>
        </div>
        {domains.filter(d => d.type === 'CUSTOM_DOMAIN').map(d => (
          <p key={d.id} className="mt-1 text-xs text-muted-foreground" dir="ltr">{d.domain}</p>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Link
          href="/dashboard/website/sections"
          className="rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent/50"
        >
          <LayoutList className="mb-2 h-5 w-5 text-primary" strokeWidth={1.5} />
          <p className="text-sm font-medium">أقسام الموقع</p>
          <p className="text-xs text-muted-foreground">{enabledSections} من {totalSections} قسم مفعل</p>
        </Link>

        <Link
          href="/dashboard/website/branding"
          className="rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent/50"
        >
          <Palette className="mb-2 h-5 w-5 text-primary" strokeWidth={1.5} />
          <p className="text-sm font-medium">العلامة التجارية</p>
          <p className="text-xs text-muted-foreground">الشعار والألوان والخطوط</p>
        </Link>

        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm font-medium mb-1">القالب</p>
          <p className="text-xs text-muted-foreground">
            {website?.theme?.nameAr || 'القالب الافتراضي'}
          </p>
          <p className="mt-2">
            <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${website?.isPublished ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'}`}>
              {website?.isPublished ? 'منشور' : 'مسودة'}
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}
