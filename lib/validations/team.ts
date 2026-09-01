import { z } from 'zod'

export const teamMemberSchema = z.object({
  name: z
    .string()
    .min(2, 'Full Name must be at least 2 characters')
    .max(100, 'Full Name cannot exceed 100 characters')
    .trim(),
  designation: z
    .string()
    .min(2, 'Designation / Role is required')
    .max(150, 'Designation cannot exceed 150 characters')
    .trim(),
  department: z
    .string()
    .max(100, 'Department cannot exceed 100 characters')
    .optional()
    .nullable()
    .transform((v) => (v ? v.trim() : null)),
  bio: z
    .string()
    .max(2000, 'Bio cannot exceed 2000 characters')
    .optional()
    .nullable()
    .transform((v) => (v ? v.trim() : null)),
  imageUrl: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v ? v.trim() : null)),
  imageAlt: z
    .string()
    .max(200, 'Alt text cannot exceed 200 characters')
    .optional()
    .nullable()
    .transform((v) => (v ? v.trim() : null)),
  linkedinUrl: z
    .string()
    .optional()
    .nullable()
    .refine(
      (val) => {
        if (!val || val.trim() === '') return true
        try {
          const url = new URL(val.trim())
          return url.protocol === 'https:' && url.hostname.includes('linkedin.com')
        } catch {
          return false
        }
      },
      { message: 'Must be a valid HTTPS LinkedIn URL (e.g. https://www.linkedin.com/in/...)' }
    )
    .transform((v) => (v ? v.trim() : null)),
  reportsToId: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v && v.trim() !== '' && v !== 'none' ? v.trim() : null)),
  displayOrder: z
    .number()
    .int('Display Order must be an integer')
    .min(0, 'Display Order must be 0 or greater')
    .default(0),
  isActive: z.boolean().default(true),
})

export type TeamMemberInput = z.infer<typeof teamMemberSchema>
