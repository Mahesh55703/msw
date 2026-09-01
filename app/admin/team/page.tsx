import { verifySession } from '@/lib/session'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import TeamList from '@/components/admin/team/TeamList'
import { safeFetchTeamMembers } from '@/lib/db/team'

export const dynamic = 'force-dynamic'

export default async function AdminTeamPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }> | { [key: string]: string | undefined }
}) {
  const session = await verifySession()
  if (!session.isAuth) redirect('/admin/login')

  const resolvedParams = (await searchParams) || {}
  const query = (resolvedParams.q || '').trim()
  const status = resolvedParams.status || 'all'
  const dept = resolvedParams.dept || 'all'
  const page = Math.max(1, parseInt(resolvedParams.page || '1', 10))
  const pageSize = 20

  const { members, totalCount, activeCount, inactiveCount, departments } =
    await safeFetchTeamMembers({
      where: {
        query,
        status,
        dept,
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    })

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto w-full">
      {/* Header Banner */}
      <div className="bg-[#12372A] p-6 md:p-8 rounded-3xl shadow-sm text-white flex flex-col sm:flex-row sm:items-center sm:justify-between border border-[#0D281E] gap-4">
        <div>
          <span className="text-[10px] font-bold text-[#D6A84F] uppercase tracking-wider">
            Organizational Hierarchy & Directory
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
            Team Members
          </h1>
          <p className="text-[#A2B3AA] text-xs sm:text-sm mt-1">
            Manage LabourAxis team profiles, roles and organizational structure ({activeCount} active, {inactiveCount} inactive).
          </p>
        </div>
        <div className="shrink-0">
          <Link
            href="/admin/team/new"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 font-bold rounded-xl shadow-xs transition-colors text-xs text-white bg-[#1F7A5C] hover:bg-[#165B44]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Team Member</span>
          </Link>
        </div>
      </div>

      {/* Main Team List Card */}
      <div className="bg-white shadow-xs border border-[#D9E1DC] overflow-hidden rounded-3xl p-6">
        <TeamList
          initialMembers={members as any}
          totalCount={totalCount}
          currentPage={page}
          pageSize={pageSize}
          departments={departments}
          currentFilters={{
            q: query,
            status,
            dept,
          }}
        />
      </div>
    </div>
  )
}