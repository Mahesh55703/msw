import prisma from '@/lib/prisma'
import { verifySession } from '@/lib/session'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { format, subDays } from 'date-fns'
import { Users, FilePlus, Target, Award, ArrowRight, ShieldCheck, Clock, CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react'

export default async function DashboardPage() {
  const session = await verifySession()
  if (!session.isAuth) redirect('/admin/login')

  const user = await prisma.user.findUnique({ where: { id: session.userId as string } })

  // Pipeline counts
  const totalEnquiries = await prisma.enquiry.count()
  const statusCounts = await prisma.enquiry.groupBy({
    by: ['status'],
    _count: { status: true }
  })

  const getCount = (status: string) => statusCounts.find(s => s.status === status)?._count.status || 0

  const newCount = getCount('NEW')
  const contactedCount = getCount('CONTACTED')
  const qualifiedCount = getCount('QUALIFIED')
  const proposalCount = getCount('PROPOSAL')
  const wonCount = getCount('WON')

  // Recent enquiries
  const recentEnquiries = await prisma.enquiry.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' }
  })

  // Enquiries by Service
  const serviceGroups = await prisma.enquiry.groupBy({
    by: ['service'],
    _count: { service: true }
  })
  
  // Format services (handling comma separated strings or empty strings)
  const serviceStats: Record<string, number> = {}
  serviceGroups.forEach(group => {
    if (!group.service) return
    const services = group.service.split(',').map(s => s.trim())
    services.forEach(s => {
      if (s) {
        serviceStats[s] = (serviceStats[s] || 0) + group._count.service
      }
    })
  })
  const sortedServices = Object.entries(serviceStats).sort((a, b) => b[1] - a[1])

  // Needs Attention
  const needsAttention = []
  
  const staleNew = await prisma.enquiry.findMany({
    where: { status: 'NEW', createdAt: { lt: subDays(new Date(), 1) } },
    orderBy: { createdAt: 'asc' },
    take: 3
  })
  if (staleNew.length > 0) {
    needsAttention.push({
      type: 'urgent',
      title: `${staleNew.length} new enquiries need contact`,
      detail: `Oldest: ${format(staleNew[0].createdAt, 'dd MMM')}`
    })
  }

  const pendingProposals = await prisma.enquiry.findMany({
    where: { status: 'PROPOSAL', updatedAt: { lt: subDays(new Date(), 3) } },
    take: 2
  })
  if (pendingProposals.length > 0) {
    needsAttention.push({
      type: 'pending',
      title: `${pendingProposals.length} proposals awaiting response`,
      detail: `Check follow-up dates`
    })
  }

  return (
    <div className="space-y-8 w-full">
      
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
            <p className="text-[#A2B3AA] mt-2 text-base md:text-lg max-w-2xl">
              LabourAxis operational dashboard. Track enterprise leads, manage statutory content, and monitor compliance pipelines.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 shrink-0">
            <Link 
              href="/admin/enquiries" 
              className="px-5 py-3 rounded-xl bg-[#1F7A5C] hover:bg-[#165B44] text-white font-bold text-xs tracking-wide transition-all shadow-sm flex items-center gap-2"
            >
              <span>View Enquiries</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              href="/admin/articles/new" 
              className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs tracking-wide border border-white/20 transition-all"
            >
              + New Article
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Leads */}
        <div className="bg-white p-6 rounded-2xl border border-[#D9E1DC] shadow-xs flex flex-col justify-between hover:shadow-md transition-all group">
          <div className="flex justify-between items-start mb-4">
            <p className="text-xs font-bold text-[#66736D] uppercase tracking-wider">Total Leads</p>
            <div className="w-10 h-10 rounded-xl bg-[#F7F4EC] border border-[#D9E1DC] flex items-center justify-center text-[#12372A] group-hover:border-[#1F7A5C]/40 transition-colors">
              <Users className="h-5 w-5 text-[#12372A]" />
            </div>
          </div>
          <div>
            <span className="text-3xl lg:text-4xl font-bold text-[#12372A] tracking-tight">{totalEnquiries}</span>
          </div>
          <p className="text-xs text-[#66736D] mt-3 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#1F7A5C]" />
            <span>All-time client enquiries</span>
          </p>
        </div>
        
        {/* New */}
        <div className="bg-white p-6 rounded-2xl border border-[#D9E1DC] shadow-xs flex flex-col justify-between hover:shadow-md transition-all group relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#D6A84F]"></div>
          <div className="flex justify-between items-start mb-4">
            <p className="text-xs font-bold text-[#D6A84F] uppercase tracking-wider">New Enquiries</p>
            <div className="w-10 h-10 rounded-xl bg-[#D6A84F]/15 border border-[#D6A84F]/30 flex items-center justify-center text-[#9E731E]">
              <FilePlus className="h-5 w-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl lg:text-4xl font-bold text-[#12372A] tracking-tight">{newCount}</span>
          </div>
          <p className="text-xs text-[#9E731E] mt-3 font-semibold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#D6A84F] animate-pulse"></span>
            <span>Needs immediate review</span>
          </p>
        </div>
        
        {/* Qualified */}
        <div className="bg-white p-6 rounded-2xl border border-[#D9E1DC] shadow-xs flex flex-col justify-between hover:shadow-md transition-all group relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#1F7A5C]"></div>
          <div className="flex justify-between items-start mb-4">
            <p className="text-xs font-bold text-[#1F7A5C] uppercase tracking-wider">In Discussion</p>
            <div className="w-10 h-10 rounded-xl bg-[#1F7A5C]/10 border border-[#1F7A5C]/20 flex items-center justify-center text-[#1F7A5C]">
              <Target className="h-5 w-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl lg:text-4xl font-bold text-[#12372A] tracking-tight">{qualifiedCount}</span>
          </div>
          <p className="text-xs text-[#1F7A5C] mt-3 font-medium">
            Active consultative discussions
          </p>
        </div>
        
        {/* Won */}
        <div className="bg-white p-6 rounded-2xl border border-[#D9E1DC] shadow-xs flex flex-col justify-between hover:shadow-md transition-all group relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#12372A]"></div>
          <div className="flex justify-between items-start mb-4">
            <p className="text-xs font-bold text-[#12372A] uppercase tracking-wider">Converted</p>
            <div className="w-10 h-10 rounded-xl bg-[#12372A]/10 border border-[#12372A]/20 flex items-center justify-center text-[#12372A]">
              <Award className="h-5 w-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl lg:text-4xl font-bold text-[#12372A] tracking-tight">{wonCount}</span>
          </div>
          <p className="text-xs text-[#12372A] mt-3 font-medium">
            Successfully retained clients
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Pipeline & Needs Attention */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* Pipeline */}
          <div className="bg-white rounded-2xl border border-[#D9E1DC] shadow-xs p-6">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#D9E1DC]/80">
              <h2 className="text-base font-bold text-[#12372A] tracking-tight">Enquiry Pipeline</h2>
              <span className="text-xs font-bold text-[#66736D] bg-[#F7F4EC] px-2.5 py-1 rounded-full border border-[#D9E1DC]">
                {totalEnquiries} Total
              </span>
            </div>
            
            <div className="space-y-4">
              {[
                { label: 'New', count: newCount, color: 'bg-[#D6A84F]' },
                { label: 'Contacted', count: contactedCount, color: 'bg-[#66736D]' },
                { label: 'Qualified', count: qualifiedCount, color: 'bg-[#1F7A5C]' },
                { label: 'Proposal', count: proposalCount, color: 'bg-[#D6A84F]/80' },
                { label: 'Won', count: wonCount, color: 'bg-[#12372A]' },
              ].map((stage) => {
                const max = Math.max(1, totalEnquiries)
                const percentage = Math.round((stage.count / max) * 100)
                return (
                  <div key={stage.label} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-[#202522]">{stage.label}</span>
                      <span className="text-[#12372A]">{stage.count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-[#F7F4EC] rounded-full h-2.5 overflow-hidden border border-[#D9E1DC]/60">
                      <div className={`${stage.color} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${Math.max(4, percentage)}%` }}></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Needs Attention */}
          <div className="bg-white rounded-2xl border border-[#D9E1DC] shadow-xs p-6">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-[#D9E1DC]/80">
              <AlertCircle className="w-4 h-4 text-[#D6A84F]" />
              <h2 className="text-base font-bold text-[#12372A] tracking-tight">Action Items</h2>
            </div>
            
            {needsAttention.length === 0 ? (
              <div className="text-center py-6 text-xs font-semibold text-[#66736D] bg-[#F7F4EC] rounded-xl border border-[#D9E1DC]/60 p-4">
                <CheckCircle2 className="w-6 h-6 text-[#1F7A5C] mx-auto mb-2" />
                All client enquiries are up to date!
              </div>
            ) : (
              <ul className="space-y-3">
                {needsAttention.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 p-3 rounded-xl bg-[#F7F4EC] border border-[#D9E1DC]">
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${item.type === 'urgent' ? 'bg-red-500' : 'bg-[#D6A84F]'}`} />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#12372A]">{item.title}</p>
                      <p className="text-[11px] text-[#66736D] mt-0.5">{item.detail}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

        </div>

        {/* Right Column: Recent Enquiries & Services */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Recent Enquiries Table */}
          <div className="bg-white rounded-2xl border border-[#D9E1DC] shadow-xs overflow-hidden">
            <div className="p-6 border-b border-[#D9E1DC]/80 flex justify-between items-center bg-[#F7F4EC]/40">
              <div>
                <h2 className="text-base font-bold text-[#12372A]">Recent Enquiries</h2>
                <p className="text-xs text-[#66736D] mt-0.5">Latest corporate consultation submissions</p>
              </div>
              <Link 
                href="/admin/enquiries" 
                className="text-xs font-bold text-[#1F7A5C] hover:text-[#165B44] flex items-center gap-1 transition-colors"
              >
                <span>View all</span>
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
                    <th className="px-5 py-3.5 text-left">Status</th>
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
                        <td className="px-5 py-4 whitespace-nowrap font-mono text-[#66736D]">{enquiry.referenceNumber.split('-').pop()}</td>
                        <td className="px-5 py-4 whitespace-nowrap font-bold text-[#12372A]">{enquiry.company || enquiry.name}</td>
                        <td className="px-5 py-4 whitespace-nowrap text-[#66736D] truncate max-w-[150px]">{enquiry.service || 'General'}</td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold
                            ${enquiry.status === 'NEW' ? 'bg-[#D6A84F]/15 text-[#9E731E] border border-[#D6A84F]/30' : ''}
                            ${enquiry.status === 'CONTACTED' ? 'bg-[#F7F4EC] text-[#66736D] border border-[#D9E1DC]' : ''}
                            ${enquiry.status === 'QUALIFIED' ? 'bg-[#1F7A5C]/10 text-[#1F7A5C] border border-[#1F7A5C]/20' : ''}
                            ${enquiry.status === 'WON' ? 'bg-[#12372A]/10 text-[#12372A] border border-[#12372A]/20' : ''}
                            ${enquiry.status === 'LOST' ? 'bg-rose-50 text-rose-700 border border-rose-200' : ''}
                          `}>
                            {enquiry.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-right">
                          <Link href={`/admin/enquiries/${enquiry.id}`} className="text-xs font-bold text-[#1F7A5C] hover:text-[#165B44]">
                            View →
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Enquiries by Service & Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="bg-white rounded-2xl border border-[#D9E1DC] shadow-xs p-6">
              <h2 className="text-base font-bold text-[#12372A] mb-4 pb-2 border-b border-[#D9E1DC]/80">Popular Services</h2>
              {sortedServices.length === 0 ? (
                <p className="text-xs text-[#66736D]">No service data recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {sortedServices.slice(0, 5).map(([service, count]) => {
                    const max = sortedServices[0][1]
                    const percentage = Math.round((count / max) * 100)
                    return (
                      <div key={service} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-[#202522] truncate max-w-[200px]">{service}</span>
                          <span className="text-[#12372A]">{count}</span>
                        </div>
                        <div className="w-full bg-[#F7F4EC] rounded-full h-2 overflow-hidden border border-[#D9E1DC]/60">
                          <div className="bg-[#1F7A5C] h-2 rounded-full" style={{ width: `${Math.max(10, percentage)}%` }}></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-[#D9E1DC] shadow-xs p-6 flex flex-col justify-between">
              <div>
                <h2 className="text-base font-bold text-[#12372A] mb-2">Publishing Hub</h2>
                <p className="text-xs text-[#66736D] mb-4">Quickly publish articles, guides and update company profiles.</p>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <Link 
                  href="/admin/articles/new" 
                  className="px-3 py-2.5 bg-[#F7F4EC] hover:bg-[#1F7A5C]/10 text-[#12372A] hover:text-[#1F7A5C] border border-[#D9E1DC] rounded-xl text-xs font-bold transition-colors text-center"
                >
                  + Article
                </Link>
                <Link 
                  href="/admin/guides/new" 
                  className="px-3 py-2.5 bg-[#F7F4EC] hover:bg-[#1F7A5C]/10 text-[#12372A] hover:text-[#1F7A5C] border border-[#D9E1DC] rounded-xl text-xs font-bold transition-colors text-center"
                >
                  + Guide
                </Link>
                <Link 
                  href="/admin/faqs/new" 
                  className="px-3 py-2.5 bg-[#F7F4EC] hover:bg-[#1F7A5C]/10 text-[#12372A] hover:text-[#1F7A5C] border border-[#D9E1DC] rounded-xl text-xs font-bold transition-colors text-center"
                >
                  + FAQ
                </Link>
                <Link 
                  href="/admin/team/new" 
                  className="px-3 py-2.5 bg-[#F7F4EC] hover:bg-[#1F7A5C]/10 text-[#12372A] hover:text-[#1F7A5C] border border-[#D9E1DC] rounded-xl text-xs font-bold transition-colors text-center"
                >
                  + Team
                </Link>
              </div>
            </div>

          </div>
          
        </div>
      </div>
      
    </div>
  )
}

