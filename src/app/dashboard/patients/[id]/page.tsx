import { requireAuth, getCurrentSession } from '@/lib/auth/dal'
import { prisma } from '@/lib/db/prisma'
import { notFound } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PatientBasicInfo } from './_components/patient-basic-info'
import { PatientMedicalHistory } from './_components/patient-medical-history'
import { PatientDentalChart } from './_components/patient-dental-chart'
import { PatientAppointments } from './_components/patient-appointments'
import { PatientBilling } from './_components/patient-billing'
import { PatientPrescriptions } from './_components/patient-prescriptions'
import { BackButton } from '@/components/ui/back-button'

export const metadata = {
  title: 'ملف المريض | DRS',
}

async function getClinicId(userId: string) {
  const { session } = await getCurrentSession()
  if (session?.adminAccessClinicId) return session.adminAccessClinicId
  const membership = await prisma.clinicMembership.findFirst({
    where: { userId, status: 'ACTIVE' },
  })
  return membership?.clinicId || ''
}

export default async function PatientEMRPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth()
  const clinicId = await getClinicId(user.id)
  
  const { id } = await params

  const patient = await prisma.patient.findUnique({
    where: { id, clinicId },
    include: {
      medicalHistory: true,
      dentalRecords: true,
      appointments: {
        orderBy: { date: 'desc' },
        include: { doctor: true, service: true }
      },
      prescriptions: {
        orderBy: { createdAt: 'desc' },
        include: { doctor: true }
      },
      invoices: {
        orderBy: { createdAt: 'desc' }
      }
    }
  })
  
  if (!patient) notFound()

  return (
    <div className="space-y-6">
      <BackButton label="العودة لقائمة المرضى" />
      {/* Patient Header */}
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold">{patient.fullName}</h1>
          <p className="text-muted-foreground mt-1">
            {patient.phone} {patient.email ? `• ${patient.email}` : ''}
          </p>
        </div>
        <div className="text-sm px-4 py-2 bg-primary/10 text-primary rounded-lg font-medium">
          {patient.gender === 'MALE' ? 'ذكر' : patient.gender === 'FEMALE' ? 'أنثى' : 'غير محدد'}
        </div>
      </div>

      <Tabs defaultValue="basic-info" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto overflow-y-hidden border-b rounded-none bg-transparent h-auto p-0 space-x-0 rtl:space-x-reverse space-x-reverse">
          <TabsTrigger value="basic-info" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3">
            البيانات الأساسية
          </TabsTrigger>
          <TabsTrigger value="medical-history" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3">
            التاريخ الطبي
          </TabsTrigger>
          <TabsTrigger value="dental-chart" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3">
            مخطط الأسنان (Chart)
          </TabsTrigger>
          <TabsTrigger value="appointments" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3">
            المواعيد
          </TabsTrigger>
          <TabsTrigger value="attachments" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3">
            الأشعة والملفات
          </TabsTrigger>
          <TabsTrigger value="prescriptions" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3">
            الروشتات
          </TabsTrigger>
          <TabsTrigger value="billing" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3">
            الفواتير والمدفوعات
          </TabsTrigger>
        </TabsList>

        <div className="pt-6">
          <TabsContent value="basic-info" className="mt-0 outline-none">
            <PatientBasicInfo patient={patient} />
          </TabsContent>

          <TabsContent value="medical-history" className="mt-0 outline-none">
            <PatientMedicalHistory patientId={patient.id} history={patient.medicalHistory} />
          </TabsContent>

          <TabsContent value="dental-chart" className="mt-0 outline-none">
            <PatientDentalChart patientId={patient.id} records={patient.dentalRecords} />
          </TabsContent>

          <TabsContent value="appointments" className="mt-0 outline-none">
            <PatientAppointments appointments={patient.appointments} />
          </TabsContent>

          <TabsContent value="attachments" className="mt-0 outline-none">
            <div className="p-12 text-center text-muted-foreground border rounded-xl bg-card">
              <p className="mb-4">معرض صور الأشعة والتحاليل الطبية.</p>
              <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                رفع ملف جديد
              </button>
            </div>
          </TabsContent>

          <TabsContent value="prescriptions" className="mt-0 outline-none">
            <PatientPrescriptions prescriptions={patient.prescriptions} patientId={patient.id} />
          </TabsContent>

          <TabsContent value="billing" className="mt-0 outline-none">
            <PatientBilling invoices={patient.invoices} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
