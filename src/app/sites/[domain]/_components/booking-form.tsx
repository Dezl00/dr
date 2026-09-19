'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { bookAppointment } from '@/actions/public'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'

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
  const [formData, setFormData] = useState({
    serviceId: '',
    doctorId: '',
    date: '',
    startTime: '',
    fullName: '',
    phone: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const result = await bookAppointment({
      ...formData,
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
        date: '',
        startTime: '',
        fullName: '',
        phone: '',
      })
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
          <Label htmlFor="fullName" className="font-medium text-[#000000]">الاسم بالكامل</Label>
          <Input 
            id="fullName" 
            required 
            value={formData.fullName}
            onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
            placeholder="أدخل اسمك الكامل"
            className="rounded-none border-[#E5E7EB] focus-visible:ring-[#000000] font-normal"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone" className="font-medium text-[#000000]">رقم الهاتف</Label>
          <Input 
            id="phone" 
            type="tel"
            required 
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            placeholder="05xxxxxxxx"
            dir="ltr"
            className="text-right rounded-none border-[#E5E7EB] focus-visible:ring-[#000000] font-normal"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="service" className="font-medium text-[#000000]">الخدمة (اختياري)</Label>
          <Select 
            value={formData.serviceId} 
            onValueChange={(val) => setFormData(prev => ({ ...prev, serviceId: val }))}
          >
            <SelectTrigger id="service" className="rounded-none border-[#E5E7EB] focus:ring-[#000000] font-normal">
              <SelectValue placeholder="اختر الخدمة" />
            </SelectTrigger>
            <SelectContent className="rounded-none border-[#E5E7EB]">
              {services.map(s => (
                <SelectItem key={s.id} value={s.id} className="font-normal">{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="doctor" className="font-medium text-[#000000]">الطبيب</Label>
          <Select 
            value={formData.doctorId} 
            onValueChange={(val) => setFormData(prev => ({ ...prev, doctorId: val }))}
            required
          >
            <SelectTrigger id="doctor" className="rounded-none border-[#E5E7EB] focus:ring-[#000000] font-normal">
              <SelectValue placeholder="اختر الطبيب" />
            </SelectTrigger>
            <SelectContent className="rounded-none border-[#E5E7EB]">
              {doctors.map(d => (
                <SelectItem key={d.id} value={d.id} className="font-normal">{d.fullName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="date" className="font-medium text-[#000000]">تاريخ الموعد</Label>
          <Input 
            id="date" 
            type="date"
            required 
            value={formData.date}
            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            min={new Date().toISOString().split('T')[0]}
            className="rounded-none border-[#E5E7EB] focus-visible:ring-[#000000] font-normal"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="startTime" className="font-medium text-[#000000]">الوقت المفضل</Label>
          <Input 
            id="startTime" 
            type="time"
            required 
            value={formData.startTime}
            onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
            className="rounded-none border-[#E5E7EB] focus-visible:ring-[#000000] font-normal"
          />
        </div>
      </div>

      <Button type="submit" className="w-full rounded-none bg-[#000000] text-[#FFFFFF] hover:bg-[#050505] font-medium" disabled={loading}>
        {loading ? 'جاري الإرسال...' : 'تأكيد الحجز'}
      </Button>
    </form>
  )
}
