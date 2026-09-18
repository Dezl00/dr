import { notFound } from 'next/navigation'
import { resolveTenant } from '@/lib/tenant/resolver'
import { prisma } from '@/lib/db/prisma'

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

  const website = await prisma.website.findUnique({
    where: { clinicId: tenant.clinicId },
    include: {
      sections: {
        where: { isEnabled: true },
        orderBy: { sortOrder: 'asc' },
      },
    },
  })

  if (!website || !website.isPublished) {
    // If unpublished, only show to admins/owners of the clinic
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
        <h1 className="text-3xl font-bold text-[var(--clinic-primary)]">
          الموقع قيد الإنشاء
        </h1>
        <p className="mt-4 text-muted-foreground">
          {tenant.clinicName} تعمل على تجهيز موقعها الإلكتروني.
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Dynamic Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="text-xl font-bold text-[var(--clinic-primary)]">
            {tenant.clinicName}
          </div>
          <nav className="hidden space-x-6 space-x-reverse md:flex">
            {website.sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.type.toLowerCase()}`}
                className="text-sm font-medium hover:text-[var(--clinic-primary)]"
              >
                {section.title}
              </a>
            ))}
          </nav>
          <a
            href={`#booking`}
            className="rounded-lg bg-[var(--clinic-primary)] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            احجز موعدك
          </a>
        </div>
      </header>

      {/* Dynamic Sections */}
      <main>
        {website.sections.map((section) => (
          <section
            key={section.id}
            id={section.type.toLowerCase()}
            className="border-b border-border py-16 last:border-0 md:py-24"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
              <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold text-[var(--clinic-primary)]">
                  {section.title}
                </h2>
                {section.content && (
                  <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                    {typeof section.content === 'string' ? section.content : JSON.stringify(section.content)}
                  </p>
                )}
              </div>
              
              {/* Specialized rendering based on section type */}
              {section.type === 'HERO' && (
                <div className="rounded-2xl bg-[var(--clinic-primary)]/5 p-8 text-center md:p-16">
                  <h1 className="mb-6 text-4xl font-extrabold text-[var(--clinic-primary)] md:text-6xl">
                    مرحباً بكم في {tenant.clinicName}
                  </h1>
                  <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                    نحن نهتم بصحة أسنانك وابتسامتك باستخدام أحدث التقنيات الطبية المتقدمة.
                  </p>
                </div>
              )}
            </div>
          </section>
        ))}
      </main>

      {/* Dynamic Footer */}
      <footer className="border-t border-border bg-card py-12">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {tenant.clinicName}. جميع الحقوق محفوظة.
          </p>
          <p className="mt-2 text-xs text-muted-foreground opacity-50">
            مشغل بواسطة منصة DRS
          </p>
        </div>
      </footer>
    </div>
  )
}
