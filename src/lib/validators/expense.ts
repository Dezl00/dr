import { z } from 'zod'

export const expenseSchema = z.object({
  category: z.enum(['SALARIES', 'RENT', 'SUPPLIES', 'UTILITIES', 'MARKETING', 'MAINTENANCE', 'OTHER']),
  amount: z.number().finite().positive(),
  description: z.string().trim().min(2).max(1_000),
  expenseDate: z.string(),
})
