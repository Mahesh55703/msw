import prisma from '@/lib/prisma'
import Link from 'next/link'

export default async function CareersPage() {
  const jobs = await prisma.jobPosting.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { applications: true } } }
  })

  return (
    <div className="space-y-6">
      <div className="bg-[#12372A] p-6 md:p-8 rounded-2xl shadow-sm text-white flex flex-col sm:flex-row sm:items-center sm:justify-between max-w-[1600px] mx-auto w-full gap-4 border border-[#0D281E]">
        <div>
          <span className="text-[10px] font-bold text-[#D6A84F] uppercase tracking-wider">Talent & Recruitment</span>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">Careers & Job Postings</h1>
          <p className="text-[#A2B3AA] text-xs mt-1">Manage active vacancies, departmental openings, and applicant pipelines.</p>
        </div>
        <div className="shrink-0">
          <Link href="/admin/careers/new" className="inline-flex items-center justify-center px-4 py-2.5 font-bold rounded-xl shadow-xs transition-colors text-xs text-white bg-[#1F7A5C] hover:bg-[#165B44]">
            + Create New Job
          </Link>
        </div>
      </div>
      
      <div className="bg-white shadow-xs border border-[#D9E1DC] overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#D9E1DC] text-xs">
            <thead className="bg-[#F7F4EC] text-[#66736D] uppercase font-bold tracking-wider text-[10px]">
              <tr>
                <th scope="col" className="px-5 py-3.5 text-left font-bold">Position Title</th>
                <th scope="col" className="px-5 py-3.5 text-left font-bold">Status</th>
                <th scope="col" className="px-5 py-3.5 text-left font-bold">Department</th>
                <th scope="col" className="px-5 py-3.5 text-left font-bold">Location</th>
                <th scope="col" className="px-5 py-3.5 text-left font-bold">Applications</th>
                <th scope="col" className="px-5 py-3.5 text-right font-bold">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[#D9E1DC]/60">
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-xs text-[#66736D]">
                    No job postings found. Create your first opening!
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-[#F7F4EC]/60 transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap font-bold text-[#12372A]">{job.title}</td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      {job.isActive ? (
                        <span className="px-2.5 py-0.5 inline-flex text-[10px] leading-5 font-bold rounded-full bg-[#1F7A5C]/10 text-[#1F7A5C] border border-[#1F7A5C]/20">
                          Active Opening
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 inline-flex text-[10px] leading-5 font-bold rounded-full bg-[#F7F4EC] text-[#66736D] border border-[#D9E1DC]">
                          Closed
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-[#66736D]">{job.department}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-[#66736D]">{job.location}</td>
                    <td className="px-5 py-4 whitespace-nowrap font-bold text-[#12372A]">
                      {job._count.applications} applicants
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-right font-bold">
                      <Link href={`/admin/careers/${job.id}`} className="text-[#1F7A5C] hover:text-[#165B44]">
                        View / Edit →
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

