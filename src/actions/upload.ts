'use server'

import { requireAuth, getCurrentSession } from '@/lib/auth/dal'
import { prisma } from '@/lib/db/prisma'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dxgflz1wq',
  api_key: process.env.CLOUDINARY_API_KEY || '188877971963418',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'NHASqglaDoMoYXJaPe8FnNGnbBU',
})

async function getActiveClinicSlug(userId: string): Promise<string> {
  const { session } = await getCurrentSession()
  const user = await requireAuth()
  let clinicId = ''
  
  if (
    user.isAdmin &&
    session?.adminAccessClinicId &&
    session?.adminAccessExpiresAt &&
    new Date() < session.adminAccessExpiresAt
  ) {
    clinicId = session.adminAccessClinicId
  } else {
    const membership = await prisma.clinicMembership.findFirst({
      where: { userId, status: 'ACTIVE' },
    })
    if (!membership) throw new Error('No active clinic found')
    clinicId = membership.clinicId
  }

  const clinic = await prisma.clinic.findUnique({ where: { id: clinicId } })
  return clinic?.slug || 'general'
}

export async function uploadImageAction(formData: FormData) {
  const user = await requireAuth()
  const clinicSlug = await getActiveClinicSlug(user.id)
  
  const file = formData.get('file') as File
  if (!file) throw new Error('لم يتم تحديد ملف')
  if (!file.type.startsWith('image/')) throw new Error('يجب أن يكون الملف صورة')

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const base64Data = buffer.toString('base64')
  const fileUri = `data:${file.type};base64,${base64Data}`

  return new Promise<string>((resolve, reject) => {
    cloudinary.uploader.upload(fileUri, {
      folder: `drs/${clinicSlug}`,
    }, (error, result) => {
      if (error || !result) {
        console.error('Cloudinary upload error:', error)
        reject(new Error('فشل الرفع إلى السحابة'))
      } else {
        resolve(result.secure_url)
      }
    })
  })
}

export async function deleteImageAction(imageUrl: string) {
  await requireAuth()
  if (!imageUrl || !imageUrl.includes('cloudinary.com')) return false
  
  try {
    const urlParts = imageUrl.split('/')
    const uploadIndex = urlParts.findIndex(p => p === 'upload')
    if (uploadIndex === -1) return false
    
    // Extract public_id: skip 'upload' and version 'v1234567'
    const pathParts = urlParts.slice(uploadIndex + 2)
    const fullPathWithExt = pathParts.join('/')
    const publicId = fullPathWithExt.replace(/\.[^/.]+$/, '')
    
    return new Promise<boolean>((resolve) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) {
          console.error('Cloudinary delete error:', error)
          resolve(false)
        } else {
          resolve(result.result === 'ok')
        }
      })
    })
  } catch (err) {
    console.error('Error deleting image:', err)
    return false
  }
}
