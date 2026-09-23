import { notFound } from 'next/navigation'
import { resolveTenant } from '@/lib/tenant/resolver'
import { prisma } from '@/lib/db/prisma'
import {
  HeroSection,
  AboutSection,
  ServicesSection,
  DoctorsSection,
  GallerySection,
  TestimonialsSection,
  FaqSection,
  BookingSection,
  ContactSection,
  WhyChooseUsSection
} from './_components/sections'
import { SiteHeader } from './_components/SiteHeader'
import { SiteFooter } from './_components/SiteFooter'

export default async function TenantPage({
  params,
}: {
  params: Promise<{ domain: string }>
}) {
  const { domain } = await params
  const tenant = await resolveTenant(domain)

  if (!tenant) {
    notFound()
  }

  const [website, settings] = await Promise.all([
    prisma.website.findUnique({
      where: { clinicId: tenant.clinicId },
      include: {
        sections: {
          where: { isEnabled: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    }),
    prisma.clinicSettings.findUnique({
      where: { clinicId: tenant.clinicId },
    })
  ])

  if (!website || !website.isPublished) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center bg-[#FAFAFA]">
        <h1 className="text-3xl font-semibold text-[#000000]">
          الموقع قيد الإنشاء
        </h1>
        <p className="mt-4 text-[#050505] font-normal">
          {tenant.clinicName} تعمل على تجهيز موقعها الإلكتروني.
        </p>
      </div>
    )
  }

  // Fallback colors if not set
  const primaryColor = settings?.primaryColor || '#000000'
  const secondaryColor = settings?.secondaryColor || '#000000'
  const accentColor = settings?.accentColor || '#E5E7EB'

  return (
    <div 
      className="min-h-screen bg-[#FFFFFF]" 
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
        sections={website.sections}
        primaryColor={primaryColor}
      />

      <main>
        {website.sections.map((section) => {
          switch (section.type) {
            case 'HERO':
              return <HeroSection key={section.id} section={section} clinicId={tenant.clinicId} domain={domain} />
            case 'ABOUT':
              return <AboutSection key={section.id} section={section} />
            case 'SERVICES':
              return <ServicesSection key={section.id} section={section} clinicId={tenant.clinicId} domain={domain} />
            case 'DOCTORS':
              return <DoctorsSection key={section.id} section={section} clinicId={tenant.clinicId} />
            case 'GALLERY':
              return <GallerySection key={section.id} section={section} />
            case 'TESTIMONIALS':
              return <TestimonialsSection key={section.id} section={section} />
            case 'FAQ':
              return <FaqSection key={section.id} section={section} />
            case 'BOOKING':
              return <BookingSection key={section.id} section={section} clinicId={tenant.clinicId} domain={domain} />
            case 'CONTACT':
              return <ContactSection key={section.id} section={section} />
            case 'WHY_CHOOSE_US':
              return <WhyChooseUsSection key={section.id} section={section} />
            default:
              return null
          }
        })}
      </main>

      <SiteFooter clinicName={tenant.clinicName} />
    </div>
  )
}
