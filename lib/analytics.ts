/**
 * LabourAxis Centralized Analytics & Conversion Tracking Architecture
 * 
 * Complies with GA4 Event Taxonomy, Google Tag Manager dataLayer structure,
 * and strict privacy / zero-PII requirements.
 */

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>
    gtag?: (...args: unknown[]) => void
  }
}

export interface AttributionData {
  utm_source: string
  utm_medium: string
  utm_campaign: string
  utm_term: string
  utm_content: string
  referrer: string
  landingPage: string
}

const ATTRIBUTION_STORAGE_KEY = 'la_first_touch_attribution'

/**
 * Initialize first-touch UTM attribution.
 * Captures query parameters and landing page on first marketing arrival.
 * Preserves initial attribution across multi-page client navigation.
 */
export function initAttributionCapture(): void {
  if (typeof window === 'undefined') return

  try {
    const existing = sessionStorage.getItem(ATTRIBUTION_STORAGE_KEY)
    if (existing) {
      // First touch already captured for this browser session
      return
    }

    const searchParams = new URLSearchParams(window.location.search)
    const utmSource = searchParams.get('utm_source')
    const utmMedium = searchParams.get('utm_medium')
    const utmCampaign = searchParams.get('utm_campaign')
    const utmTerm = searchParams.get('utm_term')
    const utmContent = searchParams.get('utm_content')
    const referrer = document.referrer || ''
    const landingPage = window.location.pathname

    const attribution: AttributionData = {
      utm_source: utmSource || '',
      utm_medium: utmMedium || '',
      utm_campaign: utmCampaign || '',
      utm_term: utmTerm || '',
      utm_content: utmContent || '',
      referrer,
      landingPage,
    }

    sessionStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(attribution))
  } catch (err) {
    // Non-blocking fallback
    console.warn('[Analytics] Attribution capture error:', err)
  }
}

/**
 * Retrieves persisted first-touch attribution, falling back to current URL query parameters.
 */
export function getStoredAttribution(): AttributionData {
  if (typeof window === 'undefined') {
    return {
      utm_source: '',
      utm_medium: '',
      utm_campaign: '',
      utm_term: '',
      utm_content: '',
      referrer: '',
      landingPage: '',
    }
  }

  try {
    const stored = sessionStorage.getItem(ATTRIBUTION_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as AttributionData
      return parsed
    }
  } catch {
    // Ignore storage parse error and fall back
  }

  const searchParams = new URLSearchParams(window.location.search)
  return {
    utm_source: searchParams.get('utm_source') || '',
    utm_medium: searchParams.get('utm_medium') || '',
    utm_campaign: searchParams.get('utm_campaign') || '',
    utm_term: searchParams.get('utm_term') || '',
    utm_content: searchParams.get('utm_content') || '',
    referrer: typeof document !== 'undefined' ? document.referrer || '' : '',
    landingPage: window.location.pathname,
  }
}

/**
 * Sanitizes parameters to guarantee zero PII is sent to Google Analytics / Tag Manager.
 */
function sanitizeParams(params: Record<string, unknown> = {}): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {}
  const disallowedKeys = [
    'email',
    'phone',
    'mobile',
    'name',
    'fullname',
    'first_name',
    'last_name',
    'firstname',
    'lastname',
    'company',
    'message',
    'notes',
    'password',
    'token',
    'enquiry_id',
    'enquiryid',
    'reference_number',
    'referencenumber',
  ]

  for (const [key, value] of Object.entries(params)) {
    const lowerKey = key.toLowerCase()
    if (disallowedKeys.includes(lowerKey)) {
      continue
    }
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      sanitized[key] = value
    }
  }

  return sanitized
}

/**
 * Core event dispatcher supporting both Google Tag Manager dataLayer and direct GA4 gtag.
 */
export function trackEvent(eventName: string, params: Record<string, unknown> = {}): void {
  if (typeof window === 'undefined') return

  try {
    const cleanParams = sanitizeParams(params)
    const payload = {
      event: eventName,
      ...cleanParams,
      timestamp: new Date().toISOString(),
    }

    // 1. Push to Google Tag Manager dataLayer
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push(payload)

    // 2. Dispatch to GA4 gtag if active
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, cleanParams)
    }
  } catch (err) {
    // Analytics failure must never disrupt app functionality
    console.warn(`[Analytics] Failed to track event ${eventName}:`, err)
  }
}

/**
 * Page View Tracking for Public Pages (SPA Navigation & Initial Load)
 */
