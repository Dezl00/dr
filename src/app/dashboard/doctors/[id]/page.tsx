import { requireAuth, getCurrentSession } from '@/lib/auth/dal'
import { prisma } from '@/lib/db/prisma'
import { updateDoctor } from '@/actions/dashboard'
import { notFound } from 'next/navigation'
import { DoctorForm } from '../DoctorForm'

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
      
      <div className="bg-white dark:bg-[#050505] border border-gray-200 dark:border-[#1F1F1F] p-6 rounded-xl">
        <DoctorForm 
          action={updateDoctorWithId}
          submitLabel="حفظ التغييرات"
          defaultValues={{
            fullName: doctor.fullName,
            specialty: doctor.specialty || '',
            phone: doctor.phone || '',
            email: doctor.email || '',
            imageUrl: doctor.imageUrl || '',
          }}
        />
      </div>
    </div>
  )
}
