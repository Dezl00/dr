import Link from 'next/link'
import { User, Lock, Building2 } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'الإعدادات | DRS',
}

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-page-title mb-6">الإعدادات</h1>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/dashboard/settings/profile"
          className="rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent/50"
        >
          <User className="mb-2 h-5 w-5 text-primary" strokeWidth={1.5} />
          <p className="text-sm font-medium">الملف الشخصي</p>
          <p className="text-xs text-muted-foreground">تعديل الاسم والبريد والصورة</p>
        </Link>

        <Link
          href="/dashboard/settings/security"
          className="rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent/50"
        >
          <Lock className="mb-2 h-5 w-5 text-primary" strokeWidth={1.5} />
          <p className="text-sm font-medium">الأمان</p>
          <p className="text-xs text-muted-foreground">كلمة المرور والجلسات</p>
        </Link>

        <Link
          href="/dashboard/settings/clinic"
          className="rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent/50"
        >
          <Building2 className="mb-2 h-5 w-5 text-primary" strokeWidth={1.5} />
          <p className="text-sm font-medium">إعدادات العيادة</p>
          <p className="text-xs text-muted-foreground">الاسم والعنوان والتواصل</p>
        </Link>
      </div>
    </div>
  )
}
