import { notFound } from 'next/navigation'
import { resolveTenant } from '@/lib/tenant/resolver'
import { prisma } from '@/lib/db/prisma'
import Link from 'next/link'
import { BookingForm } from '../_components/booking-form'

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

  const services = await prisma.service.findMany({ where: { clinicId: tenant.clinicId, isActive: true } })
  const doctors = await prisma.doctor.findMany({ where: { clinicId: tenant.clinicId, isActive: true } })

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col" dir="rtl" lang="ar">
      <header className="sticky top-0 z-50 border-b border-[#E5E7EB] bg-[#FFFFFF]">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 w-full">
          <Link href="/" className="text-xl font-semibold text-[#000000]">
            {tenant.clinicName}
          </Link>
          <Link
            href={`/`}
            className="text-sm font-medium text-[#050505] hover:text-[#000000]"
          >
            العودة للرئيسية
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6">
        <div className="w-full max-w-2xl bg-[#FFFFFF] rounded-none border border-[#E5E7EB] p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold text-[#000000] mb-2">احجز موعدك</h1>
            <p className="text-[#050505] font-normal">سجل بياناتك وسنقوم بتأكيد الموعد معك قريباً</p>
          </div>
          <BookingForm domain={domain} services={services} doctors={doctors} />
        </div>
      </main>
    </div>
  )
}
