import prisma from '@/lib/prisma'
import { verifySession } from '@/lib/session'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { format, subDays } from 'date-fns'
import { Plus } from 'lucide-react'

import { Users, FilePlus, Target, Award } from 'lucide-react'

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
      icon: '🔴',
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
      icon: '🟡',
      title: `${pendingProposals.length} proposals awaiting response`,
      detail: `Check follow-up dates`
    })
  }

  return (
    <div className="space-y-6 w-full">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end bg-gradient-to-r from-blue-600 to-indigo-700 p-8 rounded-xl shadow-md text-white relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-sm font-medium text-blue-100 uppercase tracking-wider mb-2 opacity-80">
            {format(new Date(), 'dd MMMM yyyy')}
          </p>
          <h1 className="text-3xl font-bold tracking-tight">
            Good afternoon, {user?.name?.split(' ')[0] || 'Administrator'}
          </h1>
          <p className="text-blue-50 mt-2 text-lg opacity-90">Here's what's happening with LabourAxis today.</p>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none"></div>
        <div className="absolute right-40 bottom-0 w-40 h-40 bg-blue-400 opacity-20 rounded-full -mb-10 blur-2xl pointer-events-none"></div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Leads</p>
            <div className="p-2 bg-gray-50 rounded-lg">
              <Users className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-bold text-gray-900">{totalEnquiries}</span>
          </div>
          <p className="text-xs text-gray-400 mt-2 font-medium">All time enquiries</p>
        </div>
        
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500"></div>
          <div className="flex justify-between items-start mb-2 pl-2">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">New</p>
            <div className="p-2 bg-blue-50 rounded-lg">
              <FilePlus className="h-5 w-5 text-blue-500" />
            </div>
          </div>
          <div className="pl-2">
            <span className="text-3xl font-bold text-gray-900">{newCount}</span>
          </div>
          <p className="text-xs text-blue-600 mt-2 font-medium pl-2">Needs attention today</p>
        </div>
        
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-purple-500"></div>
          <div className="flex justify-between items-start mb-2 pl-2">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Qualified</p>
            <div className="p-2 bg-purple-50 rounded-lg">
              <Target className="h-5 w-5 text-purple-500" />
            </div>
          </div>
          <div className="pl-2">
            <span className="text-3xl font-bold text-gray-900">{qualifiedCount}</span>
          </div>
          <p className="text-xs text-purple-600 mt-2 font-medium pl-2">In active discussion</p>
        </div>
        
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-green-500"></div>
          <div className="flex justify-between items-start mb-2 pl-2">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Won</p>
            <div className="p-2 bg-green-50 rounded-lg">
              <Award className="h-5 w-5 text-green-500" />
            </div>
          </div>
          <div className="pl-2">
            <span className="text-3xl font-bold text-gray-900">{wonCount}</span>
          </div>
          <p className="text-xs text-green-600 mt-2 font-medium pl-2">Converted to clients</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Pipeline & Needs Attention */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Enquiry Pipeline</h2>
            <div className="space-y-4">
              {[
                { label: 'New', count: newCount, color: 'bg-blue-500' },
                { label: 'Contacted', count: contactedCount, color: 'bg-indigo-400' },
                { label: 'Qualified', count: qualifiedCount, color: 'bg-purple-400' },
                { label: 'Proposal', count: proposalCount, color: 'bg-amber-400' },
                { label: 'Won', count: wonCount, color: 'bg-green-500' },
              ].map((stage) => {
                const max = Math.max(1, totalEnquiries)
                const percentage = Math.round((stage.count / max) * 100)
                return (
                  <div key={stage.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">{stage.label}</span>
                      <span className="text-gray-900">{stage.count}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className={`${stage.color} h-2 rounded-full`} style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Needs Attention</h2>
            {needsAttention.length === 0 ? (
              <p className="text-sm text-gray-500">You're all caught up!</p>
            ) : (
              <ul className="space-y-3">
                {needsAttention.map((item, i) => (
                  <li key={i} className="flex items-start">
                    <span className="mr-2 text-lg leading-none">{item.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.detail}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Recent Enquiries & Services */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-base font-semibold text-gray-900">Recent Enquiries</h2>
              <Link href="/admin/enquiries" className="text-sm text-blue-600 hover:text-blue-800 font-medium">View all →</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Ref</th>
                    <th className="px-5 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Company</th>
                    <th className="px-5 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Service</th>
                    <th className="px-5 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentEnquiries.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-6 text-center text-gray-500">No enquiries found.</td>
                    </tr>
                  ) : (
                    recentEnquiries.map((enquiry) => (
                      <tr key={enquiry.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3 whitespace-nowrap text-gray-500">{enquiry.referenceNumber.split('-').pop()}</td>
                        <td className="px-5 py-3 whitespace-nowrap font-medium text-gray-900">{enquiry.company || enquiry.name}</td>
                        <td className="px-5 py-3 whitespace-nowrap text-gray-500 truncate max-w-[150px]">{enquiry.service || 'General'}</td>
                        <td className="px-5 py-3 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                            ${enquiry.status === 'NEW' ? 'bg-blue-100 text-blue-800' : ''}
                            ${enquiry.status === 'CONTACTED' ? 'bg-indigo-100 text-indigo-800' : ''}
                            ${enquiry.status === 'WON' ? 'bg-green-100 text-green-800' : ''}
                            ${enquiry.status === 'LOST' ? 'bg-gray-100 text-gray-800' : ''}
                          `}>
                            {enquiry.status === 'NEW' ? '🟢 ' : ''}{enquiry.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap text-right">
                          <Link href={`/admin/enquiries/${enquiry.id}`} className="text-blue-600 hover:text-blue-900 font-medium">View</Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Enquiries by Service</h2>
              {sortedServices.length === 0 ? (
                <p className="text-sm text-gray-500">No data available yet.</p>
              ) : (
                <div className="space-y-3">
                  {sortedServices.slice(0, 6).map(([service, count]) => {
                    const max = sortedServices[0][1]
                    const percentage = Math.round((count / max) * 100)
                    return (
                      <div key={service} className="flex items-center text-sm">
                        <div className="w-1/3 truncate pr-2 text-gray-600">{service}</div>
                        <div className="w-2/3 flex items-center">
                          <div className="bg-blue-100 rounded-sm h-5" style={{ width: `${Math.max(10, percentage)}%` }}></div>
                          <span className="ml-2 font-medium text-gray-900">{count}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 flex flex-col">
              <h2 className="text-base font-semibold text-gray-900 mb-2">Enquiries Overview</h2>
              <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                <div className="text-4xl mb-2">📈</div>
                <h3 className="text-sm font-medium text-gray-900">Not enough data yet</h3>
                <p className="text-xs text-gray-500 mt-1">Your enquiry trends will appear here as leads are received over multiple months.</p>
              </div>
            </div>
          </div>
          
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/articles/new" className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors border border-blue-100">
            + New Article
          </Link>
          <Link href="/admin/guides/new" className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors border border-blue-100">
            + New Guide
          </Link>
          <Link href="/admin/team/new" className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors border border-blue-100">
            + Add Team Member
          </Link>
          <Link href="/admin/enquiries" className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors border border-blue-100">
            View Enquiries
          </Link>
        </div>
      </div>
      
    </div>
  )
}
