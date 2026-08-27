import prisma from '@/lib/prisma'
import CmsList from './CmsList'
import { Prisma } from '@prisma/client'

type ColumnConfig = {
  key: string
  label: string
}

type CmsListWrapperProps = {
  category: string
  columns: ColumnConfig[]
  searchParams: Promise<{
    q?: string
    status?: string
    page?: string
  }>
}

export default async function CmsListWrapper({ category, columns, searchParams }: CmsListWrapperProps) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.q || ''
  const status = resolvedParams.status || ''
  const page = parseInt(resolvedParams.page || '1') || 1
  const limit = 20

  const where: Prisma.ArticleWhereInput = {
    category,
    ...(query ? {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { content: { contains: query, mode: 'insensitive' } }
      ]
    } : {}),
    ...(status === 'published' ? { published: true } : status === 'draft' ? { published: false } : {})
  }

  const [totalCount, items] = await Promise.all([
    prisma.article.count({ where }),
    prisma.article.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: { author: true } // always include author just in case
    })
  ])

  const totalPages = Math.ceil(totalCount / limit)

  return (
    <CmsList
      items={items}
      totalCount={totalCount}
      currentPage={page}
      totalPages={totalPages}
      category={category}
      columns={columns}
    />
  )
}
