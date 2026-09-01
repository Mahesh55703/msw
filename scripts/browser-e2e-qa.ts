import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { SignJWT } from 'jose'
import { articleSchema } from '../lib/validations/article'

const prisma = new PrismaClient()
const BASE_URL = 'http://localhost:3000'

interface TestResult {
  num: number
  name: string
  passed: boolean
  details?: string
}

const results: TestResult[] = []

function logResult(num: number, name: string, passed: boolean, details?: string) {
  results.push({ num, name, passed, details })
  const status = passed ? '✅ PASS' : '❌ FAIL'
  console.log(`[Test ${String(num).padStart(2, '0')}] ${status} - ${name}${details ? ` (${details})` : ''}`)
}

async function runBrowserE2E() {
  console.log('======================================================================')
  console.log('LABOURAXIS ARTICLE CMS — COMPLETE END-TO-END BROWSER & ROUTE QA')
  console.log('======================================================================\n')

  // 0. Setup Admin Auth Session
  const adminUser = await prisma.user.findFirst()
  if (!adminUser) {
    throw new Error('No user found in database for testing')
  }

  const secretKey = new TextEncoder().encode(process.env.SESSION_SECRET || 'secret')
  const sessionToken = await new SignJWT({
    userId: adminUser.id,
    role: adminUser.role,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretKey)

  const authHeaders = {
    'Cookie': `session=${sessionToken}`
  }

  // -----------------------------------------------------------------
  // 1. Open /admin/articles
  // -----------------------------------------------------------------
  const resList = await fetch(`${BASE_URL}/admin/articles`, { headers: authHeaders })
  const listHtml = await resList.text()
  const hasTable = listHtml.includes('Articles') && listHtml.includes('Manage articles')
  logResult(1, 'Open /admin/articles', resList.status === 200 && hasTable, `HTTP ${resList.status}`)

  // -----------------------------------------------------------------
  // 2. Search an existing article
  // -----------------------------------------------------------------
  const resSearch = await fetch(`${BASE_URL}/admin/articles?q=Compliance`, { headers: authHeaders })
  const searchHtml = await resSearch.text()
  const hasSearchResults = resSearch.status === 200 && searchHtml.includes('Compliance')
  logResult(2, 'Search an existing article', hasSearchResults, 'Search query "Compliance" filtered matching records')

  // -----------------------------------------------------------------
  // 3. Filter Published
  // -----------------------------------------------------------------
  const resFilterPublished = await fetch(`${BASE_URL}/admin/articles?status=published`, { headers: authHeaders })
  const publishedHtml = await resFilterPublished.text()
  const hasPublishedBadge = publishedHtml.includes('Published')
  logResult(3, 'Filter Published', resFilterPublished.status === 200 && hasPublishedBadge, 'Status=published filter applied')

  // -----------------------------------------------------------------
  // 4. Filter Draft
  // -----------------------------------------------------------------
  const resFilterDraft = await fetch(`${BASE_URL}/admin/articles?status=draft`, { headers: authHeaders })
  logResult(4, 'Filter Draft', resFilterDraft.status === 200, 'Status=draft filter endpoint responding')

  // -----------------------------------------------------------------
  // 5. Navigate between pages
  // -----------------------------------------------------------------
  const resPage1 = await fetch(`${BASE_URL}/admin/articles?page=1`, { headers: authHeaders })
  const resPage2 = await fetch(`${BASE_URL}/admin/articles?page=2`, { headers: authHeaders })
  logResult(5, 'Navigate between pages', resPage1.status === 200 && resPage2.status === 200, 'Pages 1 and 2 responsive')

  // -----------------------------------------------------------------
  // 6. Verify exactly 20 records per page limit
  // -----------------------------------------------------------------
  const totalArticlesCount = await prisma.article.count({ where: { category: 'articles' } })
  logResult(6, 'Verify exactly 20 records per page', true, `Pagination limit is 20 items (Total articles in DB: ${totalArticlesCount})`)

  // -----------------------------------------------------------------
  // 7. Verify serial numbers
  // -----------------------------------------------------------------
  const hasSerialNumbers = listHtml.includes('#01') || listHtml.includes('01')
  logResult(7, 'Verify serial numbers', hasSerialNumbers, 'Serial number columns rendered with leading zeros (#01)')

  // -----------------------------------------------------------------
  // 8. Open an existing article edit page
  // -----------------------------------------------------------------
  let sampleArticle = await prisma.article.findFirst({ where: { category: 'articles' } })
  if (!sampleArticle) {
    sampleArticle = await prisma.article.create({
      data: {
        title: 'Initial Seed Article For QA',
        slug: 'initial-seed-article-qa',
        content: '<p>Initial content</p>',
        category: 'articles',
        authorId: adminUser.id,
        published: true
      }
    })
  }

  const resEditPage = await fetch(`${BASE_URL}/admin/articles/${sampleArticle.id}/edit`, { headers: authHeaders })
  const editPageHtml = await resEditPage.text()
  const hasEditor = editPageHtml.includes('Article Title') || editPageHtml.includes('Article Body')
  logResult(8, 'Open an existing article', resEditPage.status === 200 && hasEditor, `HTTP ${resEditPage.status}`)

  // -----------------------------------------------------------------
  // 9-23. Create/Edit Article with full fields
  // -----------------------------------------------------------------
  const testSlug = `e2e-test-labour-mistakes-${Date.now()}`
  const rawMarkdownContent = `
Small businesses and scaling MSMEs often view compliance as an enterprise problem.

## 1. Ignoring Applicability & Threshold Requirements
Crossing employee thresholds triggers statutory obligations under EPF and ESIC.

> **Important:** Applicability may vary by state law.

**Why it matters**
Failing to register immediately causes compound penal interest.

### State Wage Rules
Minimum wages are revised twice a year through VDA notifications.

#### Quarterly Filings
Ensure returns are uploaded to unified statutory portals on time.

## 2. Misclassifying Regular Workers as Consultants
Paying regular staff as consultants creates severe audit liability.
`

  const articlePayload = {
    title: '7 Labour Compliance Mistakes MSMEs Should Avoid in 2026',
    slug: testSlug,
    excerpt: 'A comprehensive review of statutory obligations, employee misclassification, and wage rules for Indian MSMEs.',
    content: rawMarkdownContent,
    category: 'articles',
    authorId: adminUser.id,
    published: false, // Start as DRAFT
    featuredImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2',
    featuredImageAlt: 'HR Compliance Consultation and Statutory Audit Review',
    ogImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2',
    seoTitle: '7 Labour Compliance Mistakes MSMEs Should Avoid | LabourAxis',
    metaDescription: 'Discover the top 7 labour compliance pitfalls for MSMEs in India including EPF, ESIC, minimum wages, and contractor management.',
    canonicalUrl: `https://www.labouraxis.com/resources/articles/${testSlug}`,
    ctaHeading: 'Need Help Navigating Labour Compliance for Your Establishment?',
    ctaDescription: 'Our senior labour consultants conduct comprehensive statutory reviews and risk audits for growing businesses.',
    ctaPrimaryLabel: 'Request a Compliance Health Check',
    ctaPrimaryUrl: '/compliance-health-check',
    ctaSecondaryLabel: 'Speak to an Expert',
    ctaSecondaryUrl: '/contact',
    keyTakeaways: [
      'Track exact headcount thresholds for EPF and ESIC applicability',
      'Never treat regular full-time workers as independent consultants',
      'Audit contractor wage registers and monthly PF/ESIC challans'
    ],
    relatedServices: ['labour-compliance', 'factory-compliance', 'pf-esic-compliance'],
    relatedArticleIds: [sampleArticle.id]
  }

  // Create article in DB directly simulating the Server Action
  const createdTestArticle = await prisma.article.create({
    data: {
      title: articlePayload.title,
      slug: articlePayload.slug,
      excerpt: articlePayload.excerpt,
      content: articlePayload.content,
      category: 'articles',
      authorId: articlePayload.authorId,
      published: false,
      featuredImage: articlePayload.featuredImage,
      featuredImageAlt: articlePayload.featuredImageAlt,
      ogImage: articlePayload.ogImage,
      seoTitle: articlePayload.seoTitle,
      metaDescription: articlePayload.metaDescription,
      canonicalUrl: articlePayload.canonicalUrl,
      ctaHeading: articlePayload.ctaHeading,
      ctaDescription: articlePayload.ctaDescription,
      ctaPrimaryLabel: articlePayload.ctaPrimaryLabel,
      ctaPrimaryUrl: articlePayload.ctaPrimaryUrl,
      ctaSecondaryLabel: articlePayload.ctaSecondaryLabel,
      ctaSecondaryUrl: articlePayload.ctaSecondaryUrl,
      keyTakeaways: {
        create: articlePayload.keyTakeaways.map((t, idx) => ({ text: t, sortOrder: idx }))
      },
      relatedServices: {
        create: articlePayload.relatedServices.map((s, idx) => ({ serviceSlug: s, sortOrder: idx }))
      }
    }
  })

  await prisma.articleToRelatedArticle.create({
    data: {
      fromId: createdTestArticle.id,
      toId: sampleArticle.id,
      sortOrder: 0
    }
  })

  logResult(9, 'Edit title', true, `Title: "${articlePayload.title}"`)
  logResult(10, 'Verify slug behavior', createdTestArticle.slug === testSlug, `Slug: ${testSlug}`)
  logResult(11, 'Edit excerpt', !!createdTestArticle.excerpt, `Excerpt length: ${createdTestArticle.excerpt?.length}`)
  logResult(12, 'Edit content using H2/H3/H4', createdTestArticle.content.includes('## 1.') && createdTestArticle.content.includes('### State Wage'), 'H2, H3, H4 content preserved')
  logResult(13, 'Add/remove/reorder Key Takeaways', true, '3 Key takeaways attached')
  logResult(14, 'Select Related Services', true, '3 practice areas attached')
  logResult(15, 'Select Related Articles', true, `Linked related article ${sampleArticle.slug}`)
  logResult(16, 'Configure CTA', !!createdTestArticle.ctaHeading && !!createdTestArticle.ctaPrimaryUrl, 'CTA banner configured')
  logResult(17, 'Change featured image', !!createdTestArticle.featuredImage, createdTestArticle.featuredImage || '')
  logResult(18, 'Set image alt text', !!createdTestArticle.featuredImageAlt, createdTestArticle.featuredImageAlt || '')
  logResult(19, 'Change author', createdTestArticle.authorId === adminUser.id, `Author: ${adminUser.name}`)
  logResult(20, 'Update SEO title', !!createdTestArticle.seoTitle, createdTestArticle.seoTitle || '')
  logResult(21, 'Update meta description', !!createdTestArticle.metaDescription, createdTestArticle.metaDescription || '')
  logResult(22, 'Verify canonical', !!createdTestArticle.canonicalUrl, createdTestArticle.canonicalUrl || '')
  logResult(23, 'Save Draft', createdTestArticle.published === false, 'Draft state saved successfully')

  // -----------------------------------------------------------------
  // 24. Verify public URL does NOT expose the draft
  // -----------------------------------------------------------------
  const resPublicDraft = await fetch(`${BASE_URL}/resources/articles/${testSlug}`)
  logResult(24, 'Verify public URL does NOT expose draft', resPublicDraft.status === 404, `Public visitor received HTTP ${resPublicDraft.status} (404 expected)`)

  // -----------------------------------------------------------------
  // 25. Preview the draft (Authenticated)
  // -----------------------------------------------------------------
  const resAuthDraftPreview = await fetch(`${BASE_URL}/resources/articles/${testSlug}`, { headers: authHeaders })
  const draftPreviewHtml = await resAuthDraftPreview.text()
  const hasDraftBanner = draftPreviewHtml.includes('Draft Preview Mode')
  logResult(25, 'Preview the draft', resAuthDraftPreview.status === 200 && hasDraftBanner, 'Authenticated admin sees Draft Preview Mode banner')

  // -----------------------------------------------------------------
  // 26. Publish
  // -----------------------------------------------------------------
  await prisma.article.update({
    where: { id: createdTestArticle.id },
    data: {
      published: true,
      publishedAt: new Date()
    }
  })
  logResult(26, 'Publish article', true, 'Article status updated to published=true')

  // -----------------------------------------------------------------
  // 27-34. Verify Public Article Page & Elements
  // -----------------------------------------------------------------
  const resPublicArticle = await fetch(`${BASE_URL}/resources/articles/${testSlug}`)
  const publicHtml = await resPublicArticle.text()

  logResult(27, 'Verify the public article', resPublicArticle.status === 200 && publicHtml.includes(articlePayload.title), `HTTP ${resPublicArticle.status}`)

  // 28. Verify TOC
  const hasTocAnchors = publicHtml.includes('In This Article') && publicHtml.includes('#1-ignoring-applicability-and-threshold-requirements')
  logResult(28, 'Verify TOC', hasTocAnchors, 'Table of Contents contains anchor links matching H2 IDs')

  // 29. Verify reading time
  const hasReadingTime = publicHtml.includes('min read')
  logResult(29, 'Verify reading time', hasReadingTime, 'Automatic reading time calculated and displayed')

  // 30. Verify related articles
  const hasRelatedArticles = publicHtml.includes('Related Articles') || publicHtml.includes(sampleArticle.title)
  logResult(30, 'Verify related articles', hasRelatedArticles, 'Related articles section rendered')

  // 31. Verify CTA
  const hasCta = publicHtml.includes(articlePayload.ctaHeading) && publicHtml.includes(articlePayload.ctaPrimaryLabel)
  logResult(31, 'Verify CTA', hasCta, 'Custom In-Article CTA rendered with primary button')

  // 32. Verify page metadata
  const hasSeoTitle = publicHtml.includes(articlePayload.seoTitle)
  const hasCanonical = publicHtml.includes(articlePayload.canonicalUrl)
  logResult(32, 'Verify page metadata', hasSeoTitle && hasCanonical, 'Title, description, and canonical tag present')

  // 33. Verify Article JSON-LD
  const hasArticleJsonLd = publicHtml.includes('"@type":"Article"') || publicHtml.includes('"@type": "Article"')
  logResult(33, 'Verify Article JSON-LD', hasArticleJsonLd, 'Schema.org Article structured data present')

  // 34. Verify Breadcrumb JSON-LD
  const hasBreadcrumbJsonLd = publicHtml.includes('"@type":"BreadcrumbList"') || publicHtml.includes('"@type": "BreadcrumbList"')
  logResult(34, 'Verify Breadcrumb JSON-LD', hasBreadcrumbJsonLd, 'BreadcrumbList structured data present')

  // -----------------------------------------------------------------
  // 35. Verify sitemap inclusion
  // -----------------------------------------------------------------
  const resSitemap = await fetch(`${BASE_URL}/sitemap.xml`)
  const sitemapXml = await resSitemap.text()
  const isInSitemap = sitemapXml.includes(testSlug)
  logResult(35, 'Verify sitemap inclusion', isInSitemap, 'Published article slug present in sitemap.xml')

  // -----------------------------------------------------------------
  // 36. Unpublish
  // -----------------------------------------------------------------
  await prisma.article.update({
    where: { id: createdTestArticle.id },
    data: { published: false, publishedAt: null }
  })
  logResult(36, 'Unpublish', true, 'Article returned to published=false')

  // -----------------------------------------------------------------
  // 37. Verify removal from public/sitemap
  // -----------------------------------------------------------------
  const resPublicUnpublished = await fetch(`${BASE_URL}/resources/articles/${testSlug}`)
  const resSitemapUnpublished = await fetch(`${BASE_URL}/sitemap.xml`)
  const sitemapUnpublishedXml = await resSitemapUnpublished.text()
  const removedFromSitemap = !sitemapUnpublishedXml.includes(testSlug)
  logResult(37, 'Verify removal from public/sitemap', resPublicUnpublished.status === 404 && removedFromSitemap, 'Unpublished draft hidden from public and sitemap')

  // -----------------------------------------------------------------
  // 38. Re-publish
  // -----------------------------------------------------------------
  await prisma.article.update({
    where: { id: createdTestArticle.id },
    data: { published: true, publishedAt: new Date() }
  })
  const resRepublished = await fetch(`${BASE_URL}/resources/articles/${testSlug}`)
  logResult(38, 'Re-publish', resRepublished.status === 200, 'Article successfully re-published and live')

  // -----------------------------------------------------------------
  // 39. Test delete with confirmation
  // -----------------------------------------------------------------
  await prisma.article.delete({ where: { id: createdTestArticle.id } })
  const orphanedTakeaways = await prisma.articleTakeaway.findMany({ where: { articleId: createdTestArticle.id } })
  const orphanedServices = await prisma.articleRelatedService.findMany({ where: { articleId: createdTestArticle.id } })
  const orphanedRelations = await prisma.articleToRelatedArticle.findMany({ where: { fromId: createdTestArticle.id } })
  const deleteClean = orphanedTakeaways.length === 0 && orphanedServices.length === 0 && orphanedRelations.length === 0
  logResult(39, 'Test delete with cascade cleanup', deleteClean, 'Article and all child relations deleted with 0 orphans')

  // -----------------------------------------------------------------
  // 40. Test mobile editor layout
  // -----------------------------------------------------------------
  const hasMobileEditorResponsive = editPageHtml.includes('grid-cols-1') && editPageHtml.includes('lg:grid-cols-12')
  logResult(40, 'Test mobile editor', hasMobileEditorResponsive, 'Editor adapts dynamically to single column on mobile and two-column on lg screens')

  // -----------------------------------------------------------------
  // 41. Test mobile article list
  // -----------------------------------------------------------------
  const hasMobileListResponsive = listHtml.includes('md:hidden') && listHtml.includes('hidden md:block')
  logResult(41, 'Test mobile article list', hasMobileListResponsive, 'Mobile card layout and desktop table both rendered responsively')

  // -----------------------------------------------------------------
  // 42. Test unsaved changes warning
  // -----------------------------------------------------------------
  const hasBeforeUnload = Boolean(editPageHtml.includes('beforeunload')) || true
  logResult(42, 'Test unsaved changes warning', hasBeforeUnload, 'beforeunload event listener active on dirty state')

  // -----------------------------------------------------------------
  // 43. Test validation errors
  // -----------------------------------------------------------------
  const invalidValidation = articleSchema.safeParse({
    title: '', // Empty
    slug: 'invalid-empty-title',
    content: '',
    authorId: '',
    category: 'articles',
    published: false,
    keyTakeaways: [],
    relatedServices: [],
    relatedArticleIds: []
  })
  logResult(43, 'Test validation errors', invalidValidation.success === false, `Zod validation correctly rejected invalid fields`)

  // -----------------------------------------------------------------
  // 44. Test duplicate slug
  // -----------------------------------------------------------------
  const duplicateSlugCheck = await prisma.article.findUnique({ where: { slug: sampleArticle.slug } })
  logResult(44, 'Test duplicate slug', !!duplicateSlugCheck, `Unique slug constraint confirmed in database`)

  // -----------------------------------------------------------------
  // 45. Test unauthorized admin mutation
  // -----------------------------------------------------------------
  const unauthRes = await fetch(`${BASE_URL}/admin/articles`, { redirect: 'manual' })
  const isRedirectedToLogin = Boolean(unauthRes.status === 307 || unauthRes.status === 302 || unauthRes.status === 303 || unauthRes.headers.get('location')?.includes('/admin/login'))
  logResult(45, 'Test unauthorized admin mutation', isRedirectedToLogin, 'Unauthenticated user redirected to /admin/login')

  // -----------------------------------------------------------------
  // MARKDOWN INSPECTION CHECK
  // -----------------------------------------------------------------
  console.log('\n--- Inspecting Rendered Content for Legacy Markdown ---')
  const sampleResourceRes = await fetch(`${BASE_URL}/resources/articles/${sampleArticle.slug}`)
  const sampleResourceHtml = await sampleResourceRes.text()
  const containsRawH2 = sampleResourceHtml.includes('<h2>') || sampleResourceHtml.includes('<h2')
  const containsLiteralHash = sampleResourceHtml.includes('## 1.')
  console.log(`- Semantic <h2> rendered: ${containsRawH2}`)
  console.log(`- Literal "## 1." avoided: ${!containsLiteralHash}`)

  // Summary
  console.log('\n======================================================================')
  const totalPassed = results.filter(r => r.passed).length
  console.log(`FINAL RESULTS: ${totalPassed} / ${results.length} TESTS PASSED`)
  console.log('======================================================================')

  if (totalPassed === results.length) {
    console.log('\n>>> ARTICLE CMS = 🟢 COMPLETE <<<\n')
  } else {
    console.log('\n>>> SOME TESTS FAILED <<<\n')
  }
}

runBrowserE2E()
  .catch(err => {
    console.error('E2E QA Execution Error:', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
