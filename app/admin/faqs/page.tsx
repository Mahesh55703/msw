import prisma from '@/lib/prisma'
import Link from 'next/link'
import FaqList from '@/components/admin/faq/FaqList'
import { Prisma } from '@prisma/client'

export default async function FaqsPage({ searchParams }: { searchParams: Promise<any> }) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.q || ''
  const status = resolvedParams.status || ''
  const category = resolvedParams.category || ''

  const where: Prisma.FaqWhereInput = {
    ...(query ? {
      OR: [
        { question: { contains: query, mode: 'insensitive' } },
        { answer: { contains: query, mode: 'insensitive' } }
      ]
    } : {}),
    ...(status === 'published' ? { published: true } : status === 'draft' ? { published: false } : {}),
    ...(category && category !== 'all' ? { category: category as any } : {})
  }

  const items = await prisma.faq.findMany({
    where,
    orderBy: [
      { category: 'asc' },
      { displayOrder: 'asc' },
      { createdAt: 'desc' }
    ]
  })

  return (
    <div className="space-y-6">
      <div className="bg-[#12372A] p-6 md:p-8 rounded-2xl shadow-sm text-white flex flex-col sm:flex-row sm:items-center sm:justify-between max-w-[1600px] mx-auto w-full gap-4 border border-[#0D281E]">
        <div>
          <span className="text-[10px] font-bold text-[#D6A84F] uppercase tracking-wider">CMS Knowledge Base</span>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">Frequently Asked Questions</h1>
          <p className="text-[#A2B3AA] text-xs mt-1">Manage public compliance FAQs across statutory categories.</p>
        </div>
        <div className="shrink-0">
          <Link href="/admin/faqs/new" className="inline-flex items-center justify-center px-4 py-2.5 font-bold rounded-xl shadow-xs transition-colors text-xs text-white bg-[#1F7A5C] hover:bg-[#165B44]">
            + Add FAQ
          </Link>
        </div>
      </div>
      
      <div className="max-w-[1600px] mx-auto w-full">
        <FaqList items={items} />
      </div>
    </div>
  )
}

