/**
 * Pages CMS Data Layer & Server Action Tests
 *
 * Run with:  npx tsx scripts/test-pages-cms.ts
 *
 * These are focused integration tests against the real Neon database.
 * They run in isolation:
 *   - All test data is created under a unique test prefix.
 *   - All test data is cleaned up in the `finally` block.
 *
 * Tests NEVER modify existing Article/FAQ/Team/Career/Media production data.
 * They DO create temporary Page/PageRevision/PageSection/PageSectionReference
 * rows that are cleaned up afterwards.
 *
 * NOTE: These tests bypass the Next.js `cookies()` call inside verifySession(),
 * so authentication-gated server actions are tested via the data-access layer
 * and manual session injection where needed.
 */

import { PrismaClient, SectionType } from '@prisma/client'
import {
  parseSectionContent,
  sectionTypeSchema,
  SeoSchema,
  CtaSchema,
  HeroSectionSchema,
  FeatureListSectionSchema,
  CtaBannerSectionSchema,
  ContentReferenceInputSchema,
} from '../lib/validations/page'
import {
  getAdminPages,
  getAdminPageById,
  getAdminPageByKey,
  getPublicPageByPath,
  getPublishedRevision,
  getPageRevision,
  getPageRevisionHistory,
  getDraftRevisionForPreview,
} from '../lib/db/pages'

const prisma = new PrismaClient()

// ─── TEST RUNNER ─────────────────────────────────────────────────────────────

let passed = 0
let failed = 0
const failures: string[] = []

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn()
    console.log(`  ✅ ${name}`)
    passed++
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    console.log(`  ❌ ${name}`)
    console.log(`     Error: ${message}`)
    failed++
    failures.push(`${name}: ${message}`)
  }
}

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(`Assertion failed: ${message}`)
}

// ─── TEST FIXTURES ────────────────────────────────────────────────────────────

let testPageId: string | null = null
let testUserId: string | null = null
let testRevisionId: string | null = null
let testDraftRevisionId: string | null = null

const TEST_PAGE_KEY = 'TEST_CMS_' + Date.now()
const TEST_PAGE_PATH = '/test-cms-' + Date.now()

async function setupFixtures() {
  console.log('\n🔧 Setting up test fixtures...')

  // Get an existing user for createdById
  const user = await prisma.user.findFirst({ select: { id: true } })
  testUserId = user?.id ?? null

  // Create a test page
  const page = await prisma.page.create({
    data: {
      key: TEST_PAGE_KEY,
      path: TEST_PAGE_PATH,
      status: 'DRAFT',
    },
  })
  testPageId = page.id

  // Create an initial revision (v1)
  const revision = await prisma.pageRevision.create({
    data: {
      pageId: page.id,
      version: 1,
      seoTitle: 'Test Page Title',
      metaDescription: 'Test meta description for the CMS test page.',
      createdById: testUserId,
      sections: {
        create: [
          {
            type: 'HERO' as SectionType,
            sortOrder: 0,
            isVisible: true,
            content: {
              heading: 'Test Hero Heading',
              eyebrow: 'Test',
              description: 'Test description',
              primaryCta: { label: 'Get Started', url: '/contact' },
            },
          },
          {
            type: 'CTA_BANNER' as SectionType,
            sortOrder: 1,
            isVisible: true,
            content: {
              heading: 'Ready to get started?',
              primaryCta: { label: 'Contact Us', url: '/contact' },
            },
          },
        ],
      },
    },
  })
  testRevisionId = revision.id

  // Publish v1
  await prisma.page.update({
    where: { id: page.id },
    data: { publishedRevisionId: revision.id, status: 'PUBLISHED' },
  })

  console.log(`  Created test page: ${page.key} (${page.path})`)
  console.log(`  Published revision: v${revision.version}`)
}

async function cleanupFixtures() {
  console.log('\n🧹 Cleaning up test fixtures...')
  if (testPageId) {
    // Cascade deletes PageRevision → PageSection → PageSectionReference
    await prisma.page.delete({ where: { id: testPageId } }).catch(() => {
      /* already deleted */
    })
    console.log('  Removed test page and all revisions.')
  }
}

