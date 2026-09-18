import { requireAdmin } from '@/lib/auth/dal'
import { AdminShell } from '@/components/admin/admin-shell'
import { ThemeProvider } from '@/components/shared/theme-provider'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'لوحة إدارة المنصة | DRS',
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireAdmin()

  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AdminShell
            user={{
              id: user.id,
              fullName: user.fullName,
              email: user.email,
            }}
          >
            {children}
          </AdminShell>
        </ThemeProvider>
      </body>
    </html>
  )
}
