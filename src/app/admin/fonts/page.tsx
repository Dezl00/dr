import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'إدارة الخطوط | إدارة المنصة',
}

export default function FontsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-page-title">إدارة الخطوط</h1>
      <p className="text-muted-foreground text-body">قريباً...</p>
    </div>
  )
}
