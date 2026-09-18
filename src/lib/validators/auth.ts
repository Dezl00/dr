import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'البريد الإلكتروني مطلوب.')
    .email('البريد الإلكتروني غير صالح.'),
  password: z
    .string()
    .min(1, 'كلمة المرور مطلوبة.'),
})

export const signupSchema = z.object({
  fullName: z
    .string()
    .min(2, 'الاسم يجب أن يكون حرفين على الأقل.')
    .max(100, 'الاسم طويل جدًا.'),
  email: z
    .string()
    .min(1, 'البريد الإلكتروني مطلوب.')
    .email('البريد الإلكتروني غير صالح.')
    .transform((v) => v.toLowerCase().trim()),
  phone: z
    .string()
    .min(10, 'رقم الهاتف غير صالح.')
    .max(15, 'رقم الهاتف غير صالح.')
    .regex(/^[0-9+]+$/, 'رقم الهاتف يجب أن يحتوي على أرقام فقط.'),
  password: z
    .string()
    .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل.')
    .max(128, 'كلمة المرور طويلة جدًا.'),
  confirmPassword: z
    .string()
    .min(1, 'تأكيد كلمة المرور مطلوب.'),
  clinicName: z
    .string()
    .min(2, 'اسم العيادة يجب أن يكون حرفين على الأقل.')
    .max(200, 'اسم العيادة طويل جدًا.'),
  slug: z
    .string()
    .min(3, 'عنوان الموقع يجب أن يكون 3 أحرف على الأقل.')
    .max(63, 'عنوان الموقع طويل جدًا.')
    .regex(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/, 'عنوان الموقع غير صالح.'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'كلمتا المرور غير متطابقتين.',
  path: ['confirmPassword'],
})

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'البريد الإلكتروني مطلوب.')
    .email('البريد الإلكتروني غير صالح.'),
})

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل.')
    .max(128, 'كلمة المرور طويلة جدًا.'),
  confirmPassword: z
    .string()
    .min(1, 'تأكيد كلمة المرور مطلوب.'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'كلمتا المرور غير متطابقتين.',
  path: ['confirmPassword'],
})

export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'كلمة المرور الحالية مطلوبة.'),
  newPassword: z
    .string()
    .min(8, 'كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل.')
    .max(128, 'كلمة المرور الجديدة طويلة جدًا.'),
  confirmNewPassword: z
    .string()
    .min(1, 'تأكيد كلمة المرور الجديدة مطلوب.'),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'كلمتا المرور غير متطابقتين.',
  path: ['confirmNewPassword'],
})

export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
