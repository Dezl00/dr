import { notFound } from 'next/navigation'
import { resolveTenant } from '@/lib/tenant/resolver'
import { prisma } from '@/lib/db/prisma'
import Image from 'next/image'
import Link from 'next/link'
import { SiteHeader } from '../../_components/SiteHeader'
import { SiteFooter } from '../../_components/SiteFooter'

export default async function ServicePage({
  params,
}: {
  params: Promise<{ domain: string; slug: string }>
}) {
  const { domain, slug } = await params
  const tenant = await resolveTenant(domain)

  if (!tenant) {
    notFound()
  }

  // Load settings for colors
  const settings = await prisma.clinicSettings.findUnique({
    where: { clinicId: tenant.clinicId },
  })

  // Load website sections for header navigation
  const website = await prisma.website.findUnique({
    where: { clinicId: tenant.clinicId },
    include: {
      sections: {
        where: { isEnabled: true },
        orderBy: { sortOrder: 'asc' },
      },
    },
  })

  // Find service by slug or id (fallback)
  const service = await prisma.service.findFirst({
    where: {
      clinicId: tenant.clinicId,
      OR: [
        { slug: slug },
        { id: slug }
      ],
      isActive: true
    },
    include: {
      doctors: {
        include: {
          doctor: true
        }
      }
    }
  })

  if (!service) {
    notFound()
  }

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
        sections={website?.sections}
        primaryColor={primaryColor}
      />

      <main className="py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <Link href="/" className="inline-flex items-center text-sm font-medium hover:opacity-70 mb-8" style={{ color: 'var(--clinic-primary)' }}>
            &rarr; العودة للصفحة الرئيسية
          </Link>
          
          <div className="bg-[#FFFFFF] rounded-none border border-[#E5E7EB] overflow-hidden">
            {service.imageUrl && (
              <div className="relative h-64 md:h-96 w-full bg-[#FAFAFA] border-b border-[#E5E7EB]">
                <Image 
                  src={service.imageUrl} 
                  alt={service.name} 
                  fill 
                  className="object-cover" 
                />
              </div>
            )}
            
            <div className="p-8 md:p-12">
              <h1 className="text-3xl md:text-4xl font-semibold mb-4" style={{ color: 'var(--clinic-primary)' }}>{service.name}</h1>
              
              <div className="flex flex-wrap gap-4 mb-8">
                {service.price && (
                  <div className="inline-flex items-center rounded-none bg-[#FAFAFA] px-3 py-1 text-sm font-medium text-[#000000] border border-[#E5E7EB]">
                    السعر: {service.price.toString()} ج.م
                  </div>
                )}
                {service.duration && (
                  <div className="inline-flex items-center rounded-none bg-[#FAFAFA] px-3 py-1 text-sm font-medium text-[#000000] border border-[#E5E7EB]">
                    المدة: {service.duration} دقيقة
                  </div>
                )}
              </div>

              {service.description && (
                <div className="prose prose-gray max-w-none mb-8 text-[#050505] font-normal">
                  <p className="text-lg leading-relaxed">{service.description}</p>
                </div>
              )}

              {service.content && (
                <div className="prose prose-gray max-w-none mb-12 text-[#050505] font-normal border-t border-[#E5E7EB] pt-8" dangerouslySetInnerHTML={{ __html: service.content }} />
              )}

              {service.doctors && service.doctors.length > 0 && (
                <div className="mb-12 border-t border-[#E5E7EB] pt-8">
                  <h3 className="text-xl font-semibold mb-6" style={{ color: 'var(--clinic-primary)' }}>الأطباء المتخصصون في هذه الخدمة</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {service.doctors.map(ds => (
                      <div key={ds.doctor.id} className="flex items-center gap-4 p-4 rounded-none border border-[#E5E7EB] bg-[#FAFAFA]">
                        <div className="w-12 h-12 bg-[#FFFFFF] rounded-none flex items-center justify-center overflow-hidden border border-[#E5E7EB]">
                          {ds.doctor.imageUrl ? (
                            <Image src={ds.doctor.imageUrl} alt={ds.doctor.fullName} width={48} height={48} className="object-cover w-full h-full" />
                          ) : (
                            <span className="font-semibold text-[#050505]">{ds.doctor.fullName.charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-[#000000]">{ds.doctor.fullName}</div>
                          <div className="text-sm" style={{ color: 'var(--clinic-secondary)' }}>{ds.doctor.specialty || 'طبيب أسنان'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-[#E5E7EB] pt-8 text-center">
                <Link
                  href="/#booking"
                  className="inline-flex rounded-none px-8 py-4 text-base font-medium text-[#FFFFFF] transition-opacity hover:opacity-90"
                  style={{ backgroundColor: 'var(--clinic-primary)' }}
                >
                  احجز موعدك الآن لهذه الخدمة
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter clinicName={tenant.clinicName} />
    </div>
  )
}
