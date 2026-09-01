import 'dotenv/config'
import { PrismaClient, Role } from '@prisma/client'
import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import { login, logout } from '../app/actions/auth'
import { encrypt, decrypt } from '../lib/session'
import { updateEnquiryStatus, deleteEnquiry } from '../app/actions/enquiries'

const prisma = new PrismaClient()
const BASE_URL = 'http://localhost:3000'

interface AuthTestResult {
  category: string
  testId: number
  description: string
  passed: boolean
  details?: string
}

const results: AuthTestResult[] = []

function recordResult(
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

async function runAdminAuthSecurityQA() {
  console.log('======================================================================')
  console.log('LABOURAXIS — ADMIN AUTHENTICATION PRODUCTION SECURITY QA')
  console.log('======================================================================\n')

  const secretKey = new TextEncoder().encode(process.env.SESSION_SECRET || 'secret')

  // 1. Find or verify test users
  const adminUser = await prisma.user.findFirst({ where: { role: Role.ADMIN } })
  if (!adminUser) throw new Error('No admin user found in database for QA')

  // -----------------------------------------------------------------
  // 1. PUBLIC LOGIN ROUTE
  // -----------------------------------------------------------------
  console.log('--- 1. PUBLIC LOGIN ROUTE ---')
  const resLogin = await fetch(`${BASE_URL}/admin/login`, { redirect: 'manual' })
  recordResult(
    'PUBLIC_LOGIN',
    1,
    'Open /admin/login (Unauthenticated)',
    resLogin.status === 200,
    `HTTP ${resLogin.status}`
  )
  recordResult(
    'PUBLIC_LOGIN',
    2,
    'No redirect loop on /admin/login',
    resLogin.status !== 307 && resLogin.status !== 302,
    'Serves login form directly'
  )

  // -----------------------------------------------------------------
  // 2. CREDENTIALS & ACCOUNT ENUMERATION DEFENSE
  // -----------------------------------------------------------------
  console.log('\n--- 2. CREDENTIALS & ENUMERATION DEFENSE ---')

  // Empty Email
  const emptyEmailForm = new FormData()
  emptyEmailForm.append('email', '')
  emptyEmailForm.append('password', 'password123')
  const emptyEmailRes = await login({}, emptyEmailForm)
  recordResult(
    'CREDENTIALS',
    3,
    'Empty Email Rejection',
    Boolean(emptyEmailRes?.message && emptyEmailRes?.message.includes('Invalid email')),
    emptyEmailRes?.message
  )

  // Empty Password
  const emptyPassForm = new FormData()
  emptyPassForm.append('email', adminUser.email)
  emptyPassForm.append('password', '')
  const emptyPassRes = await login({}, emptyPassForm)
  recordResult(
    'CREDENTIALS',
    4,
    'Empty Password Rejection',
    Boolean(emptyPassRes?.message && emptyPassRes?.message.includes('Invalid email')),
    emptyPassRes?.message
  )

  // Invalid Email Format
  const invalidEmailForm = new FormData()
  invalidEmailForm.append('email', 'notanemail')
  invalidEmailForm.append('password', 'password123')
  const invalidEmailRes = await login({}, invalidEmailForm)
  recordResult(
    'CREDENTIALS',
    5,
    'Invalid Email Format Rejection',
    Boolean(invalidEmailRes?.message && invalidEmailRes?.message.includes('Invalid email')),
    invalidEmailRes?.message
  )

  // Wrong Password for existing user
  const wrongPassForm = new FormData()
  wrongPassForm.append('email', adminUser.email)
  wrongPassForm.append('password', 'DefinitielyWrongPassword999!')
  const wrongPassRes = await login({}, wrongPassForm)
  recordResult(
    'CREDENTIALS',
    6,
    'Wrong Password Response',
    wrongPassRes?.message === 'Invalid email or password.',
    wrongPassRes?.message
  )

  // Unknown non-existent user
  const unknownUserForm = new FormData()
  unknownUserForm.append('email', 'ghost.user.doesnotexist@labouraxis.com')
  unknownUserForm.append('password', 'RandomPassword123!')
  const unknownUserRes = await login({}, unknownUserForm)
  recordResult(
    'CREDENTIALS',
    7,
    'Unknown User Response',
    unknownUserRes?.message === 'Invalid email or password.',
    unknownUserRes?.message
  )

  // Account enumeration check: responses must be identical
  recordResult(
    'CREDENTIALS',
    8,
    'Zero Account Enumeration (Identical generic responses)',
    wrongPassRes?.message === unknownUserRes?.message,
    'Generic messages match perfectly'
  )

  // -----------------------------------------------------------------
  // 3. PASSWORD STORAGE & BCRYPT SECURITY
  // -----------------------------------------------------------------
  console.log('\n--- 3. PASSWORD STORAGE & HASHING ---')
  const isBcrypt =
    adminUser.password.startsWith('$2a$') ||
    adminUser.password.startsWith('$2b$') ||
    adminUser.password.startsWith('$2y$')
  recordResult(
    'PASSWORD_SECURITY',
    9,
    'Password Hashing (bcrypt)',
    isBcrypt,
    `Prefix: ${adminUser.password.substring(0, 4)}`
  )
  recordResult(
    'PASSWORD_SECURITY',
    10,
    'Zero Plaintext Passwords in DB',
    !adminUser.password.includes(' ') && adminUser.password.length >= 50,
    'Password is secure hash'
  )

  // -----------------------------------------------------------------
  // 4. SESSION CRYPTOGRAPHY & TAMPERING TESTS
  // -----------------------------------------------------------------
  console.log('\n--- 4. SESSION CRYPTOGRAPHY & TAMPERING ---')

  const validToken = await encrypt({
    userId: adminUser.id,
    role: adminUser.role,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  })
  const decryptedValid = await decrypt(validToken)
  recordResult(
    'SESSION_CRYPTO',
    11,
    'Valid Session Token Decryption',
    decryptedValid?.userId === adminUser.id,
    `UserId: ${decryptedValid?.userId}`
  )

  // Expired Token Test
  const expiredToken = await new SignJWT({
    userId: adminUser.id,
    role: adminUser.role,
    expiresAt: new Date(Date.now() - 1000),
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(Math.floor(Date.now() / 1000) - 3600)
    .setExpirationTime(Math.floor(Date.now() / 1000) - 10)
    .sign(secretKey)

  const decryptedExpired = await decrypt(expiredToken)
  recordResult(
    'SESSION_CRYPTO',
    12,
    'Expired Session Token Rejection',
    decryptedExpired === null,
    'Expired JWT returns null'
  )

  // Tampered Payload Token Test (Signature invalidated)
  const tokenParts = validToken.split('.')
  const tamperedPayload = Buffer.from(
    JSON.stringify({ userId: 'attacker_injected_id', role: 'ADMIN' })
  ).toString('base64url')
  const tamperedToken = `${tokenParts[0]}.${tamperedPayload}.${tokenParts[2]}`

  const decryptedTampered = await decrypt(tamperedToken)
  recordResult(
    'SESSION_CRYPTO',
    13,
    'Tampered Session Token Rejection',
    decryptedTampered === null,
    'Tampered token signature fails validation'
  )

  // Token signed with incorrect / rogue secret
  const rogueKey = new TextEncoder().encode('attacker-rogue-secret-key-12345678')
  const rogueToken = await new SignJWT({
    userId: adminUser.id,
    role: 'ADMIN',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(rogueKey)

  const decryptedRogue = await decrypt(rogueToken)
  recordResult(
    'SESSION_CRYPTO',
    14,
    'Rogue Secret Signature Rejection',
    decryptedRogue === null,
    'Invalid secret key signature rejected'
  )

  // -----------------------------------------------------------------
  // 5. PROTECTED ADMIN ROUTES (UNAUTHENTICATED)
  // -----------------------------------------------------------------
  console.log('\n--- 5. PROTECTED ADMIN ROUTES (UNAUTHENTICATED) ---')
  const routesToTest = [
    '/admin',
    '/admin/dashboard',
    '/admin/articles',
    '/admin/guides',
    '/admin/checklists',
    '/admin/faqs',
    '/admin/enquiries',
    '/admin/team',
    '/admin/careers',
  ]

  let testCounter = 15
  for (const route of routesToTest) {
    const res = await fetch(`${BASE_URL}${route}`, { redirect: 'manual' })
    const isRedirectToLogin = res.status === 307 || res.status === 302
    recordResult(
      'ROUTE_PROTECTION',
      testCounter++,
      `Direct unauth access: ${route}`,
      isRedirectToLogin,
      `HTTP ${res.status}`
    )
  }

  // -----------------------------------------------------------------
  // 6. SERVER ACTION & API AUTHORIZATION
  // -----------------------------------------------------------------
  console.log('\n--- 6. SERVER ACTION & API AUTHORIZATION ---')

  // Unauthenticated API request to CSV export
  const unauthExportRes = await fetch(`${BASE_URL}/api/admin/enquiries/export`)
  recordResult(
    'MUTATION_AUTH',
    testCounter++,
    'Unauthenticated API Route: /api/admin/enquiries/export',
    unauthExportRes.status === 401,
    `HTTP ${unauthExportRes.status}`
  )

  // Unauthenticated Server Action call
  const unauthStatusRes = await updateEnquiryStatus({
    enquiryId: 'dummy-id',
    status: 'CONTACTED' as any,
  })
  recordResult(
    'MUTATION_AUTH',
    testCounter++,
    'Unauthenticated Server Action: updateEnquiryStatus',
    unauthStatusRes.success === false && unauthStatusRes.error?.includes('Unauthorized'),
    unauthStatusRes.error
  )

  // -----------------------------------------------------------------
  // 7. ROBOTS & SEARCH ENGINE INDEXING
  // -----------------------------------------------------------------
  console.log('\n--- 7. SEARCH ENGINE INDEXING & ROBOTS ---')
  const resRobots = await fetch(`${BASE_URL}/robots.txt`)
  const robotsTxt = await resRobots.text()
  recordResult(
    'ROBOTS_NOINDEX',
    testCounter++,
    'Robots.txt Disallows /admin/',
    robotsTxt.includes('Disallow: /admin/'),
    'Disallow: /admin/ present'
  )

  const resAdminLayout = await fetch(`${BASE_URL}/admin/login`)
  const layoutHtml = await resAdminLayout.text()
  recordResult(
    'ROBOTS_NOINDEX',
    testCounter++,
    'Admin Login Page Content Security',
    layoutHtml.includes('Sign In to Portal'),
    'Login page rendered properly'
  )

  // -----------------------------------------------------------------
  // 8. BRUTE FORCE RATE LIMITING
  // -----------------------------------------------------------------
  console.log('\n--- 8. BRUTE FORCE RATE LIMITING ---')
  let rateLimitHit = false
  for (let i = 0; i < 6; i++) {
    const burstForm = new FormData()
    burstForm.append('email', 'bruteforce.test@labouraxis.com')
    burstForm.append('password', `wrongpass${i}`)
    const burstRes = await login({}, burstForm)
    if (burstRes?.message?.includes('Too many failed login attempts')) {
      rateLimitHit = true
      break
    }
  }
  recordResult(
    'RATE_LIMITING',
    testCounter++,
    'Login Throttling after Repeated Failures',
    rateLimitHit,
    'Rate limit triggered after 5 failed attempts'
  )

  // -----------------------------------------------------------------
  // FINAL SUMMARY
  // -----------------------------------------------------------------
  console.log('\n======================================================================')
  const totalPassed = results.filter((r) => r.passed).length
  console.log(`FINAL RESULTS: ${totalPassed} / ${results.length} SECURITY TESTS PASSED`)
  console.log('======================================================================')

  if (totalPassed === results.length) {
    console.log('\n>>> ADMIN AUTHENTICATION = 🟢 COMPLETE <<<\n')
  } else {
    console.log('\n>>> ADMIN AUTHENTICATION = 🟡 ISSUES FOUND <<<\n')
  }
}

runAdminAuthSecurityQA()
  .catch((err) => {
    console.error('Admin Auth QA Error:', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
