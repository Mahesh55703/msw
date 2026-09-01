import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { SignJWT } from 'jose'

const prisma = new PrismaClient()
const BASE_URL = process.env.TEST_URL || 'http://localhost:3000'

interface TestResult {
  suite: string
  testId: number
  description: string
  passed: boolean
  details: string
}

const results: TestResult[] = []

function logResult(suite: string, testId: number, description: string, passed: boolean, details: string) {
  results.push({ suite, testId, description, passed, details })
  const status = passed ? '✅ PASS' : '❌ FAIL'
  console.log(`[${suite} | Test ${String(testId).padStart(2, '0')}] ${status} - ${description} (${details})`)
}

async function runCareersQA() {
  console.log('======================================================================')
  console.log('LABOURAXIS — CAREERS CMS & JOBPOSTING PRODUCTION QA MATRIX')
  console.log('======================================================================\n')

  // Generate Admin Session
  const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
  if (!adminUser) throw new Error('No admin user found')

  const secretKey = new TextEncoder().encode(process.env.SESSION_SECRET || 'secret')
  const sessionToken = await new SignJWT({
    userId: adminUser.id,
    role: adminUser.role,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretKey)

  const authHeaders = { headers: { Cookie: `session=${sessionToken}` } }

  // -----------------------------------------------------------------
  // 1. ADMIN DIRECTORY & FILTERS
  // -----------------------------------------------------------------
  console.log('--- 1. ADMIN DIRECTORY & FILTERS ---')
  const resAdminList = await fetch(`${BASE_URL}/admin/careers`, authHeaders)
  logResult('ADMIN_LIST', 1, 'Open /admin/careers', resAdminList.status === 200, `HTTP ${resAdminList.status}`)

  const textAdminList = await resAdminList.text()
  logResult('ADMIN_LIST', 2, 'Careers Header present', textAdminList.includes('Careers') && textAdminList.includes('Manage current and future career opportunities'), 'Header verified')
  logResult('ADMIN_LIST', 3, 'Search & Status tabs rendered', textAdminList.includes('Search positions') && textAdminList.includes('Published'), 'Toolbar rendered')

  const resFilterPublished = await fetch(`${BASE_URL}/admin/careers?status=published`, authHeaders)
  logResult('ADMIN_LIST', 4, 'Filter Published positions', resFilterPublished.status === 200, `HTTP ${resFilterPublished.status}`)

  const resFilterDraft = await fetch(`${BASE_URL}/admin/careers?status=draft`, authHeaders)
  logResult('ADMIN_LIST', 5, 'Filter Draft positions', resFilterDraft.status === 200, `HTTP ${resFilterDraft.status}`)

  const resFilterClosed = await fetch(`${BASE_URL}/admin/careers?status=closed`, authHeaders)
  logResult('ADMIN_LIST', 6, 'Filter Closed positions', resFilterClosed.status === 200, `HTTP ${resFilterClosed.status}`)

  const resFilterExpired = await fetch(`${BASE_URL}/admin/careers?status=expired`, authHeaders)
  logResult('ADMIN_LIST', 7, 'Filter Expired positions', resFilterExpired.status === 200, `HTTP ${resFilterExpired.status}`)

  // -----------------------------------------------------------------
  // 2. CREATE DRAFT JOB & DRAFT SECURITY
  // -----------------------------------------------------------------
  console.log('\n--- 2. CREATE DRAFT JOB & DRAFT SECURITY ---')
  const testDraftSlug = `test-lead-auditor-${Date.now()}`
  const createdDraft = await prisma.jobPosting.create({
    data: {
      title: 'Principal Statutory Audit Specialist',
      slug: testDraftSlug,
      department: 'Labour Compliance',
      location: 'Indore / Hybrid',
      employmentType: 'Full-time',
      type: 'Full-time',
      workMode: 'Hybrid',
      experience: '5+ years in Factory Compliance',
      salary: '₹12,00,000 – ₹18,00,000 PA',
      description: 'Lead nationwide factory compliance audits and statutory risk assessments for manufacturing clients.',
      responsibilities: 'Conduct statutory audit assessments.\nDefend client factories during department inspections.',
      requirements: 'LLB or Master in Labour Laws.\n5+ years industrial compliance experience.',
      applicationMethod: 'Email',
      applicationEmail: 'careers@labouraxis.com',
      status: 'DRAFT',
      isActive: false,
      displayOrder: 1,
      seoTitle: 'Principal Statutory Audit Specialist | LabourAxis',
      metaDescription: 'Join LabourAxis as Principal Statutory Audit Specialist.',
    },
  })

  logResult('DRAFT', 8, 'Create Draft Job in DB', !!createdDraft.id, `ID: ${createdDraft.id}`)

  // Unauthenticated request to draft detail page must return 404
  const resPublicDraft = await fetch(`${BASE_URL}/careers/${testDraftSlug}`)
  logResult('DRAFT', 9, 'Unauthenticated Draft Access Blocked (HTTP 404)', resPublicDraft.status === 404, `HTTP ${resPublicDraft.status}`)

  const textPublicDraft = await resPublicDraft.text()
  logResult('DRAFT', 10, 'Draft omits JobPosting JSON-LD for public', !textPublicDraft.includes('"@type":"JobPosting"'), 'No schema in 404')

  // Authenticated staff preview of draft
  const resAuthDraft = await fetch(`${BASE_URL}/careers/${testDraftSlug}`, authHeaders)
  logResult('DRAFT', 11, 'Authenticated Staff Preview of Draft (HTTP 200)', resAuthDraft.status === 200, `HTTP ${resAuthDraft.status}`)

  const textAuthDraft = await resAuthDraft.text()
  logResult('DRAFT', 12, 'Draft Preview Banner shown to Admin', textAuthDraft.includes('DRAFT PREVIEW MODE'), 'Preview banner verified')
  logResult('DRAFT', 13, 'Draft omits JobPosting JSON-LD even during Preview', !textAuthDraft.includes('"@type":"JobPosting"'), 'No schema for draft')

  // -----------------------------------------------------------------
  // 3. PUBLISHING & POSITIVE JOBPOSTING SCHEMA
  // -----------------------------------------------------------------
  console.log('\n--- 3. PUBLISHING & POSITIVE JOBPOSTING SCHEMA ---')
  const futureClosing = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  const publishedJob = await prisma.jobPosting.update({
    where: { id: createdDraft.id },
    data: {
      status: 'PUBLISHED',
      isActive: true,
      publishedAt: new Date(),
      closingDate: futureClosing,
    },
  })

  logResult('PUBLISH', 14, 'Publish Job in Database', publishedJob.status === 'PUBLISHED', 'Status = PUBLISHED')

  const resPublicPublished = await fetch(`${BASE_URL}/careers/${testDraftSlug}`)
  logResult('PUBLISH', 15, 'Public Access to Published Job (HTTP 200)', resPublicPublished.status === 200, `HTTP ${resPublicPublished.status}`)

  const textPublicPublished = await resPublicPublished.text()
  const hasJobPostingSchema = textPublicPublished.includes('"@type":"JobPosting"') && textPublicPublished.includes('Principal Statutory Audit Specialist')
  logResult('PUBLISH', 16, 'POSITIVE Schema Test: JobPosting JSON-LD rendered', hasJobPostingSchema, 'Schema.org JobPosting found')

  const hasHiringOrg = textPublicPublished.includes('"name":"LabourAxis"')
  logResult('PUBLISH', 17, 'JobPosting schema includes HiringOrganization', hasHiringOrg, 'LabourAxis present')

  // Public Listing /careers contains published job
  const resPublicListing = await fetch(`${BASE_URL}/careers`)
  const textPublicListing = await resPublicListing.text()
  logResult('PUBLISH', 18, 'Public /careers lists active published job', textPublicListing.includes('Principal Statutory Audit Specialist'), 'Listed in Active Openings')

  // Sitemap includes published job
  const sitemapFn = (await import('../app/sitemap')).default
  const sitemapRoutes = await sitemapFn()
  const hasInSitemap = sitemapRoutes.some((r) => r.url.includes(`/careers/${testDraftSlug}`))
  logResult('PUBLISH', 19, 'Sitemap includes active published job URL', hasInSitemap, 'Found in dynamic sitemap')

  // -----------------------------------------------------------------
  // 4. CLOSING LIFECYCLE & NEGATIVE SCHEMA TEST
  // -----------------------------------------------------------------
  console.log('\n--- 4. CLOSING LIFECYCLE & NEGATIVE SCHEMA TEST ---')
  const closedJob = await prisma.jobPosting.update({
    where: { id: createdDraft.id },
    data: {
      status: 'CLOSED',
      isActive: false,
    },
  })

  logResult('CLOSED', 20, 'Close Position in Database', closedJob.status === 'CLOSED', 'Status = CLOSED')

  const resPublicClosed = await fetch(`${BASE_URL}/careers/${testDraftSlug}`)
  const textPublicClosed = await resPublicClosed.text()
  logResult('CLOSED', 21, 'Closed Position shows Closed Banner', textPublicClosed.includes('This position is currently closed'), 'Closed banner rendered')

  const closedHasNoSchema = !textPublicClosed.includes('"@type":"JobPosting"')
  logResult('CLOSED', 22, 'NEGATIVE Schema Test: Closed position omits JobPosting JSON-LD', closedHasNoSchema, 'Schema omitted')

  const resListingAfterClose = await fetch(`${BASE_URL}/careers`)
  const textListingAfterClose = await resListingAfterClose.text()
  logResult('CLOSED', 23, 'Closed position excluded from active openings list', !textListingAfterClose.includes('Principal Statutory Audit Specialist'), 'Excluded from /careers')

  // -----------------------------------------------------------------
  // 5. EXPIRATION LIFECYCLE & NEGATIVE SCHEMA TEST
  // -----------------------------------------------------------------
  console.log('\n--- 5. EXPIRATION LIFECYCLE & NEGATIVE SCHEMA TEST ---')
  const expiredJob = await prisma.jobPosting.update({
    where: { id: createdDraft.id },
    data: {
      status: 'PUBLISHED', // status is published but closing date is in the past!
      closingDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
    },
  })

  logResult('EXPIRED', 24, 'Set Job Deadline to Past Date', !!expiredJob.closingDate, 'Deadline = Yesterday')

  const resPublicExpired = await fetch(`${BASE_URL}/careers/${testDraftSlug}`)
  const textPublicExpired = await resPublicExpired.text()
  const expiredHasNoSchema = !textPublicExpired.includes('"@type":"JobPosting"')
  logResult('EXPIRED', 25, 'NEGATIVE Schema Test: Expired job omits JobPosting JSON-LD', expiredHasNoSchema, 'Schema omitted')

  const resListingAfterExpired = await fetch(`${BASE_URL}/careers`)
  const textListingAfterExpired = await resListingAfterExpired.text()
  logResult('EXPIRED', 26, 'Expired job excluded from active openings on /careers', !textListingAfterExpired.includes('Principal Statutory Audit Specialist'), 'Excluded from active list')

  // -----------------------------------------------------------------
  // 6. DELETE LIFECYCLE
  // -----------------------------------------------------------------
  console.log('\n--- 6. DELETE LIFECYCLE ---')
  await prisma.jobPosting.delete({ where: { id: createdDraft.id } })
  const deletedCheck = await prisma.jobPosting.findUnique({ where: { id: createdDraft.id } })
  logResult('DELETE', 27, 'Delete Position from Database', !deletedCheck, 'Deleted cleanly')

  const resDeletedPage = await fetch(`${BASE_URL}/careers/${testDraftSlug}`)
  logResult('DELETE', 28, 'Deleted position returns 404', resDeletedPage.status === 404, `HTTP ${resDeletedPage.status}`)

  // -----------------------------------------------------------------
  // 7. SECURITY & AUTHORIZATION
  // -----------------------------------------------------------------
  console.log('\n--- 7. SECURITY & AUTHORIZATION ---')
  const resUnauthAdmin = await fetch(`${BASE_URL}/admin/careers`, { redirect: 'manual' })
  logResult('SECURITY', 29, 'Unauthenticated /admin/careers Redirects', resUnauthAdmin.status === 307 || resUnauthAdmin.status === 302, `HTTP ${resUnauthAdmin.status}`)

  // Summary
  const passedCount = results.filter((r) => r.passed).length
  console.log('\n======================================================================')
  console.log(`FINAL RESULTS: ${passedCount} / ${results.length} CAREERS CMS TESTS PASSED`)
  console.log('======================================================================\n')

  if (passedCount === results.length) {
    console.log('>>> CAREERS CMS = 🟢 COMPLETE <<<\n')
  } else {
    console.error('>>> CAREERS CMS = 🔴 FAILED TESTS DETECTED <<<\n')
    process.exit(1)
  }
}

runCareersQA()
  .catch((e) => {
    console.error('Careers QA Runner exception:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
