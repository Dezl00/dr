'use client'

import { useState } from 'react'
import { ImageUpload } from '@/components/ui/image-upload'

interface DoctorFormProps {
  action: (formData: FormData) => void
  defaultValues?: {
    fullName: string
    specialty: string
    phone: string
    email: string
    imageUrl: string
  }
  submitLabel: string
}

export function DoctorForm({ action, defaultValues, submitLabel }: DoctorFormProps) {
  const [imageUrl, setImageUrl] = useState(defaultValues?.imageUrl || '')

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="imageUrl" value={imageUrl} />

      <div className="space-y-2">
        <label className="text-sm font-medium">صورة الطبيب</label>
        <ImageUpload value={imageUrl} onChange={setImageUrl} />
      </div>

      <div className="space-y-2">
        <label htmlFor="fullName" className="text-sm font-medium">الاسم الكامل</label>
        <input 
          id="fullName"
          name="fullName" 
          type="text" 
          required 
          defaultValue={defaultValues?.fullName || ''}
          className="w-full px-3 py-2 border border-gray-200 dark:border-[#1F1F1F] bg-transparent text-sm rounded-xl focus:outline-none focus:border-black dark:focus:border-white transition-colors" 
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="specialty" className="text-sm font-medium">التخصص</label>
        <input 
          id="specialty"
          name="specialty" 
          type="text"
          defaultValue={defaultValues?.specialty || ''} 
          className="w-full px-3 py-2 border border-gray-200 dark:border-[#1F1F1F] bg-transparent text-sm rounded-xl focus:outline-none focus:border-black dark:focus:border-white transition-colors" 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-medium">رقم الهاتف</label>
          <input 
            id="phone"
            name="phone" 
            type="tel"
            defaultValue={defaultValues?.phone || ''} 
            className="w-full px-3 py-2 border border-gray-200 dark:border-[#1F1F1F] bg-transparent text-sm rounded-xl focus:outline-none focus:border-black dark:focus:border-white transition-colors" 
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">البريد الإلكتروني</label>
          <input 
            id="email"
            name="email" 
            type="email"
            defaultValue={defaultValues?.email || ''} 
            className="w-full px-3 py-2 border border-gray-200 dark:border-[#1F1F1F] bg-transparent text-sm rounded-xl focus:outline-none focus:border-black dark:focus:border-white transition-colors" 
          />
        </div>
      </div>

      <button 
        type="submit" 
        className="w-full mt-6 bg-black dark:bg-white text-white dark:text-black font-medium py-2 px-4 rounded-xl hover:opacity-90 transition-opacity"
      >
        {submitLabel}
      </button>
    </form>
  )
}
