import { requireAuth, getCurrentSession } from '@/lib/auth/dal'
import { prisma } from '@/lib/db/prisma'
import { updateService } from '@/actions/dashboard'
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

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth()
  const clinicId = await getClinicId(user.id)
  
  const { id } = await params

  const service = await prisma.service.findUnique({
    where: { id, clinicId }
  })
  
  if (!service) notFound()

  const updateServiceWithId = updateService.bind(null, service.id)

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold mb-6">تعديل الخدمة</h1>
      
      <form action={updateServiceWithId} className="space-y-6 bg-card border border-border p-6 rounded-xl">
        <div className="space-y-2">
          <Label htmlFor="name">اسم الخدمة</Label>
          <Input 
            id="name" 
            name="name" 
            defaultValue={service.name} 
            required 
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">السعر (اختياري)</Label>
          <Input 
            id="price" 
            name="price"
            type="number" 
            step="0.01"
            defaultValue={service.price?.toString() || ''} 
            dir="ltr"
            className="text-left"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="duration">المدة بالدقائق (اختياري)</Label>
          <Input 
            id="duration" 
            name="duration" 
            type="number"
            defaultValue={service.duration || ''} 
            dir="ltr"
            className="text-left"
          />
        </div>
        
        <Button type="submit">حفظ التغييرات</Button>
      </form>
    </div>
  )
}
