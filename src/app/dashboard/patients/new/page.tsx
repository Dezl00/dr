import type { Metadata } from 'next'
import { PatientForm } from '@/components/dashboard/patient-form'

export const metadata: Metadata = {
  title: 'إضافة مريض | DRS',
}

export default function NewPatientPage() {
  return (
    <div>
      <h1 className="text-page-title mb-6">إضافة مريض جديد</h1>
      <PatientForm />
    </div>
  )
}
