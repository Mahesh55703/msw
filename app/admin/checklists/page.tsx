import Link from 'next/link'
import prisma from '@/lib/prisma'
import { verifySession } from '@/lib/session'
import { redirect } from 'next/navigation'
import ChecklistList from '@/components/admin/checklists/ChecklistList'

export const dynamic = 'force-dynamic'

interface AdminChecklistsPageProps {
  searchParams: Promise<{
    page?: string
    status?: string
    q?: string
  }>
}

export default async function AdminChecklistsPage({ searchParams }: AdminChecklistsPageProps) {
  const session = await verifySession()
  if (!session.isAuth) {
    redirect('/admin/login')
  }

  const resolvedSearchParams = await searchParams
  const currentPage = Math.max(1, parseInt(resolvedSearchParams.page || '1', 10) || 1)
  const pageSize = 20
  const statusFilter = resolvedSearchParams.status || 'all'
  const searchQuery = (resolvedSearchParams.q || '').trim()

  // Build Prisma Filter Query
  const where: any = {
    category: { in: ['checklists', 'checklist'] },
  }

  if (statusFilter === 'published') {
    where.published = true
  } else if (statusFilter === 'draft') {
    where.published = false
  }

  if (searchQuery) {
    where.OR = [
      { title: { contains: searchQuery, mode: 'insensitive' } },
      { excerpt: { contains: searchQuery, mode: 'insensitive' } },
      { content: { contains: searchQuery, mode: 'insensitive' } },
      { slug: { contains: searchQuery, mode: 'insensitive' } },
    ]
  }

  // Fetch paginated records and total count in parallel
  const [totalCount, checklists] = await Promise.all([
    prisma.article.count({ where }),
    prisma.article.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        content: true,
        published: true,
        publishedAt: true,
        scheduledAt: true,
        updatedAt: true,
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
            Compliance Checklists
          </h1>
          <p className="text-[#A2B3AA] text-xs sm:text-sm mt-1">
            Practical compliance checklists for HR, factory regulations, PF/ESIC, and workforce management.
          </p>
        </div>
        <div className="shrink-0">
          <Link
            href="/admin/checklists/new"
            className="inline-flex items-center justify-center px-5 py-3 font-bold rounded-2xl shadow-xs transition-all text-xs text-white bg-[#1F7A5C] hover:bg-[#165B44] hover:shadow-md"
          >
            + Create Checklist
          </Link>
        </div>
      </div>

      {/* Paginated List */}
      <div className="max-w-[1600px] mx-auto w-full">
        <ChecklistList
          checklists={checklists}
          totalCount={totalCount}
          currentPage={currentPage}
          pageSize={pageSize}
          currentStatus={statusFilter}
          searchQuery={searchQuery}
        />
      </div>
    </div>
  )
}
