'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Users,
  Calendar,
  Stethoscope,
  ListChecks,
  UsersRound,
  Globe,
  Settings,
  Menu,
  X,
  LogOut,
  ChevronLeft,
  Bell,
  Shield,
} from 'lucide-react'
import { logoutAction } from '@/actions/auth'
import { ClinicCtx, type ClinicContext } from '@/lib/tenant/context'

interface DashboardShellProps {
  children: React.ReactNode
  user: {
    id: string
    fullName: string
    email: string
    avatarUrl: string | null
    isAdmin: boolean
  }
  clinic: {
    id: string
    name: string
    slug: string
    timezone: string
  }
  permissions: string[]
  isAdminAccess: boolean
  roleName: string
}

const NAV_ITEMS = [
  { href: '/dashboard', label: 'الرئيسية', icon: Home, permission: null },
  { href: '/dashboard/patients', label: 'المرضى', icon: Users, permission: 'patients.view' },
  { href: '/dashboard/appointments', label: 'المواعيد', icon: Calendar, permission: 'appointments.view' },
  { href: '/dashboard/doctors', label: 'الأطباء', icon: Stethoscope, permission: 'doctors.view' },
  { href: '/dashboard/services', label: 'الخدمات', icon: ListChecks, permission: 'services.view' },
  { href: '/dashboard/team', label: 'الفريق والمستخدمون', icon: UsersRound, permission: 'users.view' },
  { href: '/dashboard/website', label: 'الموقع الإلكتروني', icon: Globe, permission: 'website.view' },
  { href: '/dashboard/settings', label: 'الإعدادات', icon: Settings, permission: 'settings.view' },
]

export function DashboardShell({
  children,
  user,
  clinic,
  permissions,
  isAdminAccess,
  roleName,
}: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  const filteredNav = NAV_ITEMS.filter(
    (item) => item.permission === null || permissions.includes(item.permission) || isAdminAccess
  )

  const clinicContext: ClinicContext = {
    clinicId: clinic.id,
    clinicName: clinic.name,
    clinicSlug: clinic.slug,
    timezone: clinic.timezone,
    permissions,
    isAdminAccess,
  }

  return (
    <ClinicCtx.Provider value={clinicContext}>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
          } fixed inset-y-0 end-0 z-50 flex w-64 flex-col border-s border-border bg-background transition-transform duration-200 lg:static lg:z-auto`}
        >
          {/* Sidebar header */}
          <div className="flex h-14 items-center justify-between border-b border-border px-4">
            <span className="text-sm font-semibold truncate">{clinic.name}</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded p-1 text-muted-foreground transition-colors duration-150 hover:bg-accent lg:hidden"
              aria-label="إغلاق القائمة"
            >
              <X className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto py-3">
            <ul className="space-y-1 px-2">
              {filteredNav.map((item) => {
                const isActive =
                  item.href === '/dashboard'
                    ? pathname === '/dashboard'
                    : pathname.startsWith(item.href)
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150 ${
                        isActive
                          ? 'bg-accent/50 text-primary'
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute inset-y-1 end-0 w-[3px] rounded-s-md bg-primary" />
                      )}
                      <item.icon className="h-4.5 w-4.5 shrink-0" strokeWidth={1.5} />
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* User section */}
          <div className="border-t border-border p-4">
            <div className="mb-2 flex items-center gap-3 rounded-lg border border-border p-3 transition-colors duration-150 hover:border-primary/50">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent text-sm font-medium text-foreground">
                {user.fullName.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{user.fullName}</p>
                <p className="truncate text-xs text-muted-foreground">{roleName}</p>
              </div>
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-foreground"
              >
                <LogOut className="h-4 w-4" strokeWidth={1.5} />
                تسجيل الخروج
              </button>
            </form>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Admin access banner */}
          {isAdminAccess && (
            <div className="flex items-center justify-between border-b border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-200">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" strokeWidth={1.5} />
                <span>
                  أنت تعمل الآن داخل <span className="font-semibold">{clinic.name}</span> بصلاحيات مدير المنصة.
                </span>
              </div>
              <Link
                href="/admin/clinics"
                className="rounded-md border border-amber-300 px-3 py-1 text-xs font-medium transition-colors duration-150 hover:bg-amber-100 dark:border-amber-800 dark:hover:bg-amber-900"
              >
                الخروج من العيادة
              </Link>
            </div>
          )}

          {/* Header */}
          <header className="flex h-14 items-center justify-between border-b border-border bg-background px-4 lg:px-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="rounded p-1.5 text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-foreground lg:hidden"
                aria-label="فتح القائمة"
              >
                <Menu className="h-5 w-5" strokeWidth={1.5} />
              </button>
              <h1 className="text-sm font-semibold lg:text-base">{clinic.name}</h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                className="relative rounded-lg p-2 text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-foreground"
                aria-label="الإشعارات"
              >
                <Bell className="h-4.5 w-4.5" strokeWidth={1.5} />
              </button>

              {user.isAdmin && (
                <Link
                  href="/admin"
                  className="hidden rounded-lg p-2 text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-foreground sm:block"
                  aria-label="لوحة الإدارة"
                >
                  <Shield className="h-4.5 w-4.5" strokeWidth={1.5} />
                </Link>
              )}
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-7xl p-4 lg:p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ClinicCtx.Provider>
  )
}
