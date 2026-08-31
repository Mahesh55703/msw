'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function saveArticle(formData: FormData) {
  try {
    const title = formData.get('title') as string
    const slug = formData.get('slug') as string
    const category = formData.get('category') as string
    const content = formData.get('content') as string
    const authorId = formData.get('authorId') as string
    const published = formData.get('published') === 'true'

    if (!title || !slug || !content || !authorId) {
      return { success: false, error: 'Missing required fields' }
    }

    // Check if slug exists
    const existing = await prisma.article.findUnique({ where: { slug } })
    if (existing) {
      return { success: false, error: 'An article with this slug already exists' }
    }

    await prisma.article.create({
      data: {
        title,
        slug,
        category,
        content,
        authorId,
        published,
        publishedAt: published ? new Date() : null,
      }
    })

    revalidatePath('/admin/articles')
    return { success: true }
  } catch (error: any) {
    console.error('Error saving article:', error)
    return { success: false, error: error.message || 'Failed to save article' }
  }
}
