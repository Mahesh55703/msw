import { verifySession } from "@/lib/session"
import { redirect } from "next/navigation"
import TeamMemberForm from "@/components/admin/team/TeamMemberForm"

export default async function NewTeamMemberPage() {
  const session = await verifySession()
  if (!session.isAuth) redirect("/admin/login")
  return <TeamMemberForm />
}
