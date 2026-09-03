# Pages CMS Baseline Audit

## 1. Executive Summary
This document establishes the current baseline of the LabourAxis website prior to the implementation of the Pages CMS. The goal is to document the existing architecture, content sources, and UI components to ensure the upcoming CMS integration does not disrupt current functionality, SEO, or existing CMS structures.

## 2. Current Route Inventory
Based on the `app` directory structure, the following public routes exist:
- `/` (Home)
- `/about`
- `/contact`
- `/careers`
- `/careers/[slug]`
- `/compliance-health-check`
- `/disclaimer`
- `/industries`
- `/industries/[slug]`
- `/privacy-policy`
- `/resources`
- `/resources/faqs`
- `/resources/[category]`
- `/resources/[category]/[slug]`
- `/services`
- `/services/[slug]`
- `/team`
- `/terms`

## 3. Page-by-Page UI Inventory
**Home (`/`)**
1. Header
2. Hero (Heading, Supporting Text, CTA buttons)
3. Value Proposition / Key Commitments
4. Core Services (Grid of services from `servicesData`)
5. Who We Help / Industries (Grid of industries)
6. How We Work / Process Timeline
7. Testimonials (using `<Testimonials />`)
8. FAQs (using `<HomeFaqs />`)
9. Final CTA Banner

**About (`/about`)**
1. Hero
2. Story/Mission
3. Core Values
4. Team Preview
5. CTA Banner

**Services (`/services` & `/services/[slug]`)**
1. Hero
2. Services List / Details
3. Related Content
4. CTA Banner

**Industries (`/industries` & `/industries/[slug]`)**
1. Hero
2. Industry Details
3. CTA Banner

**Resources (`/resources`...)**
1. Hero
2. Resource Grids (Articles, Guides, Checklists)
3. Category filters
4. Content Details

**Contact (`/contact`)**
1. Hero
2. Contact Form
3. Contact Details (Email, Phone, Location)

## 4. Page-by-Page Content Inventory
* **Home**: Hero heading, Subheading, CTAs.
* **Services**: Titles, descriptions, icons, benefits.
* **Industries**: Industry names, icons, descriptions.
* **Resources**: Titles, excerpts, publication dates.
* **About**: Mission statement, values, company history.
* **Contact**: Address, phone, email, contact form fields.

## 5. Content Source Mapping
| Section | Source | Potential CMS | Reason |
|---------|--------|---------------|--------|
| Home Hero | `app/page.tsx` | YES | Marketing copy |
| Home Services | `data/services.ts` | NO | Existing structured data |
| Home Industries | `app/page.tsx` / `data/industries.ts` | NO | Existing structured data |
| About Hero | `app/about/page.tsx` | YES | Page-specific copy |
| Contact Details | `lib/site-config.ts` | NO | System configuration |
| Testimonials | `components/home/Testimonials.tsx` | YES | Marketing copy |
| Home FAQs | Database (`Faq` model) | NO | Existing CMS |

## 6. CMS Candidate Mapping
* **YES**: Page Heroes (Home, About, Services Hub, Industries Hub), Value Propositions, CTA Banners, SEO Meta descriptions, Page-specific text sections.
* **NO**: Services details, Industries details, Articles, Checklists, Guides, Careers, Team Members, FAQs.

## 7. Existing CMS Relationships
The future Pages CMS must NOT duplicate the following models which are already defined in Prisma and have an Admin interface:
- **Article** (`/admin/articles`)
- **Media** (`/admin/media`)
- **JobPosting** (`/admin/careers`)
- **TeamMember** (`/admin/team`)
- **Faq** (`/admin/faqs`)

*Rule*: Pages should reference these models rather than redefining them.

## 8. Reusable Section Patterns
- **Hero**: Eyebrow, Heading, Subheading, Primary CTA, Secondary CTA.
- **Text + Image**: Heading, paragraph(s), image URL, alt text, reverse layout option.
- **Card Grid**: For Services/Industries (referencing existing data).
- **CTA Banner**: Background color, Heading, Subtext, Button.
- **FAQ Preview**: References to existing `Faq` model.

## 9. SEO Baseline
- Current SEO implementation relies on `generateMetadata` in `page.tsx` files or static metadata exports.
- *Do not change any current SEO values during migration.*

## 10. Media Baseline
- Images are currently served from `/public` and some from existing Media CMS.
- Future CMS should integrate with the existing `/admin/media`.

## 11. Internal Linking Baseline
- Navigational links use `next/link`.
- `TrackedCtaLink` is used for CTAs to track conversions.
- *Preserve all current hrefs and tracking parameters.*

## 12. Mobile UI Baseline
- Responsive design implemented via Tailwind CSS.
- The CMS must enforce layout constraints so authors do not break mobile views.

## 13. Content That Must Remain Code-Driven
- System Configurations (`lib/site-config.ts`).
- Routing structure (`app/` router conventions).
- Complex interactivity (Forms, Checklists, Calculators).
- Existing Data files unless explicitly refactored later.

## 14. Content That Should Become CMS-Managed
- Static marketing copy on `/`, `/about`, `/contact`.
- Hero sections across all Hub pages.
- Standalone landing pages.
- Page SEO metadata.

## 15. Potential Risks
- **Duplicate Data**: Accidentally creating CMS fields for things already in `Faq` or `Article`.
- **SEO Impact**: Breaking existing hardcoded canonicals.

## 16. Recommended Next Phase
Proceed to design the Prisma Schema for the Pages CMS incorporating flexible JSON or typed relations for the identified Reusable Section Patterns.

## 17. Files inspected
- `app/page.tsx`
- `app/about/page.tsx`
- `data/services.ts`
- `data/industries.ts`
- `prisma/schema.prisma`
- `package.json`

## 18. Git/build baseline
- **Git Commit**: `d9a5cbf7471aaf48de4830241f997cd64fa4b377`
- **Working Tree**: Clean
- **Next.js Version**: 16.3.3
- **TypeScript**: Passed (exit code 0)
- **Lint**: 163 errors, 104 warnings (exit code 1)
- **Build**: Succeeded (exit code 0, with Prisma connection warnings)
