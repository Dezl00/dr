import { prisma } from '@/lib/db/prisma'
import { requireAuth, getCurrentSession } from '@/lib/auth/dal'
import { InvoiceForm } from './_components/invoice-form'

async function getClinicId(userId: string) {
  const { session } = await getCurrentSession()
  if (session?.adminAccessClinicId) return session.adminAccessClinicId
  const membership = await prisma.clinicMembership.findFirst({
    where: { userId, status: 'ACTIVE' },
  })
  return membership?.clinicId
}

export default async function NewInvoicePage() {
  const user = await requireAuth()
  const clinicId = await getClinicId(user.id)
  
  if (!clinicId) return <div>Unauthorized</div>

  const patients = await prisma.patient.findMany({
    where: { clinicId },
    select: { id: true, fullName: true }
  })

  return (
    <div className="max-w-3xl">
      <h1 className="text-xl font-semibold mb-6">إنشاء فاتورة جديدة</h1>
      <InvoiceForm patients={patients} />
    </div>
  )
}
