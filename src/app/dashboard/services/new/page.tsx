import { createService } from '@/actions/dashboard'
import Link from 'next/link'

export default function NewServicePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">إضافة خدمة جديدة</h1>
        <Link 
          href="/dashboard/services"
          className="text-sm text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white"
        >
          العودة للقائمة
        </Link>
      </div>

      <div className="bg-white dark:bg-[#050505] border border-gray-200 dark:border-[#1F1F1F] p-6 max-w-2xl">
        <form action={createService} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">اسم الخدمة</label>
            <input 
              id="name"
              name="name" 
              type="text" 
              required 
              className="w-full px-3 py-2 border border-gray-200 dark:border-[#1F1F1F] bg-transparent text-sm focus:outline-none focus:border-black dark:focus:border-white transition-colors" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="price" className="text-sm font-medium">السعر</label>
              <input 
                id="price"
                name="price" 
                type="number" 
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-200 dark:border-[#1F1F1F] bg-transparent text-sm focus:outline-none focus:border-black dark:focus:border-white transition-colors" 
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="duration" className="text-sm font-medium">المدة (بالدقائق)</label>
              <input 
                id="duration"
                name="duration" 
                type="number" 
                min="1"
                className="w-full px-3 py-2 border border-gray-200 dark:border-[#1F1F1F] bg-transparent text-sm focus:outline-none focus:border-black dark:focus:border-white transition-colors" 
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full mt-6 bg-black dark:bg-white text-white dark:text-black font-medium py-2 px-4 hover:opacity-90 transition-opacity"
          >
            حفظ الخدمة
          </button>
        </form>
      </div>
    </div>
  )
}
