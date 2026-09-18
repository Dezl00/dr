import { z } from 'zod'

export const createAppointmentSchema = z.object({
  patientId: z.string().min(1, 'المريض مطلوب.'),
  doctorId: z.string().min(1, 'الطبيب مطلوب.'),
  serviceId: z.string().optional(),
  date: z.string().min(1, 'التاريخ مطلوب.'),
  startTime: z
    .string()
    .min(1, 'وقت البدء مطلوب.')
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'وقت غير صالح.'),
  endTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'وقت غير صالح.')
    .optional(),
  notes: z.string().optional(),
})

export const updateAppointmentSchema = z.object({
  patientId: z.string().optional(),
  doctorId: z.string().optional(),
  serviceId: z.string().optional(),
  date: z.string().optional(),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'وقت غير صالح.').optional(),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'وقت غير صالح.').optional(),
  status: z.enum(['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).optional(),
  notes: z.string().optional(),
})

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>
