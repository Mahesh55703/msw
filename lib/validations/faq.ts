import { z } from 'zod'

export const faqCategoryEnum = z.enum([
  'UNCATEGORIZED',
  'HR_OPERATIONS',
  'LABOUR_COMPLIANCE',
  'PF_EPFO',
  'ESIC',
  'PAYROLL',
  'FACTORY_COMPLIANCE',
  'CONTRACT_LABOUR',
  'INDUSTRIAL_RELATIONS',
])

export type FaqCategoryType = z.infer<typeof faqCategoryEnum>

export const FAQ_CATEGORY_LABELS: Record<FaqCategoryType, string> = {
  HR_OPERATIONS: 'HR & HR Operations',
  LABOUR_COMPLIANCE: 'Labour Compliance',
  PF_EPFO: 'PF & EPFO',
  ESIC: 'ESIC',
  PAYROLL: 'Payroll & Attendance',
  FACTORY_COMPLIANCE: 'Factory Compliance',
  CONTRACT_LABOUR: 'Contract Labour',
  INDUSTRIAL_RELATIONS: 'Industrial Relations',
  UNCATEGORIZED: 'Uncategorized (Review Required)',
}

export const faqSchema = z.object({
  question: z
    .string()
    .min(5, 'Question must be at least 5 characters long')
    .max(300, 'Question cannot exceed 300 characters')
    .trim(),
  answer: z
    .string()
    .min(10, 'Answer must be at least 10 characters long')
    .trim(),
  category: faqCategoryEnum.default('UNCATEGORIZED'),
  published: z.boolean().default(false),
  displayOrder: z.coerce.number().int().min(0, 'Display order must be 0 or higher').default(0),
})

export type FaqInput = z.infer<typeof faqSchema>
