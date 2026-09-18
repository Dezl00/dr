import { ThemeProvider } from '@/components/shared/theme-provider'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <div className="w-full max-w-md">
              {children}
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
