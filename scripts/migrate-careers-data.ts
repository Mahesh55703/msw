import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrateCareersData() {
  console.log('Migrating and enriching existing Careers data...')

  const existingJobs = await prisma.jobPosting.findMany()
  console.log(`Found ${existingJobs.length} existing jobs to migrate.`)

  let order = 1
  for (const job of existingJobs) {
    let workMode = 'Hybrid'
    if (job.location.toLowerCase().includes('remote')) {
      workMode = 'Remote'
    } else if (job.location.toLowerCase().includes('on-site') || job.location.toLowerCase().includes('onsite')) {
      workMode = 'On-site'
    }

    const responsibilities = [
      'Lead and execute client advisory mandates for statutory compliance.',
      'Maintain error-free registers, muster rolls, and inspection defense documentation.',
      'Collaborate directly with plant heads and HR leadership across client facilities.',
    ].join('\n')

    const requirements = job.requirements || [
      'Bachelor’s or Master’s degree in HR, Law, Commerce, or related discipline.',
      'Prior domain experience in Indian labour laws and statutory compliance.',
      'Strong communication, client consulting, and audit-readiness skills.',
    ].join('\n')

    await prisma.jobPosting.update({
      where: { id: job.id },
      data: {
        employmentType: job.type || 'Full-time',
        workMode,
        responsibilities,
        requirements,
        applicationMethod: 'Email',
        applicationEmail: 'careers@labouraxis.com',
        status: 'PUBLISHED',
        isActive: true,
        publishedAt: job.createdAt || new Date(),
        displayOrder: order++,
        seoTitle: `${job.title} | Careers at LabourAxis`,
        metaDescription: `Apply for ${job.title} at LabourAxis in ${job.location}. Work with India’s premier labour compliance and industrial HR advisory team.`,
      },
    })
    console.log(`Enriched Job: "${job.title}" (${job.slug})`)
  }

  const all = await prisma.jobPosting.findMany({ orderBy: { displayOrder: 'asc' } })
  console.log(`\nMigration complete. Total active jobs in DB: ${all.length}`)
}

migrateCareersData()
  .catch((e) => {
    console.error('Careers migration error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
