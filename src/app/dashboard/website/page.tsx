import { prisma } from '@/lib/db/prisma'
import { requireAuth, getCurrentSession } from '@/lib/auth/dal'
import Link from 'next/link'
import { ExternalLink, Palette, LayoutList } from 'lucide-react'
import { updateWebsiteSettings } from '@/actions/dashboard'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">الموقع الإلكتروني</h1>
        <Button variant="outline" asChild className="rounded-xl border border-border">
          <a
            href={`http://${siteUrl}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            معاينة الموقع
            <ExternalLink className="h-4 w-4 ms-2" strokeWidth={1.5} />
          </a>
        </Button>
      </div>

      {/* Site URL */}
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-sm text-muted-foreground mb-1">عنوان الموقع</p>
        <div className="flex items-center gap-2">
          <p className="text-base font-medium" dir="ltr">{siteUrl}</p>
        </div>
        {domains.filter(d => d.type === 'CUSTOM_DOMAIN').map(d => (
          <p key={d.id} className="mt-1 text-sm text-muted-foreground" dir="ltr">{d.domain}</p>
        ))}
      </div>

      <div className="max-w-xl">
        <form action={updateWebsiteSettings} className="space-y-6 bg-card border border-border p-6 rounded-xl">
          <h2 className="text-lg font-semibold">إعدادات النشر</h2>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="isPublished" className="text-base font-medium">نشر الموقع الإلكتروني</Label>
              <p className="text-sm text-muted-foreground">عند التفعيل، سيكون الموقع متاحاً للعامة</p>
            </div>
            {/* The Switch needs to submit a form, we can use a hidden input for the actual value or handle it if Switch has name prop. Switch typically supports name prop in Radix/shadcn */}
            <Switch 
              id="isPublished" 
              name="isPublished" 
              defaultChecked={website?.isPublished} 
              dir="ltr"
            />
          </div>
          
          <Button type="submit" className="rounded-xl">حفظ التغييرات</Button>
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
