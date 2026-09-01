import 'dotenv/config'
import { PrismaClient, FaqCategory } from '@prisma/client'
import { faqsData } from '../data/faqs'

const prisma = new PrismaClient()

const categoryEnumMap: Record<string, FaqCategory> = {
  hr: FaqCategory.HR_OPERATIONS,
  'labour-compliance': FaqCategory.LABOUR_COMPLIANCE,
  pf: FaqCategory.PF_EPFO,
  esic: FaqCategory.ESIC,
  payroll: FaqCategory.PAYROLL,
  factory: FaqCategory.FACTORY_COMPLIANCE,
  'contract-labour': FaqCategory.CONTRACT_LABOUR,
  'industrial-relations': FaqCategory.INDUSTRIAL_RELATIONS,
}

async function reconcileFaqs() {
  console.log('====================================================')
  console.log('STARTING FAQ DATABASE RECONCILIATION')
  console.log('====================================================')

  const dbFaqs = await prisma.faq.findMany()
  console.log(`Found ${dbFaqs.length} total FAQ records in database.`)

  // Build static lookup map
  const staticMap = new Map<string, { catEnum: FaqCategory; order: number; answer: string }>()
  faqsData.forEach((cat) => {
    const catEnum = categoryEnumMap[cat.id]
    cat.faqs.forEach((item, idx) => {
      staticMap.set(item.question.trim().toLowerCase(), {
        catEnum,
        order: idx + 1,
        answer: item.answer,
      })
    })
  })

  let updatedCount = 0

  for (const faq of dbFaqs) {
    const qKey = faq.question.trim().toLowerCase()
    const staticMatch = staticMap.get(qKey)

    let targetCategory: FaqCategory = faq.category
    let targetOrder: number = faq.displayOrder

    if (staticMatch) {
      targetCategory = staticMatch.catEnum
      targetOrder = staticMatch.order
    } else {
      // Custom questions in DB
      if (qKey.includes('which businesses need labour compliance support')) {
        targetCategory = FaqCategory.LABOUR_COMPLIANCE
        targetOrder = 11
      } else if (qKey.includes('what should a principal employer review')) {
        targetCategory = FaqCategory.CONTRACT_LABOUR
        targetOrder = 11
      } else if (targetCategory === FaqCategory.UNCATEGORIZED) {
        // Fallback safety check for uncategorized
        if (qKey.includes('uan') || qKey.includes('pf') || qKey.includes('epfo')) {
          targetCategory = FaqCategory.PF_EPFO
          targetOrder = 10
        } else if (qKey.includes('esic') || qKey.includes('esi')) {
          targetCategory = FaqCategory.ESIC
          targetOrder = 10
        } else if (qKey.includes('conflict') || qKey.includes('legal') || qKey.includes('dispute')) {
          targetCategory = FaqCategory.INDUSTRIAL_RELATIONS
          targetOrder = 10
        } else if (qKey.includes('leave') || qKey.includes('wage') || qKey.includes('payroll')) {
          targetCategory = FaqCategory.PAYROLL
          targetOrder = 10
        }
      }
    }

    // Ensure displayOrder is non-negative
    targetOrder = Math.max(1, targetOrder)

    // Clean answer text: wrap in <p> if raw string without tags
    let cleanAnswer = faq.answer.trim()
    if (!cleanAnswer.startsWith('<p>') && !cleanAnswer.startsWith('<div>')) {
      cleanAnswer = `<p>${cleanAnswer}</p>`
    }

    await prisma.faq.update({
      where: { id: faq.id },
      data: {
        category: targetCategory,
        displayOrder: targetOrder,
        answer: cleanAnswer,
        published: true,
      },
    })

    updatedCount++
  }

  console.log(`Updated ${updatedCount} FAQs with verified categories and display orders.`)

  // Post-Reconciliation Verification
  const postFaqs = await prisma.faq.findMany()
  const uncategorizedCount = postFaqs.filter((f) => f.category === FaqCategory.UNCATEGORIZED).length
  const negativeOrderCount = postFaqs.filter((f) => f.displayOrder < 0).length
  const publishedCount = postFaqs.filter((f) => f.published).length

  console.log('\n--- POST-RECONCILIATION SUMMARY ---')
  console.log(`Total FAQs: ${postFaqs.length}`)
  console.log(`Published FAQs: ${publishedCount}`)
  console.log(`UNCATEGORIZED FAQs: ${uncategorizedCount}`)
  console.log(`Negative Order FAQs: ${negativeOrderCount}`)

  const byCat = await prisma.faq.groupBy({
    by: ['category'],
    _count: true,
    orderBy: { category: 'asc' },
  })
  console.log('Category breakdown in Faq table:', byCat)

  if (uncategorizedCount === 0 && postFaqs.length === 82) {
    console.log('\n>>> RECONCILIATION SUCCESSFUL: UNCATEGORIZED = 0, ALL 82 FAQS CATEGORIZED <<<')
  }
}

reconcileFaqs()
  .catch((err) => {
    console.error('Reconciliation error:', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
