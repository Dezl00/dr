import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DRS - Dental SaaS Platform',
  description: 'منصة إدارة عيادات الأسنان',
  manifest: '/manifest.json',
}

import { Cairo } from 'next/font/google'
import NextTopLoader from 'nextjs-toploader'

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
        <NextTopLoader
          color="#000"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #000,0 0 5px #000"
        />
        {children}
      </body>
    </html>
  )
}
