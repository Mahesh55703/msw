import prisma from '@/lib/prisma'
import { verifySession } from '@/lib/session'
import { notFound, redirect } from 'next/navigation'
import EnquiryDetailClient from '@/components/admin/enquiries/EnquiryDetailClient'

export const dynamic = 'force-dynamic'

export default async function EnquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await verifySession()
  if (!session.isAuth) redirect('/admin/login')

  const { id } = await params
  const enquiry = await prisma.enquiry.findUnique({
    where: { id },
    include: {
      assignedTo: { select: { id: true, name: true, email: true } },
      activities: {
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!enquiry) {
    notFound()
  }

  // Fetch team members for assignment
  const teamMembers = await prisma.user.findMany({
    select: { id: true, name: true, email: true },
    orderBy: { name: 'asc' },
  })

  // Duplicate Lead Detection (same email or phone in other enquiries)
  const duplicatesCount = await prisma.enquiry.count({
    where: {
      id: { not: enquiry.id },
      OR: [
        { email: { equals: enquiry.email, mode: 'insensitive' } },
        ...(enquiry.phone ? [{ phone: enquiry.phone }] : []),
      ],
    },
  })

  return (
    <EnquiryDetailClient
      enquiry={enquiry}
      teamMembers={teamMembers}
      duplicatesCount={duplicatesCount}
    />
  )
}
