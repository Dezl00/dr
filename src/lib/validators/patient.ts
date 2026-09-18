import { z } from 'zod'

export const createPatientSchema = z.object({
  fullName: z
    .string()
    .min(2, 'اسم المريض يجب أن يكون حرفين على الأقل.')
    .max(200, 'اسم المريض طويل جدًا.'),
  phone: z.string().optional(),
  email: z.string().email('البريد الإلكتروني غير صالح.').optional().or(z.literal('')),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE']).optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
})

export const updatePatientSchema = createPatientSchema.partial()

export type CreatePatientInput = z.infer<typeof createPatientSchema>
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>
