const fs = require('fs');
const path = require('path');

const content = `# Pages CMS IA & Admin UX Specification

## 1. Executive Summary
This document specifies the Information Architecture (IA) and User Experience (UX) for the LabourAxis Pages CMS. The architecture is explicitly designed as a **Controlled / Structured Page Editor**, avoiding generic drag-and-drop mechanics. It ensures administrators can confidently edit content while preventing accidental destruction of layout, responsive design, SEO, and application logic.

## 2. Design Principles
- **Structured Content, Not Layout**: Editors fill out fields mapping to predefined sections.
- **Single Source of Truth**: Leverage existing Prisma models (Articles, Faqs, etc.) rather than duplicating data.
- **SEO & Analytics Safety**: SEO defaults to safe values. CTAs retain their tracking classes.
- **Fail-Safe Editing**: Live sites are protected by strict Draft/Publish workflows and immutable core URLs.

## 3. Admin Navigation
The Pages CMS will integrate into the existing Admin sidebar.

\`\`\`text
ADMIN
│
├── DASHBOARD
│
├── CONTENT
│   ├── Pages       <-- NEW
│   ├── Articles
│   ├── Guides
│   ├── Checklists
│   ├── FAQs
│   └── Media
│
├── LEADS
│   └── Enquiries
│
├── COMPANY
│   ├── Team
│   └── Careers
│
└── SYSTEM
    └── Settings
\`\`\`

## 4. Pages List UX
The main \`/admin/pages\` interface provides a clear overview of all managed pages.

\`\`\`text
PAGES
─────────────────────────────────────────────────────────────────
Pages                                       [+ Create Landing Page]

Search Pages...                  Filter: [All | Published | Draft]

#   Page             URL               Status      Updated    Actions
01  Home             /                 Published   Today      👁 ✎
02  About            /about            Published   Today      👁 ✎
03  Contact          /contact          Published   Yesterday  👁 ✎
04  Services Hub     /services         Draft       2d ago     👁 ✎
05  Industries Hub   /industries       Published   1w ago     👁 ✎
─────────────────────────────────────────────────────────────────
\`\`\`

## 5. Page Editor UX
The editor uses a stacked section approach with an accordion or distinct blocks to prevent overwhelm.

\`\`\`text
EDIT PAGE: HOME
─────────────────────────────────────────────────────────────────
Page: Home    URL: /    Status: Published

[Preview] [Save Draft] [Publish]
─────────────────────────────────────────────────────────────────
01 — HERO (Required)                                    [Collapse]
Eyebrow
[Industrial HR & Labour Compliance Consultancy]

Heading
[Simplify HR. Secure Compliance.]

Description
[Practical HR, labour compliance, PF, ESIC...]

Primary CTA
Label [Explore Services]      URL [/services]

Secondary CTA
Label [Get in Touch]          URL [/contact]
─────────────────────────────────────────────────────────────────
02 — CORE SERVICES (Optional)                           [Expand]
─────────────────────────────────────────────────────────────────
03 — HOW WE WORK (Repeatable)                           [Expand]
─────────────────────────────────────────────────────────────────
SEO METADATA                                            [Expand]
─────────────────────────────────────────────────────────────────
[Save Draft] [Preview] [Publish]
\`\`\`

## 6. Desktop Layout
Preferred Layout: Main Content (70%) | Sidebar (30%)

\`\`\`text
┌───────────────────────────────────────────────────────────────┐
│ Page Header: Title | Status | Save | Preview | Publish        │
├──────────────────────────────────────┬────────────────────────┤
│                                      │                        │
│ MAIN CONTENT                         │ SIDEBAR                │
│                                      │                        │
│ [ 01 Hero Section                  ] │ STATUS                 │
│ [ 02 Services Introduction         ] │ 🟢 Published           │
│ [ 03 Why LabourAxis                ] │ Updated: 10 mins ago   │
│ [ 04 Final CTA                     ] │                        │
│                                      │ PUBLISHING             │
│                                      │ [Save Draft]           │
│                                      │ [Preview]              │
│                                      │ [Publish Updates]      │
│                                      │                        │
│                                      │ SEO METADATA           │
│                                      │ Title (60 chars)       │
│                                      │ Meta Desc (160 chars)  │
│                                      │ Canonical URL          │
│                                      │ OG Image Selector      │
└──────────────────────────────────────┴────────────────────────┘
\`\`\`

## 7. Mobile Layout
On mobile (< 768px):
- Sidebar items stack below Main Content.
- Sticky action bar at bottom (Save Draft, Publish).
- Expandable accordion sections remain accessible.

## 8. Page Status Workflow
- **DRAFT**: Saved but not public.
- **PUBLISHED**: Live on the public URL.
- **MODIFIED**: Live, but has unsaved/un-published draft changes.

## 9. Section Architecture
Sections are hardcoded in the frontend layout. The CMS populates the JSON data mapping to these sections.
- **Hero**: Fixed, Required, Cannot duplicate.
- **Marketing Grid**: Optional, Reorderable items.
- **Referenced Content**: Displays dynamically fetched Prisma records.

## 10. Controlled Section Catalog
1. **Hero Header**: (Eyebrow, H1, Desc, CTAs)
2. **Text + Image**: (Heading, Rich Text, Media Picker, Image Position)
3. **Feature List**: (Heading, Repeatable [Title, Desc, Icon])
4. **CTA Banner**: (Heading, Desc, Button)
5. **Content Reference**: (Heading, Model [e.g., Faq], Filter logic)

## 11. Field Type Catalog
- **Short Text**: Headings, eyebrows (max lengths enforced).
- **Long Text**: Descriptions.
- **Rich Text**: For articles or detailed sections (restricted toolbar).
- **CTA Builder**: \`{ label, url }\` ensuring correct routing.
- **Media Selector**: Opens Media Library modal.
- **Repeatable List**: Array of specific objects.

## 12. Existing CMS Relationships
The Pages CMS will strictly **REFERENCE** existing content using foreign keys or dynamic fetching, avoiding duplication:
- **Home FAQs**: Fetched via \`Faq\` model.
- **Resources**: Fetched via \`Article\`, \`Guide\`, \`Checklist\` models.
- **Team**: Fetched via \`TeamMember\`.

## 13. Services / Industries Strategy
- Services and Industries data remains **CODE_DRIVEN** (\`data/services.ts\`).
- Pages CMS only manages the *Hub Page Intro* (e.g., Hero on \`/services\`).
- The actual grids continue to map over existing static data.

## 14. Media Strategy
- The editor will integrate with the existing Media Library.
- Clicking "Select Image" opens a modal to pick existing images or upload new ones to the centralized repository.
- CMS fields store the \`mediaId\` or \`url\`.

## 15. CTA Strategy
CTAs will be managed via a controlled builder to preserve \`TrackedCtaLink\` functionality.
- Label: Short Text.
- Type: Internal | External | Phone | Email
- Destination: URL.

## 16. SEO Editor
Sidebar panel ensuring SEO safety:
- **SEO Title**: 0/60 characters (Warning if missing).
- **Meta Description**: 0/160 characters.
- **Canonical URL**: Auto-generated by default, overrideable.
- **OG Image**: Media Selector.

## 17. Preview Architecture
- Admin clicks **Preview**.
- A secure route (e.g., \`/api/preview\`) sets a draft cookie.
- Opens the actual public page URL in a new tab rendering draft data.
- Includes a sticky "Draft Preview Mode" banner.
- Fully \`noindex\` to prevent search engine leaks.

## 18. Draft / Publish Workflow
- **Save Draft**: Updates the database \`draftContent\` JSON, does not affect \`publishedContent\`.
- **Publish**: Copies \`draftContent\` to \`publishedContent\` and revalidates the Next.js cache.

## 19. URL / Slug Protection
- **Core Pages**: \`/\`, \`/about\`, \`/contact\`, \`/services\`, \`/industries\` are **IMMUTABLE**. Slugs cannot be edited.
- **Custom Landing Pages**: (If permitted later) slugs can be edited, requiring redirect safeguards.

## 20. Core Page Protection
- Core pages cannot be deleted. The "Delete" button is disabled/hidden for protected system records.
- Unpublishing a core page is restricted or triggers a high-severity warning.

## 21. Permissions
- **Admin**: Full access (Create, Edit, Publish, Manage SEO, System settings).
- **Editor**: Can Edit and Save Drafts. Publishing is restricted. Cannot delete pages.

## 22. Revision Requirements
- **Recommended**: Simple snapshot of the last published state to allow "Revert to Published". Full complex revision history is optional for Phase 4 but recommended eventually.

## 23. Validation Rules
- Required fields enforced on Publish (not on Save Draft).
- Max lengths enforced on Headings and SEO fields.
- CTA URLs must be valid formats.

## 24. Accessibility Requirements
- Proper focus states for all inputs.
- ARIA labels for icon buttons (Preview, Edit).
- Screen-reader compatible tooltips.

## 25. SEO Safeguards
- Drafts never leak to search engines.
- Missing H1s prevented by making Hero Heading required.
- Canonical URL falls back to standard route if left blank.

## 26. Analytics Safeguards
- No custom script injection fields.
- CTAs render securely into existing \`TrackedCtaLink\` components.

## 27. Performance Requirements
- Uses React Server Components to fetch \`publishedContent\`.
- Incremental Static Regeneration (ISR) ensures fast load times.

## 28. Error / Empty States
- Unsaved changes trigger \`beforeunload\` browser warnings.
- Failed saves display clear toast notifications.
- Empty lists guide users to create content.

## 29. Migration UX Requirements
- Initial seed data must precisely populate from \`app/page.tsx\` strings. No manual admin setup should be required on day 1.

## 30. Recommended Phase 4 Database Architecture
- \`Page\` model: id, slug (unique), status, seo metadata.
- \`PageSection\` model: id, pageId, type, content (JSON).
This supports structured data without rigidity.

## 31. Open Questions
- Should \`privacy-policy\` and \`terms\` be editable in the CMS, or remain purely code-driven static files for legal safety? (Recommendation: Keep code-driven).

---

## Page-by-Page Editor Matrix

| Page | Section | Editable Fields | Relationship | Required | Optional | Protected |
|------|---------|-----------------|--------------|----------|----------|-----------|
| Home | Hero | Heading, Desc, CTAs | None | YES | NO | YES |
| Home | Core Services | Heading | \`data/services.ts\` | YES | YES | YES |
| About| Story | Heading, Body | None | YES | NO | YES |
| Contact| Hero | Heading, Desc | None | YES | NO | YES |
| Contact| Info | (Site Config) | GLOBAL | NO | NO | YES |
| Services Hub| Hero | Heading, Desc | None | YES | NO | YES |
| Industries Hub| Hero | Heading, Desc | None | YES | NO | YES |
| Careers | Hub Hero | Heading, Desc | \`JobPosting\` | YES | NO | YES |
| Team | Hub Hero | Heading, Desc | \`TeamMember\` | YES | NO | YES |

---

## Final Architectural Recommendation
1. **Manage**: Static page marketing copy, Heroes, Hub headers, SEO metadata.
2. **Do NOT Manage**: Legal text, complex forms, core layout logic.
3. **Fixed Sections**: Page Heroes, Contact Info blocks.
4. **Optional Sections**: Marketing callouts, CTA Banners.
5. **Repeatable Sections**: Timeline steps, Feature commitments.
6. **Referenced Content**: Articles, FAQs, Team, Careers.
7. **Protected Pages**: \`/\`, \`/about\`, \`/contact\`, Hubs.
8. **Editors Can Change**: Text, images, CTAs, SEO fields.
9. **Admins Can Change**: Slugs for custom landing pages, system config.
10. **Code-Driven**: Services logic, Industries logic.
11. **Phase 4 DB Needs**: Flexible JSON structure for section content mapped to rigid frontend types.
12. **Do NOT Implement**: Drag-and-drop, HTML editors.
`;

fs.writeFileSync(path.join(process.cwd(), 'docs', 'PAGES-CMS-IA-ADMIN-UX.md'), content);
console.log('Created docs/PAGES-CMS-IA-ADMIN-UX.md');
