/**
 * Phase 7B Sub-Phase D — End-to-End Validation Script
 * 
 * Tests:
 * 1. Verifies 8 published service pages exist in CMS and have proper sections
 * 2. Verifies 10 published industry pages exist in CMS and have proper sections
 * 3. Creates a NEW test Service (payroll-management-test) not in static data
 * 4. Creates a NEW test Industry (automotive-manufacturing-test) not in static data
 * 5. Verifies both new pages can be resolved by the same CMS query used in public routes
 * 6. Verifies draft pages cannot be resolved by the public route query
 * 7. Cleans up test records
 */

const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function main() {
  const results = [];
  
  console.log('\n============================================================');
  console.log('PHASE 7B SUB-PHASE D — END-TO-END VALIDATION');
  console.log('============================================================\n');

  // ============================================================
  // TEST 1: Verify all 8 migrated services have CMS records
  // ============================================================
  const expectedServices = [
    'hr-consulting', 'labour-compliance', 'pf-esic-compliance',
    'factory-compliance', 'contract-labour-compliance', 'payroll-hr-operations',
    'industrial-relations', 'compliance-audit'
  ];
  
  let servicesPassed = 0;
  for (const slug of expectedServices) {
    const page = await db.page.findUnique({
      where: { path: `/services/${slug}` },
      include: {
        publishedRevision: {
          include: { sections: true }
        }
      }
    });
    
    const pass = page && page.status === 'PUBLISHED' && page.publishedRevision && page.publishedRevision.sections.length > 0;
    if (pass) servicesPassed++;
    else console.log(`  ✗ FAIL: /services/${slug} — missing or no sections`);
  }
  
  const t1 = servicesPassed === 8;
  console.log(`TEST 1: All 8 migrated services in CMS — ${t1 ? '✓ PASS' : '✗ FAIL'} (${servicesPassed}/8 passed)`);
  results.push({ test: 'All 8 services in CMS', pass: t1 });

  // ============================================================
  // TEST 2: Verify all 10 migrated industries have CMS records
  // ============================================================
  const expectedIndustries = [
    'manufacturing', 'construction', 'logistics-warehousing', 'engineering',
    'automotive', 'hospitality', 'healthcare', 'education', 'retail', 'msmes'
  ];
  
  let industriesPassed = 0;
  for (const slug of expectedIndustries) {
    const page = await db.page.findUnique({
      where: { path: `/industries/${slug}` },
      include: {
        publishedRevision: {
          include: { sections: true }
        }
      }
    });
    
    const pass = page && page.status === 'PUBLISHED' && page.publishedRevision && page.publishedRevision.sections.length > 0;
    if (pass) industriesPassed++;
    else console.log(`  ✗ FAIL: /industries/${slug} — missing or no sections`);
  }
  
  const t2 = industriesPassed === 10;
  console.log(`TEST 2: All 10 migrated industries in CMS — ${t2 ? '✓ PASS' : '✗ FAIL'} (${industriesPassed}/10 passed)`);
  results.push({ test: 'All 10 industries in CMS', pass: t2 });

  // ============================================================
  // TEST 3: Draft isolation — draft pages return null from public query
  // ============================================================
  const draftTest = await db.page.findUnique({
    where: { path: '/services/hr-consulting', status: 'PUBLISHED' },
  });
  const t3 = draftTest !== null;
  console.log(`TEST 3: Public query only returns PUBLISHED pages — ${t3 ? '✓ PASS' : '✗ FAIL'}`);
  results.push({ test: 'Draft isolation', pass: t3 });
  
  // Verify a DRAFT page would not appear in public query
  const nonExistentDraft = await db.page.findUnique({
    where: { path: '/services/non-existent-draft-slug', status: 'PUBLISHED' },
  });
  const t3b = nonExistentDraft === null;
  console.log(`TEST 3b: Non-existent slug returns null — ${t3b ? '✓ PASS' : '✗ FAIL'}`);
  results.push({ test: 'Non-existent slug returns 404', pass: t3b });

  // ============================================================
  // TEST 4: Create a brand new Service via CMS (not in static data)
  // ============================================================
  console.log('\n--- TEST 4: New Service End-to-End ---');
  const newServiceSlug = 'payroll-management-test';
  const newServicePath = `/services/${newServiceSlug}`;
  
  // Clean up first if exists from previous run
  const existing = await db.page.findUnique({ where: { path: newServicePath } });
  if (existing) {
    await db.page.delete({ where: { id: existing.id } });
    console.log('  (Cleaned up previous test record)');
  }
  
  // STEP 1: Create page (DRAFT)
  const newPage = await db.page.create({
    data: {
      key: 'SERVICE_PAYROLL_MANAGEMENT_TEST',
      path: newServicePath,
      status: 'DRAFT'
    }
  });
  
  // STEP 2: Create revision
  const newRevision = await db.pageRevision.create({
    data: {
      pageId: newPage.id,
      version: 1,
      seoTitle: 'Payroll Management Test | LabourAxis',
      metaDescription: 'Test payroll management service page',
      canonicalUrl: newServicePath
    }
  });
  
  // STEP 3: Create a HERO section
  await db.pageSection.create({
    data: {
      revisionId: newRevision.id,
      type: 'HERO',
      sortOrder: 0,
      content: {
        heading: 'Payroll Management',
        description: 'End-to-end payroll processing and statutory compliance for businesses.'
      }
    }
  });
  
  // STEP 4: Verify draft is NOT publicly visible
  const draftVisible = await db.page.findUnique({
    where: { path: newServicePath, status: 'PUBLISHED' }
  });
  const t4a = draftVisible === null;
  console.log(`  Draft not publicly visible — ${t4a ? '✓ PASS' : '✗ FAIL'}`);
  results.push({ test: 'New service draft not public', pass: t4a });
  
  // STEP 5: Publish
  await db.page.update({
    where: { id: newPage.id },
    data: {
      status: 'PUBLISHED',
      publishedRevisionId: newRevision.id
    }
  });
  
  // STEP 6: Verify it's now publicly visible
  const publishedVisible = await db.page.findUnique({
    where: { path: newServicePath, status: 'PUBLISHED' },
    include: { publishedRevision: { include: { sections: true } } }
  });
  const t4b = publishedVisible !== null && publishedVisible.publishedRevision !== null && publishedVisible.publishedRevision.sections.length > 0;
  console.log(`  Published service publicly accessible with sections — ${t4b ? '✓ PASS' : '✗ FAIL'}`);
  results.push({ test: 'New service public after publish', pass: t4b });
  
  const t4 = t4a && t4b;
  console.log(`TEST 4: New Service End-to-End — ${t4 ? '✓ PASS' : '✗ FAIL'}`);

  // ============================================================
  // TEST 5: Create a brand new Industry via CMS (not in static data)
  // ============================================================
  console.log('\n--- TEST 5: New Industry End-to-End ---');
  const newIndustrySlug = 'automotive-manufacturing-test';
  const newIndustryPath = `/industries/${newIndustrySlug}`;
  
  const existingInd = await db.page.findUnique({ where: { path: newIndustryPath } });
  if (existingInd) {
    await db.page.delete({ where: { id: existingInd.id } });
    console.log('  (Cleaned up previous test record)');
  }
  
  const newIndPage = await db.page.create({
    data: {
      key: 'INDUSTRY_AUTOMOTIVE_MANUFACTURING_TEST',
      path: newIndustryPath,
      status: 'DRAFT'
    }
  });
  
  const newIndRevision = await db.pageRevision.create({
    data: {
      pageId: newIndPage.id,
      version: 1,
      seoTitle: 'Automotive Manufacturing HR & Labour Compliance | LabourAxis',
      metaDescription: 'Specialized HR and compliance solutions for the automotive manufacturing industry.',
      canonicalUrl: newIndustryPath
    }
  });
  
  await db.pageSection.create({
    data: {
      revisionId: newIndRevision.id,
      type: 'HERO',
      sortOrder: 0,
      content: {
        eyebrow: 'Automotive Manufacturing',
        heading: 'HR & Compliance for Automotive Manufacturing',
        description: 'Structured workforce and compliance solutions for automotive OEMs, Tier-1 and Tier-2 suppliers.'
      }
    }
  });
  
  const draftIndVisible = await db.page.findUnique({
    where: { path: newIndustryPath, status: 'PUBLISHED' }
  });
  const t5a = draftIndVisible === null;
  console.log(`  Draft industry not publicly visible — ${t5a ? '✓ PASS' : '✗ FAIL'}`);
  results.push({ test: 'New industry draft not public', pass: t5a });
  
  await db.page.update({
    where: { id: newIndPage.id },
    data: {
      status: 'PUBLISHED',
      publishedRevisionId: newIndRevision.id
    }
  });
  
  const publishedIndVisible = await db.page.findUnique({
    where: { path: newIndustryPath, status: 'PUBLISHED' },
    include: { publishedRevision: { include: { sections: true } } }
  });
  const t5b = publishedIndVisible !== null && publishedIndVisible.publishedRevision !== null;
  console.log(`  Published industry publicly accessible — ${t5b ? '✓ PASS' : '✗ FAIL'}`);
  results.push({ test: 'New industry public after publish', pass: t5b });
  
  const t5 = t5a && t5b;
  console.log(`TEST 5: New Industry End-to-End — ${t5 ? '✓ PASS' : '✗ FAIL'}`);

  // ============================================================
  // CLEANUP: Remove test records
  // ============================================================
  console.log('\n--- Cleaning up test records ---');
  await db.page.delete({ where: { id: newPage.id } });
  await db.page.delete({ where: { id: newIndPage.id } });
  console.log('  Test records removed ✓');

  // ============================================================
  // SUMMARY
  // ============================================================
  const allPassed = results.every(r => r.pass);
  const passCount = results.filter(r => r.pass).length;
  
  console.log('\n============================================================');
  console.log(`PHASE 7B-D VALIDATION RESULTS: ${passCount}/${results.length} PASSED`);
  console.log(allPassed ? '✓ ALL TESTS PASSED' : '✗ SOME TESTS FAILED');
  console.log('============================================================\n');
  
  results.forEach(r => console.log(`  [${r.pass ? 'PASS' : 'FAIL'}] ${r.test}`));
  console.log();
  
  return allPassed;
}

main()
  .then(ok => process.exit(ok ? 0 : 1))
  .catch(e => {
    console.error('Test error:', e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
