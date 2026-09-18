import { createAppointment } from '@/actions/dashboard'
import { requireAuth, getCurrentSession } from '@/lib/auth/dal'
import { prisma } from '@/lib/db/prisma'
import Link from 'next/link'
import { redirect } from 'next/navigation'

async function getActiveClinicId(userId: string): Promise<string> {
  const { session } = await getCurrentSession()
  const user = await requireAuth()
  
  if (
    user.isAdmin &&
    session?.adminAccessClinicId &&
    session?.adminAccessExpiresAt &&
    new Date() < session.adminAccessExpiresAt
  ) {
    return session.adminAccessClinicId
  }
  
  const membership = await prisma.clinicMembership.findFirst({
    where: { userId, status: 'ACTIVE' },
  })
  
  if (!membership) {
    redirect('/onboarding')
  }
  
  return membership.clinicId
}

export default async function NewAppointmentPage() {
  const user = await requireAuth()
  const clinicId = await getActiveClinicId(user.id)

  const [patients, doctors, services] = await Promise.all([
    prisma.patient.findMany({ where: { clinicId }, orderBy: { fullName: 'asc' } }),
    prisma.doctor.findMany({ where: { clinicId, isActive: true }, orderBy: { fullName: 'asc' } }),
    prisma.service.findMany({ where: { clinicId, isActive: true }, orderBy: { name: 'asc' } }),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">حجز موعد جديد</h1>
        <Link 
          href="/dashboard/appointments"
          className="text-sm text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white"
        >
          العودة للقائمة
        </Link>
      </div>

      <div className="bg-white dark:bg-[#050505] border border-gray-200 dark:border-[#1F1F1F] p-6 max-w-2xl">
        <form action={createAppointment} className="space-y-4">
          
          <div className="space-y-2">
            <label htmlFor="patientId" className="text-sm font-medium">المريض</label>
            <select 
              id="patientId"
              name="patientId" 
              required 
              className="w-full px-3 py-2 border border-gray-200 dark:border-[#1F1F1F] bg-transparent text-sm focus:outline-none focus:border-black dark:focus:border-white transition-colors appearance-none"
            >
              <option value="" disabled selected>اختر المريض</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.fullName}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="doctorId" className="text-sm font-medium">الطبيب</label>
              <select 
                id="doctorId"
                name="doctorId" 
                required 
                className="w-full px-3 py-2 border border-gray-200 dark:border-[#1F1F1F] bg-transparent text-sm focus:outline-none focus:border-black dark:focus:border-white transition-colors appearance-none"
              >
                <option value="" disabled selected>اختر الطبيب</option>
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>{d.fullName}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="serviceId" className="text-sm font-medium">الخدمة (اختياري)</label>
              <select 
                id="serviceId"
                name="serviceId" 
                className="w-full px-3 py-2 border border-gray-200 dark:border-[#1F1F1F] bg-transparent text-sm focus:outline-none focus:border-black dark:focus:border-white transition-colors appearance-none"
              >
                <option value="">بدون خدمة محددة</option>
                {services.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="date" className="text-sm font-medium">التاريخ</label>
              <input 
                id="date"
                name="date" 
                type="date" 
                required
                className="w-full px-3 py-2 border border-gray-200 dark:border-[#1F1F1F] bg-transparent text-sm focus:outline-none focus:border-black dark:focus:border-white transition-colors" 
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="startTime" className="text-sm font-medium">الوقت</label>
              <input 
                id="startTime"
                name="startTime" 
                type="time" 
                required
                className="w-full px-3 py-2 border border-gray-200 dark:border-[#1F1F1F] bg-transparent text-sm focus:outline-none focus:border-black dark:focus:border-white transition-colors" 
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-medium">ملاحظات (اختياري)</label>
            <textarea 
              id="notes"
              name="notes" 
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 dark:border-[#1F1F1F] bg-transparent text-sm focus:outline-none focus:border-black dark:focus:border-white transition-colors resize-none" 
            />
          </div>

          <button 
            type="submit" 
            className="w-full mt-6 bg-black dark:bg-white text-white dark:text-black font-medium py-2 px-4 hover:opacity-90 transition-opacity"
          >
            حجز الموعد
          </button>
        </form>
      </div>
    </div>
  )
}
