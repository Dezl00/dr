import { requireAuth, getCurrentSession } from '@/lib/auth/dal'
import { prisma } from '@/lib/db/prisma'
import { updateDoctor } from '@/actions/dashboard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { notFound } from 'next/navigation'

async function getClinicId(userId: string) {
  const { session } = await getCurrentSession()
  if (session?.adminAccessClinicId) return session.adminAccessClinicId
  const membership = await prisma.clinicMembership.findFirst({
    where: { userId, status: 'ACTIVE' },
  })
  return membership?.clinicId || ''
}

export default async function EditDoctorPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth()
  const clinicId = await getClinicId(user.id)
  
  const { id } = await params

  const doctor = await prisma.doctor.findUnique({
    where: { id, clinicId }
  })
  
  if (!doctor) notFound()

  const updateDoctorWithId = updateDoctor.bind(null, doctor.id)

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold mb-6">تعديل بيانات الطبيب</h1>
      
      <form action={updateDoctorWithId} className="space-y-6 bg-card border border-border p-6 rounded-xl">
        <div className="space-y-2">
          <Label htmlFor="fullName">الاسم بالكامل</Label>
          <Input 
            id="fullName" 
            name="fullName" 
            defaultValue={doctor.fullName} 
            required 
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="specialty">التخصص</Label>
          <Input 
            id="specialty" 
            name="specialty" 
            defaultValue={doctor.specialty || ''} 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">رقم الهاتف</Label>
          <Input 
            id="phone" 
            name="phone" 
            defaultValue={doctor.phone || ''} 
            dir="ltr"
            className="text-left"
          />
        </div>
        
        <Button type="submit">حفظ التغييرات</Button>
      </form>
    </div>
  )
}
