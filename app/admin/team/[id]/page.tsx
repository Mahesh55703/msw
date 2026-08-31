import { verifySession } from "@/lib/session"
import { redirect, notFound } from "next/navigation"
import TeamMemberForm from "@/components/admin/team/TeamMemberForm"
import prisma from "@/lib/prisma"

export default async function EditTeamMemberPage({ params }: { params: { id: string } }) {
  const session = await verifySession()
  if (!session.isAuth) redirect("/admin/login")
    
  const { id } = await params;
  
  const member = await prisma.teamMember.findUnique({
    where: { id }
  })
  
  if (!member) notFound()

  return <TeamMemberForm initialData={member} />
}
