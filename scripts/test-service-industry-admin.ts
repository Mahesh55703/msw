import { CreateServiceIndustryPageSchema } from '../lib/validations/page.js'

async function runTests() {
  console.log('--- Running Admin UI Validation Tests ---')
  let passed = 0
  let failed = 0

  const assert = (condition: boolean, message: string) => {
    if (condition) {
      console.log(`✅ PASS: ${message}`)
      passed++
    } else {
      console.error(`❌ FAIL: ${message}`)
      failed++
    }
  }

  // 1. Invalid Slug
  const parsed1 = CreateServiceIndustryPageSchema.safeParse({ type: 'SERVICE', name: 'Test', slug: 'Test Slug!' })
  assert(parsed1.success === false, 'Invalid slug with spaces and caps is rejected')

  // 2. Reserved Slug test is logic in the action, but we can test the schema rules
  const parsed2 = CreateServiceIndustryPageSchema.safeParse({ type: 'SERVICE', name: 'Valid', slug: 'valid-slug' })
  assert(parsed2.success === true, 'Valid lowercase hyphenated slug passes schema')

  const parsed3 = CreateServiceIndustryPageSchema.safeParse({ type: 'CORE', name: 'Valid', slug: 'valid-slug' })
  assert(parsed3.success === false, 'Invalid type CORE is rejected')
  
  console.log(`\nTests complete: ${passed} passed, ${failed} failed.`)
  process.exit(failed > 0 ? 1 : 0)
}

runTests().catch(console.error)
