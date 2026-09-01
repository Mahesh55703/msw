'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { verifySession } from '@/lib/session'
import {
  checklistSchema,
  ChecklistInput,
  ChecklistContentPayload,
} from '@/lib/validations/checklist'

export async function createChecklist(data: ChecklistInput) {
  const session = await verifySession()
  if (!session.isAuth) {
    return { success: false, error: 'Unauthorized. Please sign in.' }
  }

  const result = checklistSchema.safeParse(data)
  if (!result.success) {
    return { success: false, error: result.error.errors[0]?.message || 'Validation failed' }
  }

  const validated = result.data

  try {
    const existing = await prisma.article.findUnique({
      where: { slug: validated.slug },
    })

    if (existing) {
      return { success: false, error: 'A checklist or resource with this slug already exists.' }
    }

    const contentPayload: ChecklistContentPayload = {
      purpose: validated.purpose,
      audience: validated.audience,
      sections: validated.sections,
      downloadableFile: validated.downloadableFile || null,
      notes: validated.notes || '',
    }

    const newChecklist = await prisma.$transaction(async (tx) => {
      const created = await tx.article.create({
        data: {
          title: validated.title,
          slug: validated.slug,
          excerpt: validated.excerpt,
          content: JSON.stringify(contentPayload),
          category: 'checklists',
          authorId: validated.authorId,
          published: validated.published,
          publishedAt: validated.published
            ? validated.publishedAt
              ? new Date(validated.publishedAt)
              : new Date()
            : null,
          scheduledAt: validated.lastReviewedAt ? new Date(validated.lastReviewedAt) : null,
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
          relatedServices: {
            create: validated.relatedServices.map((serviceSlug, index) => ({
              serviceSlug,
              sortOrder: index,
            })),
          },
        },
      })

      // Attach related resources
      if (validated.relatedResourceIds && validated.relatedResourceIds.length > 0) {
        await tx.articleToRelatedArticle.createMany({
          data: validated.relatedResourceIds.map((toId, index) => ({
            fromId: created.id,
            toId,
            sortOrder: index,
          })),
        })
      }

      return created
    })

    revalidatePath('/admin/checklists')
    revalidatePath('/resources/checklists')
    revalidatePath(`/resources/checklists/${validated.slug}`)
    revalidatePath('/sitemap.xml')

    return { success: true, slug: newChecklist.slug, checklistId: newChecklist.id }
  } catch (error: any) {
    console.error('Error creating checklist:', error)
    return { success: false, error: error.message || 'Failed to create checklist' }
  }
}

export async function updateChecklist(id: string, data: ChecklistInput) {
  const session = await verifySession()
  if (!session.isAuth) {
    return { success: false, error: 'Unauthorized. Please sign in.' }
  }

  const result = checklistSchema.safeParse(data)
  if (!result.success) {
    return { success: false, error: result.error.errors[0]?.message || 'Validation failed' }
  }

  const validated = result.data

  try {
    const existing = await prisma.article.findUnique({
      where: { slug: validated.slug },
    })

    if (existing && existing.id !== id) {
      return { success: false, error: 'Another resource with this slug already exists.' }
    }

    const currentChecklist = await prisma.article.findUnique({
      where: { id },
    })

    if (!currentChecklist) {
      return { success: false, error: 'Checklist not found.' }
    }

    let publishedAt = currentChecklist.publishedAt
    if (validated.published && !currentChecklist.published) {
      publishedAt = validated.publishedAt ? new Date(validated.publishedAt) : new Date()
    } else if (!validated.published) {
      publishedAt = null
    }

    const contentPayload: ChecklistContentPayload = {
      purpose: validated.purpose,
      audience: validated.audience,
      sections: validated.sections,
      downloadableFile: validated.downloadableFile || null,
      notes: validated.notes || '',
    }

    await prisma.$transaction(async (tx) => {
      // 1. Clear old child relations
      await tx.articleRelatedService.deleteMany({ where: { articleId: id } })
      await tx.articleToRelatedArticle.deleteMany({ where: { fromId: id } })

      // 2. Update Checklist record
      await tx.article.update({
        where: { id },
        data: {
          title: validated.title,
          slug: validated.slug,
          excerpt: validated.excerpt,
          content: JSON.stringify(contentPayload),
          category: 'checklists',
          authorId: validated.authorId,
          published: validated.published,
          publishedAt,
          scheduledAt: validated.lastReviewedAt ? new Date(validated.lastReviewedAt) : null,
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
          relatedServices: {
            create: validated.relatedServices.map((serviceSlug, index) => ({
              serviceSlug,
              sortOrder: index,
            })),
          },
        },
      })

      // 3. Re-attach related resources
      if (validated.relatedResourceIds && validated.relatedResourceIds.length > 0) {
        await tx.articleToRelatedArticle.createMany({
          data: validated.relatedResourceIds.map((toId, index) => ({
            fromId: id,
            toId,
            sortOrder: index,
          })),
        })
      }
    })

    revalidatePath('/admin/checklists')
    revalidatePath('/resources/checklists')
    revalidatePath(`/resources/checklists/${validated.slug}`)
    if (currentChecklist.slug !== validated.slug) {
      revalidatePath(`/resources/checklists/${currentChecklist.slug}`)
    }
    revalidatePath('/sitemap.xml')

    return { success: true, slug: validated.slug, checklistId: id }
  } catch (error: any) {
    console.error('Error updating checklist:', error)
    return { success: false, error: error.message || 'Failed to update checklist' }
  }
}

