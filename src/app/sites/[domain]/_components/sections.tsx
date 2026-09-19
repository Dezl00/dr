import { prisma } from '@/lib/db/prisma'
import Image from 'next/image'
import Link from 'next/link'
import { BookingForm } from './booking-form'
import { WebsiteSection } from '@prisma/client'

export async function HeroSection({ section, clinicId, domain }: { section: WebsiteSection, clinicId: string, domain: string }) {
  const content = section.content as any || {}
  return (
    <section id="hero" className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="rounded-none bg-[#FAFAFA] p-8 text-center md:p-16 border border-[#E5E7EB]">
          <h1 className="mb-6 text-4xl font-semibold text-[#000000] md:text-6xl leading-tight">
            {section.title || content.headline || 'مرحباً بكم في عيادتنا'}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-[#050505] font-normal">
            {content.subheadline || 'نحن نهتم بصحة أسنانك وابتسامتك باستخدام أحدث التقنيات الطبية المتقدمة.'}
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="#booking" className="rounded-none bg-[#000000] px-6 py-3 text-sm font-medium text-[#FFFFFF] transition-opacity hover:opacity-90">
              احجز موعدك الآن
            </Link>
            <Link href="#services" className="rounded-none bg-[#FFFFFF] px-6 py-3 text-sm font-medium text-[#000000] border border-[#E5E7EB] transition-opacity hover:bg-[#FAFAFA]">
              خدماتنا
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
    <section id="about" className="py-16 md:py-24 bg-[#FFFFFF] border-t border-[#E5E7EB]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-semibold text-[#000000] mb-6">{section.title || 'من نحن'}</h2>
            <div className="text-[#050505] font-normal space-y-4">
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
    <section id="services" className="py-16 md:py-24 bg-[#FAFAFA] border-t border-[#E5E7EB]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold text-[#000000]">{section.title || 'خدماتنا'}</h2>
          <p className="mt-4 text-[#050505] font-normal">نقدم مجموعة واسعة من خدمات طب الأسنان لتلبية احتياجاتكم</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(service => (
            <Link key={service.id} href={`/services/${service.slug || service.id}`} className="block group">
              <div className="bg-[#FFFFFF] rounded-none border border-[#E5E7EB] p-6 h-full transition-colors group-hover:border-[#000000]">
                {service.imageUrl && (
                  <div className="relative h-48 mb-4 rounded-none overflow-hidden border border-[#E5E7EB]">
                    <Image src={service.imageUrl} alt={service.name} fill className="object-cover" />
                  </div>
                )}
                <h3 className="text-xl font-medium text-[#000000] mb-2">{service.name}</h3>
                {service.description && (
                  <p className="text-[#050505] font-normal text-sm line-clamp-2">{service.description}</p>
                )}
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="font-medium text-[#000000]">{service.price ? `${service.price} ريال` : 'حسب الاستشارة'}</span>
                  <span className="text-[#000000] font-medium">قراءة المزيد &larr;</span>
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
    where: { clinicId, isActive: true }
  })

  return (
    <section id="doctors" className="py-16 md:py-24 bg-[#FFFFFF] border-t border-[#E5E7EB]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold text-[#000000]">{section.title || 'أطبائنا'}</h2>
          <p className="mt-4 text-[#050505] font-normal">نخبة من أفضل أطباء الأسنان في خدمتكم</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {doctors.map(doctor => (
            <div key={doctor.id} className="bg-[#FFFFFF] rounded-none border border-[#E5E7EB] p-6 text-center">
              <div className="relative w-32 h-32 mx-auto mb-4 rounded-none overflow-hidden border border-[#E5E7EB]">
                <div className="bg-[#FAFAFA] w-full h-full flex items-center justify-center text-2xl font-semibold text-[#050505]">
                  {doctor.fullName.charAt(0)}
                </div>
              </div>
              <h3 className="text-lg font-medium text-[#000000]">{doctor.fullName}</h3>
              <p className="text-[#050505] font-normal text-sm mt-1">{doctor.specialty || 'طبيب أسنان'}</p>
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
    <section id="gallery" className="py-16 md:py-24 bg-[#FAFAFA] border-t border-[#E5E7EB]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold text-[#000000]">{section.title || 'معرض الصور'}</h2>
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
    <section id="testimonials" className="py-16 md:py-24 bg-[#FFFFFF] border-t border-[#E5E7EB]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold text-[#000000]">{section.title || 'آراء العملاء'}</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t: any, i: number) => (
            <div key={i} className="bg-[#FAFAFA] rounded-none border border-[#E5E7EB] p-6">
              <p className="text-[#050505] font-normal mb-4">"{t.content}"</p>
              <div className="font-medium text-[#000000]">- {t.name}</div>
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
    <section id="faq" className="py-16 md:py-24 bg-[#FAFAFA] border-t border-[#E5E7EB]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold text-[#000000]">{section.title || 'الأسئلة الشائعة'}</h2>
        </div>
        <div className="space-y-4">
          {faqs.map((faq: any, i: number) => (
            <div key={i} className="bg-[#FFFFFF] rounded-none border border-[#E5E7EB] p-6">
              <h3 className="text-lg font-medium text-[#000000] mb-2">{faq.question}</h3>
              <p className="text-[#050505] font-normal">{faq.answer}</p>
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
    <section id="booking" className="py-16 md:py-24 bg-[#FFFFFF] border-t border-[#E5E7EB]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold text-[#000000]">{section.title || 'احجز موعدك'}</h2>
          <p className="mt-4 text-[#050505] font-normal">سجل بياناتك وسنقوم بتأكيد الموعد معك قريباً</p>
        </div>
        <div className="bg-[#FFFFFF] rounded-none border border-[#E5E7EB] p-6 md:p-8">
          <BookingForm domain={domain} services={services} doctors={doctors} />
        </div>
      </div>
    </section>
  )
}
