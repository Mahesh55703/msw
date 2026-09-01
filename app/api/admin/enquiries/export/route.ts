import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifySession } from '@/lib/session'
import { Prisma } from '@prisma/client'
import { subDays } from 'date-fns'

export async function GET(req: NextRequest) {
  try {
    const session = await verifySession()
    if (!session.isAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const query = (searchParams.get('q') || '').trim()
    const status = searchParams.get('status') || ''
    const priority = searchParams.get('priority') || ''
    const assignedTo = searchParams.get('assignedTo') || ''
    const dateRange = searchParams.get('dateRange') || ''

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

    const enquiries = await prisma.enquiry.findMany({
      where,
      include: { assignedTo: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    })

    // Escape CSV cell value
    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""'
      const str = String(val).replace(/"/g, '""')
      return `"${str}"`
    }

    const headers = [
      'Reference Number',
      'Client Name',
      'Company',
      'Designation',
      'Email',
      'Phone',
      'Location',
      'Industry',
      'Employees',
      'Contract Workers',
      'Service Required',
      'Status',
      'Priority',
      'Assigned To',
      'Source',
      'Created Date',
      'Contacted Date',
      'Qualified Date',
      'Proposal Date',
      'Closed Date',
    ]

    const csvRows = [headers.join(',')]

    enquiries.forEach((e) => {
      const row = [
        escapeCsv(e.referenceNumber),
        escapeCsv(e.name),
        escapeCsv(e.company),
        escapeCsv(e.designation),
        escapeCsv(e.email),
        escapeCsv(e.phone),
        escapeCsv(e.location),
        escapeCsv(e.industry),
        escapeCsv(e.employeeCount),
        escapeCsv(e.contractorCount),
        escapeCsv(e.service),
        escapeCsv(e.status),
        escapeCsv(e.priority),
        escapeCsv(e.assignedTo?.name || 'Unassigned'),
        escapeCsv(e.source),
        escapeCsv(e.createdAt.toISOString()),
        escapeCsv(e.firstContactedAt?.toISOString()),
        escapeCsv(e.qualifiedAt?.toISOString()),
        escapeCsv(e.proposalAt?.toISOString()),
        escapeCsv(e.closedAt?.toISOString()),
      ]
      csvRows.push(row.join(','))
    })

    const csvData = csvRows.join('\n')

    return new NextResponse(csvData, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="labouraxis-enquiries-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    })
  } catch (err: any) {
    console.error('Error exporting enquiries CSV:', err)
    return NextResponse.json({ error: 'Failed to export CSV' }, { status: 500 })
  }
}
