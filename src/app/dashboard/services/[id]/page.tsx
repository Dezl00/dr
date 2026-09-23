import { requireAuth, getCurrentSession } from '@/lib/auth/dal'
import { prisma } from '@/lib/db/prisma'
import { updateService } from '@/actions/dashboard'
import { notFound } from 'next/navigation'
import { ServiceForm } from './ServiceForm'

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
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold mb-6">تعديل الخدمة</h1>
      
      <ServiceForm 
        action={updateServiceWithId}
        defaultValues={{
          name: service.name,
          price: service.price?.toString() || '',
          duration: service.duration?.toString() || '',
          description: service.description || '',
          content: service.content || '',
          imageUrl: service.imageUrl || '',
        }}
      />
    </div>
  )
}
