import prisma from '@/lib/prisma'
import Link from 'next/link'
import FaqList from '@/components/admin/faq/FaqList'
import { Prisma } from '@prisma/client'
import { verifySession } from '@/lib/session'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function FaqsAdminPage({ searchParams }: { searchParams: Promise<any> }) {
  const session = await verifySession()
  if (!session.isAuth) {
    redirect('/admin/login')
  }

  const resolvedParams = await searchParams
  const query = (resolvedParams.q || '').trim()
  const status = resolvedParams.status || ''
  const category = resolvedParams.category || ''

  const where: Prisma.FaqWhereInput = {
    ...(query
      ? {
          OR: [
            { question: { contains: query, mode: 'insensitive' } },
            { answer: { contains: query, mode: 'insensitive' } },
          ] as any,
        }
      : {}),
    ...(status === 'published' ? { published: true } : status === 'draft' ? { published: false } : {}),
    ...(category && category !== 'all' ? { category: category as any } : {}),
  }

  const [items, totalCount, uncategorizedCount] = await Promise.all([
    prisma.faq.findMany({
      where,
      orderBy: [
        { category: 'asc' },
        { displayOrder: 'asc' },
        { createdAt: 'desc' },
      ],
    }),
    prisma.faq.count(),
    prisma.faq.count({ where: { category: 'UNCATEGORIZED' } }),
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
            FAQs
          </h1>
          <p className="text-[#A2B3AA] text-xs sm:text-sm mt-1">
            Manage frequently asked questions across HR, labour compliance and workforce management.
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-3">
          <Link
            href="/admin/faqs/new"
            className="inline-flex items-center justify-center px-5 py-3 font-bold rounded-2xl shadow-xs transition-all text-xs text-white bg-[#1F7A5C] hover:bg-[#165B44] hover:shadow-md"
          >
            + Add FAQ
          </Link>
        </div>
      </div>

      {/* Uncategorized Alert Banner if any */}
      {uncategorizedCount > 0 && (
        <div className="max-w-[1600px] mx-auto w-full bg-amber-500/10 border border-amber-500/30 text-amber-900 rounded-2xl p-4 flex items-center justify-between text-xs font-semibold">
          <span>
            ⚠️ <strong>{uncategorizedCount} FAQ(s)</strong> are currently marked as Uncategorized. Please assign appropriate categories.
          </span>
          <Link
            href="/admin/faqs?category=UNCATEGORIZED"
            className="px-3 py-1.5 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 transition-colors"
          >
            Review Uncategorized
          </Link>
        </div>
      )}

      {/* FAQ Data Table */}
      <div className="max-w-[1600px] mx-auto w-full">
        <FaqList
          items={items}
          totalCount={totalCount}
          currentQuery={query}
          currentCategory={category}
          currentStatus={status}
        />
      </div>
    </div>
  )
}
