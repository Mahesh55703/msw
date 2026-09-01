/**
 * Automated Analytics & Conversion Pipeline Test Suite
 * 
 * Verifies:
 * 1. Event taxonomy formatting and dataLayer integration
 * 2. Strict PII sanitization (filtering names, emails, phones, tokens, db ids)
 * 3. First-touch UTM persistence and multi-page attribution retention
 * 4. Conversion funnel lifecycle (Form Start -> DB Confirmation -> Conversion Event)
 * 5. Admin & preview route exclusion
 * 6. Non-blocking error resilience
 */

import {
  trackEvent,
  trackPageView,
  trackConsultationCta,
  trackPhoneClick,
  trackWhatsAppClick,
  trackEmailClick,
  trackArticleView,
  trackGuideView,
  trackChecklistDownload,
  trackCareerApplication,
  trackContactFormStarted,
  trackContactFormSubmitted,
  trackContactFormError,
  initAttributionCapture,
  getStoredAttribution,
} from '../lib/analytics'

async function runAnalyticsTests() {
  console.log('🧪 Starting LabourAxis Analytics & Conversion Tracking Verification...\n')

  let passed = 0
  let failed = 0

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`)
      passed++
    } else {
      console.error(`  ❌ [FAIL] ${testName}${detail ? ` - ${detail}` : ''}`)
      failed++
    }
  }

  // Set up mock window and sessionStorage environment
  const mockStorage: Record<string, string> = {}
  const mockDataLayer: Array<Record<string, any>> = []
  const mockGtagCalls: Array<{ name: string; params: Record<string, any> }> = []

  const originalWindow = (global as any).window
  const originalDocument = (global as any).document
  const originalSessionStorage = (global as any).sessionStorage

  try {
    (global as any).window = {
      location: {
        pathname: '/services/pf-esic-compliance',
        search: '?utm_source=google&utm_medium=cpc&utm_campaign=q3_compliance&utm_term=esic+consultant&utm_content=hero_banner',
      },
      dataLayer: mockDataLayer,
      gtag: (command: string, name: string, params: Record<string, any>) => {
        if (command === 'event') {
          mockGtagCalls.push({ name, params })
        }
      },
    }

    ;(global as any).document = {
      title: 'PF & ESIC Compliance | LabourAxis',
      referrer: 'https://www.google.com/',
    }

    ;(global as any).sessionStorage = {
      getItem: (key: string) => mockStorage[key] || null,
      setItem: (key: string, value: string) => {
        mockStorage[key] = value
      },
      removeItem: (key: string) => {
        delete mockStorage[key]
      },
      clear: () => {
        for (const k of Object.keys(mockStorage)) delete mockStorage[k]
      },
    }

    // --- TEST 1: First-touch attribution capture ---
    console.log('--- 1. First-Touch Attribution Capture & Persistence ---')
    initAttributionCapture()
    const stored = getStoredAttribution()
    assert(stored.utm_source === 'google', 'UTM source correctly captured as "google"')
    assert(stored.utm_medium === 'cpc', 'UTM medium correctly captured as "cpc"')
    assert(stored.utm_campaign === 'q3_compliance', 'UTM campaign correctly captured as "q3_compliance"')
    assert(stored.landingPage === '/services/pf-esic-compliance', 'Landing page captured')
    assert(stored.referrer === 'https://www.google.com/', 'Referrer captured')

    // Simulate navigation to /contact without query parameters
    ;(global as any).window.location.pathname = '/contact'
    ;(global as any).window.location.search = ''
    const retainedAfterNav = getStoredAttribution()
    assert(
      retainedAfterNav.utm_source === 'google' && retainedAfterNav.landingPage === '/services/pf-esic-compliance',
      'Attribution retained across multi-page client navigation'
    )

    // --- TEST 2: Strict Privacy & Zero PII in dataLayer ---
    console.log('\n--- 2. Strict Privacy & Zero-PII Sanitization ---')
    mockDataLayer.length = 0
    trackEvent('test_pii_sanitization', {
      safe_param: 'allowed_value',
      email: 'john@example.com',
      phone: '+91 9876543210',
      name: 'John Doe',
      company: 'Acme Corp',
      message: 'Sensitive proposal inquiry',
      password: 'secret_password',
      enquiry_id: 'cuid12345',
      referenceNumber: 'LA-2026-XYZ',
    })

    const piiPushed = mockDataLayer[mockDataLayer.length - 1]
    assert(piiPushed.event === 'test_pii_sanitization', 'Event pushed to dataLayer')
    assert(piiPushed.safe_param === 'allowed_value', 'Safe parameter retained')
    assert(!('email' in piiPushed), 'Email parameter completely stripped')
    assert(!('phone' in piiPushed), 'Phone parameter completely stripped')
    assert(!('name' in piiPushed), 'Name parameter completely stripped')
    assert(!('company' in piiPushed), 'Company parameter completely stripped')
    assert(!('message' in piiPushed), 'Message body completely stripped')
    assert(!('enquiry_id' in piiPushed), 'Internal Enquiry ID completely stripped')
    assert(!('referenceNumber' in piiPushed), 'CRM Reference number completely stripped')

    // --- TEST 3: Public Page View & Admin Exclusion ---
    console.log('\n--- 3. Page View Tracking & Admin Exclusion ---')
    mockDataLayer.length = 0
    trackPageView('/services/factory-compliance', 'Factory Compliance')
    assert(
      mockDataLayer.some((e) => e.event === 'page_view' && e.page_path === '/services/factory-compliance'),
      'Public page_view event pushed for /services/factory-compliance'
    )

    const beforeAdminCount = mockDataLayer.length
    trackPageView('/admin/enquiries/123')
    trackPageView('/admin/dashboard')
    trackPageView('/api/upload')
    assert(mockDataLayer.length === beforeAdminCount, 'Admin CMS and API routes strictly excluded from page_view tracking')

    // --- TEST 4: CTA & Direct Communication Tracking ---
    console.log('\n--- 4. CTA and Communication Link Events ---')
    mockDataLayer.length = 0
    trackConsultationCta('header', 'Request Consultation', 'navigation')
    trackPhoneClick('footer', 'footer')
    trackWhatsAppClick('contact_page', 'contact')
    trackEmailClick('footer', 'footer')

    assert(mockDataLayer.some((e) => e.event === 'consultation_cta_click' && e.cta_location === 'header'), 'consultation_cta_click tracked')
    assert(mockDataLayer.some((e) => e.event === 'phone_click' && e.link_location === 'footer'), 'phone_click tracked')
    assert(mockDataLayer.some((e) => e.event === 'whatsapp_click' && e.link_location === 'contact_page'), 'whatsapp_click tracked')
    assert(mockDataLayer.some((e) => e.event === 'email_click' && e.link_location === 'footer'), 'email_click tracked')

    // --- TEST 5: Content Views & Conversions ---
    console.log('\n--- 5. Content Views & Key Conversion Events ---')
    mockDataLayer.length = 0
    trackArticleView('art-101', 'factories-act-guide-2026', 'compliance')
    trackGuideView('gd-202', 'pf-esic-audit-checklist')
    trackChecklistDownload('chk-303', 'monthly-compliance-checklist', 'pdf')
    trackCareerApplication('job-404', 'Senior HR Compliance Consultant', 'Operations', 'email')

    assert(mockDataLayer.some((e) => e.event === 'article_view' && e.content_slug === 'factories-act-guide-2026'), 'article_view tracked')
    assert(mockDataLayer.some((e) => e.event === 'guide_view' && e.content_slug === 'pf-esic-audit-checklist'), 'guide_view tracked')
    assert(mockDataLayer.some((e) => e.event === 'checklist_download' && e.file_type === 'pdf'), 'checklist_download key event tracked')
    assert(mockDataLayer.some((e) => e.event === 'career_application_click' && e.job_title === 'Senior HR Compliance Consultant'), 'career_application_click key event tracked')

    // --- TEST 6: Form Conversion Lifecycle ---
    console.log('\n--- 6. Form Submission & Conversion Lifecycle ---')
    mockDataLayer.length = 0
    // Form started
    trackContactFormStarted('consultation_form', 'contact')
    assert(mockDataLayer.some((e) => e.event === 'contact_form_started'), 'contact_form_started event fires on interaction')

    // Form submitted on server DB success
    trackContactFormSubmitted('consultation_form', 'contact')
    assert(mockDataLayer.some((e) => e.event === 'contact_form_submitted'), 'contact_form_submitted fires on confirmed DB success')

    // Error case
    trackContactFormError('consultation_form', 'validation_error')
    assert(mockDataLayer.some((e) => e.event === 'contact_form_error'), 'contact_form_error fires on submission failure')

    // --- TEST 7: Analytics Failure Resilience ---
    console.log('\n--- 7. Analytics Failure Resilience ---')
    // Simulate broken dataLayer or gtag throwing an exception
    ;(global as any).window.gtag = () => {
      throw new Error('Adblocker or network error intercepted gtag')
    }
    let errorThrown = false
    try {
      trackEvent('failing_event', { test: true })
      trackContactFormSubmitted('consultation_form')
    } catch {
      errorThrown = true
    }
    assert(!errorThrown, 'Analytics helper handles exceptions gracefully without throwing')

  } finally {
    (global as any).window = originalWindow
    ;(global as any).document = originalDocument
    ;(global as any).sessionStorage = originalSessionStorage
  }

  console.log(`\n========================================`)
  console.log(`Summary: ${passed} Passed, ${failed} Failed`)
  console.log(`========================================`)

  if (failed > 0) {
    process.exit(1)
  }
}

runAnalyticsTests().catch((err) => {
  console.error('Test execution fatal error:', err)
  process.exit(1)
})
