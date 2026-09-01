'use server'

import prisma from '@/lib/prisma'
import { verifySession } from '@/lib/session'
import { revalidatePath } from 'next/cache'
import { del } from '@vercel/blob'
import fs from 'fs'
import path from 'path'

export async function getMediaUsage(url: string) {
  try {
    const session = await verifySession()
    if (!session.isAuth) {
      return { success: false, error: 'Unauthorized', usage: [] }
    }

    const [articles, teamMembers] = await Promise.all([
      prisma.article.findMany({
        where: {
          OR: [
            { featuredImage: url },
            { ogImage: url },
          ],
        },
        select: { id: true, title: true, slug: true, category: true },
      }),
      prisma.teamMember.findMany({
        where: { imageUrl: url },
        select: { id: true, name: true },
      }),
    ])

    const usage: { type: string; title: string; link?: string }[] = []

    articles.forEach((a: { id: string; title: string; slug: string; category: string }) => {
      const typeLabel =
        a.category === 'guide'
          ? 'Guide'
          : a.category === 'checklist'
          ? 'Checklist'
          : 'Article'
      const editPath =
        a.category === 'guide'
          ? `/admin/guides/${a.id}/edit`
          : a.category === 'checklist'
          ? `/admin/checklists/${a.id}/edit`
          : `/admin/articles/${a.id}/edit`

      usage.push({ type: typeLabel, title: a.title, link: editPath })
    })

    teamMembers.forEach((t: { id: string; name: string }) => {
      usage.push({ type: 'Team Member', title: t.name, link: `/admin/team` })
    })

    return {
      success: true,
      usage,
      isUsed: usage.length > 0,
    }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to check usage', usage: [] }
  }
}

export async function updateMediaMetadata(data: { id: string; filename: string; altText?: string }) {
  try {
    const session = await verifySession()
    if (!session.isAuth) {
      return { success: false, error: 'Unauthorized' }
    }

    if (!data.filename.trim()) {
      return { success: false, error: 'Filename is required' }
    }

    const media = await prisma.media.update({
      where: { id: data.id },
      data: {
        filename: data.filename.trim(),
        altText: data.altText?.trim() || null,
      },
    })

    try {
      revalidatePath('/admin/media')
    } catch {}
    return { success: true, media }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update metadata' }
  }
}

export async function deleteMediaItem(id: string, force = false) {
  try {
    const session = await verifySession()
    if (!session.isAuth) {
      return { success: false, error: 'Unauthorized' }
    }

    const media = await prisma.media.findUnique({
      where: { id },
    })

    if (!media) {
      return { success: false, error: 'Media not found' }
    }

    // Check usage before deleting unless force flag is passed
    if (!force) {
      const usageCheck = await getMediaUsage(media.url)
      if (usageCheck.isUsed) {
        return {
          success: false,
          error: `Media is currently in use across ${usageCheck.usage.length} content item(s).`,
          usage: usageCheck.usage,
          requiresForce: true,
        }
      }
    }

    // 1. Delete from Vercel Blob if stored there
    if (process.env.BLOB_READ_WRITE_TOKEN && media.url.includes('blob.vercel-storage.com')) {
      try {
        await del(media.url, { token: process.env.BLOB_READ_WRITE_TOKEN })
      } catch (blobErr) {
        console.error('Error deleting from Vercel Blob:', blobErr)
        // Continue to delete DB record even if blob cleanup fails
      }
    } else if (media.url.startsWith('/uploads/')) {
      // 2. Delete local file if stored locally
      try {
        const localPath = path.join(process.cwd(), 'public', media.url)
        if (fs.existsSync(localPath)) {
          fs.unlinkSync(localPath)
        }
      } catch (localErr) {
        console.error('Error deleting local file:', localErr)
      }
    }

    // 3. Delete database record
    await prisma.media.delete({
      where: { id },
    })

    try {
      revalidatePath('/admin/media')
    } catch {}
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete media' }
  }
}
