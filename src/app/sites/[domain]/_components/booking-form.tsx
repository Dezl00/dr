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
      toast({
        title: "تم الحجز بنجاح",
        description: "تم استلام طلب الحجز الخاص بك. سنتواصل معك قريباً لتأكيد الموعد.",
      })
      setFormData({
        serviceId: '',
        doctorId: '',
        startTime: '',
        fullName: '',
        phone: '',
      })
      setDateObj(undefined)
      router.refresh()
    } else {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: result.error || "حدث خطأ أثناء إرسال الطلب",
      })
    }
    setLoading(false)
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
          <Input 
            id="phone" 
            type="tel"
            required 
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            placeholder="05xxxxxxxx"
            dir="ltr"
            className="text-right rounded-none border-[#E5E7EB] font-normal"
            style={{ '--tw-ring-color': 'var(--clinic-primary)' } as any}
          />
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

      <Button type="submit" className="w-full rounded-none font-medium hover:opacity-90 transition-opacity text-[#FFFFFF]" disabled={loading} style={{ backgroundColor: 'var(--clinic-primary)' }}>
        {loading ? 'جاري الإرسال...' : 'تأكيد الحجز'}
      </Button>
    </form>
  )
}
