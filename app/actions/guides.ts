'use server'

import prisma from '@/lib/prisma'
import { verifySession } from '@/lib/session'
import { revalidatePath } from 'next/cache'
import { guideSchema, type GuideInput } from '@/lib/validations/guide'

export async function createGuide(data: GuideInput) {
  const session = await verifySession()
  if (!session.isAuth) {
    return { success: false, error: 'Unauthorized: You must be logged in to create a guide' }
  }

  const parsed = guideSchema.safeParse(data)
  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map((i) => i.message).join(', ')
    return { success: false, error: errorMsg }
  }

  const validated = parsed.data

  // Ensure slug uniqueness
  const existing = await prisma.article.findUnique({
    where: { slug: validated.slug },
  })
  if (existing) {
    return { success: false, error: `A resource with slug "${validated.slug}" already exists. Please choose another.` }
  }

  try {
    const lastReviewedDate = validated.lastReviewedAt ? new Date(validated.lastReviewedAt) : new Date()

    const guide = await prisma.article.create({
      data: {
        title: validated.title,
        slug: validated.slug,
        excerpt: validated.excerpt,
        content: validated.content,
        category: 'guides',
        authorId: validated.authorId,
        published: validated.published,
        publishedAt: validated.published ? (validated.publishedAt ? new Date(validated.publishedAt) : new Date()) : null,
        scheduledAt: lastReviewedDate, // Maps to Last Reviewed date
        featuredImage: validated.featuredImage || null,
        featuredImageAlt: validated.featuredImageAlt || null,
        ogImage: validated.ogImage || null,
        seoTitle: validated.seoTitle || null,
        metaDescription: validated.metaDescription || null,
        canonicalUrl: validated.canonicalUrl || null,
        ctaHeading: validated.ctaHeading || null,
        ctaDescription: validated.ctaDescription || null,
        ctaPrimaryLabel: validated.ctaPrimaryLabel || null,
        ctaPrimaryUrl: validated.ctaPrimaryUrl || null,
        ctaSecondaryLabel: validated.ctaSecondaryLabel || null,
        ctaSecondaryUrl: validated.ctaSecondaryUrl || null,
        keyTakeaways: {
          create: (validated.keyTakeaways || []).map((text, idx) => ({
            text,
            sortOrder: idx,
          })),
        },
        relatedServices: {
          create: (validated.relatedServices || []).map((serviceSlug, idx) => ({
            serviceSlug,
            sortOrder: idx,
          })),
        },
        relatedFrom: {
          create: (validated.relatedResourceIds || []).map((toId, idx) => ({
            toId,
            sortOrder: idx,
          })),
        },
      },
    })

    revalidatePath('/admin/guides')
    revalidatePath('/resources/guides')
    revalidatePath(`/resources/guides/${guide.slug}`)
    revalidatePath('/sitemap.xml')

    return { success: true, guideId: guide.id, slug: guide.slug }
  } catch (error: any) {
    console.error('Error creating guide:', error)
    return { success: false, error: error.message || 'Failed to create guide' }
  }
}