export function trackPageView(pagePath: string, pageTitle?: string, pageType?: string): void {
  if (pagePath.startsWith('/admin') || pagePath.startsWith('/api')) {
    return // Exclude admin CMS and internal API routes
  }

  trackEvent('page_view', {
    page_path: pagePath,
    page_title: pageTitle || (typeof document !== 'undefined' ? document.title : ''),
    page_type: pageType || resolvePageType(pagePath),
  })
}

/**
 * Resolves standard page category based on path
 */
export function resolvePageType(pathname: string): string {
  if (pathname === '/') return 'home'
  if (pathname.startsWith('/services')) return 'service'
  if (pathname.startsWith('/industries')) return 'industry'
  if (pathname.startsWith('/resources/guides') || pathname.startsWith('/resources/guide')) return 'guide'
  if (pathname.startsWith('/resources/checklists') || pathname.startsWith('/resources/checklist')) return 'checklist'
  if (pathname.startsWith('/resources')) return 'resource'
  if (pathname.startsWith('/careers')) return 'career'
  if (pathname.startsWith('/contact')) return 'contact'
  if (pathname.startsWith('/about')) return 'about'
  if (pathname.startsWith('/team')) return 'team'
  if (pathname.startsWith('/compliance-health-check')) return 'compliance_health_check'
  return 'general'
}

/**
 * Consultation CTA Click
 */
export function trackConsultationCta(ctaLocation: string, ctaLabel: string, pageType?: string): void {
  trackEvent('consultation_cta_click', {
    cta_location: ctaLocation,
    cta_label: ctaLabel,
    page_type: pageType || (typeof window !== 'undefined' ? resolvePageType(window.location.pathname) : 'general'),
  })
}

/**
 * Telephone Link Click
 */
export function trackPhoneClick(linkLocation: string, pageType?: string): void {
  trackEvent('phone_click', {
    link_location: linkLocation,
    page_type: pageType || (typeof window !== 'undefined' ? resolvePageType(window.location.pathname) : 'general'),
  })
}

/**
 * WhatsApp Link Click
 */
export function trackWhatsAppClick(linkLocation: string, pageType?: string): void {
  trackEvent('whatsapp_click', {
    link_location: linkLocation,
    page_type: pageType || (typeof window !== 'undefined' ? resolvePageType(window.location.pathname) : 'general'),
  })
}

/**
 * Email Link Click
 */
export function trackEmailClick(linkLocation: string, pageType?: string): void {
  trackEvent('email_click', {
    link_location: linkLocation,
    page_type: pageType || (typeof window !== 'undefined' ? resolvePageType(window.location.pathname) : 'general'),
  })
}

/**
 * Article View (Public Articles only)
 */
export function trackArticleView(contentId: string, slug: string, category: string): void {
  trackEvent('article_view', {
    content_id: contentId,
    content_slug: slug,
    content_category: category,
  })
}

/**
 * Guide View (Public Guides only)
 */
export function trackGuideView(contentId: string, slug: string): void {
  trackEvent('guide_view', {
    content_id: contentId,
    content_slug: slug,
  })
}

/**
 * Checklist Download / Access Event (GA4 Key Event)
 */
export function trackChecklistDownload(contentId: string, slug: string, fileType: string = 'pdf'): void {
  trackEvent('checklist_download', {
    content_id: contentId,
    content_slug: slug,
    file_type: fileType,
  })
}

/**
 * Career Application Action Click (GA4 Key Event)
 */
export function trackCareerApplication(
  jobId: string,
  jobTitle: string,
  department?: string,
  applicationMethod: string = 'email'
): void {
  trackEvent('career_application_click', {
    job_id: jobId,
    job_title: jobTitle,
    department: department || 'General',
    application_method: applicationMethod,
  })
}

/**
 * Contact Form Started (Fired once on first interaction)
 */
export function trackContactFormStarted(formName: string = 'consultation_form', pageType?: string): void {
  trackEvent('contact_form_started', {
    form_name: formName,
    page_type: pageType || 'contact',
  })
}

/**
 * Contact Form Submitted Successfully (GA4 Key Event / Conversion)
 * MUST ONLY be fired after database confirmation of enquiry creation!
 */
export function trackContactFormSubmitted(formName: string = 'consultation_form', pageType?: string): void {
  trackEvent('contact_form_submitted', {
    form_name: formName,
    page_type: pageType || 'contact',
  })
}

/**
 * Contact Form Submission Error
 */
export function trackContactFormError(formName: string = 'consultation_form', errorCategory: string = 'validation_error'): void {
  trackEvent('contact_form_error', {
    form_name: formName,
    error_category: errorCategory,
  })
}
