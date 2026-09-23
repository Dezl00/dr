import { createDoctor } from '@/actions/dashboard'
import Link from 'next/link'
import { DoctorForm } from '../DoctorForm'

export default function NewDoctorPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">إضافة طبيب جديد</h1>
        <Link 
          href="/dashboard/doctors"
          className="text-sm text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white"
        >
          العودة للقائمة
        </Link>
      </div>

      <div className="bg-white dark:bg-[#050505] border border-gray-200 dark:border-[#1F1F1F] p-6 max-w-2xl rounded-xl">
        <DoctorForm action={createDoctor} submitLabel="حفظ الطبيب" />
      </div>
    </div>
  )
}
