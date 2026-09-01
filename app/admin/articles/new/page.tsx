import prisma from '@/lib/prisma'
import { verifySession } from '@/lib/session'
import { redirect } from 'next/navigation'
import ArticleEditor from '@/components/admin/articles/ArticleEditor'

export default async function NewArticlePage() {
  const session = await verifySession()
  if (!session.isAuth) redirect('/admin/login')

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true },
    orderBy: { name: 'asc' },
  })

  return <ArticleEditor users={users} />
}
