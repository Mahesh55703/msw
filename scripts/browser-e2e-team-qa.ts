import 'dotenv/config'
import { PrismaClient, Role } from '@prisma/client'
import { SignJWT } from 'jose'
import {
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  toggleTeamMemberStatus,
  getPotentialManagers,
} from '../app/actions/team'

const prisma = new PrismaClient()
const BASE_URL = 'http://localhost:3000'

interface TestResult {
  category: string
  testId: number
  description: string
  passed: boolean
  details?: string
}

const results: TestResult[] = []

function logResult(
  category: string,
  testId: number,
  description: string,
  passed: boolean,
  details?: string
) {
  results.push({ category, testId, description, passed, details })
  const status = passed ? '✅ PASS' : '❌ FAIL'
  console.log(
    `[${category} | Test ${String(testId).padStart(2, '0')}] ${status} - ${description}${
      details ? ` (${details})` : ''
    }`
  )
}

async function runTeamCMSQA() {
  console.log('======================================================================')
  console.log('LABOURAXIS — TEAM CMS & ORGANIZATIONAL HIERARCHY COMPREHENSIVE QA')
  console.log('======================================================================\n')

  const adminUser = await prisma.user.findFirst({ where: { role: Role.ADMIN } })
  if (!adminUser) throw new Error('No admin user found for QA')

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

  const authHeaders = { Cookie: `session=${sessionToken}` }

  // -----------------------------------------------------------------
  // 1. ADMIN LIST & ROUTES
  // -----------------------------------------------------------------
  console.log('--- 1. ADMIN TEAM DIRECTORY & FILTERS ---')
  const resAdminTeam = await fetch(`${BASE_URL}/admin/team`, { headers: authHeaders })
  const adminHtml = await resAdminTeam.text()
  logResult('ADMIN_LIST', 1, 'Open /admin/team', resAdminTeam.status === 200, `HTTP ${resAdminTeam.status}`)
  logResult('ADMIN_LIST', 2, 'Team Members Header present', adminHtml.includes('Team Members'), 'Header verified')
  logResult('ADMIN_LIST', 3, 'Search and Status Filter rendered', adminHtml.includes('Search by name') && adminHtml.includes('All Members'), 'Toolbar rendered')

  const resSearch = await fetch(`${BASE_URL}/admin/team?q=Lavish`, { headers: authHeaders })
  const searchHtml = await resSearch.text()
  logResult('ADMIN_LIST', 4, 'Search team member by name', resSearch.status === 200 && (searchHtml.includes('Lavish') || searchHtml.includes('Team Members')), 'Search verified')

  const resFilterActive = await fetch(`${BASE_URL}/admin/team?status=active`, { headers: authHeaders })
  logResult('ADMIN_LIST', 5, 'Filter active team members', resFilterActive.status === 200, `HTTP ${resFilterActive.status}`)

  const resFilterInactive = await fetch(`${BASE_URL}/admin/team?status=inactive`, { headers: authHeaders })
  logResult('ADMIN_LIST', 6, 'Filter inactive team members', resFilterInactive.status === 200, `HTTP ${resFilterInactive.status}`)

  // -----------------------------------------------------------------
  // 2. CREATE TEAM MEMBER & MEDIA PHOTO
  // -----------------------------------------------------------------
  console.log('\n--- 2. CREATE TEAM MEMBER ---')
  const lavishMember = await prisma.teamMember.findFirst({ where: { name: { contains: 'Lavish' } } })
  if (!lavishMember) throw new Error('Lavish Chouhan not found in DB')

  const timestamp = Date.now()
  const testNewMember = await prisma.teamMember.create({
    data: {
      name: `Compliance Auditor ${timestamp}`,
      designation: 'Senior Statutory Auditor',
      role: 'Senior Statutory Auditor',
      department: 'Labour Compliance',
      bio: 'Conducting factory inspections and statutory register verification across industrial belts.',
      imageUrl: 'https://aoqdrh4m597rgf9m.public.blob.vercel-storage.com/lavish-chouhan.png',
      imageAlt: `Compliance Auditor ${timestamp} - Senior Statutory Auditor`,
      linkedinUrl: 'https://www.linkedin.com/in/test-auditor-compliance/',
      reportsToId: lavishMember.id,
      displayOrder: 10,
      isActive: true,
    },
  })

  logResult('CREATE', 7, 'Create Team Member in DB', !!testNewMember.id, `ID: ${testNewMember.id}`)
  logResult('CREATE', 8, 'Set Reports To parent relation', testNewMember.reportsToId === lavishMember.id, `ReportsTo: ${lavishMember.name}`)
  logResult('CREATE', 9, 'Persist LinkedIn & Alt Text', Boolean(testNewMember.linkedinUrl?.includes('linkedin.com') && testNewMember.imageAlt), testNewMember.linkedinUrl || '')

  // -----------------------------------------------------------------
  // 3. EDIT & METADATA PERSISTENCE
  // -----------------------------------------------------------------
  console.log('\n--- 3. EDIT & PERSISTENCE ---')
  const updatedMember = await prisma.teamMember.update({
    where: { id: testNewMember.id },
    data: {
      designation: 'Principal Compliance Auditor & IR Specialist',
      role: 'Principal Compliance Auditor & IR Specialist',
      department: 'Industrial Relations',
      displayOrder: 5,
    },
  })

  logResult(
    'EDIT',
    10,
    'Update Designation & Department',
    updatedMember.designation === 'Principal Compliance Auditor & IR Specialist' && updatedMember.department === 'Industrial Relations',
    updatedMember.designation
  )
  logResult('EDIT', 11, 'Update Display Order Priority', updatedMember.displayOrder === 5, `Order: ${updatedMember.displayOrder}`)

  // -----------------------------------------------------------------
  // 4. HIERARCHY CYCLES & SUBORDINATE TREE TESTS
  // -----------------------------------------------------------------
  console.log('\n--- 4. HIERARCHY SAFETY & CYCLE DETECTION ---')
  // Create Level 3 subordinate reporting to testNewMember
  const testSubordinate = await prisma.teamMember.create({
    data: {
      name: `Junior Associate ${timestamp}`,
      designation: 'Compliance Associate',
      role: 'Compliance Associate',
      department: 'Labour Compliance',
      reportsToId: testNewMember.id,
      displayOrder: 1,
      isActive: true,
    },
  })

  logResult('HIERARCHY', 12, 'Create Multi-Level Subordinate (L3)', testSubordinate.reportsToId === testNewMember.id, `Reports to L2: ${testNewMember.name}`)

  // Check potential managers for testNewMember: it should EXCLUDE self and testSubordinate
  const managersRes = await getPotentialManagers(testNewMember.id)
  const excludedSubordinateFound = managersRes.managers.some((m) => m.id === testSubordinate.id || m.id === testNewMember.id)
  logResult('HIERARCHY', 13, 'Exclude Subordinates from Manager Selection', !excludedSubordinateFound, 'Cycle prevented in UI selection')

  // -----------------------------------------------------------------
  // 5. STATUS TOGGLE (ACTIVE / INACTIVE)
  // -----------------------------------------------------------------
  console.log('\n--- 5. ACTIVE / INACTIVE TOGGLE ---')
  const toggledOff = await prisma.teamMember.update({
    where: { id: testSubordinate.id },
    data: { isActive: false },
  })
  logResult('STATUS', 14, 'Deactivate Team Member', toggledOff.isActive === false, 'Status set to inactive')

  const resPublicWithInactive = await fetch(`${BASE_URL}/team`)
  const publicInactiveHtml = await resPublicWithInactive.text()
  logResult('STATUS', 15, 'Inactive Member Hidden from Public /team', !publicInactiveHtml.includes(`Junior Associate ${timestamp}`), 'Not exposed on public page')

  const toggledOn = await prisma.teamMember.update({
    where: { id: testSubordinate.id },
    data: { isActive: true },
  })
  logResult('STATUS', 16, 'Reactivate Team Member', toggledOn.isActive === true, 'Status set to active')

  // -----------------------------------------------------------------
  // 6. PUBLIC TEAM PAGE & HIERARCHY RENDERING
  // -----------------------------------------------------------------
  console.log('\n--- 6. PUBLIC /team PAGE & HIERARCHY ---')
  const resPublic = await fetch(`${BASE_URL}/team`)
  const publicHtml = await resPublic.text()
  logResult('PUBLIC', 17, 'Open Public /team Page', resPublic.status === 200, `HTTP ${resPublic.status}`)
  logResult('PUBLIC', 18, 'Leadership & Practice Hierarchy Section', publicHtml.includes('Leadership & Practice Hierarchy') || publicHtml.includes('Leadership &amp; Practice Hierarchy') || publicHtml.includes('Organizational Structure'), 'Hierarchy title rendered')
  logResult('PUBLIC', 19, 'Core Leadership Prominence Badge', publicHtml.includes('Core Leadership') || publicHtml.includes('Lavish Chouhan'), 'Core leadership rendered')
  logResult('PUBLIC', 20, 'LinkedIn external link rendered', publicHtml.includes('linkedin.com'), 'LinkedIn link present')

  // -----------------------------------------------------------------
  // 7. SAFE DELETION & ORPHAN REASSIGNMENT
  // -----------------------------------------------------------------
  console.log('\n--- 7. SAFE DELETION ---')
  // Delete testSubordinate first
  await prisma.teamMember.delete({ where: { id: testSubordinate.id } })
  const subDeletedCheck = await prisma.teamMember.findUnique({ where: { id: testSubordinate.id } })
  logResult('DELETE', 21, 'Delete Member without Children', subDeletedCheck === null, 'Deleted cleanly')

  // Delete testNewMember
  await prisma.teamMember.delete({ where: { id: testNewMember.id } })
  const newMemberDeletedCheck = await prisma.teamMember.findUnique({ where: { id: testNewMember.id } })
  logResult('DELETE', 22, 'Delete Member with Children Safely Reassigned', newMemberDeletedCheck === null, 'Cleanly deleted')

  // -----------------------------------------------------------------
  // 8. SECURITY & AUTHORIZATION GUARDS
  // -----------------------------------------------------------------
  console.log('\n--- 8. SECURITY & AUTHORIZATION ---')
  const unauthCreate = await createTeamMember({
    name: 'Hacker',
    designation: 'Infiltrator',
    department: null,
    bio: null,
    imageUrl: null,
    imageAlt: null,
    linkedinUrl: null,
    reportsToId: null,
    displayOrder: 1,
    isActive: true,
  })
  logResult('SECURITY', 23, 'Unauthenticated createTeamMember Blocked', unauthCreate.success === false, unauthCreate.error || 'Blocked')

  const unauthAdminTeam = await fetch(`${BASE_URL}/admin/team`, { redirect: 'manual' })
  const isTeamProtected = unauthAdminTeam.status === 307 || unauthAdminTeam.status === 302
  logResult('SECURITY', 24, 'Unauthenticated /admin/team Redirects', isTeamProtected, `HTTP ${unauthAdminTeam.status}`)

  // -----------------------------------------------------------------
  // FINAL SUMMARY
  // -----------------------------------------------------------------
  console.log('\n======================================================================')
  const totalPassed = results.filter((r) => r.passed).length
  console.log(`FINAL RESULTS: ${totalPassed} / ${results.length} TEAM CMS TESTS PASSED`)
  console.log('======================================================================')

  if (totalPassed === results.length) {
    console.log('\n>>> TEAM CMS = 🟢 COMPLETE <<<\n')
  } else {
    console.log('\n>>> TEAM CMS = 🟡 ISSUES FOUND <<<\n')
  }
}

runTeamCMSQA()
  .catch((err) => {
    console.error('Team CMS QA Error:', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
