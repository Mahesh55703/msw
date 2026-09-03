import { getUsers } from '@/app/actions/users'
import Link from 'next/link'
import { Plus, Search, Shield, User, CircleDot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { verifySession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { hasPermission, Role } from '@/lib/rbac'

export default async function UsersPage() {
  const session = await verifySession()
  if (!session.isAuth || !hasPermission(session.role as Role, 'users:view')) {
    redirect('/admin/dashboard')
  }

  const users = await getUsers()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#12372A]">Users & Roles</h1>
          <p className="text-sm text-[#66736D] mt-1">
            Manage administrative access and permissions.
          </p>
        </div>
        <Link href="/admin/users/new" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-[#1F7A5C] text-white shadow hover:bg-[#165B44] h-9 px-4 py-2">
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#D9E1DC] overflow-hidden">
        <div className="p-4 border-b border-[#D9E1DC] bg-[#F7F4EC]/50 flex items-center justify-between">
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search users..." 
              className="pl-9 bg-white border-[#D9E1DC]"
            />
          </div>
          {/* Mock filters for visual completeness */}
          <div className="flex gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white border border-[#D9E1DC]">All Roles</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white border border-[#D9E1DC]">Active Only</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-[#66736D] uppercase bg-[#F7F4EC]/30 border-b border-[#D9E1DC]">
              <tr>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Created</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-[#D9E1DC]/50 hover:bg-[#F7F4EC]/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#E8F0EB] flex items-center justify-center text-[#1F7A5C]">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-[#12372A]">{user.name}</div>
                        <div className="text-xs text-[#66736D]">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      user.role === 'SUPER_ADMIN' ? 'bg-amber-100 text-amber-800' :
                      user.role === 'ADMIN' ? 'bg-blue-100 text-blue-800' :
                      'bg-slate-100 text-slate-800'
                    }`}>
                      {user.role === 'SUPER_ADMIN' && <Shield className="w-3 h-3 mr-1" />}
                      {user.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <CircleDot className={`w-3 h-3 ${user.isActive ? 'text-emerald-500' : 'text-slate-300'}`} />
                      <span className={user.isActive ? 'text-emerald-700' : 'text-slate-500'}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[#66736D]">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/admin/users/${user.id}`} className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-[#E8F0EB] text-[#1F7A5C] hover:text-[#165B44] h-8 rounded-md px-3 text-xs">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[#66736D]">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
