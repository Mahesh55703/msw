import { verifySession } from '@/lib/session'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Briefcase } from 'lucide-react'
import JobList from '@/components/admin/careers/JobList'
import { safeFetchJobs } from '@/lib/db/careers'

export const dynamic = 'force-dynamic'

export default async function AdminCareersPage({
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

  const {
    jobs,
    totalCount,
    draftCount,
    publishedCount,
    closedCount,
    expiredCount,
    departments,
  } = await safeFetchJobs({
    where: {
      query,
      status,
      department: dept,
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
            Talent & Recruitment
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
            Careers
          </h1>
          <p className="text-[#A2B3AA] text-xs sm:text-sm mt-1">
            Manage current and future career opportunities ({publishedCount} published, {draftCount} draft, {closedCount} closed).
          </p>
        </div>
        <div className="shrink-0">
          <Link
            href="/admin/careers/new"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 font-bold rounded-xl shadow-xs transition-colors text-xs text-white bg-[#1F7A5C] hover:bg-[#165B44]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Job</span>
          </Link>
        </div>
      </div>

      {/* Main Jobs List Card */}
      <div className="bg-white shadow-xs border border-[#D9E1DC] overflow-hidden rounded-3xl p-6">
        <JobList
          initialJobs={jobs}
          totalCount={totalCount}
          draftCount={draftCount}
          publishedCount={publishedCount}
          closedCount={closedCount}
          expiredCount={expiredCount}
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
