import { verifySession } from '@/lib/session'
import { redirect } from 'next/navigation'
import TeamEditor from '@/components/admin/team/TeamEditor'
import { safeFetchTeamMembers } from '@/lib/db/team'

export const dynamic = 'force-dynamic'

export default async function NewTeamMemberPage() {
  const session = await verifySession()
  if (!session.isAuth) redirect('/admin/login')

  const { members } = await safeFetchTeamMembers()
  const availableManagers = members.map((m) => ({
    id: m.id,
    name: m.name,
    designation: m.designation,
    department: m.department,
  }))

  return <TeamEditor availableManagers={availableManagers} />
}
