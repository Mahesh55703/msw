import prisma from '@/lib/prisma'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function TeamPage() {
  const members = await prisma.teamMember.findMany({
    orderBy: { order: 'asc' }
  })

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-6 rounded-xl shadow-md text-white flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team Management</h1>
          <p className="text-cyan-50 mt-1">Manage your team members and their public profiles.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link href="/admin/team/new" className="inline-flex items-center justify-center px-4 py-2 border border-transparent font-medium rounded-lg text-blue-700 bg-white hover:bg-cyan-50 shadow-sm transition-colors">
            + Add Team Member
          </Link>
        </div>
      </div>
      
      <div className="bg-white shadow-sm border border-gray-100 overflow-hidden rounded-xl">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Photo</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {members.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    No team members found. Add your first team member!
                  </td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {member.imageUrl ? (
                        <img src={member.imageUrl} alt={member.name} className="h-10 w-10 rounded-full object-cover" />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                          {member.name.charAt(0)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{member.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {member.isActive ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Hidden
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/admin/team/${member.id}`} className="text-indigo-600 hover:text-indigo-900">
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}