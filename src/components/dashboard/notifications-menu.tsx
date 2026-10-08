'use client'

import { useState, useEffect, useRef, useTransition } from 'react'
import { Bell, Loader2 } from 'lucide-react'
import { getRecentNotifications } from '@/actions/notifications'
import Link from 'next/link'

export function NotificationsMenu({ clinicId }: { clinicId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [isPending, startTransition] = useTransition()
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleOpen = () => {
    setIsOpen(!isOpen)
    if (!isOpen && notifications.length === 0) {
      startTransition(async () => {
        const data = await getRecentNotifications(clinicId)
        setNotifications(data)
      })
    }
  }

  const unreadCount = notifications.length // Simplified for now

  return (
    <div ref={wrapperRef} className="relative">
      <button
        onClick={handleOpen}
        className="relative rounded-full p-2 text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-foreground"
        aria-label="الإشعارات"
      >
        <Bell className="h-5 w-5" strokeWidth={1.5} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 border-2 border-white"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-80 rounded-xl border border-border bg-white shadow-none z-50">
          <div className="flex items-center justify-between border-b border-border p-3">
            <h3 className="text-sm font-semibold">الإشعارات</h3>
            {isPending && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </div>
          <div className="max-h-80 overflow-y-auto p-2">
            {!isPending && notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">لا توجد إشعارات جديدة</div>
            ) : (
              <div className="space-y-1">
                {notifications.map((notif) => (
                  <Link
                    key={notif.id}
                    href={`/dashboard/appointments/${notif.id}`}
                    onClick={() => setIsOpen(false)}
                    className="block rounded-lg p-3 hover:bg-slate-50 transition-colors"
                  >
                    <p className="text-sm font-medium">حجز جديد: {notif.patientName}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      موعد: {notif.date} الساعة {notif.time}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
