import { createDoctor } from '@/actions/dashboard'
import Link from 'next/link'

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

      <div className="bg-white dark:bg-[#050505] border border-gray-200 dark:border-[#1F1F1F] p-6 max-w-2xl">
        <form action={createDoctor} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="fullName" className="text-sm font-medium">الاسم الكامل</label>
            <input 
              id="fullName"
              name="fullName" 
              type="text" 
              required 
              className="w-full px-3 py-2 border border-gray-200 dark:border-[#1F1F1F] bg-transparent text-sm focus:outline-none focus:border-black dark:focus:border-white transition-colors" 
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="specialty" className="text-sm font-medium">التخصص</label>
            <input 
              id="specialty"
              name="specialty" 
              type="text" 
              className="w-full px-3 py-2 border border-gray-200 dark:border-[#1F1F1F] bg-transparent text-sm focus:outline-none focus:border-black dark:focus:border-white transition-colors" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">رقم الهاتف</label>
              <input 
                id="phone"
                name="phone" 
                type="tel" 
                className="w-full px-3 py-2 border border-gray-200 dark:border-[#1F1F1F] bg-transparent text-sm focus:outline-none focus:border-black dark:focus:border-white transition-colors" 
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">البريد الإلكتروني</label>
              <input 
                id="email"
                name="email" 
                type="email" 
                className="w-full px-3 py-2 border border-gray-200 dark:border-[#1F1F1F] bg-transparent text-sm focus:outline-none focus:border-black dark:focus:border-white transition-colors" 
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full mt-6 bg-black dark:bg-white text-white dark:text-black font-medium py-2 px-4 hover:opacity-90 transition-opacity"
          >
            حفظ الطبيب
          </button>
        </form>
      </div>
    </div>
  )
}
