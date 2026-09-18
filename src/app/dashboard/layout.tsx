import { requireAuth, getCurrentSession } from '@/lib/auth/dal'
import { prisma } from '@/lib/db/prisma'
import { redirect } from 'next/navigation'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { ThemeProvider } from '@/components/shared/theme-provider'
import { getUserPermissions } from '@/lib/permissions/service'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'لوحة التحكم | DRS',
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireAuth()
  const { session } = await getCurrentSession()

  // Find user's clinic membership
  const membership = await prisma.clinicMembership.findFirst({
    where: {
      userId: user.id,
      status: 'ACTIVE',
    },
    include: {
      clinic: {
        select: {
          id: true,
          name: true,
          slug: true,
          status: true,
          timezone: true,
        },
      },
      role: {
        select: {
          name: true,
          nameAr: true,
        },
      },
    },
  })

  // Check for admin tenant access
  let clinicId: string | null = null
  let clinicName = ''
  let clinicSlug = ''
  let clinicTimezone = 'Africa/Cairo'
  let isAdminAccess = false
  let roleName = ''

  if (
    user.isAdmin &&
    session?.adminAccessClinicId &&
    session?.adminAccessExpiresAt &&
    new Date() < session.adminAccessExpiresAt
  ) {
    // Admin accessing a clinic
    const clinic = await prisma.clinic.findUnique({
      where: { id: session.adminAccessClinicId },
      select: { id: true, name: true, slug: true, status: true, timezone: true },
    })
    if (clinic) {
      clinicId = clinic.id
      clinicName = clinic.name
      clinicSlug = clinic.slug
      clinicTimezone = clinic.timezone
      isAdminAccess = true
      roleName = 'مدير المنصة'
    }
  } else if (membership) {
    clinicId = membership.clinic.id
    clinicName = membership.clinic.name
    clinicSlug = membership.clinic.slug
    clinicTimezone = membership.clinic.timezone
    roleName = membership.role.nameAr
  }

  if (!clinicId) {
    redirect('/onboarding')
  }

  // Get user permissions for this clinic
  const permissions = await getUserPermissions(user.id, clinicId)

  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <DashboardShell
            user={{
              id: user.id,
              fullName: user.fullName,
              email: user.email,
              avatarUrl: user.avatarUrl,
              isAdmin: user.isAdmin,
            }}
            clinic={{
              id: clinicId,
              name: clinicName,
              slug: clinicSlug,
              timezone: clinicTimezone,
            }}
            permissions={permissions}
            isAdminAccess={isAdminAccess}
            roleName={roleName}
          >
            {children}
          </DashboardShell>
        </ThemeProvider>
      </body>
    </html>
  )
}
