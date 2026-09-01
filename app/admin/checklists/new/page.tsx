import { verifySession } from '@/lib/session'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import ChecklistEditor from '@/components/admin/checklists/ChecklistEditor'

export default async function NewChecklistPage() {
  const session = await verifySession()
  if (!session.isAuth) {
    redirect('/admin/login')
  }

  const users = await prisma.user.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })

  return <ChecklistEditor users={users} />
}