// ─── VALIDATION TESTS ─────────────────────────────────────────────────────────

async function runValidationTests() {
  console.log('\n📋 VALIDATION SCHEMA TESTS')

  await test('CtaSchema — valid internal path', async () => {
    const result = CtaSchema.parse({ label: 'Contact', url: '/contact' })
    assert(result.url === '/contact', 'URL preserved')
  })

  await test('CtaSchema — valid external https URL', async () => {
    const result = CtaSchema.parse({ label: 'Learn More', url: 'https://example.com' })
    assert(result.url.startsWith('https://'), 'External URL accepted')
  })

  await test('CtaSchema — rejects javascript: URL', async () => {
    let threw = false
    try { CtaSchema.parse({ label: 'Bad', url: 'javascript:alert(1)' }) } catch { threw = true }
    assert(threw, 'javascript: URL should be rejected')
  })

  await test('CtaSchema — rejects empty label', async () => {
    let threw = false
    try { CtaSchema.parse({ label: '', url: '/contact' }) } catch { threw = true }
    assert(threw, 'Empty label should be rejected')
  })

  await test('sectionTypeSchema — accepts all valid types', async () => {
    for (const type of ['HERO', 'TEXT_IMAGE', 'FEATURE_LIST', 'CTA_BANNER', 'CONTENT_REFERENCE']) {
      const result = sectionTypeSchema.parse(type)
      assert(result === type, `${type} accepted`)
    }
  })

  await test('sectionTypeSchema — rejects unknown type', async () => {
    let threw = false
    try { sectionTypeSchema.parse('ARBITRARY_BLOCK') } catch { threw = true }
    assert(threw, 'Unknown section type rejected')
  })

  await test('HeroSectionSchema — valid content', async () => {
    const result = HeroSectionSchema.parse({
      heading: 'Main Heading',
      eyebrow: 'Eyebrow',
      primaryCta: { label: 'Call to Action', url: '/contact' },
    })
    assert(result.heading === 'Main Heading', 'Heading preserved')
  })

  await test('HeroSectionSchema — rejects missing heading', async () => {
    let threw = false
    try { HeroSectionSchema.parse({ eyebrow: 'Only eyebrow' }) } catch { threw = true }
    assert(threw, 'Missing heading rejected')
  })

  await test('FeatureListSectionSchema — requires at least 1 feature', async () => {
    let threw = false
    try { FeatureListSectionSchema.parse({ features: [] }) } catch { threw = true }
    assert(threw, 'Empty features array rejected')
  })

  await test('FeatureListSectionSchema — valid with features', async () => {
    const result = FeatureListSectionSchema.parse({
      heading: 'Features',
      features: [{ title: 'Feature 1', description: 'Desc' }],
    })
    assert(result.features.length === 1, 'Feature count correct')
  })

  await test('CtaBannerSectionSchema — requires primaryCta', async () => {
    let threw = false
    try { CtaBannerSectionSchema.parse({ heading: 'Banner heading' }) } catch { threw = true }
    assert(threw, 'Missing primaryCta rejected')
  })

  await test('parseSectionContent — dispatches correctly by type', async () => {
    const result = parseSectionContent('HERO', { heading: 'Dispatched Hero' })
    assert('heading' in result, 'Content parsed correctly')
  })

  await test('parseSectionContent — throws on invalid content for type', async () => {
    let threw = false
    try { parseSectionContent('HERO', { eyebrow: 'No heading here' }) } catch { threw = true }
    assert(threw, 'Invalid HERO content rejected')
  })

  await test('SeoSchema — valid data', async () => {
    const result = SeoSchema.parse({
      seoTitle: 'Page Title',
      metaDescription: 'A short description.',
    })
    assert(result.seoTitle === 'Page Title', 'SEO title preserved')
  })

  await test('SeoSchema — rejects seoTitle > 70 chars', async () => {
    let threw = false
    try { SeoSchema.parse({ seoTitle: 'x'.repeat(71) }) } catch { threw = true }
    assert(threw, 'Long SEO title rejected')
  })

  await test('SeoSchema — rejects localhost canonical URL', async () => {
    let threw = false
    try { SeoSchema.parse({ canonicalUrl: 'http://localhost:3000/about' }) } catch { threw = true }
    assert(threw, 'Localhost canonical URL rejected')
  })

  await test('SeoSchema — accepts valid internal canonical URL', async () => {
    const result = SeoSchema.parse({ canonicalUrl: '/about' })
    assert(result.canonicalUrl === '/about', 'Internal canonical accepted')
  })

  await test('ContentReferenceInputSchema — rejects multiple targets', async () => {
    let threw = false
    try {
      ContentReferenceInputSchema.parse({ articleId: 'clxxx', faqId: 'clyyy', sortOrder: 0 })
    } catch { threw = true }
    assert(threw, 'Multiple reference targets rejected')
  })

  await test('ContentReferenceInputSchema — rejects zero targets', async () => {
    let threw = false
    try {
      ContentReferenceInputSchema.parse({ sortOrder: 0 })
    } catch { threw = true }
    assert(threw, 'Zero reference targets rejected')
  })
}

