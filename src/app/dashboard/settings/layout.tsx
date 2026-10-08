'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, Lock, Building2, Bell } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const tabs = [
    { href: '/dashboard/settings/profile', label: 'الملف الشخصي', icon: User },
    { href: '/dashboard/settings/security', label: 'الأمان', icon: Lock },
    { href: '/dashboard/settings/clinic', label: 'إعدادات العيادة', icon: Building2 },
    { href: '/dashboard/settings/notifications', label: 'الإشعارات (SMS)', icon: Bell },
  ]

  return (
    <div className="flex flex-col md:flex-row gap-6 max-w-6xl mx-auto">
      {/* Sidebar / Tabs */}
      <aside className="w-full md:w-64 shrink-0">
        <h1 className="text-2xl font-semibold mb-6">الإعدادات</h1>
        <nav className="flex flex-col space-y-1">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href
            return (
              <Link prefetch={true}
                key={tab.href}
                href={tab.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200',
                  isActive
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/50'
                )}
              >
                <tab.icon className={cn('w-4.5 h-4.5', isActive ? 'text-blue-700 dark:text-blue-400' : 'text-slate-400')} strokeWidth={isActive ? 2 : 1.5} />
                {tab.label}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Content Area */}
      <main className="flex-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 min-h-[500px]">
        {children}
      </main>
    </div>
  )
}
