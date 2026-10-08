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
  ChevronDown,
  ExternalLink,
} from 'lucide-react'
import { logoutAction } from '@/actions/auth'
import { ClinicCtx, type ClinicContext } from '@/lib/tenant/context'
import { GlobalSearch } from './global-search'
import { NotificationsMenu } from './notifications-menu'

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
          <header className="flex h-14 items-center justify-between border-b border-border bg-white px-4 lg:px-6">
            <div className="flex items-center gap-4 flex-1">
              <button
                onClick={() => setSidebarOpen(true)}
                className="rounded p-1.5 text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-foreground lg:hidden"
                aria-label="فتح القائمة"
              >
                <Menu className="h-5 w-5" strokeWidth={1.5} />
              </button>
              
              <div className="hidden lg:block w-96">
                <GlobalSearch clinicId={clinic.id} />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="block lg:hidden">
                <GlobalSearch clinicId={clinic.id} />
              </div>

              <NotificationsMenu clinicId={clinic.id} />

              {user.isAdmin && (
                <Link prefetch={true}
                  href="/admin"
                  className="hidden rounded-full p-2 text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-foreground sm:block"
                  aria-label="لوحة الإدارة"
                >
                  <Shield className="h-5 w-5" strokeWidth={1.5} />
                </Link>
              )}

              {/* User Dropdown */}
              <div className="relative border-r border-border pr-3">
                <button 
                  className="flex items-center gap-2 rounded-full hover:bg-accent/50 p-1 pr-2 transition-colors group"
                  onClick={() => document.getElementById('user-dropdown-menu')?.classList.toggle('hidden')}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                    {user.fullName.charAt(0)}
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-hover:text-foreground" />
                </button>
                
                <div id="user-dropdown-menu" className="absolute left-0 top-full mt-2 hidden w-48 rounded-xl border border-border bg-white p-1 z-50">
                  <div className="px-3 py-2 border-b border-border mb-1">
                    <p className="text-sm font-medium">{user.fullName}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <Link href={`/dashboard/settings/profile`} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-slate-50 transition-colors" onClick={() => document.getElementById('user-dropdown-menu')?.classList.add('hidden')}>
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    إعدادات الحساب
                  </Link>
                  <a href={`${process.env.NEXT_PUBLIC_ROOT_DOMAIN?.includes('localhost') ? 'http' : 'https'}://${clinic.slug}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-slate-50 transition-colors" onClick={() => document.getElementById('user-dropdown-menu')?.classList.add('hidden')}>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    زيارة الموقع
                  </a>
                  <div className="h-px bg-border my-1"></div>
                  <form action={logoutAction}>
                    <button type="submit" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                      <LogOut className="h-4 w-4" />
                      تسجيل الخروج
                    </button>
                  </form>
                </div>
              </div>
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
