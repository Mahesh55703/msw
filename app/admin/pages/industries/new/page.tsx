import { verifySession } from '@/lib/session'
import { redirect } from 'next/navigation'
import CreatePageForm from '@/components/admin/pages/CreatePageForm'
import { hasPermission, Role } from '@/lib/rbac'

export default async function CreateIndustryRoute() {
  const session = await verifySession()
  if (!session.isAuth) redirect('/admin/login')
  
  if (!hasPermission(session.role as Role, 'pages:edit')) {
    redirect('/admin/pages')
  }

  return <CreatePageForm type="INDUSTRY" />
}
