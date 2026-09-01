import { z } from 'zod'

export const jobPostingSchema = z
  .object({
    title: z
      .string()
      .min(2, 'Job Title must be at least 2 characters')
      .max(150, 'Job Title cannot exceed 150 characters')
      .trim(),
    slug: z
      .string()
      .min(2, 'Slug must be at least 2 characters')
      .max(150, 'Slug cannot exceed 150 characters')
      .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
      .trim(),
    department: z
      .string()
      .min(2, 'Department is required')
      .max(100, 'Department cannot exceed 100 characters')
      .trim(),
    location: z
      .string()
      .min(2, 'Location is required')
      .max(150, 'Location cannot exceed 150 characters')
      .trim(),
    employmentType: z
      .enum(['Full-time', 'Part-time', 'Contract', 'Internship'])
      .default('Full-time'),
    workMode: z
      .enum(['On-site', 'Hybrid', 'Remote'])
      .default('On-site'),
    experience: z
      .string()
      .max(100, 'Experience text cannot exceed 100 characters')
      .optional()
      .nullable()
      .transform((v) => (v ? v.trim() : null)),
    salary: z
      .string()
      .max(100, 'Salary text cannot exceed 100 characters')
      .optional()
      .nullable()
      .transform((v) => (v ? v.trim() : null)),
    description: z
      .string()
      .min(10, 'Job Description must be at least 10 characters')
      .trim(),
    responsibilities: z
      .string()
      .optional()
      .nullable()
      .transform((v) => (v ? v.trim() : null)),
    requirements: z
      .string()
      .min(5, 'Job Requirements must be at least 5 characters')
      .trim(),
    applicationMethod: z
      .enum(['Email', 'URL', 'Form'])
      .default('Email'),
    applicationUrl: z
      .string()
      .optional()
      .nullable()
      .refine(
        (val) => {
          if (!val || val.trim() === '') return true
          try {
            const u = new URL(val.trim())
            return u.protocol === 'https:' || u.protocol === 'http:'
          } catch {
            return false
          }
        },
        { message: 'Application URL must be a valid URL (e.g. https://...)' }
      )
      .transform((v) => (v ? v.trim() : null)),
    applicationEmail: z
      .string()
      .optional()
      .nullable()
      .refine(
        (val) => {
          if (!val || val.trim() === '') return true
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())
        },
        { message: 'Application Email must be a valid email address' }
      )
      .transform((v) => (v ? v.trim() : null)),
    status: z
      .enum(['DRAFT', 'PUBLISHED', 'CLOSED'])
      .default('PUBLISHED'),
    publishedAt: z
      .string()
      .or(z.date())
      .optional()
      .nullable()
      .transform((v) => (v ? new Date(v) : null)),
    closingDate: z
      .string()
      .or(z.date())
      .optional()
      .nullable()
      .transform((v) => (v ? new Date(v) : null)),
    displayOrder: z
      .number()
      .int('Display order must be an integer')
      .min(0, 'Display order must be 0 or greater')
      .default(0),
    seoTitle: z
      .string()
      .max(100, 'SEO Title cannot exceed 100 characters')
      .optional()
      .nullable()
      .transform((v) => (v ? v.trim() : null)),
    metaDescription: z
      .string()
      .max(300, 'Meta Description cannot exceed 300 characters')
      .optional()
      .nullable()
      .transform((v) => (v ? v.trim() : null)),
  })
  .refine(
    (data) => {
      if (data.applicationMethod === 'URL') {
        return !!data.applicationUrl && data.applicationUrl.trim().length > 0
      }
      return true
    },
    {
      message: 'Application URL is required when application method is set to "URL"',
      path: ['applicationUrl'],
    }
  )
  .refine(
    (data) => {
      if (data.applicationMethod === 'Email') {
        return !!data.applicationEmail && data.applicationEmail.trim().length > 0
      }
      return true
    },
    {
      message: 'Application Email is required when application method is set to "Email"',
      path: ['applicationEmail'],
    }
  )
  .refine(
    (data) => {
      if (data.publishedAt && data.closingDate) {
        return data.closingDate >= data.publishedAt
      }
      return true
    },
    {
      message: 'Closing date cannot be earlier than the publishing date',
      path: ['closingDate'],
    }
  )

export type JobPostingInput = z.infer<typeof jobPostingSchema>
