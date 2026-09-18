import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'إدارة الخطط | إدارة المنصة',
}

export default function PlansPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-page-title">إدارة الخطط</h1>
      <p className="text-muted-foreground text-body">قريباً...</p>
    </div>
  )
}
