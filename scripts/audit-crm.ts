import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function auditEnquiries() {
  console.log('=== ENQUIRY & CRM DATABASE AUDIT ===')
  const totalEnquiries = await prisma.enquiry.count()
  const users = await prisma.user.findMany({ select: { id: true, name: true, email: true, role: true } })
  const enquiries = await prisma.enquiry.findMany({
    include: { activities: true, assignedTo: true }
  })

  console.log(`Total Enquiries in DB: ${totalEnquiries}`)
  console.log(`Team Users in DB:`, users)
  console.log(`Enquiries sample:`, enquiries.slice(0, 3).map(e => ({
    id: e.id,
    ref: e.referenceNumber,
    name: e.name,
    company: e.company,
    status: e.status,
    priority: e.priority,
    activitiesCount: e.activities.length,
    assigned: e.assignedTo?.name
  })))
}

auditEnquiries()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
