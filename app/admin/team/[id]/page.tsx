import { verifySession } from '@/lib/session'
import { redirect, notFound } from 'next/navigation'
import TeamEditor from '@/components/admin/team/TeamEditor'
import { getPotentialManagers } from '@/app/actions/team'
import { safeFetchTeamMembers } from '@/lib/db/team'

export const dynamic = 'force-dynamic'

export default async function EditTeamMemberPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await verifySession()
  if (!session.isAuth) redirect('/admin/login')

  const { id } = await params

  const { members } = await safeFetchTeamMembers()
  const member = members.find((m) => m.id === id)

  if (!member) notFound()

  // Get available managers excluding self and descendants (cycle prevention)
  const managersRes = await getPotentialManagers(id)
  const availableManagers = managersRes.success ? managersRes.managers : []

  return <TeamEditor initialData={member} availableManagers={availableManagers} />
}