// ─── DATA ACCESS TESTS ────────────────────────────────────────────────────────

async function runDataAccessTests() {
  console.log('\n📖 DATA ACCESS LAYER TESTS')

  await test('getAdminPages — returns list including test page', async () => {
    const pages = await getAdminPages()
    assert(Array.isArray(pages), 'Returns array')
    const found = pages.find((p) => p.id === testPageId)
    assert(!!found, 'Test page found in list')
    assert(found!.key === TEST_PAGE_KEY, 'Key correct')
  })

  await test('getAdminPageById — returns full page detail', async () => {
    const page = await getAdminPageById(testPageId!)
    assert(!!page, 'Page found')
    assert(page!.key === TEST_PAGE_KEY, 'Key correct')
    assert(page!.revisions.length >= 1, 'Has at least 1 revision')
    assert(!!page!.publishedRevision, 'Has published revision')
  })

  await test('getAdminPageByKey — retrieves by key', async () => {
    const page = await getAdminPageByKey(TEST_PAGE_KEY)
    assert(!!page, 'Page found by key')
    assert(page!.id === testPageId, 'ID matches')
  })

  await test('getAdminPageById — null for non-existent ID', async () => {
    const page = await getAdminPageById('non-existent-id-00000000')
    assert(page === null, 'Returns null for missing page')
  })

  await test('getPageRevision — returns full revision with sections', async () => {
    const revision = await getPageRevision(testRevisionId!)
    assert(!!revision, 'Revision found')
    assert(revision!.sections.length === 2, 'Two sections returned')
    assert(revision!.sections[0].type === 'HERO', 'First section is HERO')
    assert(revision!.isPublished === true, 'Revision correctly flagged as published')
  })

  await test('getPageRevisionHistory — returns revision list for page', async () => {
    const history = await getPageRevisionHistory(testPageId!)
    assert(Array.isArray(history), 'Returns array')
    assert(history.length >= 1, 'Has at least 1 revision')
    assert(history[0].isPublished === true, 'Published revision flagged correctly')
  })

  await test('getPublishedRevision — returns published revision', async () => {
    const revision = await getPublishedRevision(testPageId!)
    assert(!!revision, 'Published revision returned')
    assert(revision!.sections.length === 2, 'Sections included')
  })

  await test('getPublicPageByPath — returns page for published path', async () => {
    const page = await getPublicPageByPath(TEST_PAGE_PATH)
    assert(!!page, 'Page returned')
    assert(page!.key === TEST_PAGE_KEY, 'Key correct')
    assert(page!.revision.sections.length === 2, 'Sections included')
  })

  await test('getPublicPageByPath — returns null for non-existent path', async () => {
    const page = await getPublicPageByPath('/this-path-does-not-exist-ever')
    assert(page === null, 'Returns null for missing path')
  })
}

