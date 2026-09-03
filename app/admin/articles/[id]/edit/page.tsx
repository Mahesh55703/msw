import { verifySession } from '@/lib/session'
import { redirect, notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import ArticleEditor from '@/components/admin/articles/ArticleEditor'

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await verifySession()
  if (!session.isAuth) redirect('/admin/login')

  const resolvedParams = await params
  const [article, users, services] = await Promise.all([
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
    prisma.page.findMany({
      where: { path: { startsWith: '/services/' }, status: 'PUBLISHED' },
      select: { path: true, publishedRevision: { select: { seoTitle: true } } }
    }),
  ])

  if (!article) notFound()

  const availableServices = services.map(s => ({
    slug: s.path.replace('/services/', ''),
    title: s.publishedRevision?.seoTitle?.split(' |')[0] || s.path.replace('/services/', '').replace(/-/g, ' ')
  }))

  return <ArticleEditor initialData={article} users={users} availableServices={availableServices} />
}
