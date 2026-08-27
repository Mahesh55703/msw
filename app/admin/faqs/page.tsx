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
      <div className="bg-gradient-to-r from-purple-500 to-fuchsia-600 p-6 rounded-xl shadow-md text-white flex flex-col sm:flex-row sm:items-center sm:justify-between max-w-[1600px] mx-auto w-full gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">FAQs</h1>
          <p className="text-purple-50 mt-1">Manage frequently asked questions displayed on the public FAQ page.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link href="/admin/faqs/new" className="inline-flex items-center justify-center px-4 py-2 border border-transparent font-medium rounded-lg shadow-sm transition-colors text-fuchsia-700 bg-white hover:bg-purple-50">
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
