'use client'

import { useTransition } from 'react'
import { updateAppointmentStatus } from '@/actions/dashboard'
import { cn } from '@/lib/utils'

const STATUS_MAP = {
  SCHEDULED: { label: 'مجدول', class: 'status-scheduled' },
  CONFIRMED: { label: 'مؤكد', class: 'status-confirmed' },
  COMPLETED: { label: 'مكتمل', class: 'status-completed' },
  CANCELLED: { label: 'ملغي', class: 'status-cancelled' },
  NO_SHOW: { label: 'لم يحضر', class: 'status-noshow' },
}

export function AppointmentStatusSelect({ appointmentId, currentStatus }: { appointmentId: string, currentStatus: string }) {
  const [isPending, startTransition] = useTransition()
  
  const statusObj = STATUS_MAP[currentStatus as keyof typeof STATUS_MAP] || STATUS_MAP.SCHEDULED

  return (
    <select
      disabled={isPending}
      value={currentStatus}
      onChange={(e) => {
        startTransition(() => {
          updateAppointmentStatus(appointmentId, e.target.value)
        })
      }}
      className={cn(
        'appearance-none text-xs font-semibold px-2 py-1.5 rounded-md outline-none cursor-pointer disabled:opacity-50 transition-colors w-24 text-center text-center-last',
        statusObj.class
      )}
    >
      <option value="SCHEDULED" className="bg-white text-slate-900 font-medium">مجدول</option>
      <option value="CONFIRMED" className="bg-white text-slate-900 font-medium">مؤكد</option>
      <option value="COMPLETED" className="bg-white text-slate-900 font-medium">مكتمل</option>
      <option value="CANCELLED" className="bg-white text-slate-900 font-medium">ملغي</option>
      <option value="NO_SHOW" className="bg-white text-slate-900 font-medium">لم يحضر</option>
    </select>
  )
}
