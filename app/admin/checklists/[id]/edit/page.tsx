import { verifySession } from '@/lib/session'
import { redirect, notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import ChecklistEditor from '@/components/admin/checklists/ChecklistEditor'

interface EditChecklistPageProps {
  params: Promise<{ id: string }>
}

export default async function EditChecklistPage({ params }: EditChecklistPageProps) {
  const session = await verifySession()
  if (!session.isAuth) {
    redirect('/admin/login')
  }

  const resolvedParams = await params
  const [checklist, users] = await Promise.all([
    prisma.article.findUnique({
      where: { id: resolvedParams.id },
      include: {
        relatedServices: { orderBy: { sortOrder: 'asc' } },
        relatedFrom: {
          orderBy: { sortOrder: 'asc' },
          include: {
            toArticle: {
              select: {
                id: true,
                title: true,
                slug: true,
                category: true,
                published: true,
              },
            },
          },
        },
      },
    }),
    prisma.user.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
  ])

  if (!checklist) {
    notFound()
  }

  return <ChecklistEditor initialData={checklist} users={users} />
}
