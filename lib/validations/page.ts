import { z } from 'zod'
import { SectionType } from '@prisma/client'

// ─── CTA ─────────────────────────────────────────────────────────────────────
// CTA URL: allow internal paths (/...) and approved external URLs (https://)
// Explicitly reject javascript:, data:, mailto: schemes in external, etc.
const ctaUrlSchema = z
  .string()
  .min(1, 'CTA URL is required')
  .refine(
    (url) => url.startsWith('/') || url.startsWith('#') || /^https?:\/\//i.test(url) || /^mailto:/i.test(url) || /^tel:/i.test(url),
    'CTA URL must be an internal path (e.g. /contact), anchor link (e.g. #open-positions), or an approved external URL (https://...)'
  )
  .refine(
    (url) => !/^javascript:/i.test(url),
    'JavaScript URLs are not permitted'
  )

export const CtaSchema = z.object({
  label: z.string().min(1, 'CTA label is required').max(80, 'CTA label too long'),
  url: ctaUrlSchema,
})

export type CtaInput = z.infer<typeof CtaSchema>

// ─── SECTION TYPE ─────────────────────────────────────────────────────────────
export const sectionTypeSchema = z.enum([
  'HERO',
  'TEXT_IMAGE',
  'FEATURE_LIST',
  'CTA_BANNER',
  'CONTENT_REFERENCE',
] as const satisfies [SectionType, ...SectionType[]])

// ─── SEO ─────────────────────────────────────────────────────────────────────
export const SeoSchema = z.object({
  seoTitle: z
    .string()
    .max(70, 'SEO title must be 70 characters or fewer')
    .optional()
    .nullable(),
  metaDescription: z
    .string()
    .max(160, 'Meta description must be 160 characters or fewer')
    .optional()
    .nullable(),
  canonicalUrl: z
    .string()
    .refine(
      (url) =>
        !url ||
        /^https?:\/\//i.test(url) ||
        url.startsWith('/'),
      'Canonical URL must be a valid absolute URL or internal path'
    )
    .refine(
      (url) =>
        !url ||
        !/localhost/i.test(url),
      'Canonical URL must not point to localhost'
    )
    .optional()
    .nullable(),
  ogImageId: z.string().cuid('OG image must be a valid Media ID').optional().nullable(),
})

export type SeoInput = z.infer<typeof SeoSchema>

// ─── SECTION CONTENT SCHEMAS ──────────────────────────────────────────────────

export const HeroSectionSchema = z.object({
  eyebrow: z.string().max(120, 'Eyebrow text too long').optional().nullable(),
  heading: z.string().min(1, 'Heading is required').max(200, 'Heading too long'),
  description: z.string().max(600, 'Description too long').optional().nullable(),
  primaryCta: CtaSchema.optional().nullable(),
  secondaryCta: CtaSchema.optional().nullable(),
  mediaAlt: z.string().max(200, 'Alt text too long').optional().nullable(),
})

export type HeroSectionInput = z.infer<typeof HeroSectionSchema>

export const TextImageSectionSchema = z.object({
  heading: z.string().min(1, 'Heading is required').max(200, 'Heading too long'),
  body: z.string().min(1, 'Body content is required').max(5000, 'Body too long'),
  imageAlt: z.string().max(200, 'Alt text too long').optional().nullable(),
  imagePosition: z.enum(['left', 'right']).default('right'),
})

export type TextImageSectionInput = z.infer<typeof TextImageSectionSchema>

export const FeatureItemSchema = z.object({
  title: z.string().min(1, 'Feature title is required').max(120, 'Feature title too long'),
  description: z.string().max(500, 'Feature description too long').optional().nullable(),
  icon: z.string().max(60, 'Icon name too long').optional().nullable(),
})

export const FeatureListSectionSchema = z.object({
  heading: z.string().max(200, 'Heading too long').optional().nullable(),
  description: z.string().max(500, 'Description too long').optional().nullable(),
  features: z
    .array(FeatureItemSchema)
    .min(1, 'At least one feature is required')
    .max(20, 'Maximum 20 features'),
})

