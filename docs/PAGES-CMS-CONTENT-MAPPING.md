# Pages CMS Content Mapping

## 1. Executive Summary
This document specifies the field-level content mapping for migrating the current LabourAxis website to a future Pages CMS. It defines exactly what content will be editable, what remains code-driven, and how the future CMS should relate to the existing Prisma models (Articles, Faqs, Careers, Team). No database changes have been made.

## 2. CMS Scope
The future Pages CMS will control:
- Marketing and editorial content on static pages (Home, About, Contact).
- Hero sections and layout headers for index/hub pages (Services, Industries, Resources).
- Meta tags and SEO properties for these pages.

## 3. Non-CMS Scope
The Pages CMS will **NOT** control or duplicate:
- The underlying structured data for Services (`data/services.ts`) and Industries (`data/industries.ts`).
- Records in existing Prisma CMS models (Articles, JobPostings, TeamMembers, Faqs).
- Core routing, application logic, and system configurations.

## 4. Page Inventory
- **Core Pages**: `/` (Home), `/about`, `/contact`, `/compliance-health-check`, `/team`, `/careers`
- **Hubs**: `/services`, `/industries`, `/resources`, `/resources/articles`, `/resources/guides`, `/resources/checklists`, `/resources/faqs`
- **Legal**: `/privacy-policy`, `/terms`, `/disclaimer`
- **Dynamic Entities**: `/services/[slug]`, `/industries/[slug]`, `/resources/[category]/[slug]`

## 5. Page Section Hierarchy

**HOME (`/`)**
├── Hero
│   ├── Eyebrow
│   ├── H1
│   ├── Description
│   ├── Primary CTA
│   └── Secondary CTA
├── Value Proposition
│   ├── Heading
│   └── Commitments (Repeatable)
├── Core Services
│   ├── Eyebrow
│   ├── Heading
│   ├── Description
│   └── CTA
├── Who We Help
│   ├── Eyebrow
│   ├── Heading
│   └── Description
├── How We Work
│   ├── Eyebrow
│   ├── Heading
│   ├── Description
│   └── Steps (Repeatable)
├── Testimonials
│   └── (Referenced Component)
├── FAQs
│   └── (Referenced Existing CMS)
└── Final CTA Banner
    ├── Heading
    ├── Description
    └── CTA

**ABOUT (`/about`)**
├── Hero
├── Founder / Story
├── Network
├── Commitments
└── Final CTA Banner

**CONTACT (`/contact`)**
├── Hero
├── Form Intro
└── Contact Info (Global Configuration)

## 6. Complete Content Ownership Matrix

| Page | Section | Field | Current Source | Classification | Future CMS? | Relationship |
|------|---------|-------|---------------|----------------|-------------|--------------|
| Home | Hero | Eyebrow | `app/page.tsx` | CMS_EDITABLE | YES | None |
| Home | Hero | Heading | `app/page.tsx` | CMS_EDITABLE | YES | None |
| Home | Hero | Description | `app/page.tsx` | CMS_EDITABLE | YES | None |
| Home | Hero | CTA 1 | `app/page.tsx` | CMS_EDITABLE | YES | None |
| Home | Hero | CTA 2 | `app/page.tsx` | CMS_EDITABLE | YES | None |
| Home | Services | Intro | `app/page.tsx` | CMS_EDITABLE | YES | None |
| Home | Services | Grid | `data/services.ts` | CODE_DRIVEN | NO | Structured Data |
| Home | Industries | Grid | `data/industries.ts` | CODE_DRIVEN | NO | Structured Data |
| Home | How We Work | Steps | `app/page.tsx` | CMS_EDITABLE | YES | Repeatable Block |
| Home | FAQs | List | `Faq` model | EXISTING_CMS_RELATION | NO | FAQ Model |
| About | Hero | Heading | `app/about/page.tsx` | CMS_EDITABLE | YES | None |
| Contact| Info | Phone | `lib/site-config.ts` | GLOBAL_CONFIGURATION | NO | Config |
| Services| Hub | Heading | `app/services/page.tsx`| CMS_EDITABLE | YES | None |

## 7. Detailed Field Specifications

| Field | Type | Required | Repeatable | Editable | Validation | Notes |
|------|------|----------|------------|----------|------------|-------|
| Eyebrow | Text | No | No | Yes | Max 60 chars | Small uppercase text |
| Hero Heading | Text | Yes | No | Yes | Max 120 chars | Main H1 |
| Hero Description | Rich Text | No | No | Yes | Max 300 chars | Brief intro |
| Primary CTA | Object | No | No | Yes | Valid URL | `{ label, url }` |
| Secondary CTA | Object | No | No | Yes | Valid URL | `{ label, url }` |
| Feature Items | Object | Yes | Yes | Yes | Max 6 items | `{ title, description }` |
| Final CTA Banner | Object | No | No | Yes | | `{ heading, description, cta }` |

