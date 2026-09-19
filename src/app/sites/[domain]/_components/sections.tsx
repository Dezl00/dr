import { prisma } from '@/lib/db/prisma'
import Image from 'next/image'
import Link from 'next/link'
import { BookingForm } from './booking-form'
import { WebsiteSection } from '@prisma/client'

export async function HeroSection({ section, clinicId, domain }: { section: WebsiteSection, clinicId: string, domain: string }) {
  const content = section.content as any || {}
  return (
    <section id="hero" className="py-16 md:py-24 bg-[#FAFAFA]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="rounded-none p-8 text-center md:p-16 border border-[#E5E7EB] bg-[#FFFFFF]">
          <h1 className="mb-6 text-4xl font-semibold md:text-6xl leading-tight" style={{ color: 'var(--clinic-primary)' }}>
            {content.title || section.title || 'مرحباً بكم في عيادتنا'}
          </h1>
          <p className="mx-auto max-w-2xl text-lg font-normal text-[#050505]">
            {content.subtitle || 'نحن نهتم بصحة أسنانك وابتسامتك باستخدام أحدث التقنيات الطبية المتقدمة.'}
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link 
              href={content.button1Link || '#booking'} 
              className="rounded-none px-6 py-3 text-sm font-medium transition-opacity hover:opacity-90 text-[#FFFFFF]"
              style={{ backgroundColor: 'var(--clinic-primary)' }}
            >
              {content.button1Text || 'احجز موعدك الآن'}
            </Link>
            <Link 
              href={content.button2Link || '#services'} 
              className="rounded-none px-6 py-3 text-sm font-medium border transition-opacity hover:opacity-80 bg-[#FFFFFF]"
              style={{ color: 'var(--clinic-primary)', borderColor: 'var(--clinic-primary)' }}
            >
              {content.button2Text || 'خدماتنا'}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export async function AboutSection({ section }: { section: WebsiteSection }) {
  const content = section.content as any || {}
  return (
    <section id="about" className="py-16 md:py-24 border-t border-[#E5E7EB] bg-[#FFFFFF]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-semibold mb-6" style={{ color: 'var(--clinic-primary)' }}>{section.title || 'من نحن'}</h2>
            <div className="font-normal space-y-4 text-[#050505]">
              <p>{content.description || 'نحن نقدم أفضل خدمات العناية بالأسنان بوجود طاقم طبي متخصص وخبرة طويلة في هذا المجال.'}</p>
            </div>
          </div>
          {content.imageUrl && (
            <div className="relative h-64 md:h-96 rounded-none overflow-hidden border border-[#E5E7EB]">
              <Image src={content.imageUrl} alt="About Clinic" fill className="object-cover" />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export async function ServicesSection({ section, clinicId, domain }: { section: WebsiteSection, clinicId: string, domain: string }) {
  const services = await prisma.service.findMany({
    where: { clinicId, showOnWebsite: true, isActive: true },
    orderBy: { sortOrder: 'asc' }
  })

  return (
    <section id="services" className="py-16 md:py-24 border-t border-[#E5E7EB] bg-[#FAFAFA]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold" style={{ color: 'var(--clinic-primary)' }}>{section.title || 'خدماتنا'}</h2>
          <p className="mt-4 font-normal text-[#050505]">نقدم مجموعة واسعة من خدمات طب الأسنان لتلبية احتياجاتكم</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(service => (
            <Link key={service.id} href={`/services/${service.slug || service.id}`} className="block group">
              <div className="rounded-none border border-[#E5E7EB] bg-[#FFFFFF] p-6 h-full transition-colors group-hover:border-[var(--clinic-primary)]">
                {service.imageUrl && (
                  <div className="relative h-48 mb-4 rounded-none overflow-hidden border border-[#E5E7EB]">
                    <Image src={service.imageUrl} alt={service.name} fill className="object-cover" />
                  </div>
                )}
                <h3 className="text-xl font-medium mb-2 text-[#050505] group-hover:text-[var(--clinic-primary)] transition-colors">{service.name}</h3>
                {service.description && (
                  <p className="font-normal text-sm line-clamp-2 text-[#050505]/70">{service.description}</p>
                )}
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="font-medium text-[#050505]">{service.price ? `${service.price} ج.م` : 'حسب الاستشارة'}</span>
                  <span className="font-medium" style={{ color: 'var(--clinic-primary)' }}>قراءة المزيد &larr;</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export async function DoctorsSection({ section, clinicId }: { section: WebsiteSection, clinicId: string }) {
  const doctors = await prisma.doctor.findMany({
    where: { clinicId, isActive: true, showOnWebsite: true },
    orderBy: { sortOrder: 'asc' },
  })

  return (
    <section id="doctors" className="py-16 md:py-24 border-t border-[#E5E7EB] bg-[#FFFFFF]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold" style={{ color: 'var(--clinic-primary)' }}>{section.title || 'أطبائنا'}</h2>
          <p className="mt-4 font-normal text-[#050505]">نخبة من أفضل أطباء الأسنان في خدمتكم</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {doctors.map(doctor => (
            <div key={doctor.id} className="rounded-none border border-[#E5E7EB] bg-[#FAFAFA] p-6 text-center">
              <div className="relative w-32 h-32 mx-auto mb-4 rounded-none overflow-hidden border border-[#E5E7EB]">
                {doctor.imageUrl ? (
                  <Image src={doctor.imageUrl} alt={doctor.fullName} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl font-semibold bg-[#E5E7EB] text-[#050505]">
                    {doctor.fullName.charAt(0)}
                  </div>
                )}
              </div>
              <h3 className="text-lg font-medium text-[#050505]">{doctor.fullName}</h3>
              <p className="font-normal text-sm mt-1" style={{ color: 'var(--clinic-primary)' }}>{doctor.specialty || 'طبيب أسنان'}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export async function GallerySection({ section }: { section: WebsiteSection }) {
  const content = section.content as any || {}
  const images: string[] = content.images || []

  if (images.length === 0) return null

  return (
    <section id="gallery" className="py-16 md:py-24 border-t border-[#E5E7EB] bg-[#FAFAFA]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold" style={{ color: 'var(--clinic-primary)' }}>{section.title || 'معرض الصور'}</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img, i) => (
            <div key={i} className="relative aspect-square rounded-none overflow-hidden border border-[#E5E7EB]">
              <Image src={img} alt={`Gallery image ${i + 1}`} fill className="object-cover" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export async function TestimonialsSection({ section }: { section: WebsiteSection }) {
  const content = section.content as any || {}
  const testimonials = content.testimonials || []

  if (testimonials.length === 0) return null

  return (
    <section id="testimonials" className="py-16 md:py-24 border-t border-[#E5E7EB] bg-[#FFFFFF]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold" style={{ color: 'var(--clinic-primary)' }}>{section.title || 'آراء العملاء'}</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t: any, i: number) => (
            <div key={i} className="rounded-none border border-[#E5E7EB] bg-[#FAFAFA] p-6">
              <p className="font-normal mb-4 text-[#050505]">"{t.text || t.content}"</p>
              <div className="font-medium" style={{ color: 'var(--clinic-primary)' }}>- {t.name}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export async function FaqSection({ section }: { section: WebsiteSection }) {
  const content = section.content as any || {}
  const faqs = content.faqs || []

  if (faqs.length === 0) return null

  return (
    <section id="faq" className="py-16 md:py-24 border-t border-[#E5E7EB] bg-[#FAFAFA]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold" style={{ color: 'var(--clinic-primary)' }}>{section.title || 'الأسئلة الشائعة'}</h2>
        </div>
        <div className="space-y-4">
          {faqs.map((faq: any, i: number) => (
            <div key={i} className="rounded-none border border-[#E5E7EB] bg-[#FFFFFF] p-6">
              <h3 className="text-lg font-medium mb-2 text-[#050505]">{faq.question}</h3>
              <p className="font-normal text-[#050505]/80">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export async function BookingSection({ section, clinicId, domain }: { section: WebsiteSection, clinicId: string, domain: string }) {
  const services = await prisma.service.findMany({ where: { clinicId, isActive: true } })
  const doctors = await prisma.doctor.findMany({ where: { clinicId, isActive: true } })

  return (
    <section id="booking" className="py-16 md:py-24 border-t border-[#E5E7EB] bg-[#FFFFFF]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold" style={{ color: 'var(--clinic-primary)' }}>{section.title || 'احجز موعدك'}</h2>
          <p className="mt-4 font-normal text-[#050505]">سجل بياناتك وسنقوم بتأكيد الموعد معك قريباً</p>
        </div>
        <div className="rounded-none border border-[#E5E7EB] bg-[#FAFAFA] p-6 md:p-8">
          <BookingForm domain={domain} services={services} doctors={doctors} />
        </div>
      </div>
    </section>
  )
}

export async function ContactSection({ section }: { section: WebsiteSection }) {
  const content = section.content as any || {}
  return (
    <section id="contact" className="py-16 md:py-24 border-t border-[#E5E7EB] bg-[#FAFAFA]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
        <h2 className="text-3xl font-semibold mb-6" style={{ color: 'var(--clinic-primary)' }}>{section.title || 'اتصل بنا'}</h2>
        <p className="font-normal text-lg text-[#050505]">{content.welcomeMessage || 'يسعدنا تواصلكم معنا للرد على استفساراتكم.'}</p>
      </div>
    </section>
  )
}

export async function WhyChooseUsSection({ section }: { section: WebsiteSection }) {
  const content = section.content as any || {}
  return (
    <section id="why-choose-us" className="py-16 md:py-24 border-t border-[#E5E7EB] bg-[#FFFFFF]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
        <h2 className="text-3xl font-semibold mb-6" style={{ color: 'var(--clinic-primary)' }}>{section.title || 'لماذا تختارنا'}</h2>
        <p className="font-normal text-lg text-[#050505]">{content.description || 'نحن نقدم رعاية صحية متميزة بفضل أحدث التقنيات.'}</p>
      </div>
    </section>
  )
}
