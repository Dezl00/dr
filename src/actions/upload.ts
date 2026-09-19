'use server'

import { put } from '@vercel/blob'
import { requireAuth } from '@/lib/auth/dal'

export async function uploadImageAction(formData: FormData) {
  await requireAuth()
  
  const file = formData.get('file') as File
  if (!file) {
    throw new Error('لم يتم تحديد ملف')
  }

  if (!file.type.startsWith('image/')) {
    throw new Error('يجب أن يكون الملف صورة')
  }

  // Upload to Vercel Blob
  const blob = await put(`uploads/${Date.now()}-${file.name}`, file, {
    access: 'public',
  })

  return blob.url
}
