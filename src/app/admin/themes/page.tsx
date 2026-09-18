import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'إدارة القوالب | إدارة المنصة',
}

export default function ThemesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-page-title">إدارة القوالب</h1>
      <p className="text-muted-foreground text-body">قريباً...</p>
    </div>
  )
}