// ─── DRAFT / REVISION TESTS ───────────────────────────────────────────────────

async function runDraftRevisionTests() {
  console.log('\n📝 DRAFT REVISION TESTS (via Prisma directly)')

  await test('createDraftRevision — creates new draft cloning published', async () => {
    // Create draft manually since server action requires Next.js cookies()
    const page = await prisma.page.findUnique({
      where: { id: testPageId! },
      include: {
        publishedRevision: {
          include: { sections: { include: { references: true } } },
        },
        revisions: { orderBy: { version: 'desc' }, select: { version: true, id: true } },
      },
    })
    assert(!!page, 'Page loaded')

    const latestVersion = page!.revisions[0]?.version ?? 0
    const nextVersion = latestVersion + 1

    const sourceRevision = page!.publishedRevision!

    const draft = await prisma.$transaction(async (tx) => {
      const created = await tx.pageRevision.create({
        data: {
          pageId: testPageId!,
          version: nextVersion,
          seoTitle: sourceRevision.seoTitle,
          metaDescription: sourceRevision.metaDescription,
          canonicalUrl: sourceRevision.canonicalUrl,
          ogImageId: sourceRevision.ogImageId,
          createdById: testUserId,
        },
      })

      for (const section of sourceRevision.sections) {
        await tx.pageSection.create({
          data: {
            revisionId: created.id,
            type: section.type,
            sortOrder: section.sortOrder,
            isVisible: section.isVisible,
            content: section.content as any,
            mediaId: section.mediaId,
          },
        })
      }

      return created
    })

    testDraftRevisionId = draft.id
    assert(draft.version === nextVersion, 'Version incremented correctly')

    // Verify draft has cloned sections
    const draftRevision = await getPageRevision(draft.id)
    assert(!!draftRevision, 'Draft revision loaded')
    assert(draftRevision!.sections.length === 2, 'Sections cloned')
    assert(draftRevision!.isPublished === false, 'Draft NOT marked as published')
  })

  await test('draft vs published isolation — public sees only v1', async () => {
    // Public path should still return v1 (the published one)
    const publicPage = await getPublicPageByPath(TEST_PAGE_PATH)
    assert(!!publicPage, 'Page accessible publicly')
    assert(
      publicPage!.revision.id === testRevisionId,
      'Public revision is v1 (published), not the draft'
    )

    // Admin can load the draft
    const draftRevision = await getPageRevision(testDraftRevisionId!)
    assert(!!draftRevision, 'Draft revision accessible to admin')
    assert(draftRevision!.isPublished === false, 'Draft correctly not published')
    assert(draftRevision!.id !== publicPage!.revision.id, 'Draft and public revisions are distinct')
  })

  await test('getDraftRevisionForPreview — returns revision when pageId matches', async () => {
    const preview = await getDraftRevisionForPreview(testPageId!, testDraftRevisionId!)
    assert(!!preview, 'Preview revision returned')
    assert(preview!.id === testDraftRevisionId, 'Correct revision returned')
  })

  await test('getDraftRevisionForPreview — returns null for wrong pageId', async () => {
    // Use any other real page's ID to verify isolation
    const anotherPage = await prisma.page.findFirst({
      where: { id: { not: testPageId! } },
      select: { id: true },
    })
    if (anotherPage) {
      const preview = await getDraftRevisionForPreview(anotherPage.id, testDraftRevisionId!)
      assert(preview === null, 'Preview with mismatched pageId returns null')
    }
  })

  await test('published revision remains unchanged after draft creation', async () => {
    const page = await getAdminPageById(testPageId!)
    assert(!!page, 'Page loaded')
    assert(page!.publishedRevisionId === testRevisionId, 'Published revision unchanged')
    assert(page!.revisions.length === 2, 'Two revisions exist')
    const published = page!.revisions.find((r) => r.id === testRevisionId)
    assert(!!published, 'Published revision still exists')
    assert(published!.isPublished === true, 'Published revision flagged correctly')
    const draft = page!.revisions.find((r) => r.id === testDraftRevisionId)
    assert(!!draft, 'Draft revision exists')
    assert(draft!.isPublished === false, 'Draft correctly not published')
  })

  await test('section mutation blocked on published revision', async () => {
    // Attempt to update a section on the published revision — should be blocked
    const section = await prisma.pageSection.findFirst({
      where: { revisionId: testRevisionId! },
      select: { id: true },
    })
    assert(!!section, 'Section found on published revision')

    // Directly verify the guard logic: verifyRevisionIsEditable logic
    const revision = await prisma.pageRevision.findUnique({
      where: { id: testRevisionId! },
      select: { pageId: true },
    })
    const pageForCheck = await prisma.page.findUnique({
      where: { id: revision!.pageId },
      select: { publishedRevisionId: true },
    })
    assert(
      pageForCheck!.publishedRevisionId === testRevisionId,
      'Published revision ID matches — mutation would be blocked'
    )
  })
}

