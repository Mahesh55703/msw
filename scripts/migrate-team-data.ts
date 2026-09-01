import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrateTeamData() {
  console.log('Migrating and enriching existing Team data...')

  // 1. Lavish Chouhan (Founder & Lead Consultant)
  const lavish = await prisma.teamMember.findFirst({
    where: { name: { contains: 'Lavish' } },
  })

  let lavishId: string
  if (lavish) {
    const updated = await prisma.teamMember.update({
      where: { id: lavish.id },
      data: {
        name: 'Lavish Chouhan',
        designation: 'Founder & Lead Consultant',
        role: 'Founder & Lead Consultant',
        department: 'Leadership',
        bio: 'Practitioner and consultant with deep expertise in Indian labour laws, industrial relations, and factory compliance. Specializes in building audit-proof HR systems and mitigating workforce risks for MSMEs and industrial units.',
        imageUrl: 'https://aoqdrh4m597rgf9m.public.blob.vercel-storage.com/lavish-chouhan.png',
        imageAlt: 'Lavish Chouhan - Founder & Lead Consultant',
        linkedinUrl: 'https://www.linkedin.com/in/lavish-chouhan-8b29b4361/',
        displayOrder: 1,
        order: 1,
        isActive: true,
        reportsToId: null,
      },
    })
    lavishId = updated.id
    console.log('Updated Lavish Chouhan:', lavishId)
  } else {
    const created = await prisma.teamMember.create({
      data: {
        name: 'Lavish Chouhan',
        designation: 'Founder & Lead Consultant',
        role: 'Founder & Lead Consultant',
        department: 'Leadership',
        bio: 'Practitioner and consultant with deep expertise in Indian labour laws, industrial relations, and factory compliance. Specializes in building audit-proof HR systems and mitigating workforce risks for MSMEs and industrial units.',
        imageUrl: 'https://aoqdrh4m597rgf9m.public.blob.vercel-storage.com/lavish-chouhan.png',
        imageAlt: 'Lavish Chouhan - Founder & Lead Consultant',
        linkedinUrl: 'https://www.linkedin.com/in/lavish-chouhan-8b29b4361/',
        displayOrder: 1,
        order: 1,
        isActive: true,
        reportsToId: null,
      },
    })
    lavishId = created.id
    console.log('Created Lavish Chouhan:', lavishId)
  }

  // 2. HR Operations Lead
  const hrLead = await prisma.teamMember.findFirst({
    where: { name: { contains: 'HR Operations' } },
  })

  let hrLeadId: string
  if (hrLead) {
    const updated = await prisma.teamMember.update({
      where: { id: hrLead.id },
      data: {
        name: 'HR Operations Lead',
        designation: 'Director – Operations',
        role: 'Director – Operations',
        department: 'HR Operations',
        bio: 'Overseeing pan-India compliance delivery, client relationship management, and operational workflows.',
        imageAlt: 'HR Operations Lead',
        displayOrder: 2,
        order: 2,
        isActive: true,
        reportsToId: lavishId,
      },
    })
    hrLeadId = updated.id
    console.log('Updated HR Operations Lead:', hrLeadId)
  } else {
    const created = await prisma.teamMember.create({
      data: {
        name: 'HR Operations Lead',
        designation: 'Director – Operations',
        role: 'Director – Operations',
        department: 'HR Operations',
        bio: 'Overseeing pan-India compliance delivery, client relationship management, and operational workflows.',
        imageAlt: 'HR Operations Lead',
        displayOrder: 2,
        order: 2,
        isActive: true,
        reportsToId: lavishId,
      },
    })
    hrLeadId = created.id
    console.log('Created HR Operations Lead:', hrLeadId)
  }

  // 3. Pratik Sharma
  const pratik = await prisma.teamMember.findFirst({
    where: { name: { contains: 'Pratik' } },
  })

  if (pratik) {
    await prisma.teamMember.update({
      where: { id: pratik.id },
      data: {
        name: 'Pratik Sharma',
        designation: 'Operations Manager',
        role: 'Operations Manager',
        department: 'Operations',
        bio: 'Managing establishment compliance, registers, muster rolls, and audit readiness.',
        imageUrl: 'https://aoqdrh4m597rgf9m.public.blob.vercel-storage.com/Pratik.png',
        imageAlt: 'Pratik Sharma - Operations Manager',
        displayOrder: 3,
        order: 3,
        isActive: true,
        reportsToId: lavishId,
      },
    })
    console.log('Updated Pratik Sharma:', pratik.id)
  } else {
    const created = await prisma.teamMember.create({
      data: {
        name: 'Pratik Sharma',
        designation: 'Operations Manager',
        role: 'Operations Manager',
        department: 'Operations',
        bio: 'Managing establishment compliance, registers, muster rolls, and audit readiness.',
        imageUrl: 'https://aoqdrh4m597rgf9m.public.blob.vercel-storage.com/Pratik.png',
        imageAlt: 'Pratik Sharma - Operations Manager',
        displayOrder: 3,
        order: 3,
        isActive: true,
        reportsToId: lavishId,
      },
    })
    console.log('Created Pratik Sharma:', created.id)
  }

  const all = await prisma.teamMember.findMany({
    include: {
      reportsTo: { select: { id: true, name: true, designation: true } },
      directReports: { select: { id: true, name: true, designation: true } },
    },
    orderBy: { displayOrder: 'asc' },
  })

  console.log('\nFinal Team Members Migration Result:')
  all.forEach((m) => {
    console.log(
      `#${m.displayOrder} - ${m.name} (${m.designation}) | Dept: ${m.department} | Reports To: ${
        m.reportsTo ? m.reportsTo.name : 'None (Root)'
      } | Direct Reports: ${m.directReports.map((d) => d.name).join(', ') || 'None'}`
    )
  })
}

migrateTeamData()
  .catch((e) => {
    console.error('Migration error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
