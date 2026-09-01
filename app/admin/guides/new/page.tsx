import prisma from '@/lib/prisma'
import { verifySession } from '@/lib/session'
import { redirect } from 'next/navigation'
import GuideEditor from '@/components/admin/guides/GuideEditor'

export default async function NewGuidePage() {
  const session = await verifySession()
  if (!session.isAuth) redirect('/admin/login')

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true },
    orderBy: { name: 'asc' },
  })

  return <GuideEditor users={users} />
}
