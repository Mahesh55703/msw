'use server'

import prisma from '@/lib/prisma'
import { verifySession } from '@/lib/session'
import { revalidatePath } from 'next/cache'
import { articleSchema, type ArticleFormData } from '@/lib/validations/article'

export async function createArticle(rawData: ArticleFormData) {
  try {
    const session = await verifySession()
    if (!session.isAuth || !session.userId) {
      return { success: false, error: 'Unauthorized. Please log in to perform this action.' }
    }

    const validated = articleSchema.safeParse(rawData)
    if (!validated.success) {
      const errorMsg = validated.error.errors.map(e => e.message).join(', ')
      return { success: false, error: errorMsg }
    }

    const data = validated.data

    // Check slug uniqueness
    const existing = await prisma.article.findUnique({ where: { slug: data.slug } })
    if (existing) {
      return { success: false, error: 'An article with this URL slug already exists. Please choose a unique slug.' }
    }

    const authorId = data.authorId || session.userId

    const createdArticle = await prisma.$transaction(async (tx) => {
      const article = await tx.article.create({
        data: {
          title: data.title,
          slug: data.slug,
          excerpt: data.excerpt || null,
          content: data.content,
          category: data.category || 'articles',
          authorId: authorId,
          published: data.published,
          publishedAt: data.published ? (data.publishedAt || new Date()) : null,
          
          featuredImage: data.featuredImage || null,
          featuredImageAlt: data.featuredImageAlt || null,
          ogImage: data.ogImage || null,
          
          seoTitle: data.seoTitle || null,
          metaDescription: data.metaDescription || null,
          canonicalUrl: data.canonicalUrl || null,
          
          ctaHeading: data.ctaHeading || null,
          ctaDescription: data.ctaDescription || null,
          ctaPrimaryLabel: data.ctaPrimaryLabel || null,
          ctaPrimaryUrl: data.ctaPrimaryUrl || null,
          ctaSecondaryLabel: data.ctaSecondaryLabel || null,
          ctaSecondaryUrl: data.ctaSecondaryUrl || null,

          keyTakeaways: {
            create: (data.keyTakeaways || []).map((text, idx) => ({
              text: text.trim(),
              sortOrder: idx
            }))
          },
          relatedServices: {
            create: (data.relatedServices || []).map((serviceSlug, idx) => ({
              serviceSlug,
              sortOrder: idx
            }))
          }
        }
      })

      if (data.relatedArticleIds && data.relatedArticleIds.length > 0) {
        await tx.articleToRelatedArticle.createMany({
          data: data.relatedArticleIds.map((toId, idx) => ({
            fromId: article.id,
            toId,
            sortOrder: idx
          }))
        })
      }

      return article
    })

    revalidatePath('/admin/articles')
    revalidatePath('/resources/articles')
    revalidatePath(`/resources/articles/${createdArticle.slug}`)
    revalidatePath('/sitemap.xml')

    return { success: true, articleId: createdArticle.id, slug: createdArticle.slug }
  } catch (error: any) {
    console.error('Error creating article:', error)
    return { success: false, error: error.message || 'Failed to create article' }
  }
}

