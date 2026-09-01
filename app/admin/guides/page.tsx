import { verifySession } from '@/lib/session'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import GuideList from '@/components/admin/guides/GuideList'

export default async function GuidesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>
}) {
  const session = await verifySession()
  if (!session.isAuth) redirect('/admin/login')

  const resolvedParams = await searchParams
  const query = resolvedParams.q?.trim() || ''
  const status = resolvedParams.status?.trim() || 'all'
  const page = Math.max(1, parseInt(resolvedParams.page || '1', 10) || 1)
  const pageSize = 20

  const where: Prisma.ArticleWhereInput = {
    category: 'guides',
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

  const [totalCount, guides] = await Promise.all([
    prisma.article.count({ where }),
    prisma.article.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    }),
  ])

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#12372A] p-6 md:p-8 rounded-3xl shadow-sm text-white flex flex-col sm:flex-row sm:items-center sm:justify-between max-w-[1600px] mx-auto w-full gap-4 border border-[#0D281E]">
        <div>
          <span className="text-[10px] font-bold text-[#D6A84F] uppercase tracking-wider">
            CMS Knowledge Base
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">Compliance Guides</h1>
          <p className="text-[#A2B3AA] text-xs mt-1">
            Practical guides for HR, labour compliance and workforce management.
          </p>
        </div>
        <div className="shrink-0">
          <Link
            href="/admin/guides/new"
            className="inline-flex items-center justify-center px-4 py-2.5 font-bold rounded-xl shadow-xs transition-colors text-xs text-white bg-[#1F7A5C] hover:bg-[#165B44]"
          >
            + Create Guide
          </Link>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto w-full">
        <GuideList
          guides={guides}
          totalCount={totalCount}
          currentPage={page}
          pageSize={pageSize}
          currentStatus={status}
          searchQuery={query}
        />
      </div>
    </div>
  )
}
