import { z } from 'zod'

export const guideSchema = z.object({
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
  content: z
    .string()
    .min(20, 'Guide content must be at least 20 characters'),
  category: z.string().default('guides'),
  authorId: z.string().min(1, 'Author is required'),
  published: z.boolean().default(false),
  publishedAt: z.union([z.string(), z.date()]).optional().nullable(),
  lastReviewedAt: z.union([z.string(), z.date()]).optional().nullable(),
  
  // Media (Supports both CDN full URLs like https://... and local upload paths like /uploads/...)
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
  keyTakeaways: z.array(z.string().min(1, 'Takeaway cannot be empty')).default([]),
  guideCovers: z.array(z.string().min(1, 'Coverage point cannot be empty')).default([]),
  relatedServices: z.array(z.string()).default([]),
  relatedResourceIds: z.array(z.string()).default([]),
})

export type GuideInput = z.infer<typeof guideSchema>
