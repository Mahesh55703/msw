import prisma from '@/lib/prisma'
import { verifySession } from '@/lib/session'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { format, subDays } from 'date-fns'
import {
  Users,
  FilePlus,
  Target,
  Award,
  ArrowRight,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  TrendingUp,
  Calendar,
  AlertTriangle,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await verifySession()
  if (!session.isAuth) redirect('/admin/login')

  const user = await prisma.user.findUnique({ where: { id: session.userId as string } })

  // Pipeline counts
  const totalEnquiries = await prisma.enquiry.count()
  const statusCounts = await prisma.enquiry.groupBy({
    by: ['status'],
    _count: { status: true },
  })

  const getCount = (status: string) =>
    statusCounts.find((s) => s.status === status)?._count.status || 0

  const newCount = getCount('NEW')
  const contactedCount = getCount('CONTACTED')
  const qualifiedCount = getCount('QUALIFIED')
  const proposalCount = getCount('PROPOSAL')
  const wonCount = getCount('WON')
  const lostCount = getCount('LOST')

  const conversionRate =
    totalEnquiries > 0 ? Math.round((wonCount / totalEnquiries) * 100) : 0

  // Recent enquiries
  const recentEnquiries = await prisma.enquiry.findMany({
    take: 8,
    orderBy: { createdAt: 'desc' },
  })

  // Enquiries by Service
  const serviceGroups = await prisma.enquiry.groupBy({
    by: ['service'],
    _count: { service: true },
  })

  const serviceStats: Record<string, number> = {}
  serviceGroups.forEach((group) => {
    if (!group.service) return
    const services = group.service.split(',').map((s) => s.trim())
    services.forEach((s) => {
      if (s) {
        serviceStats[s] = (serviceStats[s] || 0) + group._count.service
      }
    })
  })
  const sortedServices = Object.entries(serviceStats).sort((a, b) => b[1] - a[1])

  // Follow-ups & Action Items Calculation
  const allEnquiriesWithDetails = await prisma.enquiry.findMany({
    where: { status: { notIn: ['WON', 'LOST'] } },
    select: { id: true, referenceNumber: true, name: true, company: true, sourceDetails: true, createdAt: true, status: true },
  })

  const todayStr = new Date().toISOString().slice(0, 10)
  const overdueFollowUps: any[] = []
  const todayFollowUps: any[] = []
  const upcomingFollowUps: any[] = []

  allEnquiriesWithDetails.forEach((e) => {
    try {
      if (e.sourceDetails) {
        const d = JSON.parse(e.sourceDetails)
        if (d.nextFollowUpAt) {
          const dateStr = d.nextFollowUpAt.slice(0, 10)
          if (dateStr < todayStr) {
            overdueFollowUps.push({ ...e, followUpDate: dateStr })
          } else if (dateStr === todayStr) {
            todayFollowUps.push({ ...e, followUpDate: dateStr })
          } else {
            upcomingFollowUps.push({ ...e, followUpDate: dateStr })
          }
        }
      }
    } catch {}
  })

  // Stale New Enquiries (> 24 hours without contact)
  const staleNew = await prisma.enquiry.findMany({
    where: { status: 'NEW', createdAt: { lt: subDays(new Date(), 1) } },
    orderBy: { createdAt: 'asc' },
    take: 3,
  })

  return (
    <div className="space-y-8 w-full max-w-[1600px] mx-auto">
      {/* Welcome Banner */}
      <div className="bg-[#12372A] p-8 md:p-10 rounded-3xl text-white relative overflow-hidden shadow-lg border border-[#0D281E]">
        <div className="absolute inset-0 bg-grid-forest opacity-30 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#1F7A5C]/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#D6A84F] uppercase tracking-wider mb-3 bg-[#1B4E3C]/80 border border-[#D6A84F]/30 px-3.5 py-1.5 rounded-full">
              <Clock className="w-3.5 h-3.5" />
              <span>{format(new Date(), 'EEEE, dd MMMM yyyy')}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
              Welcome back, {user?.name?.split(' ')[0] || 'Administrator'}
            </h1>
            <p className="text-[#A2B3AA] mt-2 text-sm md:text-base max-w-2xl">
              LabourAxis operational dashboard. Track enterprise consultation leads, manage follow-ups, and monitor conversion pipelines.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 shrink-0">
            <Link
              href="/admin/enquiries"
              className="px-5 py-3 rounded-2xl bg-[#1F7A5C] hover:bg-[#165B44] text-white font-bold text-xs tracking-wide transition-all shadow-sm flex items-center gap-2"
            >
              <span>Manage Enquiries ({newCount} New)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {/* Total Leads */}
        <div className="bg-white p-5 rounded-3xl border border-[#D9E1DC] shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-3">
            <p className="text-xs font-bold text-[#66736D] uppercase tracking-wider">Total Leads</p>
            <div className="w-9 h-9 rounded-xl bg-[#F7F4EC] border border-[#D9E1DC] flex items-center justify-center text-[#12372A]">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-bold text-[#12372A] tracking-tight">{totalEnquiries}</span>
          </div>
          <p className="text-[11px] text-[#66736D] mt-2 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#1F7A5C]" />
            <span>All-time consultation leads</span>
          </p>
        </div>

        {/* New Leads */}
        <div className="bg-white p-5 rounded-3xl border border-[#D9E1DC] shadow-xs flex flex-col justify-between hover:shadow-md transition-all relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#D6A84F]"></div>
          <div className="flex justify-between items-start mb-3">
            <p className="text-xs font-bold text-[#D6A84F] uppercase tracking-wider">New Leads</p>
            <div className="w-9 h-9 rounded-xl bg-[#D6A84F]/15 border border-[#D6A84F]/30 flex items-center justify-center text-[#9E731E]">
              <FilePlus className="h-4 w-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-bold text-[#12372A] tracking-tight">{newCount}</span>
          </div>
          <p className="text-[11px] text-[#9E731E] mt-2 font-semibold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#D6A84F] animate-pulse"></span>
            <span>Needs initial contact</span>
          </p>
        </div>

        {/* Qualified */}
        <div className="bg-white p-5 rounded-3xl border border-[#D9E1DC] shadow-xs flex flex-col justify-between hover:shadow-md transition-all relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#1F7A5C]"></div>
          <div className="flex justify-between items-start mb-3">
            <p className="text-xs font-bold text-[#1F7A5C] uppercase tracking-wider">Qualified</p>
            <div className="w-9 h-9 rounded-xl bg-[#1F7A5C]/10 border border-[#1F7A5C]/20 flex items-center justify-center text-[#1F7A5C]">
              <Target className="h-4 w-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-bold text-[#12372A] tracking-tight">{qualifiedCount}</span>
          </div>
          <p className="text-[11px] text-[#1F7A5C] mt-2 font-medium">
            Active requirements discussion
          </p>
        </div>

        {/* Proposals */}
        <div className="bg-white p-5 rounded-3xl border border-[#D9E1DC] shadow-xs flex flex-col justify-between hover:shadow-md transition-all relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500"></div>
          <div className="flex justify-between items-start mb-3">
            <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">Proposals</p>
            <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-bold text-[#12372A] tracking-tight">{proposalCount}</span>
          </div>
          <p className="text-[11px] text-amber-700 mt-2 font-medium">
            Proposals awaiting decision
          </p>
        </div>

        {/* Converted Won */}
        <div className="bg-white p-5 rounded-3xl border border-[#D9E1DC] shadow-xs flex flex-col justify-between hover:shadow-md transition-all relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#12372A]"></div>
          <div className="flex justify-between items-start mb-3">
            <p className="text-xs font-bold text-[#12372A] uppercase tracking-wider">Won ({conversionRate}%)</p>
            <div className="w-9 h-9 rounded-xl bg-[#12372A]/10 border border-[#12372A]/20 flex items-center justify-center text-[#12372A]">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-bold text-[#12372A] tracking-tight">{wonCount}</span>
          </div>
          <p className="text-[11px] text-[#12372A] mt-2 font-medium">
            Successfully retained clients
          </p>
        </div>
      </div>

      {/* Main Operational CRM Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Pipeline & Follow-ups (lg:col-span-1) */}
        <div className="lg:col-span-1 space-y-6">
          {/* Pipeline Breakdown */}
          <div className="bg-white rounded-3xl border border-[#D9E1DC] shadow-xs p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#D9E1DC]/80">
              <h2 className="text-sm font-bold text-[#12372A] tracking-tight">Lead Conversion Pipeline</h2>
              <span className="text-xs font-bold text-[#66736D] bg-[#F7F4EC] px-2.5 py-1 rounded-full border border-[#D9E1DC]">
                {totalEnquiries} Total
              </span>
            </div>

            <div className="space-y-3.5">
              {[
                { label: 'New', count: newCount, color: 'bg-[#D6A84F]' },
                { label: 'Contacted', count: contactedCount, color: 'bg-slate-400' },
                { label: 'Qualified', count: qualifiedCount, color: 'bg-[#1F7A5C]' },
                { label: 'Proposal Sent', count: proposalCount, color: 'bg-amber-500' },
                { label: 'Won (Signed)', count: wonCount, color: 'bg-[#12372A]' },
                { label: 'Lost / Inactive', count: lostCount, color: 'bg-rose-500' },
              ].map((stage) => {
                const max = Math.max(1, totalEnquiries)
                const percentage = Math.round((stage.count / max) * 100)
                return (
                  <div key={stage.label} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-[#202522]">{stage.label}</span>
                      <span className="text-[#12372A]">
                        {stage.count} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-[#F7F4EC] rounded-full h-2 overflow-hidden border border-[#D9E1DC]/60">
                      <div
                        className={`${stage.color} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${Math.max(percentage > 0 ? 5 : 0, percentage)}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Follow-up Operational Widget */}
          <div className="bg-white rounded-3xl border border-[#D9E1DC] shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#D9E1DC]/80">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#1F7A5C]" />
                <h2 className="text-sm font-bold text-[#12372A]">Scheduled Follow-ups</h2>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 bg-rose-50 rounded-2xl border border-rose-100">
                <span className="text-xs text-rose-700 font-bold uppercase block">Overdue</span>
                <span className="text-xl font-bold text-rose-800">{overdueFollowUps.length}</span>
              </div>
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100">
                <span className="text-xs text-amber-700 font-bold uppercase block">Today</span>
                <span className="text-xl font-bold text-amber-800">{todayFollowUps.length}</span>
              </div>
              <div className="p-3 bg-[#F7F4EC] rounded-2xl border border-[#D9E1DC]">
                <span className="text-xs text-[#66736D] font-bold uppercase block">Upcoming</span>
                <span className="text-xl font-bold text-[#12372A]">{upcomingFollowUps.length}</span>
              </div>
            </div>

            {overdueFollowUps.length === 0 && todayFollowUps.length === 0 && (
              <div className="text-center py-4 text-xs text-[#66736D] bg-[#F7F4EC]/50 rounded-2xl p-3">
                <CheckCircle2 className="w-5 h-5 text-[#1F7A5C] mx-auto mb-1" />
                All lead follow-ups are up to date!
              </div>
            )}

            {overdueFollowUps.slice(0, 3).map((item) => (
              <Link
                key={item.id}
                href={`/admin/enquiries/${item.id}`}
                className="flex items-center justify-between p-3 rounded-2xl bg-rose-50/60 border border-rose-100 hover:bg-rose-100 transition-colors text-xs"
              >
                <div>
                  <div className="font-bold text-[#12372A]">{item.company || item.name}</div>
                  <div className="text-[11px] text-rose-700">Follow-up was due: {item.followUpDate}</div>
                </div>
                <ChevronRight className="w-4 h-4 text-rose-500" />
              </Link>
            ))}
          </div>
        </div>

        {/* Right Column: Recent Enquiries & Popular Services (lg:col-span-2) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Enquiries Table */}
          <div className="bg-white rounded-3xl border border-[#D9E1DC] shadow-xs overflow-hidden">
            <div className="p-6 border-b border-[#D9E1DC]/80 flex justify-between items-center bg-[#F7F4EC]/40">
              <div>
                <h2 className="text-sm font-bold text-[#12372A]">Recent Consultation Enquiries</h2>
                <p className="text-xs text-[#66736D] mt-0.5">Latest corporate consultation submissions</p>
              </div>
              <Link
                href="/admin/enquiries"
                className="text-xs font-bold text-[#1F7A5C] hover:text-[#165B44] flex items-center gap-1 transition-colors"
              >
                <span>View all inbox</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#D9E1DC] text-xs">
                <thead className="bg-[#F7F4EC] text-[#66736D] uppercase font-bold tracking-wider text-[10px]">
                  <tr>
                    <th className="px-5 py-3.5 text-left">Ref</th>
                    <th className="px-5 py-3.5 text-left">Company / Name</th>
                    <th className="px-5 py-3.5 text-left">Service</th>
                    <th className="px-5 py-3.5 text-center">Status</th>
                    <th className="px-5 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9E1DC]/60 bg-white">
                  {recentEnquiries.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-xs text-[#66736D]">
                        No client enquiries received yet.
                      </td>
                    </tr>
                  ) : (
                    recentEnquiries.map((enquiry) => (
                      <tr key={enquiry.id} className="hover:bg-[#F7F4EC]/60 transition-colors">
                        <td className="px-5 py-4 whitespace-nowrap font-mono font-bold text-[#12372A]">
                          <Link href={`/admin/enquiries/${enquiry.id}`} className="text-[#1F7A5C] hover:underline">
                            {enquiry.referenceNumber}
                          </Link>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap font-bold text-[#12372A]">
                          {enquiry.company || enquiry.name}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-[#66736D] truncate max-w-[180px]">
                          {enquiry.service || 'General Enquiry'}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              enquiry.status === 'NEW'
                                ? 'bg-[#D6A84F]/15 text-[#9E731E] border border-[#D6A84F]/30'
                                : enquiry.status === 'QUALIFIED'
                                ? 'bg-[#1F7A5C]/10 text-[#1F7A5C] border border-[#1F7A5C]/20'
                                : enquiry.status === 'WON'
                                ? 'bg-[#12372A]/10 text-[#12372A] border border-[#12372A]/20'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {enquiry.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-right">
                          <Link
                            href={`/admin/enquiries/${enquiry.id}`}
                            className="text-xs font-bold text-[#1F7A5C] hover:text-[#165B44]"
                          >
                            Details →
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Enquiries by Service Distribution */}
          <div className="bg-white rounded-3xl border border-[#D9E1DC] shadow-xs p-6 space-y-4">
            <h2 className="text-sm font-bold text-[#12372A] pb-2 border-b border-[#D9E1DC]/80">
              Demand by Compliance Service
            </h2>
            {sortedServices.length === 0 ? (
              <p className="text-xs text-[#66736D]">No service breakdown recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {sortedServices.slice(0, 6).map(([service, count]) => {
                  const max = sortedServices[0][1]
                  const percentage = Math.round((count / max) * 100)
                  return (
                    <div key={service} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-[#202522] truncate max-w-[260px]">{service}</span>
                        <span className="text-[#12372A]">
                          {count} lead{count === 1 ? '' : 's'}
                        </span>
                      </div>
                      <div className="w-full bg-[#F7F4EC] rounded-full h-2 overflow-hidden border border-[#D9E1DC]/60">
                        <div
                          className="bg-[#1F7A5C] h-2 rounded-full"
                          style={{ width: `${Math.max(8, percentage)}%` }}
                        ></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
