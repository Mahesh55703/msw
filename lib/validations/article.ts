import { z } from 'zod'

export const articleSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must only contain lowercase alphanumeric characters and hyphens'),
  excerpt: z.string().max(500, 'Excerpt must be less than 500 characters').optional().nullable(),
  content: z.string().min(1, 'Content is required'),
  category: z.string().default('articles'),
  authorId: z.string().min(1, 'Author is required'),
  published: z.boolean().default(false),
  publishedAt: z.coerce.date().optional().nullable(),
  
  // Media
  featuredImage: z.string().optional().nullable(),
  featuredImageAlt: z.string().optional().nullable(),
  ogImage: z.string().optional().nullable(),
  
  // SEO
  seoTitle: z.string().max(100, 'SEO Title should ideally be 60 characters or less').optional().nullable(),
  metaDescription: z.string().max(300, 'Meta Description should ideally be 160 characters or less').optional().nullable(),
  canonicalUrl: z.string().optional().nullable(),
  
  // Call to Action
  ctaHeading: z.string().optional().nullable(),
  ctaDescription: z.string().optional().nullable(),
  ctaPrimaryLabel: z.string().optional().nullable(),
  ctaPrimaryUrl: z.string().optional().nullable(),
  ctaSecondaryLabel: z.string().optional().nullable(),
  ctaSecondaryUrl: z.string().optional().nullable(),

  // Relational Arrays
  keyTakeaways: z.array(z.string().min(1, 'Takeaway cannot be empty')).optional().default([]),
  relatedServices: z.array(z.string()).optional().default([]),
  relatedArticleIds: z.array(z.string()).optional().default([])
})

export type ArticleFormData = z.infer<typeof articleSchema>
