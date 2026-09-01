import prisma from '@/lib/prisma'
import { verifySession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { Prisma } from '@prisma/client'
import { subDays } from 'date-fns'
import EnquiryList from '@/components/admin/enquiries/EnquiryList'

export const dynamic = 'force-dynamic'

export default async function EnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const session = await verifySession()
  if (!session.isAuth) redirect('/admin/login')

  const resolvedParams = await searchParams
  const query = (resolvedParams.q || '').trim()
  const status = resolvedParams.status || ''
  const priority = resolvedParams.priority || ''
  const assignedTo = resolvedParams.assignedTo || ''
  const dateRange = resolvedParams.dateRange || ''
  const page = Math.max(1, parseInt(resolvedParams.page || '1', 10))
  const pageSize = 20

  let dateFilter: Prisma.DateTimeFilter | undefined
  const now = new Date()

  if (dateRange === 'today') {
    const todayStart = new Date(now.setHours(0, 0, 0, 0))
    dateFilter = { gte: todayStart }
  } else if (dateRange === '7d') {
    dateFilter = { gte: subDays(now, 7) }
  } else if (dateRange === '30d') {
    dateFilter = { gte: subDays(now, 30) }
  }

  const where: Prisma.EnquiryWhereInput = {
    ...(query
      ? {
          OR: [
            { referenceNumber: { contains: query, mode: 'insensitive' } },
            { name: { contains: query, mode: 'insensitive' } },
            { company: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
            { phone: { contains: query, mode: 'insensitive' } },
            { service: { contains: query, mode: 'insensitive' } },
            { message: { contains: query, mode: 'insensitive' } },
          ],
        }
      : {}),
    ...(status && status !== 'all' ? { status: status as any } : {}),
    ...(priority && priority !== 'all' ? { priority: priority as any } : {}),
    ...(assignedTo === 'unassigned'
      ? { assignedToId: null }
      : assignedTo && assignedTo !== 'all'
      ? { assignedToId: assignedTo }
      : {}),
    ...(dateFilter ? { createdAt: dateFilter } : {}),
  }

  const [enquiries, totalCount, teamMembers] = await Promise.all([
    prisma.enquiry.findMany({
      where,
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.enquiry.count({ where }),
    prisma.user.findMany({
      select: { id: true, name: true, email: true },
      orderBy: { name: 'asc' },
    }),
  ])

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto w-full">
      {/* Header Banner */}
      <div className="bg-[#12372A] p-6 md:p-8 rounded-3xl shadow-sm text-white flex flex-col sm:flex-row sm:items-center sm:justify-between border border-[#0D281E] gap-4">
        <div>
          <span className="text-[10px] font-bold text-[#D6A84F] uppercase tracking-wider">
            CRM Operations
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
            Enquiries
          </h1>
          <p className="text-[#A2B3AA] text-xs sm:text-sm mt-1">
            Manage consultation enquiries and track leads from first contact through conversion.
          </p>
        </div>
      </div>

      {/* Enquiry List Table / Mobile Cards Component */}
      <EnquiryList
        enquiries={enquiries as any}
        totalCount={totalCount}
        page={page}
        pageSize={pageSize}
        totalPages={totalPages}
        teamMembers={teamMembers}
        currentFilters={{
          q: query,
          status,
          priority,
          assignedTo,
          dateRange,
        }}
      />
    </div>
  )
}
