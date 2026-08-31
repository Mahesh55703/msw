import prisma from '@/lib/prisma'
import Link from 'next/link'

export default async function TeamPage() {
  const members = await prisma.teamMember.findMany({
    orderBy: { order: 'asc' }
  })

  return (
    <div className="space-y-6">
      <div className="bg-[#12372A] p-6 md:p-8 rounded-2xl shadow-sm text-white flex flex-col sm:flex-row sm:items-center sm:justify-between max-w-[1600px] mx-auto w-full gap-4 border border-[#0D281E]">
        <div>
          <span className="text-[10px] font-bold text-[#D6A84F] uppercase tracking-wider">Organizational Management</span>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">Team & Leadership Directory</h1>
          <p className="text-[#A2B3AA] text-xs mt-1">Manage public executive profiles and advisory team listings.</p>
        </div>
        <div className="shrink-0">
          <Link href="/admin/team/new" className="inline-flex items-center justify-center px-4 py-2.5 font-bold rounded-xl shadow-xs transition-colors text-xs text-white bg-[#1F7A5C] hover:bg-[#165B44]">
            + Add Team Member
          </Link>
        </div>
      </div>
      
      <div className="bg-white shadow-xs border border-[#D9E1DC] overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#D9E1DC] text-xs">
            <thead className="bg-[#F7F4EC] text-[#66736D] uppercase font-bold tracking-wider text-[10px]">
              <tr>
                <th scope="col" className="px-5 py-3.5 text-left font-bold">Photo</th>
                <th scope="col" className="px-5 py-3.5 text-left font-bold">Name</th>
                <th scope="col" className="px-5 py-3.5 text-left font-bold">Role / Title</th>
                <th scope="col" className="px-5 py-3.5 text-left font-bold">Status</th>
                <th scope="col" className="px-5 py-3.5 text-right font-bold">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[#D9E1DC]/60">
              {members.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-xs text-[#66736D]">
                    No team members found in the directory.
                  </td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr key={member.id} className="hover:bg-[#F7F4EC]/60 transition-colors">
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {member.imageUrl ? (
                        <img src={member.imageUrl} alt={member.name} className="h-9 w-9 rounded-xl object-cover border border-[#D9E1DC]" />
                      ) : (
                        <div className="h-9 w-9 rounded-xl bg-[#F7F4EC] border border-[#D9E1DC] flex items-center justify-center font-bold text-xs text-[#12372A]">
                          {member.name.charAt(0)}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap font-bold text-[#12372A]">{member.name}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-[#66736D]">{member.role}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {member.isActive ? (
                        <span className="px-2.5 py-0.5 inline-flex text-[10px] leading-5 font-bold rounded-full bg-[#1F7A5C]/10 text-[#1F7A5C] border border-[#1F7A5C]/20">
                          Active
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 inline-flex text-[10px] leading-5 font-bold rounded-full bg-[#F7F4EC] text-[#66736D] border border-[#D9E1DC]">
                          Hidden
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-right font-bold">
                      <Link href={`/admin/team/${member.id}`} className="text-[#1F7A5C] hover:text-[#165B44]">
                        Edit →
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