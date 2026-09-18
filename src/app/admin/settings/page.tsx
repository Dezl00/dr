import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'إعدادات المنصة | إدارة المنصة',
}

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-page-title">إعدادات المنصة</h1>
      <p className="text-muted-foreground text-body">قريباً...</p>
    </div>
  )
}
