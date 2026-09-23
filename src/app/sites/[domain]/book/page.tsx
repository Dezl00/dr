import { notFound } from 'next/navigation'
import { resolveTenant } from '@/lib/tenant/resolver'
import { prisma } from '@/lib/db/prisma'
import { BookingForm } from '../_components/booking-form'
import { SiteHeader } from '../_components/SiteHeader'
import { SiteFooter } from '../_components/SiteFooter'

export default async function BookingPage({
  params,
}: {
  params: Promise<{ domain: string }>
}) {
  const { domain } = await params
  const tenant = await resolveTenant(domain)

  if (!tenant) {
    notFound()
  }

  const [services, doctors, settings, website] = await Promise.all([
    prisma.service.findMany({ where: { clinicId: tenant.clinicId, isActive: true } }),
    prisma.doctor.findMany({ where: { clinicId: tenant.clinicId, isActive: true } }),
    prisma.clinicSettings.findUnique({ where: { clinicId: tenant.clinicId } }),
    prisma.website.findUnique({
      where: { clinicId: tenant.clinicId },
      include: {
        sections: {
          where: { isEnabled: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    }),
  ])

  const primaryColor = settings?.primaryColor || '#000000'
  const secondaryColor = settings?.secondaryColor || '#000000'
  const accentColor = settings?.accentColor || '#E5E7EB'

  return (
    <div 
      className="min-h-screen bg-[#FAFAFA] flex flex-col" 
      dir="rtl" 
      lang="ar"
      style={{
        '--clinic-primary': primaryColor,
        '--clinic-secondary': secondaryColor,
        '--clinic-accent': accentColor,
      } as React.CSSProperties}
    >
      <SiteHeader 
        clinicName={tenant.clinicName} 
        sections={website?.sections}
        primaryColor={primaryColor}
      />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6">
        <div className="w-full max-w-2xl bg-[#FFFFFF] rounded-none border border-[#E5E7EB] p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold mb-2" style={{ color: 'var(--clinic-primary)' }}>احجز موعدك</h1>
            <p className="text-[#050505] font-normal">سجل بياناتك وسنقوم بتأكيد الموعد معك قريباً</p>
          </div>
          <BookingForm domain={domain} services={services} doctors={doctors} />
        </div>
      </main>

      <SiteFooter clinicName={tenant.clinicName} />
    </div>
  )
}
