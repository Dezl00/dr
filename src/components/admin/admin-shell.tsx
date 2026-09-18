'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  Globe,
  Palette,
  Type,
  ScrollText,
  Settings,
  Menu,
  X,
  LogOut,
  Layers,
  Shield,
} from 'lucide-react'
import { logoutAction } from '@/actions/auth'

interface AdminShellProps {
  children: React.ReactNode
  user: {
    id: string
    fullName: string
    email: string
  }
}

const NAV_ITEMS = [
  { href: '/admin', label: 'نظرة عامة', icon: LayoutDashboard },
  { href: '/admin/clinics', label: 'العيادات', icon: Building2 },
  { href: '/admin/users', label: 'المستخدمون', icon: Users },
  { href: '/admin/plans', label: 'الخطط', icon: Layers },
  { href: '/admin/subscriptions', label: 'الاشتراكات', icon: CreditCard },
  { href: '/admin/domains', label: 'النطاقات', icon: Globe },
  { href: '/admin/themes', label: 'القوالب', icon: Palette },
  { href: '/admin/fonts', label: 'الخطوط', icon: Type },
  { href: '/admin/audit-logs', label: 'سجل المراجعة', icon: ScrollText },
  { href: '/admin/settings', label: 'الإعدادات', icon: Settings },
]

export function AdminShell({ children, user }: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={`${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        } fixed inset-y-0 end-0 z-50 flex w-64 flex-col border-s border-border bg-background transition-transform duration-200 lg:static lg:z-auto`}
      >
        <div className="flex h-14 items-center justify-between border-b border-border px-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" strokeWidth={1.5} />
            <span className="text-sm font-semibold">إدارة المنصة</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="p-1 lg:hidden" aria-label="إغلاق">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === '/admin'
                  ? pathname === '/admin'
                  : pathname.startsWith(item.href)
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    }`}
                  >
                    <item.icon className="h-4.5 w-4.5 shrink-0" strokeWidth={1.5} />
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="border-t border-border p-3">
          <Link
            href="/dashboard"
            className="mb-2 flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Building2 className="h-4 w-4" strokeWidth={1.5} />
            لوحة العيادة
          </Link>
          <div className="flex items-center gap-3 rounded-lg px-3 py-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
              {user.fullName.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user.fullName}</p>
              <p className="truncate text-xs text-muted-foreground">مدير المنصة</p>
            </div>
          </div>
          <form action={logoutAction}>
            <button type="submit" className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground">
              <LogOut className="h-4 w-4" strokeWidth={1.5} />
              تسجيل الخروج
            </button>
          </form>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center justify-between border-b border-border px-4 lg:px-6">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 lg:hidden" aria-label="فتح القائمة">
            <Menu className="h-5 w-5" strokeWidth={1.5} />
          </button>
          <div />
        </header>
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl p-4 lg:p-6">{children}</div>
        </main>
      </div>
    </div>
  )
}