export async function deleteChecklist(id: string) {
  const session = await verifySession()
  if (!session.isAuth) {
    return { success: false, error: 'Unauthorized. Please sign in.' }
  }

  try {
    const checklist = await prisma.article.findUnique({
      where: { id },
      select: { slug: true },
    })

    if (!checklist) {
      return { success: false, error: 'Checklist not found.' }
    }

    await prisma.$transaction(async (tx) => {
      await tx.articleTakeaway.deleteMany({ where: { articleId: id } })
      await tx.articleRelatedService.deleteMany({ where: { articleId: id } })
      await tx.articleToRelatedArticle.deleteMany({
        where: { OR: [{ fromId: id }, { toId: id }] },
      })
      await tx.article.delete({ where: { id } })
    })

    revalidatePath('/admin/checklists')
    revalidatePath('/resources/checklists')
    revalidatePath(`/resources/checklists/${checklist.slug}`)
    revalidatePath('/sitemap.xml')

    return { success: true }
  } catch (error: any) {
    console.error('Error deleting checklist:', error)
    return { success: false, error: error.message || 'Failed to delete checklist' }
  }
}

export async function togglePublishChecklist(id: string) {
  const session = await verifySession()
  if (!session.isAuth) {
    return { success: false, error: 'Unauthorized. Please sign in.' }
  }

  try {
    const checklist = await prisma.article.findUnique({
      where: { id },
      select: { id: true, published: true, slug: true },
    })

    if (!checklist) {
      return { success: false, error: 'Checklist not found.' }
    }

    const nextPublished = !checklist.published
    await prisma.article.update({
      where: { id },
      data: {
        published: nextPublished,
        publishedAt: nextPublished ? new Date() : null,
      },
    })

    revalidatePath('/admin/checklists')
    revalidatePath('/resources/checklists')
    revalidatePath(`/resources/checklists/${checklist.slug}`)
    revalidatePath('/sitemap.xml')

    return { success: true, published: nextPublished }
  } catch (error: any) {
    console.error('Error toggling publish state:', error)
    return { success: false, error: error.message || 'Failed to toggle publish' }
  }
}

export async function searchResourcesForChecklist(query: string) {
  const session = await verifySession()
  if (!session.isAuth) {
    return []
  }

  if (!query || query.trim().length === 0) {
    return []
  }

  try {
    const resources = await prisma.article.findMany({
      where: {
        OR: [
          { title: { contains: query.trim(), mode: 'insensitive' } },
          { slug: { contains: query.trim(), mode: 'insensitive' } },
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
  } catch (error) {
    console.error('Error searching resources:', error)
    return []
  }
}
