import { UserForm } from '../UserForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { getUser } from '@/app/actions/users'
import { verifySession } from '@/lib/session'
import { hasPermission, Role } from '@/lib/rbac'
import { redirect, notFound } from 'next/navigation'

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await verifySession()
  if (!session.isAuth || !hasPermission(session.role as Role, 'users:manage')) {
    redirect('/admin/users')
  }

  const user = await getUser(id)
  if (!user) notFound()

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/users" className="text-sm text-[#1F7A5C] hover:underline flex items-center mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Users
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-[#12372A]">Edit User</h1>
        <p className="text-sm text-[#66736D] mt-1">
          Update account details, role, or active status.
        </p>
      </div>
      
      <UserForm initialData={user} isEditing />
    </div>
  )
}
