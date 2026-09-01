import prisma from '@/lib/prisma'
import { verifySession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { Prisma } from '@prisma/client'
import MediaUploader from './MediaUploader'
import MediaGalleryClient from '@/components/admin/media/MediaGalleryClient'

export const dynamic = 'force-dynamic'

export default async function MediaPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const session = await verifySession()
  if (!session.isAuth) redirect('/admin/login')

  const resolvedParams = await searchParams
  const query = (resolvedParams.q || '').trim()
  const type = resolvedParams.type || ''
  const sort = resolvedParams.sort || 'newest'
  const page = Math.max(1, parseInt(resolvedParams.page || '1', 10))
  const pageSize = 24

  const where: Prisma.MediaWhereInput = {
    ...(query
      ? {
          OR: [
            { filename: { contains: query, mode: 'insensitive' } },
            { altText: { contains: query, mode: 'insensitive' } },
          ],
        }
      : {}),
    ...(type && type !== 'all'
      ? {
          mimeType: {
            contains: type === 'jpeg' ? 'jpeg' : type === 'jpg' ? 'jpeg' : type,
            mode: 'insensitive',
          },
        }
      : {}),
  }

  let orderBy: Prisma.MediaOrderByWithRelationInput = { createdAt: 'desc' }
  if (sort === 'oldest') {
    orderBy = { createdAt: 'asc' }
  } else if (sort === 'name_asc') {
    orderBy = { filename: 'asc' }
  } else if (sort === 'name_desc') {
    orderBy = { filename: 'desc' }
  }

  const [mediaItems, totalCount] = await Promise.all([
    prisma.media.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.media.count({ where }),
  ])

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto w-full">
      {/* Header Banner */}
      <div className="bg-[#12372A] p-6 md:p-8 rounded-3xl shadow-sm text-white flex flex-col sm:flex-row sm:items-center sm:justify-between border border-[#0D281E] gap-4">
        <div>
          <span className="text-[10px] font-bold text-[#D6A84F] uppercase tracking-wider">
            Asset Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
            Media Library
          </h1>
          <p className="text-[#A2B3AA] text-xs sm:text-sm mt-1">
            Manage images and reusable media assets across LabourAxis Articles, Guides, and Checklists.
          </p>
        </div>
        <div className="shrink-0">
          <MediaUploader />
        </div>
      </div>

      {/* Main Media Gallery */}
      <div className="bg-white shadow-xs border border-[#D9E1DC] overflow-hidden rounded-3xl p-6">
        <MediaGalleryClient
          initialItems={mediaItems as any}
          totalCount={totalCount}
          currentPage={page}
          pageSize={pageSize}
          currentFilters={{
            q: query,
            type,
            sort,
          }}
        />
      </div>
    </div>
  )
}