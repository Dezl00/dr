import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DRS - Dental SaaS Platform',
  description: 'منصة إدارة عيادات الأسنان',
  manifest: '/manifest.json',
}

import { IBM_Plex_Sans_Arabic } from 'next/font/google'

const ibmPlex = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['100', '200', '300', '400', '500', '600', '700'],
  variable: '--font-ibm-plex',
  display: 'swap',
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${ibmPlex.variable} font-sans bg-background text-foreground antialiased`}>
        {children}
      </body>
    </html>
  )
}
