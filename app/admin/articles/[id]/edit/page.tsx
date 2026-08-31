import { verifySession } from '@/lib/session'
import { redirect, notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import CmsForm from '@/components/admin/cms/CmsForm'

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await verifySession()
  if (!session.isAuth) redirect('/admin/login')

  const resolvedParams = await params
  const article = await prisma.article.findUnique({ where: { id: resolvedParams.id } })
  if (!article) notFound()

  const users = await prisma.user.findMany({ select: { id: true, name: true } });
  return <CmsForm users={users} category="articles" initialData={article} />
}
