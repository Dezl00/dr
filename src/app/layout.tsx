import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DRS - Dental SaaS Platform',
  description: 'منصة إدارة عيادات الأسنان',
}

import { Cairo } from 'next/font/google'

const cairo = Cairo({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cairo',
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.variable} font-sans bg-background text-foreground antialiased`}>
        {children}
      </body>
    </html>
  )
}
