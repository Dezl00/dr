import { notFound } from 'next/navigation'
import { resolveTenant } from '@/lib/tenant/resolver'
import { prisma } from '@/lib/db/prisma'
import type { Metadata } from 'next'

interface TenantLayoutProps {
  children: React.ReactNode
  params: Promise<{ domain: string }>
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string }>
}): Promise<Metadata> {
  const { domain } = await params
  const tenant = await resolveTenant(domain)

  if (!tenant) return { title: 'Not Found' }

  const website = await prisma.website.findUnique({
    where: { clinicId: tenant.clinicId },
    include: { settings: true },
  })

  return {
    title: website?.settings?.metaTitle || tenant.clinicName,
    description: website?.settings?.metaDescription || `${tenant.clinicName} - عيادة أسنان`,
    openGraph: {
      title: website?.settings?.metaTitle || tenant.clinicName,
      description: website?.settings?.metaDescription || `${tenant.clinicName} - عيادة أسنان`,
      ...(website?.settings?.ogImageUrl ? { images: [website.settings.ogImageUrl] } : {}),
    },
  }
}

export default async function TenantLayout({ children, params }: TenantLayoutProps) {
  const { domain } = await params
  const tenant = await resolveTenant(domain)

  if (!tenant) {
    notFound()
  }

  // Load clinic settings for branding
  const clinicSettings = await prisma.clinicSettings.findUnique({
    where: { clinicId: tenant.clinicId },
    include: { font: { include: { weights: true } } },
  })

  // Generate dynamic CSS variables from clinic branding
  const primaryColor = clinicSettings?.primaryColor || '#2563EB'
  const secondaryColor = clinicSettings?.secondaryColor || '#1E40AF'
  const accentColor = clinicSettings?.accentColor || '#3B82F6'
  const fontFamily = clinicSettings?.font?.family || "'Rubik', system-ui, sans-serif"

  // Generate @font-face declarations for clinic font
  const fontFaces = clinicSettings?.font?.weights
    ?.map(
      (w) => `
    @font-face {
      font-family: '${clinicSettings.font!.name}';
      font-style: normal;
      font-weight: ${w.weight};
      font-display: swap;
      src: url('${w.fileUrl}') format('${w.format}');
    }
  `
    )
    .join('\n') || ''

  return (
    <html lang="ar" dir="rtl">
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              ${fontFaces}
              :root {
                --clinic-primary: ${primaryColor};
                --clinic-secondary: ${secondaryColor};
                --clinic-accent: ${accentColor};
                --clinic-font: ${fontFamily};
              }
              body {
                font-family: var(--clinic-font);
              }
            `,
          }}
        />
      </head>
      <body className="bg-white text-gray-900 antialiased">
        {children}
      </body>
    </html>
  )
}
