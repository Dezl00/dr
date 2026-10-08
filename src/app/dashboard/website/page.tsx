import { prisma } from '@/lib/db/prisma'
import { requireAuth, getCurrentSession } from '@/lib/auth/dal'
import Link from 'next/link'
import { ExternalLink, Globe, LayoutTemplate, Link as LinkIcon } from 'lucide-react'
import { updateWebsiteSettings } from '@/actions/dashboard'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { SubmitButton } from '@/components/ui/submit-button'
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
  const protocol = rootDomain.includes('localhost') ? 'http' : 'https'
  const siteUrl = `${clinic?.slug}.${rootDomain.replace(/:\d+$/, '')}`

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">الموقع الإلكتروني</h1>
          <p className="text-sm text-slate-500 mt-1">إدارة محتوى وإعدادات موقع العيادة الخاص بك</p>
        </div>
        <Button variant="default" asChild className="rounded-xl px-6 bg-blue-600 hover:bg-blue-700 text-white">
          <a
            href={`${protocol}://${siteUrl}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            معاينة الموقع
            <ExternalLink className="h-4 w-4 ms-2" strokeWidth={1.5} />
          </a>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Settings Sidebar (Left/Right depending on RTL) */}
        <div className="space-y-6 lg:col-span-1">
          {/* Domain Settings */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-50 text-blue-600 p-2 rounded-xl">
                <Globe className="h-5 w-5" />
              </div>
              <h2 className="text-base font-semibold">إعدادات النشر والدومين</h2>
            </div>
            
            <form action={updateWebsiteSettings} className="space-y-5">
              <div className="space-y-3">
                <Label htmlFor="slug" className="text-sm font-medium text-slate-700">النطاق الفرعي (الصب دومين)</Label>
                <div className="flex items-center" dir="ltr">
                  <Input 
                    type="text" 
                    id="slug"
                    name="slug"
                    defaultValue={clinic?.slug || ''}
                    className="rounded-r-none border-r-0 focus-visible:ring-0 text-right bg-slate-50 h-10"
                    pattern="^[a-z0-9-]+$"
                    title="حروف إنجليزية صغيرة وأرقام وعلامة الناقص فقط"
                  />
                  <div className="px-3 h-10 flex items-center bg-slate-100 border border-slate-200 rounded-r-lg text-sm text-slate-500 whitespace-nowrap">
                    .{rootDomain.replace(/:\d+$/, '')}
                  </div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  هذا هو الرابط الذي سيصل من خلاله المرضى لموقعك. يجب أن يحتوي على حروف إنجليزية صغيرة وأرقام فقط.
                </p>
              </div>

              <div className="h-px bg-slate-100 my-4" />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="isPublished" className="text-sm font-medium text-slate-700">نشر الموقع</Label>
                  <p className="text-xs text-slate-500">جعل الموقع متاحاً للعامة</p>
                </div>
                <label className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200 transition-colors has-[:checked]:bg-blue-600 cursor-pointer">
                  <input 
                    type="checkbox" 
                    id="isPublished" 
                    name="isPublished" 
                    className="peer sr-only" 
                    defaultChecked={website?.isPublished} 
                  />
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform rtl:-translate-x-1 rtl:peer-checked:-translate-x-6" />
                </label>
              </div>

              <div className="pt-2">
                <SubmitButton className="w-full rounded-xl bg-slate-900 text-white hover:bg-slate-800">حفظ الإعدادات</SubmitButton>
              </div>
            </form>
          </div>
        </div>

        {/* Sections Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-indigo-50 text-indigo-600 p-2 rounded-xl">
                <LayoutTemplate className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold">أقسام الموقع</h2>
                <p className="text-sm text-slate-500 mt-1">قم بترتيب أقسام الموقع بالسحب والإفلات، أو فعل/عطل ما تريد.</p>
              </div>
            </div>

            <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100">
              {website?.sections ? (
                <WebsiteSectionsManager initialSections={website.sections} />
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-500 text-sm">لا توجد أقسام مضافة بعد.</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
      </div>
    </div>
  )
}
