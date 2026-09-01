import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { faqsData } from '../data/faqs'

const prisma = new PrismaClient()

async function audit() {
  console.log('====================================================')
  console.log('AUDIT: FAQS IN DATABASE & STATIC SOURCES')
  console.log('====================================================')

  const faqsCount = await prisma.faq.count()
  const articlesFaqCount = await prisma.article.count({ where: { category: { in: ['faqs', 'faq'] } } })
  const allArticlesCount = await prisma.article.count()
  const publishedFaqs = await prisma.faq.count({ where: { published: true } })
  const draftFaqs = await prisma.faq.count({ where: { published: false } })
  const uncategorizedFaqs = await prisma.faq.count({ where: { category: 'UNCATEGORIZED' } })

  const faqsByCategory = await prisma.faq.groupBy({
    by: ['category'],
    _count: true,
  })

  console.log(`Total Faq model records: ${faqsCount}`)
  console.log(`Total Article records with category 'faqs'/'faq': ${articlesFaqCount}`)
  console.log(`Total all Article records: ${allArticlesCount}`)
  console.log(`Published in Faq: ${publishedFaqs}`)
  console.log(`Draft in Faq: ${draftFaqs}`)
  console.log(`Uncategorized in Faq: ${uncategorizedFaqs}`)
  console.log('Faqs by category in Faq table:', faqsByCategory)

  // Count static FAQs in data/faqs.ts
  const staticCategories = faqsData
  let totalStaticFaqs = 0
  staticCategories.forEach((cat) => {
    totalStaticFaqs += cat.faqs.length
    console.log(`Static Category [${cat.id}] "${cat.title}": ${cat.faqs.length} FAQs`)
  })
  console.log(`Total FAQs in data/faqs.ts: ${totalStaticFaqs}`)

  // Check all Article records with category = faqs
  const articleFaqs = await prisma.article.findMany({
    where: { category: { in: ['faqs', 'faq'] } },
    select: { id: true, title: true, slug: true, content: true, excerpt: true, published: true, createdAt: true, updatedAt: true },
  })
  console.log(`Found ${articleFaqs.length} Article FAQ records.`)

  // Check Faq records
  const faqs = await prisma.faq.findMany({
    orderBy: [{ category: 'asc' }, { displayOrder: 'asc' }, { createdAt: 'asc' }],
  })

  // Duplicate checks in Faq
  const questionMap = new Map<string, number>()
  faqs.forEach((f) => {
    const q = f.question.trim().toLowerCase()
    questionMap.set(q, (questionMap.get(q) || 0) + 1)
  })
  const duplicates = Array.from(questionMap.entries()).filter(([_, count]) => count > 1)
  console.log(`Duplicate questions in Faq table: ${duplicates.length}`)
  if (duplicates.length > 0) {
    console.log('Duplicates:', duplicates)
  }

  // Check display order validity
  let invalidDisplayOrder = faqs.filter((f) => typeof f.displayOrder !== 'number' || f.displayOrder < 0 || isNaN(f.displayOrder))
  console.log(`Invalid displayOrder count: ${invalidDisplayOrder.length}`)
  invalidDisplayOrder.forEach((f) => {
    console.log(`- Invalid Order FAQ [${f.id}] Order: ${f.displayOrder} | Q: ${f.question}`)
  })

  // List all 4 Uncategorized FAQs
  const uncategorized = faqs.filter((f) => f.category === 'UNCATEGORIZED')
  console.log('\n--- 4 UNCATEGORIZED FAQS IN FAQS TABLE ---')
  uncategorized.forEach((f, idx) => {
    console.log(`[${idx + 1}] ID: ${f.id} | Order: ${f.displayOrder}`)
    console.log(`    Q: "${f.question}"`)
    console.log(`    A: "${f.answer.slice(0, 120)}..."`)
  })

  // Check matching with static data/faqs.ts
  console.log('\n--- MAPPING STATIC DATA/FAQS.TS TO FAQS TABLE ---')
  const staticFaqMap = new Map<string, { category: string; question: string; answer: string }>()
  faqsData.forEach((cat) => {
    cat.faqs.forEach((item) => {
      staticFaqMap.set(item.question.trim().toLowerCase(), {
        category: cat.id,
        question: item.question,
        answer: item.answer,
      })
    })
  })

  let matchedWithStatic = 0
  let notInStatic = 0
  faqs.forEach((f) => {
    const match = staticFaqMap.get(f.question.trim().toLowerCase())
    if (match) {
      matchedWithStatic++
    } else {
      notInStatic++
      console.log(`- FAQ not in static data/faqs.ts: "${f.question}" (Category in DB: ${f.category})`)
    }
  })
  console.log(`Matched with static: ${matchedWithStatic} / ${faqs.length}, Not in static: ${notInStatic}`)
}

audit()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })
