'use client'

import { useState } from 'react'
import { Eye, Clock, Calendar, User, Phone, Stethoscope, FileText, Bell } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { sendManualReminder } from '@/actions/dashboard'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'

type Props = {
  appointmentId: string
  patientName: string
  patientPhone: string | null
  doctorName: string
  serviceName: string
  dateStr: string
  timeStr: string
  notes: string | null
  statusLabel: string
}

export function AppointmentDetailsModal({
  appointmentId,
  patientName,
  patientPhone,
  doctorName,
  serviceName,
  dateStr,
  timeStr,
  notes,
  statusLabel,
}: Props) {
  const [loading, setLoading] = useState(false)

  const handleSendReminder = async () => {
    setLoading(true)
    try {
      const res = await sendManualReminder(appointmentId)
      if (res.success) {
        toast({ title: 'نجاح', description: 'تم إرسال رسالة التذكير بنجاح' })
      } else {
        toast({ variant: 'destructive', title: 'خطأ', description: res.error || 'حدث خطأ أثناء الإرسال' })
      }
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'خطأ', description: e.message })
    }
    setLoading(false)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="inline-flex items-center justify-center rounded-md w-8 h-8 hover:bg-muted text-muted-foreground transition-colors" title="التفاصيل">
          <Eye className="w-4 h-4" />
        </button>
      </DialogTrigger>
      <DialogContent dir="rtl" className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">تفاصيل الموعد</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-3 border-b pb-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-base">{patientName}</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5" dir="ltr">
                <Phone className="w-3 h-3" />
                {patientPhone || 'لا يوجد رقم هاتف'}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3"/> التاريخ</p>
              <p className="font-medium text-sm">{dateStr}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3"/> الوقت</p>
              <p className="font-medium text-sm" dir="ltr">{timeStr}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1"><Stethoscope className="w-3 h-3"/> الطبيب</p>
              <p className="font-medium text-sm">{doctorName}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1"><FileText className="w-3 h-3"/> الخدمة</p>
              <p className="font-medium text-sm">{serviceName}</p>
            </div>
          </div>

          <div className="pt-2">
            <p className="text-xs text-muted-foreground mb-1">حالة الموعد</p>
            <p className="font-medium text-sm">{statusLabel}</p>
          </div>

          {notes && (
            <div className="pt-2">
              <p className="text-xs text-muted-foreground mb-1">ملاحظات</p>
              <p className="text-sm p-3 bg-muted/50 rounded-md border border-border">{notes}</p>
            </div>
          )}

        </div>
        
        <div className="flex gap-2 pt-2 border-t justify-end">
          <Button 
            variant="outline" 
            onClick={handleSendReminder} 
            disabled={loading}
            className="w-full sm:w-auto flex items-center gap-2"
          >
            <Bell className="w-4 h-4" />
            {loading ? 'جاري الإرسال...' : 'إرسال تذكير يدوي (SMS)'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
