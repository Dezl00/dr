import { z } from 'zod'

export const createClinicSchema = z.object({
  name: z
    .string()
    .min(2, 'اسم العيادة يجب أن يكون حرفين على الأقل.')
    .max(200, 'اسم العيادة طويل جدًا.'),
  slug: z
    .string()
    .min(3, 'عنوان الموقع يجب أن يكون 3 أحرف على الأقل.')
    .max(63, 'عنوان الموقع طويل جدًا.')
    .regex(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/, 'عنوان الموقع غير صالح.'),
})

export const updateClinicSchema = z.object({
  name: z
    .string()
    .min(2, 'اسم العيادة يجب أن يكون حرفين على الأقل.')
    .max(200, 'اسم العيادة طويل جدًا.')
    .optional(),
  phone: z.string().optional(),
  email: z.string().email('البريد الإلكتروني غير صالح.').optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  timezone: z.string().optional(),
})

export const clinicSettingsSchema = z.object({
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'لون غير صالح.').optional(),
  secondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'لون غير صالح.').optional(),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'لون غير صالح.').optional(),
  phone: z.string().optional(),
  email: z.string().email('البريد الإلكتروني غير صالح.').optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  socialFacebook: z.string().url().optional().or(z.literal('')),
  socialInstagram: z.string().url().optional().or(z.literal('')),
  socialTwitter: z.string().url().optional().or(z.literal('')),
  socialWhatsapp: z.string().optional(),
})

export type CreateClinicInput = z.infer<typeof createClinicSchema>
export type UpdateClinicInput = z.infer<typeof updateClinicSchema>
export type ClinicSettingsInput = z.infer<typeof clinicSettingsSchema>