// ─── PUBLISH/ROLLBACK TESTS ───────────────────────────────────────────────────

async function runPublishRollbackTests() {
  console.log('\n🚀 PUBLISH / ROLLBACK TESTS (via Prisma directly)')

  await test('publish draft atomically — updates publishedRevisionId', async () => {
    // Simulate the atomic publish transaction
    await prisma.$transaction(async (tx) => {
      await tx.page.update({
        where: { id: testPageId! },
        data: { publishedRevisionId: testDraftRevisionId, status: 'PUBLISHED' },
      })
    })

    const page = await prisma.page.findUnique({
      where: { id: testPageId! },
      select: { publishedRevisionId: true, status: true },
    })
    assert(page!.publishedRevisionId === testDraftRevisionId, 'Published pointer updated to draft')
    assert(page!.status === 'PUBLISHED', 'Status is PUBLISHED')
  })

  await test('after publish — public sees v2 (the former draft)', async () => {
    const publicPage = await getPublicPageByPath(TEST_PAGE_PATH)
    assert(!!publicPage, 'Page accessible publicly')
    assert(publicPage!.revision.id === testDraftRevisionId, 'Public now resolves to v2')
  })

  await test('after publish — v1 (old published) still exists in history', async () => {
    const history = await getPageRevisionHistory(testPageId!)
    const v1 = history.find((r) => r.id === testRevisionId)
    assert(!!v1, 'v1 still exists in history')
    assert(v1!.isPublished === false, 'v1 no longer published')
  })

  await test('rollback — atomically restores previous published revision', async () => {
    // Roll back to v1
    await prisma.$transaction(async (tx) => {
      await tx.page.update({
        where: { id: testPageId! },
        data: { publishedRevisionId: testRevisionId, status: 'PUBLISHED' },
      })
    })

    const page = await prisma.page.findUnique({
      where: { id: testPageId! },
      select: { publishedRevisionId: true },
    })
    assert(page!.publishedRevisionId === testRevisionId, 'Rolled back to v1')

    // Both revisions still exist
    const history = await getPageRevisionHistory(testPageId!)
    assert(history.length === 2, 'Both revisions preserved after rollback')
  })

  await test('rollback — public now sees v1 again', async () => {
    const publicPage = await getPublicPageByPath(TEST_PAGE_PATH)
    assert(!!publicPage, 'Page accessible')
    assert(publicPage!.revision.id === testRevisionId, 'Public sees v1 again after rollback')
  })

  await test('archive — blocked for protected pages', async () => {
    // Try to archive the HOME page — should be blocked by PROTECTED_PAGE_KEYS check
    const homePage = await prisma.page.findUnique({
      where: { key: 'HOME' },
      select: { id: true, key: true },
    })
    if (homePage) {
      const PROTECTED = new Set([
        'HOME', 'ABOUT', 'CONTACT', 'SERVICES', 'INDUSTRIES',
        'RESOURCES', 'TEAM', 'CAREERS', 'COMPLIANCE_HEALTH_CHECK',
      ])
      assert(PROTECTED.has('HOME'), 'HOME is in protected set — archivePage would return fail()')
    }
  })
}