export type FeatureListSectionInput = z.infer<typeof FeatureListSectionSchema>

export const CtaBannerSectionSchema = z.object({
  heading: z.string().min(1, 'Heading is required').max(200, 'Heading too long'),
  description: z.string().max(500, 'Description too long').optional().nullable(),
  primaryCta: CtaSchema,
  secondaryCta: CtaSchema.optional().nullable(),
})

export type CtaBannerSectionInput = z.infer<typeof CtaBannerSectionSchema>

export const ContentReferenceSectionSchema = z.object({
  heading: z.string().max(200, 'Heading too long').optional().nullable(),
  description: z.string().max(500, 'Description too long').optional().nullable(),
})

export type ContentReferenceSectionInput = z.infer<typeof ContentReferenceSectionSchema>

// ─── UNION DISCRIMINATOR ──────────────────────────────────────────────────────

/**
 * Validate section content against the schema for its type.
 * Throws a ZodError if the content is invalid.
 * Returns the parsed, sanitised content.
 */
export function parseSectionContent(
  type: SectionType,
  content: unknown
): HeroSectionInput | TextImageSectionInput | FeatureListSectionInput | CtaBannerSectionInput | ContentReferenceSectionInput {
  switch (type) {
    case 'HERO':
      return HeroSectionSchema.parse(content)
    case 'TEXT_IMAGE':
      return TextImageSectionSchema.parse(content)
    case 'FEATURE_LIST':
      return FeatureListSectionSchema.parse(content)
    case 'CTA_BANNER':
      return CtaBannerSectionSchema.parse(content)
    case 'CONTENT_REFERENCE':
      return ContentReferenceSectionSchema.parse(content)
    default: {
      // Exhaustiveness check — TypeScript will error here if a new SectionType is added without handling
      const _exhaustive: never = type
      throw new Error('Unknown section type: ' + _exhaustive)
    }
  }
}

// ─── REFERENCE INPUT ──────────────────────────────────────────────────────────

export const ContentReferenceInputSchema = z.object({
  articleId: z.string().cuid().optional().nullable(),
  faqId: z.string().cuid().optional().nullable(),
  teamMemberId: z.string().cuid().optional().nullable(),
  jobPostingId: z.string().cuid().optional().nullable(),
  sortOrder: z.number().int().min(0).default(0),
}).refine(
  (data) =>
    [data.articleId, data.faqId, data.teamMemberId, data.jobPostingId].filter(Boolean).length === 1,
  'Each reference must point to exactly one target (Article, FAQ, TeamMember, or JobPosting)'
)

export type ContentReferenceInput = z.infer<typeof ContentReferenceInputSchema>

// ─── PAGE/REVISION LEVEL ──────────────────────────────────────────────────────

export const CreateSectionInputSchema = z.object({
  type: sectionTypeSchema,
  sortOrder: z.number().int().min(0),
  isVisible: z.boolean().default(true),
  content: z.unknown(), // validated per-type inside the action using parseSectionContent
  mediaId: z.string().cuid('Media ID must be a valid CUID').optional().nullable(),
})

export type CreateSectionInput = z.infer<typeof CreateSectionInputSchema>

export const UpdateSectionContentInputSchema = z.object({
  content: z.unknown(), // validated per-type using parseSectionContent
  mediaId: z.string().cuid('Media ID must be a valid CUID').optional().nullable(),
})

export const ReorderSectionsInputSchema = z
  .array(
    z.object({
      id: z.string().cuid('Section ID must be a valid CUID'),
      sortOrder: z.number().int().min(0),
    })
  )
  .min(1, 'At least one section reorder item required')
export const CreateServiceIndustryPageSchema = z.object({
  type: z.enum(['SERVICE', 'INDUSTRY']),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(100, 'Slug too long')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase, URL-safe, and hyphen-separated (e.g. payroll-management)'),
})
export type CreateServiceIndustryPageInput = z.infer<typeof CreateServiceIndustryPageSchema>
