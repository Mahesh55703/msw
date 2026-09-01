import { verifySession } from '@/lib/session'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import ArticleList from '@/components/admin/articles/ArticleList'

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>
}) {
  const session = await verifySession()
  if (!session.isAuth) redirect('/admin/login')

  const resolvedParams = await searchParams
  const query = resolvedParams.q?.trim() || ''
  const status = resolvedParams.status?.trim() || ''
  const page = Math.max(1, parseInt(resolvedParams.page || '1', 10) || 1)
  const limit = 20

  const where: Prisma.ArticleWhereInput = {
    category: 'articles',
    ...(query
      ? {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { excerpt: { contains: query, mode: 'insensitive' } },
            { content: { contains: query, mode: 'insensitive' } },
          ],
        }
      : {}),
    ...(status === 'published'
      ? { published: true }
      : status === 'draft'
      ? { published: false }
      : {}),
  }

  const [totalCount, items] = await Promise.all([
    prisma.article.count({ where }),
    prisma.article.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    }),
  ])

  const totalPages = Math.max(1, Math.ceil(totalCount / limit))

  return (
    <ArticleList
      items={items}
      totalCount={totalCount}
      currentPage={page}
      totalPages={totalPages}
    />
  )
}
