'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { bookAppointment } from '@/actions/public'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type Service = { id: string, name: string }
type Doctor = { id: string, fullName: string }

export function BookingForm({
  domain,
  services,
  doctors
}: {
  domain: string
  services: Service[]
  doctors: Doctor[]
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [dateObj, setDateObj] = useState<Date>()
  const [formData, setFormData] = useState({
    serviceId: '',
    doctorId: '',
    startTime: '',
    fullName: '',
    phone: '',
  })
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!dateObj) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يرجى تحديد تاريخ الموعد",
      })
      return
    }

    setLoading(true)
    const formattedDate = format(dateObj, 'yyyy-MM-dd')

    const result = await bookAppointment({
      ...formData,
      date: formattedDate,
      domain
    })

    if (result.success) {
      setIsSuccess(true)
    } else {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: result.error || "حدث خطأ أثناء إرسال الطلب",
      })
    }
    setLoading(false)
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in duration-300">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
          <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/20">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h3 className="text-2xl font-semibold text-[#050505] mb-2">تم تأكيد حجزك بنجاح!</h3>
        <p className="text-[#050505]/70 max-w-sm font-normal">
          لقد قمنا بتسجيل موعدك وسنقوم بإرسال رسالة نصية (SMS) لتأكيد الحجز فوراً. نتمنى لك دوام الصحة والعافية.
        </p>
        <Button 
          variant="outline" 
          onClick={() => {
            setIsSuccess(false)
            setFormData({ serviceId: '', doctorId: '', startTime: '', fullName: '', phone: '' })
            setDateObj(undefined)
          }} 
          className="mt-8 rounded-none border-[#E5E7EB] font-medium text-[#050505] hover:bg-gray-50"
        >
          حجز موعد جديد
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="fullName" className="font-medium text-[#050505]">الاسم بالكامل</Label>
          <Input 
            id="fullName" 
            required 
            value={formData.fullName}
            onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
            placeholder="أدخل اسمك الكامل"
            className="rounded-none border-[#E5E7EB] font-normal"
            style={{ '--tw-ring-color': 'var(--clinic-primary)' } as any}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone" className="font-medium text-[#050505]">رقم الهاتف</Label>
          <div className="relative flex w-full" dir="ltr">
            <span className="inline-flex items-center rounded-l-md rounded-r-none border border-r-0 border-[#E5E7EB] bg-muted px-3 text-sm text-muted-foreground">
              +20
            </span>
            <Input 
              id="phone" 
              type="tel"
              required 
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="10xxxxxxxx"
              className="rounded-l-none rounded-r-md border-[#E5E7EB] font-normal"
              style={{ '--tw-ring-color': 'var(--clinic-primary)' } as any}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="service" className="font-medium text-[#050505]">الخدمة (اختياري)</Label>
          <Select 
            value={formData.serviceId} 
            onValueChange={(val) => setFormData(prev => ({ ...prev, serviceId: val }))}
          >
            <SelectTrigger id="service" className="rounded-none border-[#E5E7EB] font-normal" style={{ '--tw-ring-color': 'var(--clinic-primary)' } as any}>
              <SelectValue placeholder="اختر الخدمة" />
            </SelectTrigger>
            <SelectContent className="rounded-none border-[#E5E7EB]" dir="rtl">
              {services.map(s => (
                <SelectItem key={s.id} value={s.id} className="font-normal">{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="doctor" className="font-medium text-[#050505]">الطبيب</Label>
          <Select 
            value={formData.doctorId} 
            onValueChange={(val) => setFormData(prev => ({ ...prev, doctorId: val }))}
            required
          >
            <SelectTrigger id="doctor" className="rounded-none border-[#E5E7EB] font-normal" style={{ '--tw-ring-color': 'var(--clinic-primary)' } as any}>
              <SelectValue placeholder="اختر الطبيب" />
            </SelectTrigger>
            <SelectContent className="rounded-none border-[#E5E7EB]" dir="rtl">
              {doctors.map(d => (
                <SelectItem key={d.id} value={d.id} className="font-normal">{d.fullName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 flex flex-col justify-end">
          <Label className="font-medium text-[#050505]">تاريخ الموعد</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-right font-normal rounded-none border-[#E5E7EB]",
                  !dateObj && "text-muted-foreground"
                )}
                style={{ '--tw-ring-color': 'var(--clinic-primary)' } as any}
              >
                <CalendarIcon className="mr-2 h-4 w-4" style={{ color: 'var(--clinic-primary)' }} />
                {dateObj ? format(dateObj, "PPP", { locale: ar }) : <span>اختر التاريخ</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-none border-[#E5E7EB] custom-calendar-wrapper">
              <style>{`
                .custom-calendar-wrapper .bg-primary {
                  background-color: var(--clinic-primary) !important;
                  color: #FFFFFF !important;
                }
                .custom-calendar-wrapper .text-primary {
                  color: var(--clinic-primary) !important;
                }
              `}</style>
              <Calendar
                mode="single"
                selected={dateObj}
                onSelect={setDateObj}
                locale={ar}
                dir="rtl"
                disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2 flex flex-col justify-end">
          <Label htmlFor="startTime" className="font-medium text-[#050505]">الوقت المفضل</Label>
          <Input 
            id="startTime" 
            type="time"
            required 
            value={formData.startTime}
            onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
            className="rounded-none border-[#E5E7EB] font-normal"
            style={{ '--tw-ring-color': 'var(--clinic-primary)' } as any}
          />
        </div>
      </div>

      <Button type="submit" className="w-full rounded-none font-medium hover:opacity-90 transition-opacity text-[#FFFFFF] flex items-center justify-center gap-2" disabled={loading} style={{ backgroundColor: 'var(--clinic-primary)' }}>
        {loading && (
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {loading ? 'جاري تأكيد الحجز...' : 'تأكيد الحجز'}
      </Button>
    </form>
  )
}
