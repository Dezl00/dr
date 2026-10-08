'use client'

import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'

export function PatientAppointments({ appointments }: { appointments: any[] }) {
  if (!appointments || appointments.length === 0) {
    return (
      <div className="p-12 text-center text-muted-foreground border rounded-xl bg-card">
        لا توجد مواعيد سابقة أو قادمة لهذا المريض.
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-5 py-3.5 text-start font-medium text-muted-foreground">التاريخ</th>
            <th className="px-5 py-3.5 text-start font-medium text-muted-foreground">الوقت</th>
            <th className="px-5 py-3.5 text-start font-medium text-muted-foreground">الطبيب</th>
            <th className="px-5 py-3.5 text-start font-medium text-muted-foreground">الخدمة</th>
            <th className="px-5 py-3.5 text-start font-medium text-muted-foreground">الحالة</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {appointments.map((apt) => (
            <tr key={apt.id} className="transition-colors hover:bg-accent/50">
              <td className="px-5 py-3.5">
                {format(new Date(apt.date), 'dd MMMM yyyy', { locale: ar })}
              </td>
              <td className="px-5 py-3.5" dir="ltr">{apt.startTime}</td>
              <td className="px-5 py-3.5">{apt.doctor?.fullName || '—'}</td>
              <td className="px-5 py-3.5">{apt.service?.name || '—'}</td>
              <td className="px-5 py-3.5">
                <Badge variant={
                  apt.status === 'COMPLETED' ? 'default' : 
                  apt.status === 'CANCELLED' ? 'destructive' : 
                  'secondary'
                }>
                  {apt.status === 'COMPLETED' ? 'مكتمل' : 
                   apt.status === 'SCHEDULED' ? 'مجدول' : 
                   apt.status === 'CONFIRMED' ? 'مؤكد' : 
                   apt.status === 'NO_SHOW' ? 'لم يحضر' : 'ملغي'}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