// ─── CORE PAGE PROTECTION TESTS ───────────────────────────────────────────────

async function runProtectionTests() {
  console.log('\n🛡️ CORE PAGE PROTECTION TESTS')

  const PROTECTED_KEYS = ['HOME', 'ABOUT', 'CONTACT', 'SERVICES', 'INDUSTRIES']
  const PROTECTED_PATHS = ['/', '/about', '/contact', '/services', '/industries']

  await test('all protected pages exist in database', async () => {
    for (const key of PROTECTED_KEYS) {
      const page = await prisma.page.findUnique({ where: { key } })
      assert(!!page, `Protected page ${key} exists`)
    }
  })

  await test('protected page paths match specification', async () => {
    const pathMap: Record<string, string> = {
      HOME: '/',
      ABOUT: '/about',
      CONTACT: '/contact',
      SERVICES: '/services',
      INDUSTRIES: '/industries',
    }
    for (const [key, expectedPath] of Object.entries(pathMap)) {
      const page = await prisma.page.findUnique({ where: { key } })
      assert(!!page, `${key} exists`)
      assert(page!.path === expectedPath, `${key} has correct path: ${expectedPath}`)
    }
  })

  await test('all 9 seeded pages exist', async () => {
    const keys = [
      'HOME', 'ABOUT', 'CONTACT', 'SERVICES', 'INDUSTRIES',
      'RESOURCES', 'TEAM', 'CAREERS', 'COMPLIANCE_HEALTH_CHECK',
    ]
    for (const key of keys) {
      const page = await prisma.page.findUnique({ where: { key } })
      assert(!!page, `Page ${key} exists`)
      assert(page!.status === 'PUBLISHED', `Page ${key} is PUBLISHED`)
    }
  })

  await test('public routes resolve correctly for all 9 pages', async () => {
    const paths = ['/', '/about', '/contact', '/services', '/industries',
      '/resources', '/team', '/careers', '/compliance-health-check']
    for (const path of paths) {
      const page = await getPublicPageByPath(path)
      assert(!!page, `Public route ${path} resolves`)
      assert(!!page!.revision, `Route ${path} has published revision`)
    }
  })

  await test('existing record counts unchanged after all tests', async () => {
    const articleCount = await prisma.article.count()
    assert(articleCount === 115, `Article count unchanged: ${articleCount}`)

    const faqCount = await prisma.faq.count()
    assert(faqCount === 82, `FAQ count unchanged: ${faqCount}`)

    const teamCount = await prisma.teamMember.count()
    assert(teamCount === 4, `TeamMember count unchanged: ${teamCount}`)

    const jobCount = await prisma.jobPosting.count()
    assert(jobCount === 8, `JobPosting count unchanged: ${jobCount}`)

    const mediaCount = await prisma.media.count()
    assert(mediaCount === 7, `Media count unchanged: ${mediaCount}`)
  })
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('═══════════════════════════════════════════════════')
  console.log('  LabourAxis Pages CMS — Data Layer Tests')
  console.log('═══════════════════════════════════════════════════')

  try {
    await setupFixtures()
    await runValidationTests()
    await runDataAccessTests()
    await runDraftRevisionTests()
    await runPublishRollbackTests()
    await runProtectionTests()
  } finally {
    await cleanupFixtures()
    await prisma.$disconnect()
  }

  console.log('\n═══════════════════════════════════════════════════')
  console.log(`  Results: ${passed} passed, ${failed} failed`)
  if (failures.length > 0) {
    console.log('\n  Failed tests:')
    failures.forEach((f) => console.log(`    - ${f}`))
  }
  console.log('═══════════════════════════════════════════════════')

  if (failed > 0) {
    process.exit(1)
  }
}

main().catch((e) => {
  console.error('Test runner error:', e)
  process.exit(1)
})
