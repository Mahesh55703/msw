import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { faqsData } from '../data/faqs'

const prisma = new PrismaClient()

// Map static category string ID to FaqCategory enum
const categoryEnumMap: Record<string, string> = {
  hr: 'HR_OPERATIONS',
  'labour-compliance': 'LABOUR_COMPLIANCE',
  pf: 'PF_EPFO',
  esic: 'ESIC',
  payroll: 'PAYROLL',
  factory: 'FACTORY_COMPLIANCE',
  'contract-labour': 'CONTRACT_LABOUR',
  'industrial-relations': 'INDUSTRIAL_RELATIONS',
}

async function inspectCategoryDistribution() {
  const faqs = await prisma.faq.findMany({
    orderBy: [{ category: 'asc' }, { displayOrder: 'asc' }, { createdAt: 'asc' }],
  })

  // Build lookup from static faqsData
  const staticMap = new Map<string, { catEnum: string; title: string; order: number }>()
  faqsData.forEach((cat) => {
    const catEnum = categoryEnumMap[cat.id]
    cat.faqs.forEach((item, idx) => {
      staticMap.set(item.question.trim().toLowerCase(), {
        catEnum,
        title: cat.title,
        order: idx + 1,
      })
    })
  })

  console.log('--- DETAILED COMPARISON OF 82 DB FAQS ---')
  let correctMatches = 0
  let mismatchedCategories = 0

  faqs.forEach((f, i) => {
    const qKey = f.question.trim().toLowerCase()
    const staticMatch = staticMap.get(qKey)

    if (staticMatch) {
      if (f.category === staticMatch.catEnum) {
        correctMatches++
      } else {
        mismatchedCategories++
        console.log(`Mismatch [${f.id}]: "${f.question}"`)
        console.log(`  Current DB Category: ${f.category} (Order: ${f.displayOrder})`)
        console.log(`  Expected Static Category: ${staticMatch.catEnum} (Order: ${staticMatch.order})`)
      }
    } else {
      console.log(`Custom/Extra DB FAQ [${f.id}]: "${f.question}" (Current DB Category: ${f.category})`)
    }
  })

  console.log(`\nCorrect category matches: ${correctMatches}`)
  console.log(`Mismatched categories: ${mismatchedCategories}`)
}

inspectCategoryDistribution()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })
