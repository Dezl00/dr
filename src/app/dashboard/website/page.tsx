import { prisma } from '@/lib/db/prisma'
import { requireAuth, getCurrentSession } from '@/lib/auth/dal'
import Link from 'next/link'
import { ExternalLink, Palette, LayoutList } from 'lucide-react'
import { updateWebsiteSettings } from '@/actions/dashboard'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import type { Metadata } from 'next'
import { WebsiteSectionsManager } from './components/WebsiteSectionsManager'

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

  return (
    <div className="space-y-6">
      <h1 className="text-page-title">الموقع الإلكتروني</h1>

      {/* Site URL */}
      <div className="rounded-xl border border-border bg-card p-4">
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

      <div className="max-w-xl">
        <form action={updateWebsiteSettings} className="space-y-4 bg-card border border-border p-6 rounded-xl">
          <h2 className="text-lg font-medium">إعدادات النشر</h2>
          
          <div className="flex items-center space-x-2 space-x-reverse">
            <input 
              type="checkbox" 
              id="isPublished" 
              name="isPublished" 
              defaultChecked={website?.isPublished} 
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="isPublished">نشر الموقع الإلكتروني (متاح للعامة)</Label>
          </div>
          
          <Button type="submit">حفظ التغييرات</Button>
        </form>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4 mt-8">أقسام الموقع</h2>
        <div className="max-w-3xl">
          {website?.sections ? (
            <WebsiteSectionsManager initialSections={website.sections} />
          ) : (
            <p className="text-muted-foreground text-sm">لا توجد أقسام مضافة بعد.</p>
          )}
        </div>
      </div>
    </div>
  )
}
