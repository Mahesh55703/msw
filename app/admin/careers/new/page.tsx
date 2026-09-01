import { verifySession } from '@/lib/session'
import { redirect } from 'next/navigation'
import JobEditor from '@/components/admin/careers/JobEditor'

export const dynamic = 'force-dynamic'

export default async function NewCareerJobPage() {
  const session = await verifySession()
  if (!session.isAuth) redirect('/admin/login')

  return <JobEditor />
}
