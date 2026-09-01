import { PrismaClient } from '@prisma/client'
import { parseAndFormatArticleContent, calculateReadingTime } from '../lib/content-parser'
import { articleSchema } from '../lib/validations/article'

const prisma = new PrismaClient()

async function runQA() {
  console.log('====================================================')
  console.log('STARTING LABOURAXIS ARTICLE CMS PRODUCTION QA')
  console.log('====================================================\n')

  // 1. Test Content Parser & Markdown-to-Semantic-HTML Pipeline
  console.log('Test 1: Content Parser & Markdown-to-HTML Normalization')
  const rawSampleMarkdown = `
Small businesses and scaling MSMEs often view compliance as an enterprise problem.

## 1. Ignoring Applicability & Threshold Requirements

Many businesses fail to realize that hiring the 10th or 20th employee triggers statutory obligations.

> **Important:** Applicability varies by state law.

### Penalties & Liabilities
Failing to register for EPF or ESIC leads to back-dated liabilities.

## 2. Misclassifying Employees as Consultants
Paying regular workers as consultants is a major audit risk.
`
  const parsed = parseAndFormatArticleContent(rawSampleMarkdown)
  console.log(`- Word count calculated: ${parsed.wordCount}`)
  console.log(`- Reading time text: ${parsed.readingTimeText}`)
  console.log(`- TOC headings extracted (${parsed.toc.length}):`, parsed.toc.map(t => `${t.id} -> ${t.text}`))
  console.log(`- HTML contains anchor IDs:`, parsed.html.includes('id="1-ignoring-applicability-threshold-requirements"'))
  console.log(`- Markdown ## converted to <h2>:`, parsed.html.includes('<h2 id='))
  console.log(`- Blockquote converted to <blockquote>:`, parsed.html.includes('<blockquote>'))

  if (!parsed.html.includes('<h2 id=') || parsed.toc.length !== 2) {
    throw new Error('Content Parser test failed!')
  }
  console.log('✓ Content Parser & TOC verification passed!\n')

  // 2. Test Zod Validation Schema
  console.log('Test 2: Zod Article Validation Schema')
  const validData = {
    title: 'Comprehensive Guide to Factory Compliance 2026',
    slug: 'comprehensive-guide-factory-compliance-2026',
    excerpt: 'Detailed operational checklist and statutory compliance manual.',
    content: parsed.html,
    authorId: 'test-author-id',
    published: false,
    keyTakeaways: ['Register factory under Factories Act', 'Maintain Form 1 registers'],
    relatedServices: ['factory-compliance', 'labour-compliance'],
    relatedArticleIds: []
  }

  const validParse = articleSchema.safeParse(validData)
  console.log('- Valid data parsing result:', validParse.success ? 'SUCCESS' : validParse.error)
  if (!validParse.success) throw new Error('Valid schema parsing failed')

  const invalidSlugData = {
    ...validData,
    slug: 'Invalid Slug with Spaces & Caps!'
  }
  const invalidParse = articleSchema.safeParse(invalidSlugData)
  console.log('- Invalid slug rejected:', !invalidParse.success)
  if (invalidParse.success) throw new Error('Invalid slug was improperly accepted')
  console.log('✓ Zod Schema verification passed!\n')

  // 3. Test Database Relations (Create -> Read -> Update -> Delete)
  console.log('Test 3: Database Article CRUD & Relational Transactions')
  const admin = await prisma.user.findFirst()
  if (!admin) {
    console.log('Skipping DB transaction test (no user in DB).')
    return
  }

  const testSlug = `qa-test-article-${Date.now()}`
  console.log(`- Creating test article with slug: ${testSlug}`)

  // Find another article to link as related
  const existingArticle = await prisma.article.findFirst({
    where: { slug: { not: testSlug } }
  })

  // Create article with all relations
  const created = await prisma.article.create({
    data: {
      title: 'QA Test Automated Article',
      slug: testSlug,
      excerpt: 'Automated test excerpt for QA verification.',
      content: parsed.html,
      category: 'articles',
      authorId: admin.id,
      published: false, // DRAFT
      keyTakeaways: {
        create: [
          { text: 'Takeaway 1: Review contractor registers monthly', sortOrder: 0 },
          { text: 'Takeaway 2: Verify minimum wage VDA notifications', sortOrder: 1 }
        ]
      },
      relatedServices: {
        create: [
          { serviceSlug: 'labour-compliance', sortOrder: 0 },
          { serviceSlug: 'factory-compliance', sortOrder: 1 }
        ]
      },
      ctaHeading: 'Need expert compliance advice?',
      ctaDescription: 'Speak with our senior HR consultants today.',
      ctaPrimaryLabel: 'Schedule Health Check',
      ctaPrimaryUrl: '/compliance-health-check',
      ctaSecondaryLabel: 'Contact Us',
      ctaSecondaryUrl: '/contact',
      seoTitle: 'QA Test Article SEO Title',
      metaDescription: 'SEO meta description for QA verification.',
      canonicalUrl: `https://www.labouraxis.com/resources/articles/${testSlug}`
    },
    include: {
      keyTakeaways: true,
      relatedServices: true
    }
  })

  console.log(`- Article created with ID: ${created.id}`)
  console.log(`- Key takeaways count: ${created.keyTakeaways.length}`)
  console.log(`- Related services count: ${created.relatedServices.length}`)

  // Link related article if exists
  if (existingArticle) {
    await prisma.articleToRelatedArticle.create({
      data: {
        fromId: created.id,
        toId: existingArticle.id,
        sortOrder: 0
      }
    })
    console.log(`- Linked related article: ${existingArticle.title} (${existingArticle.id})`)
  }

  // Verify Draft status (published: false)
  console.log(`- Draft status verified: published=${created.published}`)

  // Test Update: Publish and change takeaways
  console.log('- Updating article: publishing live & updating takeaways...')
  const updated = await prisma.article.update({
    where: { id: created.id },
    data: {
      published: true,
      publishedAt: new Date(),
      title: 'QA Test Automated Article (Published Live)',
      keyTakeaways: {
        deleteMany: {},
        create: [
          { text: 'Updated Takeaway: Immediate CLRA Registration', sortOrder: 0 }
        ]
      }
    },
    include: {
      keyTakeaways: true,
      relatedServices: true,
      relatedTo: { include: { toArticle: true } }
    }
  })

  console.log(`- Published status verified: published=${updated.published}, publishedAt=${updated.publishedAt}`)
  console.log(`- Updated takeaways count: ${updated.keyTakeaways.length} (${updated.keyTakeaways[0].text})`)
  console.log(`- Related articles count: ${updated.relatedTo.length}`)

  // Test Cascade Deletion
  console.log('- Cleaning up test article...')
  await prisma.article.delete({ where: { id: created.id } })

  const orphanedTakeaways = await prisma.articleTakeaway.findMany({ where: { articleId: created.id } })
  const orphanedServices = await prisma.articleRelatedService.findMany({ where: { articleId: created.id } })
  const orphanedRelatedLinks = await prisma.articleToRelatedArticle.findMany({ where: { fromId: created.id } })

  console.log(`- Orphaned takeaways remaining: ${orphanedTakeaways.length}`)
  console.log(`- Orphaned services remaining: ${orphanedServices.length}`)
  console.log(`- Orphaned related links remaining: ${orphanedRelatedLinks.length}`)

  if (orphanedTakeaways.length > 0 || orphanedServices.length > 0 || orphanedRelatedLinks.length > 0) {
    throw new Error('Cascade cleanup failed!')
  }

  console.log('✓ Article CRUD & Cascade cleanup verification passed!\n')

  console.log('====================================================')
  console.log('ALL QA AUTOMATED VERIFICATIONS PASSED SUCCESSFULLY!')
  console.log('====================================================')
}

runQA()
  .catch(e => {
    console.error('QA Test Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
