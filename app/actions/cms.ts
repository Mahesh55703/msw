'use server'

import prisma from '@/lib/prisma'
import { verifySession } from '@/lib/session'
import { requirePermission, hasPermission, Role } from '@/lib/rbac'
import { revalidatePath } from 'next/cache'

export async function deleteContent(id: string) {
  const session = await requirePermission('articles:publish').catch(()=>null)
  if (!session) throw new Error('Unauthorized')

  const record = await prisma.article.findUnique({ where: { id } })
  if (!record) throw new Error('Record not found')

  await prisma.article.delete({
    where: { id }
  })
  
  revalidatePath(`/admin/${record.category}`)
  return { success: true }
}

export async function togglePublishContent(id: string, publish: boolean) {
  const session = await requirePermission('articles:publish').catch(()=>null)
  if (!session) throw new Error('Unauthorized')

  const record = await prisma.article.findUnique({ where: { id } })
  if (!record) throw new Error('Record not found')

  await prisma.article.update({
    where: { id },
    data: { published: publish }
  })

  revalidatePath(`/admin/${record.category}`)
  return { success: true }
}

export async function createContent(data: any) {
  const session = await requirePermission('articles:publish').catch(()=>null)
  if (!session) throw new Error('Unauthorized')

  if (!data.title || !data.slug || !data.content) {
    throw new Error('Missing required fields')
  }

  const existing = await prisma.article.findUnique({ where: { slug: data.slug } })
  if (existing) throw new Error('An item with this slug already exists')

  const { keyTakeaways, relatedServices, ...articleData } = data

  await prisma.article.create({
    data: {
      ...articleData,
      authorId: session.userId as string,
      publishedAt: data.published ? new Date() : null,
      keyTakeaways: {
        create: (keyTakeaways || []).map((t: string, i: number) => ({ text: t, sortOrder: i }))
      },
      relatedServices: {
        create: (relatedServices || []).map((s: string, i: number) => ({ serviceSlug: s, sortOrder: i }))
      }
    }
  })

  revalidatePath(`/admin/${data.category}`)
  return { success: true }
}

export async function updateContent(id: string, data: any) {
  const session = await requirePermission('articles:publish').catch(()=>null)
  if (!session) throw new Error('Unauthorized')

  if (!data.title || !data.slug || !data.content) {
    throw new Error('Missing required fields')
  }

  const existing = await prisma.article.findUnique({ where: { slug: data.slug } })
  if (existing && existing.id !== id) throw new Error('An item with this slug already exists')

  const { keyTakeaways, relatedServices, ...articleData } = data

  await prisma.article.update({
    where: { id },
    data: {
      ...articleData,
      publishedAt: data.published ? new Date() : null,
      keyTakeaways: {
        deleteMany: {},
        create: (keyTakeaways || []).map((t: string, i: number) => ({ text: t, sortOrder: i }))
      },
      relatedServices: {
        deleteMany: {},
        create: (relatedServices || []).map((s: string, i: number) => ({ serviceSlug: s, sortOrder: i }))
      }
    }
  })

  revalidatePath(`/admin/${data.category}`)
  return { success: true }
}
