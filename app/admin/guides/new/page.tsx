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

  const services = await prisma.page.findMany({
    where: { path: { startsWith: '/services/' }, status: 'PUBLISHED' },
    select: { path: true, publishedRevision: { select: { seoTitle: true } } }
  })
  
  const availableServices = services.map(s => ({
    slug: s.path.replace('/services/', ''),
    title: s.publishedRevision?.seoTitle?.split(' |')[0] || s.path.replace('/services/', '').replace(/-/g, ' ')
  }))

  return <GuideEditor users={users} availableServices={availableServices} />
}