## 8. Global Content Mapping
The following elements appear on multiple pages and must remain **GLOBAL_CONFIGURATION** (defined in `site-config.ts`), not duplicated in the CMS:
- Company Phone
- WhatsApp Number
- General Email
- Office Address
- Social Media Links
- Global Footer Description

## 9. Existing CMS Relationships
The Pages CMS must **NOT** create duplicate storage for the following. Instead, page sections should reference them:
- **Articles**: Do not duplicate article content on the Home or Hub pages.
- **FAQs**: The Home page FAQ section fetches from the `Faq` model.
- **Team**: The `/team` page uses the `TeamMember` model.
- **Careers**: The `/careers` page uses the `JobPosting` model.

## 10. Services / Industries Relationship Strategy
Currently, Services and Industries are stored in `data/services.ts` and `data/industries.ts`. 
- **Strategy**: Keep these fields **CODE_DRIVEN** for now.
- The Pages CMS should only control the "Intro" or "Hero" sections of the `/services` and `/industries` hub pages.
- The cards themselves will continue to be generated dynamically from code until a dedicated Services/Industries CMS model is created.

## 11. Media Mapping
- **Current**: Images are in `/public` or the existing Media Library.
- **Future**: The Pages CMS should include an Image Picker field that integrates with the existing Media model (`/admin/media`).
- Images should be selected by ID or URL from the Media Library rather than uploaded directly to the Page model to prevent duplication.

## 12. CTA Mapping
- **Home Primary CTA**: "Explore Services" (Internal Link to `/services`) -> **CMS_EDITABLE**
- **Home Secondary CTA**: "Get in Touch" (Internal Link to `/contact`) -> **CMS_EDITABLE**
- **Bottom Banner CTAs**: "Discuss Your Requirements" (Internal Link to `/contact`) -> **CMS_EDITABLE**
- **Tracking**: Existing `TrackedCtaLink` analytics events must be preserved. The CMS model should support an `analyticsEvent` field if editors need to specify it.

## 13. SEO Field Mapping
For every indexable page managed by the Pages CMS, provide the following **CMS_EDITABLE** fields:
- `seoTitle` (Text)
- `metaDescription` (Text)
- `canonicalUrl` (Text)
- `ogImage` (Media Relation)
*If left blank, the system will fall back to safe defaults.*

## 14. Repeatable Content Blocks
**How We Work Steps** (Home)
- Repeatable: YES (Max 6)
- Required fields: `number`, `title`, `description`

**Commitments** (About & Home)
- Repeatable: YES (Max 6)
- Required fields: `title`, `description`

## 15. Page Template Recommendations
Instead of building a rigid generic CMS, the database should support:
- **Page Instances**: A single record for "Home", "About", "Contact" with predefined sections.
- **Section Types**: Reusable JSON structures for "Hero", "CTA Banner", "Feature Grid".

## 16. Editor Requirements
The future CMS UI will need:
- Plain Text fields for headings.
- Rich Text editor for descriptions (without excessive formatting options).
- CTA Builder (Label + URL).
- Repeatable block builder (Add/Remove items).
- Media Picker (Integration with existing Media library).
- SEO Metadata Editor.

## 17. Migration Mapping
- **Home Page**: Extract exact strings from `app/page.tsx` (e.g., "Simplify HR. Secure Compliance.") and seed them into the future database record for the Home page.
- **About Page**: Extract exact strings from `app/about/page.tsx` and seed them.
- No manual data entry should be required by the user upon deployment.

## 18. Risks
- **Overly Generic CMS**: Building a "drag and drop" page builder might break Tailwind mobile responsiveness. We must enforce structured fields.
- **SEO Regression**: If the new CMS overrides existing canonical tags incorrectly.
- **Data Duplication**: Storing FAQs or Articles in the Pages CMS instead of referencing them.

## 19. Open Questions
- **Legal Pages**: Should `privacy-policy` and `terms` become CMS editable, or remain purely code-driven static files for legal safety? (Recommendation: Keep Code-Driven for now).
- **Service/Industry Hubs**: Should the entire page be a CMS record, or just the top intro sections? (Recommendation: Just the top sections, keep grids dynamic).

## 20. Recommended Phase 3
Proceed to design the Prisma Schema for the Pages CMS.
Recommended Models:
- `Page` (id, slug, title, seo fields)
- `PageSection` (id, pageId, type, order, content JSON)
This approach accommodates the fixed repeatable blocks without overcomplicating relations.