export async function updateArticle(id: string, rawData: ArticleFormData) {
  try {
    const session = await verifySession()
    if (!session.isAuth) {
      return { success: false, error: 'Unauthorized. Please log in to perform this action.' }
    }

    const validated = articleSchema.safeParse(rawData)
    if (!validated.success) {
      const errorMsg = validated.error.errors.map(e => e.message).join(', ')
      return { success: false, error: errorMsg }
    }

    const data = validated.data

    // Check slug uniqueness against other records
    const existing = await prisma.article.findUnique({ where: { slug: data.slug } })
    if (existing && existing.id !== id) {
      return { success: false, error: 'Another article is already using this URL slug.' }
    }

    const currentArticle = await prisma.article.findUnique({ where: { id } })
    if (!currentArticle) {
      return { success: false, error: 'Article not found.' }
    }

    // Determine publication timestamp
    let publishedAt = currentArticle.publishedAt
    if (data.published && !publishedAt) {
      publishedAt = data.publishedAt || new Date()
    } else if (!data.published) {
      publishedAt = null
    }

    await prisma.$transaction(async (tx) => {
      // 1. Update article base fields
      await tx.article.update({
        where: { id },
        data: {
          title: data.title,
          slug: data.slug,
          excerpt: data.excerpt || null,
          content: data.content,
          category: data.category || 'articles',
          authorId: data.authorId || currentArticle.authorId,
          published: data.published,
          publishedAt,
          
          featuredImage: data.featuredImage || null,
          featuredImageAlt: data.featuredImageAlt || null,
          ogImage: data.ogImage || null,
          
          seoTitle: data.seoTitle || null,
          metaDescription: data.metaDescription || null,
          canonicalUrl: data.canonicalUrl || null,
          
          ctaHeading: data.ctaHeading || null,
          ctaDescription: data.ctaDescription || null,
          ctaPrimaryLabel: data.ctaPrimaryLabel || null,
          ctaPrimaryUrl: data.ctaPrimaryUrl || null,
          ctaSecondaryLabel: data.ctaSecondaryLabel || null,
          ctaSecondaryUrl: data.ctaSecondaryUrl || null,
        }
      })

      // 2. Synchronize Key Takeaways
      await tx.articleTakeaway.deleteMany({ where: { articleId: id } })
      if (data.keyTakeaways && data.keyTakeaways.length > 0) {
        await tx.articleTakeaway.createMany({
          data: data.keyTakeaways.map((text, idx) => ({
            articleId: id,
            text: text.trim(),
            sortOrder: idx
          }))
        })
      }

      // 3. Synchronize Related Services
      await tx.articleRelatedService.deleteMany({ where: { articleId: id } })
      if (data.relatedServices && data.relatedServices.length > 0) {
        await tx.articleRelatedService.createMany({
          data: data.relatedServices.map((serviceSlug, idx) => ({
            articleId: id,
            serviceSlug,
            sortOrder: idx
          }))
        })
      }

      // 4. Synchronize Related Articles
      await tx.articleToRelatedArticle.deleteMany({ where: { fromId: id } })
      if (data.relatedArticleIds && data.relatedArticleIds.length > 0) {
        // Filter out self-referencing ID
        const validRelatedIds = data.relatedArticleIds.filter(toId => toId !== id)
        if (validRelatedIds.length > 0) {
          await tx.articleToRelatedArticle.createMany({
            data: validRelatedIds.map((toId, idx) => ({
              fromId: id,
              toId,
              sortOrder: idx
            }))
          })
        }
      }
    })

    revalidatePath('/admin/articles')
    revalidatePath('/resources/articles')
    revalidatePath(`/resources/articles/${data.slug}`)
    if (currentArticle.slug !== data.slug) {
      revalidatePath(`/resources/articles/${currentArticle.slug}`)
    }
    revalidatePath('/sitemap.xml')

    return { success: true, articleId: id, slug: data.slug }
  } catch (error: any) {
    console.error('Error updating article:', error)
    return { success: false, error: error.message || 'Failed to update article' }
  }
}

export async function deleteArticle(id: string) {
  try {
    const session = await verifySession()
    if (!session.isAuth) {
      return { success: false, error: 'Unauthorized. Please log in to perform this action.' }
    }

    const article = await prisma.article.findUnique({ where: { id } })
    if (!article) {
      return { success: false, error: 'Article not found.' }
    }

    await prisma.article.delete({ where: { id } })

    revalidatePath('/admin/articles')
    revalidatePath('/resources/articles')
    revalidatePath(`/resources/articles/${article.slug}`)
    revalidatePath('/sitemap.xml')

    return { success: true }
  } catch (error: any) {
    console.error('Error deleting article:', error)
    return { success: false, error: error.message || 'Failed to delete article' }
  }
}

export async function togglePublishArticle(id: string, published: boolean) {
  try {
    const session = await verifySession()
    if (!session.isAuth) {
      return { success: false, error: 'Unauthorized. Please log in to perform this action.' }
    }

    const article = await prisma.article.findUnique({ where: { id } })
    if (!article) {
      return { success: false, error: 'Article not found.' }
    }

    const updated = await prisma.article.update({
      where: { id },
      data: {
        published,
        publishedAt: published ? (article.publishedAt || new Date()) : null
      }
    })

    revalidatePath('/admin/articles')
    revalidatePath('/resources/articles')
    revalidatePath(`/resources/articles/${updated.slug}`)
    revalidatePath('/sitemap.xml')

    return { success: true, published: updated.published }
  } catch (error: any) {
    console.error('Error toggling publish status:', error)
    return { success: false, error: error.message || 'Failed to update status' }
  }
}

export async function searchArticlesForRelation(query: string = '', excludeId?: string) {
  try {
    const session = await verifySession()
    if (!session.isAuth) return []

    const articles = await prisma.article.findMany({
      where: {
        ...(excludeId ? { id: { not: excludeId } } : {}),
        ...(query ? { title: { contains: query, mode: 'insensitive' } } : {})
      },
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        published: true,
        updatedAt: true
      },
      orderBy: { updatedAt: 'desc' },
      take: 15
    })

    return articles
  } catch (error) {
    console.error('Error fetching articles for relation:', error)
    return []
  }
}
