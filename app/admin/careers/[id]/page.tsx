import { verifySession } from '@/lib/session'
import { redirect, notFound } from 'next/navigation'
import JobEditor from '@/components/admin/careers/JobEditor'
import { safeFetchJobById } from '@/lib/db/careers'

export const dynamic = 'force-dynamic'

export default async function EditCareerJobPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await verifySession()
  if (!session.isAuth) redirect('/admin/login')

  const { id } = await params
  const job = await safeFetchJobById(id)

  if (!job) notFound()

  return <JobEditor initialData={job} />
}
