import { verifySession } from '@/lib/session'
import { redirect, notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import GuideEditor from '@/components/admin/guides/GuideEditor'

export default async function EditGuidePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await verifySession()
  if (!session.isAuth) redirect('/admin/login')

  const resolvedParams = await params
  const [guide, users] = await Promise.all([
    prisma.article.findUnique({
      where: { id: resolvedParams.id },
      include: {
        author: { select: { id: true, name: true, email: true } },
        keyTakeaways: { orderBy: { sortOrder: 'asc' } },
        relatedServices: { orderBy: { sortOrder: 'asc' } },
        relatedFrom: {
          orderBy: { sortOrder: 'asc' },
          include: {
            toArticle: {
              select: { id: true, title: true, slug: true, category: true, published: true },
            },
          },
        },
      },
    }),
    prisma.user.findMany({
      select: { id: true, name: true, email: true },
      orderBy: { name: 'asc' },
    }),
  ])

  if (!guide) notFound()

  return <GuideEditor initialData={guide} users={users} />
}
