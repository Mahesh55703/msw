# LabourAxis Analytics & Conversion Tracking Architecture

## 1. Overview & Architecture

LabourAxis uses a modern, high-performance analytics architecture designed for Next.js App Router:

```
                  ┌─────────────────────────────────────┐
                  │          Visitor Session            │
                  └──────────────────┬──────────────────┘
                                     │ First-Touch UTM Capture (sessionStorage)
                                     ▼
        ┌────────────────────────────┴───────────────────────────┐
        │                                                        │
        ▼                                                        ▼
┌──────────────────┐                                   ┌──────────────────┐
│   Public Pages   │                                   │   Admin Portal   │
│ (GA4/GTM Active) │                                   │ (/admin/*, /api) │
│ - Page Views     │                                   │ - STRICTLY       │
│ - CTA Clicks     │                                   │   EXCLUDED       │
│ - Conversions    │                                   │   FROM TRACKING  │
└────────┬─────────┘                                   └──────────────────┘
         │
         │ dataLayer.push / gtag()
         ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        lib/analytics.ts                                │
│        • Zero-PII sanitization                                         │
│        • Safe try/catch non-blocking execution                         │
│        • Dual GTM dataLayer & GA4 gtag support                         │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
                   ┌───────────────────────────────┐
                   │ Google Tag Manager / GA4      │
                   │ • Key Event: form_submitted   │
                   │ • Key Event: checklist_dl     │
                   │ • Key Event: career_apply     │
                   └───────────────────────────────┘
```

---

## 2. Environment Variables

| Variable | Scope | Description |
|---|---|---|
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Public Browser | Google Analytics 4 Measurement ID (`G-XXXXXXXXXX`). Used for direct `gtag.js` script injection when GTM is not configured. |
| `NEXT_PUBLIC_GTM_ID` | Public Browser | Google Tag Manager Container ID (`GTM-XXXXXXX`). If defined, GTM is used as primary container and GA4 gtag is coordinated via GTM. |

> **Security Rule**: Never expose database credentials, session secrets, Turnstile secret keys, or Resend API keys to browser analytics. Only public identifiers starting with `NEXT_PUBLIC_` are loaded on the client.

---

## 3. Event Taxonomy Standard

| Event Name | Trigger | Safe Parameters | Mark as GA4 Conversion | Where Fired |
|---|---|---|:---:|---|
| `page_view` | Public page load & App Router SPA navigation | `page_path`, `page_title`, `page_type` | No | `AnalyticsProvider.tsx` on client route change |
| `contact_form_started` | First meaningful field interaction (focus/input) | `form_name`, `page_type` | No | `ConsultationForm.tsx` (once per form session) |
| `contact_form_submitted` | Server Action confirms PostgreSQL enquiry creation | `form_name`, `page_type` | **YES** (Primary Conversion) | `ConsultationForm.tsx` on `result.success === true` |
| `contact_form_error` | Form validation error or server rejection | `form_name`, `error_category` | No | `ConsultationForm.tsx` on failure |
| `consultation_cta_click` | Click on consultation / health-check CTA button | `cta_location`, `cta_label`, `page_type` | Secondary | Header, Footer, Hero, Service pages, Health Check page |
| `phone_click` | Click on telephone `tel:` link | `link_location`, `page_type` | Secondary | Direct contact links |
| `whatsapp_click` | Click on WhatsApp link / button | `link_location`, `page_type` | Secondary | Direct WhatsApp links |
| `email_click` | Click on `mailto:` email address | `link_location`, `page_type` | Secondary | Header, Footer, MobileNav, Contact page |
| `article_view` | Public article detail page viewed | `content_id`, `content_slug`, `content_category` | No | `ContentViewTracker.tsx` in `resources/[category]/[slug]/page.tsx` |
| `guide_view` | Public guide detail page viewed | `content_id`, `content_slug` | No | `ContentViewTracker.tsx` in `resources/[category]/[slug]/page.tsx` |
| `checklist_download` | Checklist PDF download or access initiated | `content_id`, `content_slug`, `file_type` | **YES** (Key Event) | `TrackedAnchor` in checklist pages |
| `career_application_click` | Application action on active published job | `job_id`, `job_title`, `department`, `application_method` | **YES** (Key Event) | `TrackedAnchor` / `TrackedCtaLink` in `careers/[slug]/page.tsx` |

---

## 4. First-Touch Lead Attribution Lifecycle

1. **Initial Marketing Arrival**: When a visitor lands on any page (e.g. `/services/pf-esic-compliance?utm_source=google&utm_medium=cpc&utm_campaign=industrial_compliance`), `initAttributionCapture()` in `lib/analytics.ts` extracts:
   - `utm_source`
   - `utm_medium`
   - `utm_campaign`
   - `utm_term`
   - `utm_content`
   - `referrer`
   - `landingPage`
2. **Session Persistence**: Attribution data is saved to `sessionStorage` (`la_first_touch_attribution`). It persists across internal client navigations as the user reads articles, explores services, and browses case studies.
3. **Form Population**: When the visitor opens `/contact`, `ConsultationForm.tsx` loads the stored first-touch attribution into hidden inputs.
4. **CRM Storage**: Upon submission, `submitConsultation` parses and validates the attribution and stores it in the `Enquiry` PostgreSQL table within `sourceDetails` JSON:
   ```json
   {
     "utm_source": "google",
     "utm_medium": "cpc",
     "utm_campaign": "industrial_compliance",
     "utm_term": "pf consultant",
     "utm_content": "hero_banner",
     "referrer": "https://www.google.com/",
     "landingPage": "/services/pf-esic-compliance",
     "submittedIp": "203.0.113.195",
     "submittedAt": "2026-09-01T10:15:30.000Z"
   }
   ```
5. **Admin CRM View**: The lead attribution is presented in Admin CRM (`/admin/enquiries/[id]`), providing full source-to-close attribution.

---

## 5. Strict Privacy & Zero-PII Policy

LabourAxis enforces strict privacy rules:
- **No Personal Data in Analytics**: Names, email addresses, phone numbers, employee counts, company names, messages, notes, and CRM enquiry IDs are **NEVER** pushed to `dataLayer` or `gtag`.
- **Automatic Parameter Sanitization**: `sanitizeParams()` in `lib/analytics.ts` strips any disallowed field before dispatch.
- **Exclusion of Admin Activity**: Routes starting with `/admin` and `/api` are automatically ignored by `trackPageView()`.
- **Exclusion of Draft Previews**: Authenticated staff previewing draft articles, draft guides, or draft jobs do not trigger `article_view`, `guide_view`, or `career_application_click`.

---

## 6. Resilience & Error Handling

- **Non-Blocking Operation**: All analytics helper functions are wrapped in `try { ... } catch (err) { ... }` blocks.
- **Fail-Safe Submissions**: If Google Tag Manager or Google Analytics is blocked by ad-blockers, network failure, or script errors, form submissions, page navigation, and website functionality will continue uninterrupted.
- **Authoritative Conversion Sequence**:
  ```
  User clicks Submit
          ↓
  Turnstile verification
          ↓
  Zod schema validation
          ↓
  PostgreSQL DB create enquiry
          ↓
  Server Action returns { success: true }
          ↓
  trackContactFormSubmitted() [Conversion Event]
  ```
  If DB creation fails, `trackContactFormSubmitted()` is **NEVER** fired.
