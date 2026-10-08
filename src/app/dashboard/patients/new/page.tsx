import type { Metadata } from 'next'
import { PatientForm } from '@/components/dashboard/patient-form'
import { BackButton } from '@/components/ui/back-button'

export const metadata: Metadata = {
  title: 'إضافة مريض | DRS',
}

export default function NewPatientPage() {
  return (
    <div>
      <BackButton label="العودة لقائمة المرضى" />
      <h1 className="text-page-title mb-6">إضافة مريض جديد</h1>
      <PatientForm />
    </div>
  )
}
