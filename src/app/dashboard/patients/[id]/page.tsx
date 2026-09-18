import { requireAuth, getCurrentSession } from '@/lib/auth/dal'
import { prisma } from '@/lib/db/prisma'
import { updatePatient } from '@/actions/dashboard'
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

export default async function EditPatientPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth()
  const clinicId = await getClinicId(user.id)
  
  const { id } = await params

  const patient = await prisma.patient.findUnique({
    where: { id, clinicId }
  })
  
  if (!patient) notFound()

  const updatePatientWithId = updatePatient.bind(null, patient.id)

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold mb-6">تعديل بيانات المريض</h1>
      
      <form action={updatePatientWithId} className="space-y-6 bg-card border border-border p-6 rounded-xl">
        <div className="space-y-2">
          <Label htmlFor="fullName">الاسم بالكامل</Label>
          <Input 
            id="fullName" 
            name="fullName" 
            defaultValue={patient.fullName} 
            required 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">رقم الهاتف</Label>
          <Input 
            id="phone" 
            name="phone" 
            defaultValue={patient.phone || ''} 
            dir="ltr"
            className="text-left"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">البريد الإلكتروني</Label>
          <Input 
            id="email" 
            name="email"
            type="email" 
            defaultValue={patient.email || ''} 
            dir="ltr"
            className="text-left"
          />
        </div>
        
        <Button type="submit">حفظ التغييرات</Button>
      </form>
    </div>
  )
}
