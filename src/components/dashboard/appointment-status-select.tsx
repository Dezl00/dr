'use client'

import { useTransition } from 'react'
import { updateAppointmentStatus } from '@/actions/dashboard'
import { cn } from '@/lib/utils'

const STATUS_MAP = {
  SCHEDULED: { label: 'مجدول', class: 'bg-blue-100 text-blue-700 border-blue-200' },
  CONFIRMED: { label: 'مؤكد', class: 'bg-amber-100 text-amber-700 border-amber-200' },
  COMPLETED: { label: 'مكتمل', class: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  CANCELLED: { label: 'ملغي', class: 'bg-red-100 text-red-700 border-red-200' },
  NO_SHOW: { label: 'لم يحضر', class: 'bg-gray-100 text-gray-700 border-gray-200' },
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
        'appearance-none text-xs font-medium px-2 py-1 rounded-md border outline-none cursor-pointer disabled:opacity-50 transition-colors',
        statusObj.class
      )}
    >
      <option value="SCHEDULED">مجدول</option>
      <option value="CONFIRMED">مؤكد</option>
      <option value="COMPLETED">مكتمل</option>
      <option value="CANCELLED">ملغي</option>
      <option value="NO_SHOW">لم يحضر</option>
    </select>
  )
}
