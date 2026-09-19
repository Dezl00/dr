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
import Link from 'next/link'

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
      <header className="sticky top-0 z-50 border-b border-[#E5E7EB] bg-[#FFFFFF]/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="text-xl font-bold" style={{ color: 'var(--clinic-primary)' }}>
            {tenant.clinicName}
          </Link>
          <nav className="hidden space-x-6 space-x-reverse md:flex">
            {website.sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.type.toLowerCase()}`}
                className="text-sm font-medium text-[#050505] hover:opacity-70 transition-opacity"
              >
                {section.title}
              </a>
            ))}
          </nav>
          <a
            href={`#booking`}
            className="rounded-none px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90 text-[#FFFFFF]"
            style={{ backgroundColor: 'var(--clinic-primary)' }}
          >
            احجز موعدك
          </a>
        </div>
      </header>

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

      <footer className="border-t border-[#E5E7EB] bg-[#FAFAFA] py-12">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
          <p className="text-sm text-[#050505] font-normal">
            © {new Date().getFullYear()} {tenant.clinicName}. جميع الحقوق محفوظة.
          </p>
          <p className="mt-2 text-xs font-normal opacity-50 text-[#050505]">
            مشغل بواسطة منصة DRS
          </p>
        </div>
      </footer>
    </div>
  )
}
