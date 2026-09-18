import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DRS - Dental SaaS Platform',
  description: 'منصة إدارة عيادات الأسنان',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
