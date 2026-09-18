import { requireAuth, getCurrentSession } from '@/lib/auth/dal'
import { prisma } from '@/lib/db/prisma'
import { updateAppointment } from '@/actions/dashboard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { notFound } from 'next/navigation'
import { AppointmentStatus } from '@prisma/client'

async function getClinicId(userId: string) {
  const { session } = await getCurrentSession()
  if (session?.adminAccessClinicId) return session.adminAccessClinicId
  const membership = await prisma.clinicMembership.findFirst({
    where: { userId, status: 'ACTIVE' },
  })
  return membership?.clinicId || ''
}

export default async function EditAppointmentPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth()
  const clinicId = await getClinicId(user.id)
  
  const { id } = await params

  const appointment = await prisma.appointment.findUnique({
    where: { id, clinicId },
    include: {
      patient: true,
      doctor: true,
    }
  })
  
  if (!appointment) notFound()

  const updateAppointmentWithId = updateAppointment.bind(null, appointment.id)

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold mb-6">تعديل الموعد</h1>
      
      <div className="mb-6 p-4 bg-accent/50 rounded-xl border border-border">
        <p className="font-medium">المريض: {appointment.patient.fullName}</p>
        <p className="text-sm text-muted-foreground mt-1">الطبيب: {appointment.doctor.fullName}</p>
      </div>

      <form action={updateAppointmentWithId} className="space-y-6 bg-card border border-border p-6 rounded-xl">
        <div className="space-y-2">
          <Label htmlFor="date">التاريخ</Label>
          <Input 
            id="date" 
            name="date" 
            type="date"
            defaultValue={appointment.date.toISOString().split('T')[0]} 
            required 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="startTime">وقت البدء</Label>
          <Input 
            id="startTime" 
            name="startTime" 
            type="time"
            defaultValue={appointment.startTime} 
            required 
            dir="ltr"
            className="text-left"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="status">الحالة</Label>
          <select 
            id="status" 
            name="status" 
            defaultValue={appointment.status}
            required
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value={AppointmentStatus.SCHEDULED}>مجدول</option>
            <option value={AppointmentStatus.CONFIRMED}>مؤكد</option>
            <option value={AppointmentStatus.COMPLETED}>مكتمل</option>
            <option value={AppointmentStatus.CANCELLED}>ملغي</option>
            <option value={AppointmentStatus.NO_SHOW}>لم يحضر</option>
          </select>
        </div>
        
        <Button type="submit">حفظ التغييرات</Button>
      </form>
    </div>
  )
}
