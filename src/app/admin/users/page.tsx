import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'إدارة المستخدمين | إدارة المنصة',
}

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-page-title">إدارة المستخدمين</h1>
      <p className="text-muted-foreground text-body">قريباً...</p>
    </div>
  )
}
