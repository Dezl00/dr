import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DRS - Dental SaaS Platform',
  description: 'منصة إدارة عيادات الأسنان',
  manifest: '/manifest.json',
}

import { Cairo } from 'next/font/google'

const cairo = Cairo({
  subsets: ['arabic'],
  variable: '--font-cairo',
  display: 'swap',
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
