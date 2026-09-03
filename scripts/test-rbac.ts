import { hasPermission, requirePermission, Role } from '../lib/rbac'

async function runTests() {
  console.log('--- Running RBAC Tests ---')
  
  const tests = [
    { role: 'SUPER_ADMIN', perm: 'users:manage', expected: true },
    { role: 'ADMIN', perm: 'users:manage', expected: false },
    { role: 'EDITOR', perm: 'users:manage', expected: false },
    
    { role: 'SUPER_ADMIN', perm: 'pages:publish', expected: true },
    { role: 'ADMIN', perm: 'pages:publish', expected: true },
    { role: 'EDITOR', perm: 'pages:publish', expected: false },
    
    { role: 'SUPER_ADMIN', perm: 'pages:rollback', expected: true },
    { role: 'ADMIN', perm: 'pages:rollback', expected: true },
    { role: 'EDITOR', perm: 'pages:rollback', expected: false },

    { role: 'SUPER_ADMIN', perm: 'super_admin:manage', expected: true },
    { role: 'ADMIN', perm: 'super_admin:manage', expected: false },
    
    { role: 'EDITOR', perm: 'pages:edit', expected: true },
    { role: 'EDITOR', perm: 'pages:view', expected: true },
  ]

  let passed = 0
  for (const t of tests) {
    const result = hasPermission(t.role as Role, t.perm as any)
    if (result === t.expected) {
      passed++
      console.log(`[PASS] ${t.role} -> ${t.perm} (expected ${t.expected})`)
    } else {
      console.error(`[FAIL] ${t.role} -> ${t.perm} (expected ${t.expected}, got ${result})`)
    }
  }

  console.log(`\nTests Completed: ${passed}/${tests.length} Passed`)
  
  if (passed !== tests.length) {
    process.exit(1)
  }
}

runTests().catch(console.error)