export async function updateGuide(id: string, data: GuideInput) {
  const session = await verifySession()
  if (!session.isAuth) {
    return { success: false, error: 'Unauthorized: You must be logged in to update a guide' }
  }

  const parsed = guideSchema.safeParse(data)
  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map((i) => i.message).join(', ')
    return { success: false, error: errorMsg }
  }

  const validated = parsed.data

  // Check if slug belongs to another article/guide
  const existingSlug = await prisma.article.findUnique({
    where: { slug: validated.slug },
  })
  if (existingSlug && existingSlug.id !== id) {
    return { success: false, error: `A resource with slug "${validated.slug}" already exists.` }
  }

  try {
    const currentGuide = await prisma.article.findUnique({
      where: { id },
      select: { published: true, publishedAt: true, slug: true },
    })

    let finalPublishedAt = currentGuide?.publishedAt || null
    if (validated.published && !finalPublishedAt) {
      finalPublishedAt = validated.publishedAt ? new Date(validated.publishedAt) : new Date()
    } else if (!validated.published) {
      finalPublishedAt = null
    }

    const lastReviewedDate = validated.lastReviewedAt ? new Date(validated.lastReviewedAt) : new Date()

    await prisma.$transaction(async (tx) => {
      // 1. Delete existing relations
      await tx.articleTakeaway.deleteMany({ where: { articleId: id } })
      await tx.articleRelatedService.deleteMany({ where: { articleId: id } })
      await tx.articleToRelatedArticle.deleteMany({ where: { fromId: id } })

      // 2. Update Guide with new relations
      await tx.article.update({
        where: { id },
        data: {
          title: validated.title,
          slug: validated.slug,
          excerpt: validated.excerpt,
          content: validated.content,
          category: 'guides',
          authorId: validated.authorId,
          published: validated.published,
          publishedAt: finalPublishedAt,
          scheduledAt: lastReviewedDate, // Maps to Last Reviewed date
          featuredImage: validated.featuredImage || null,
          featuredImageAlt: validated.featuredImageAlt || null,
          ogImage: validated.ogImage || null,
          seoTitle: validated.seoTitle || null,
          metaDescription: validated.metaDescription || null,
          canonicalUrl: validated.canonicalUrl || null,
          ctaHeading: validated.ctaHeading || null,
          ctaDescription: validated.ctaDescription || null,
          ctaPrimaryLabel: validated.ctaPrimaryLabel || null,
          ctaPrimaryUrl: validated.ctaPrimaryUrl || null,
          ctaSecondaryLabel: validated.ctaSecondaryLabel || null,
          ctaSecondaryUrl: validated.ctaSecondaryUrl || null,
          keyTakeaways: {
            create: (validated.keyTakeaways || []).map((text, idx) => ({
              text,
              sortOrder: idx,
            })),
          },
          relatedServices: {
            create: (validated.relatedServices || []).map((serviceSlug, idx) => ({
              serviceSlug,
              sortOrder: idx,
            })),
          },
          relatedFrom: {
            create: (validated.relatedResourceIds || []).map((toId, idx) => ({
              toId,
              sortOrder: idx,
            })),
          },
        },
      })
    })

    revalidatePath('/admin/guides')
    revalidatePath('/resources/guides')
    if (currentGuide?.slug) revalidatePath(`/resources/guides/${currentGuide.slug}`)
    revalidatePath(`/resources/guides/${validated.slug}`)
    revalidatePath('/sitemap.xml')

    return { success: true, slug: validated.slug, guideId: id }
  } catch (error: any) {
    console.error('Error updating guide:', error)
    return { success: false, error: error.message || 'Failed to update guide' }
  }
}

export async function deleteGuide(id: string) {
  const session = await verifySession()
  if (!session.isAuth) {
    return { success: false, error: 'Unauthorized: You must be logged in to delete a guide' }
  }

  try {
    const guide = await prisma.article.findUnique({
      where: { id },
      select: { slug: true },
    })

    if (!guide) {
      return { success: false, error: 'Guide not found' }
    }

    await prisma.article.delete({
      where: { id },
    })

    revalidatePath('/admin/guides')
    revalidatePath('/resources/guides')
    if (guide.slug) revalidatePath(`/resources/guides/${guide.slug}`)
    revalidatePath('/sitemap.xml')

    return { success: true }
  } catch (error: any) {
    console.error('Error deleting guide:', error)
    return { success: false, error: error.message || 'Failed to delete guide' }
  }
}

export async function togglePublishGuide(id: string) {
  const session = await verifySession()
  if (!session.isAuth) {
    return { success: false, error: 'Unauthorized: You must be logged in to modify guide status' }
  }

  try {
    const guide = await prisma.article.findUnique({
      where: { id },
      select: { id: true, published: true, slug: true },
    })

    if (!guide) {
      return { success: false, error: 'Guide not found' }
    }

    const nextPublished = !guide.published
    await prisma.article.update({
      where: { id },
      data: {
        published: nextPublished,
        publishedAt: nextPublished ? new Date() : null,
      },
    })

    revalidatePath('/admin/guides')
    revalidatePath('/resources/guides')
    if (guide.slug) revalidatePath(`/resources/guides/${guide.slug}`)
    revalidatePath('/sitemap.xml')

    return { success: true, published: nextPublished }
  } catch (error: any) {
    console.error('Error toggling guide publish status:', error)
    return { success: false, error: error.message || 'Failed to toggle guide status' }
  }
}

export async function searchResourcesForGuide(query: string, currentGuideId?: string) {
  const session = await verifySession()
  if (!session.isAuth) {
    return []
  }

  try {
    const resources = await prisma.article.findMany({
      where: {
        id: currentGuideId ? { not: currentGuideId } : undefined,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { slug: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        published: true,
      },
      take: 10,
      orderBy: { updatedAt: 'desc' },
    })

    return resources
  } catch (e) {
    console.error('Error searching resources for guide:', e)
    return []
  }
}
