import { PrismaClient } from '@prisma/client'
import { resourcesData } from '../data/resources'
import { faqsData } from '../data/faqs'

const prisma = new PrismaClient()

const OPEN_POSITIONS = [
  {
    title: "HR & Labour Compliance Executive",
    location: "Indore / Hybrid",
    type: "Full-time",
    department: "Compliance",
    description: "We are looking for an HR & Labour Compliance Executive to join our team...",
    requirements: "Experience in HR Operations and Labour Compliance."
  },
  {
    title: "Labour Compliance Executive",
    location: "Indore / Hybrid",
    type: "Full-time",
    department: "Labour Compliance",
    description: "Handle statutory compliance and registers...",
    requirements: "Knowledge of Indian Labour Laws."
  },
  {
    title: "HR Executive - Industrial Relations",
    location: "Indore / Hybrid",
    type: "Full-time",
    department: "HR / IR",
    description: "Manage employee relations and HR operations...",
    requirements: "Experience in IR and dispute resolution."
  },
  {
    title: "Payroll & Statutory Executive",
    location: "Indore / Hybrid",
    type: "Full-time",
    department: "Payroll",
    description: "Manage end-to-end payroll and PF/ESIC returns...",
    requirements: "Expertise in Payroll software and statutory portals."
  },
  {
    title: "Business Development Executive",
    location: "Indore / Remote",
    type: "Full-time",
    department: "Business Development",
    description: "Drive B2B sales and client acquisition...",
    requirements: "B2B sales experience in service industry."
  },
  {
    title: "Compliance Analyst",
    location: "Indore / Hybrid",
    type: "Full-time",
    department: "Compliance",
    description: "Research and document compliance changes...",
    requirements: "Strong analytical and documentation skills."
  },
  {
    title: "Full-Stack Developer - Compliance Platform",
    location: "Remote",
    type: "Full-time",
    department: "Technology",
    description: "Build out the LabourAxis technology platform...",
    requirements: "Next.js, React, Node.js, Prisma, PostgreSQL."
  }
];

const TEAM_MEMBERS = [
  {
    name: "Lavish Chouhan",
    role: "Founder & Lead Consultant",
    bio: "Expert in Labour Compliance and Industrial Relations with years of experience helping MSMEs and factories.",
    imageUrl: "",
    order: 1
  },
  {
    name: "HR Operations Lead",
    role: "Director – Operations",
    bio: "Joining soon...",
    imageUrl: "",
    order: 2
  }
];

async function main() {
  console.log('Finding admin user...')
  const admin = await prisma.user.findFirst()
  if (!admin) {
    console.log('No admin user found. Please run the initial seed first.')
    process.exit(1)
  }

  console.log('Seeding Resources (Articles, Guides, Checklists)...')
  let count = 0
  for (const resource of resourcesData) {
    // Check if exists
    const exists = await prisma.article.findUnique({ where: { slug: resource.slug } })
    if (!exists) {
      // Map type to category (e.g. "article" -> "articles")
      const cat = resource.type + 's'
      
      await prisma.article.create({
        data: {
          title: resource.title,
          slug: resource.slug,
          content: resource.content || "Coming soon...",
          excerpt: resource.excerpt || resource.title,
          featuredImage: resource.featuredImage || '/logo-transparent.png',
          published: true,
          publishedAt: new Date(resource.publishedAt),
          authorId: admin.id,
          category: cat,
        }
      })
      count++
    }
  }
  console.log(`Added ${count} resources.`)

  console.log('Seeding FAQs...')
  let faqCount = 0
  for (const group of faqsData) {
    for (const faq of group.faqs) {
      const slug = faq.question.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
      const exists = await prisma.article.findUnique({ where: { slug } })
      if (!exists) {
        await prisma.article.create({
          data: {
            title: faq.question,
            slug: slug,
            content: faq.answer,
            excerpt: group.id, // We'll store the group ID in excerpt so we can group them later
            featuredImage: '',
            published: true,
            publishedAt: new Date(),
            authorId: admin.id,
            category: 'faqs',
          }
        })
        faqCount++
      }
    }
  }
  console.log(`Added ${faqCount} FAQs.`)

  console.log('Seeding Job Postings...')
  let jobCount = 0
  for (const job of OPEN_POSITIONS) {
    const slug = job.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    const exists = await prisma.jobPosting.findUnique({ where: { slug } })
    if (!exists) {
      await prisma.jobPosting.create({
        data: {
          title: job.title,
          slug: slug,
          department: job.department,
          location: job.location,
          type: job.type,
          description: job.description,
          requirements: job.requirements,
          isActive: true
        }
      })
      jobCount++
    }
  }
  console.log(`Added ${jobCount} job postings.`)

  console.log('Seeding Team Members...')
  let teamCount = 0
  for (const member of TEAM_MEMBERS) {
    const exists = await prisma.teamMember.findFirst({ where: { name: member.name } })
    if (!exists) {
      await prisma.teamMember.create({
        data: {
          name: member.name,
          role: member.role,
          bio: member.bio,
          imageUrl: member.imageUrl,
          order: member.order,
          isActive: true
        }
      })
      teamCount++
    }
  }
  console.log(`Added ${teamCount} team members.`)

  console.log('CMS Seeding complete!')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
