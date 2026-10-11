import { z } from 'zod'

export const doctorSchema = z.object({
  fullName: z.string().trim().min(2).max(200),
  specialty: z.string().trim().max(200).optional().nullable(),
  phone: z.string().trim().max(30).optional().nullable(),
  email: z.string().email().optional().nullable(),
  bio: z.string().trim().max(10000).optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  isActive: z.boolean().optional(),
  showOnWebsite: z.boolean().optional(),
  serviceIds: z.array(z.string()).max(100).optional(),
})
