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
  { href: '/dashboard/patients', label: 'المرضى (EMR)', icon: Users, permission: 'patients.view' },
  { href: '/dashboard/appointments', label: 'المواعيد', icon: Calendar, permission: 'appointments.view' },
  { href: '/dashboard/doctors', label: 'الأطباء', icon: Stethoscope, permission: 'doctors.view' },
  { href: '/dashboard/financials', label: 'المالية', icon: ListChecks, permission: 'patients.view' }, // Temp permission until financials.view is seeded
  { href: '/dashboard/inventory', label: 'المخازن', icon: ListChecks, permission: 'patients.view' },
  { href: '/dashboard/crm', label: 'علاقات المرضى', icon: UsersRound, permission: 'patients.view' },
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
      <div className="flex h-screen overflow-hidden bg-white">
        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden transition-all"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
          } fixed inset-y-0 end-0 z-50 flex w-64 flex-col bg-blue-700 text-white transition-transform duration-300 ease-out lg:static lg:z-auto shadow-2xl lg:shadow-none`}
        >
          {/* Sidebar header */}
          <div className="flex h-14 items-center justify-between px-5 border-b border-blue-600/50">
            <span className="text-base font-semibold truncate text-white">{clinic.name}</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-full p-1.5 text-blue-100 transition-colors duration-150 hover:bg-blue-600 lg:hidden"
              aria-label="إغلاق القائمة"
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1.5 px-3">
              {filteredNav.map((item) => {
                const isActive =
                  item.href === '/dashboard'
                    ? pathname === '/dashboard'
                    : pathname.startsWith(item.href)

                return (
                  <li key={item.href}>
                    <Link prefetch={true}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-blue-100 hover:bg-blue-600/60 hover:text-white'
                      }`}
                    >
                      <item.icon className="h-4.5 w-4.5 shrink-0" strokeWidth={isActive ? 2 : 1.5} />
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* User section */}
          <div className="border-t border-blue-600/50 p-4">
            <div className="mb-3 flex items-center gap-3 rounded-lg p-2 transition-colors duration-200 hover:bg-blue-600/40">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white shadow-inner">
                {user.fullName.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{user.fullName}</p>
                <p className="truncate text-xs text-blue-200">{roleName}</p>
              </div>
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-blue-100 transition-all duration-200 hover:bg-red-500/20 hover:text-red-100"
              >
                <LogOut className="h-4.5 w-4.5" strokeWidth={1.5} />
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
              <Link prefetch={true}
                href="/admin/clinics"
                className="rounded-md border border-amber-300 px-3 py-1 text-xs font-medium transition-colors duration-150 hover:bg-amber-100 dark:border-amber-800 dark:hover:bg-amber-900"
              >
                الخروج من العيادة
              </Link>
            </div>
          )}

          {/* Header */}
          <header className="flex h-14 items-center justify-between border-b border-slate-100 bg-white px-4 lg:px-6">
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
                <Link prefetch={true}
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
