import { z } from 'zod'

export const checklistItemSchema = z.object({
  id: z.string(),
  text: z.string().min(1, 'Checklist item text cannot be empty'),
  guidance: z.string().optional(),
})

export const checklistSectionSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Section title is required'),
  items: z.array(checklistItemSchema).min(1, 'Each section must have at least one checklist item'),
})

export const checklistDownloadableFileSchema = z.object({
  url: z.string().min(1, 'Download URL is required'),
  filename: z.string().min(1, 'Filename is required'),
  size: z.number().optional(),
  uploadedAt: z.string().optional(),
})

export const checklistSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title cannot exceed 200 characters'),
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .max(200, 'Slug cannot exceed 200 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens'),
  excerpt: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description cannot exceed 500 characters'),
  category: z.string().min(1, 'Category is required').default('checklists'),
  authorId: z.string().min(1, 'Author is required'),
  published: z.boolean().default(false),
  publishedAt: z.union([z.string(), z.date()]).optional().nullable(),
  lastReviewedAt: z.union([z.string(), z.date()]).optional().nullable(),

  // Structured Content Fields
  purpose: z.string().min(10, 'Purpose / What This Checklist Is For must be at least 10 characters'),
  audience: z.array(z.string().min(1, 'Audience item cannot be empty')).min(1, 'At least one target audience item is required'),
  sections: z.array(checklistSectionSchema).min(1, 'At least one checklist section is required'),
  downloadableFile: checklistDownloadableFileSchema.optional().nullable(),
  notes: z.string().optional().nullable(),

  // Media
  featuredImage: z.string().max(1000).optional().or(z.literal('')).nullable(),
  featuredImageAlt: z.string().max(200, 'Alt text cannot exceed 200 characters').optional().nullable(),
  ogImage: z.string().max(1000).optional().or(z.literal('')).nullable(),

  // SEO
  seoTitle: z.string().max(100, 'SEO title cannot exceed 100 characters').optional().nullable(),
  metaDescription: z.string().max(300, 'Meta description cannot exceed 300 characters').optional().nullable(),
  canonicalUrl: z.string().max(1000).optional().or(z.literal('')).nullable(),

  // CTA
  ctaHeading: z.string().max(150, 'CTA heading cannot exceed 150 characters').optional().nullable(),
  ctaDescription: z.string().max(500, 'CTA description cannot exceed 500 characters').optional().nullable(),
  ctaPrimaryLabel: z.string().max(80, 'CTA primary label cannot exceed 80 characters').optional().nullable(),
  ctaPrimaryUrl: z.string().max(300, 'CTA primary URL cannot exceed 300 characters').optional().nullable(),
  ctaSecondaryLabel: z.string().max(80, 'CTA secondary label cannot exceed 80 characters').optional().nullable(),
  ctaSecondaryUrl: z.string().max(300, 'CTA secondary URL cannot exceed 300 characters').optional().nullable(),

  // Relational Arrays
  relatedServices: z.array(z.string()).default([]),
  relatedResourceIds: z.array(z.string()).default([]),
})

export type ChecklistItem = z.infer<typeof checklistItemSchema>
export type ChecklistSection = z.infer<typeof checklistSectionSchema>
export type ChecklistDownloadableFile = z.infer<typeof checklistDownloadableFileSchema>
export type ChecklistInput = z.infer<typeof checklistSchema>

export interface ChecklistContentPayload {
  purpose: string
  audience: string[]
  sections: ChecklistSection[]
  downloadableFile?: ChecklistDownloadableFile | null
  notes?: string
}
