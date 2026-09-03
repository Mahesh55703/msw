# Pages CMS Database Architecture

## 1. Executive Summary
This document outlines the database architecture for the LabourAxis Pages CMS. Following the UX requirements from Phase 3, this design adopts a **Hybrid Relational-JSON Architecture** with strict **Revision-based Atomic Publishing**. It ensures core pages are immutable in their identity, edits do not leak to production, and relationships to existing content (Articles, Faqs) maintain referential integrity.

## 2. Existing Database Audit
- **Provider**: PostgreSQL.
- **Existing Models**: User, Enquiry, EnquiryActivity, Article, ArticleTakeaway, ArticleRelatedService, ArticleToRelatedArticle, Media, JobPosting, JobApplication, TeamMember, Faq.
- **Dependency Goal**: The Pages CMS will sit "on top" of this schema. It will reference `Media`, `Article`, `Faq`, `JobPosting`, and `TeamMember` without modifying their core structure.

## 3. Phase 2/3 Requirements
- Core page identities (`/`, `/about`) must be stable.
- Editing must happen in a draft state without affecting the live page.
- Revisions are required for rollback.
- SEO must be safely versioned (Draft SEO must not overwrite Live SEO until published).
- Sections are predefined (Hero, Text+Image, etc.) but their content payloads vary.
- Existing CMS models must not be duplicated.

## 4. Architecture Options
- **Option A (JSON Only)**: Store draft/published as two giant JSON columns on the `Page` model. (Poor queryability, no FK integrity).
- **Option B (Fully Relational)**: Dedicated tables for `HeroSection`, `FeatureSection`, etc. (Schema explosion, hard to maintain).
- **Option C (Hybrid Structured Model)**: Core `Page` and `PageRevision` models for status/identity. `PageSection` records belonging to a revision with a validated `content` JSON payload, and a `PageSectionReference` table for strong foreign keys.

## 5. Architecture Comparison
| Architecture | Pros | Cons | LabourAxis Fit | Recommendation |
|--------------|------|------|----------------|----------------|
| JSON Only | Easy to build, fast reads | No relational integrity, hard to query sub-items | Poor (breaks FK rules) | NO |
| Fully Relational| Strict type safety, strong FKs | 10+ new tables, rigid migrations | Over-engineered | NO |
| **Hybrid Model** | Balance of flexibility & integrity. Revisions are easy to snapshot. | JSON requires app-level Zod validation. | **Ideal** | **YES** |

## 6. Recommended Architecture
We recommend the **Hybrid Structured Model**. Sections belong to *Revisions*, not Pages. The Live page simply points to a specific `PageRevision` ID.

## 7. Page Model Design
The `Page` model manages identity and status.
- `key`: A unique, immutable string (e.g., "HOME", "ABOUT").
- `path`: The route (`/`).
- `status`: `DRAFT` | `PUBLISHED` | `ARCHIVED`.
- `publishedRevisionId`: Points to the active `PageRevision`.

## 8. Revision Model Design
The `PageRevision` model acts as a complete snapshot of the page at a point in time.
- Holds SEO fields (`seoTitle`, `metaDescription`, `canonicalUrl`, `ogImageId`) to ensure SEO changes are drafted before going live.
- Holds the `version` integer.

## 9. Section Model Design
The `PageSection` belongs to `PageRevision`.
- If an editor changes a section, a *new* Revision is created, and all sections are cloned to the new revision.
- Contains `type` enum (`HERO`, `FEATURE_LIST`, etc.).
- Contains `content` JSON for text/configuration.

## 10. Section Content Strategy
The `content` field stores localized JSON that maps to Zod schemas in the application. Repeatable fields (like "Commitments" or "How We Work steps") will be stored as JSON arrays inside this payload, preventing the need for deep relational nesting for simple text lists.

## 11. Content Reference Strategy
To maintain strong Foreign Keys for existing CMS records, we introduce `PageSectionReference`. 
This junction table links a `PageSection` to optional fields: `articleId`, `faqId`, `teamMemberId`, `jobPostingId`. This ensures database integrity (e.g., if an Article is deleted, the reference is cascade-deleted, preventing 404s).

## 12. Media Strategy
Images will reference the existing `Media` table. 
- The `PageSection` has an optional `mediaId` field for primary images.
- Page-specific alt text can be stored inside the JSON `content` payload to override the global `Media.altText` when needed.

## 13. SEO Strategy
SEO fields live on the `PageRevision`. This explicitly prevents Draft SEO from leaking into the Live page.

## 14. CTA Strategy
CTAs are stored inside the `PageSection`'s JSON `content` field as objects: `{ label, url, type }`. They do not require relational integrity since they map to static routes or external URLs.

## 15. Draft/Published Strategy
Isolation is guaranteed because the public frontend will *only* query:
`prisma.page.findUnique({ where: { path }, include: { publishedRevision: { include: { sections: true } } } })`.
Draft changes are saved to a new/pending revision, completely ignoring the live revision.

## 16. Preview Strategy
Previewing passes a secure `?revisionId=xyz` token. The frontend renders that specific revision instead of the `publishedRevision`, allowing editors to see exact changes safely.

## 17. Publishing Transaction Strategy
Atomic publishing involves:
1. Validating the Draft Revision.
2. `prisma.$transaction`: Update `Page.publishedRevisionId` to the Draft ID, and update `Page.status` to `PUBLISHED`.

## 18. Route Protection
The `key` and `path` fields on core pages will be protected at the application layer. The database enforces uniqueness on both.

## 19. Redirect Strategy
Not strictly necessary for Phase 4 since core pages are immutable. We will skip a `Redirect` model to prevent over-engineering. Next.js `next.config.js` can handle the rare manual redirects.

## 20. Permissions Compatibility
No changes needed to `User` or `Role`. The `createdById` on `PageRevision` will track which editor made the changes.

## 21. Delete/Archive Strategy
Core pages should never be physically deleted. `PageStatus.ARCHIVED` provides a soft-delete mechanism for future dynamic landing pages.

## 22. Indexes
- `Page.key` (Unique Index)
- `Page.path` (Unique Index)
- `PageSection.revisionId` (Index)

## 23. Unique Constraints
- `PageRevision(pageId, version)` must be unique.

## 24. Cascade Rules
- If `Page` is deleted -> cascade `PageRevision`.
- If `PageRevision` is deleted -> cascade `PageSection`.
- If `PageSection` is deleted -> cascade `PageSectionReference`.
- If an existing `Article` is deleted -> cascade `PageSectionReference` (keeps the CMS clean).

## 25. Migration Safety
The migration will exclusively CREATE new tables. It will NOT touch existing records or schemas.

## 26. Initial Seed Strategy
Phase 5 will include a seed script that inserts the `Page`, an initial `PageRevision`, and the exact JSON payloads mapped from Phase 2.

## 27. Performance Strategy
Querying a page requires exactly 1 database call with joined includes. No N+1 query problems.

## 28. Type Safety Strategy
The application will define `z.object()` schemas that parse the Prisma `Json` outputs before passing them to React components.

## 29. Versioning Strategy
A `schemaVersion` integer on `PageSection` will allow future migrations of JSON structures (e.g., v1 -> v2) without breaking historical revisions.

## 30. Proposed Prisma Schema
(See docs/PAGES-CMS-PROPOSED-SCHEMA.prisma)

## 31. Model-by-Model Explanation
- `Page`: Stable identity.
- `PageRevision`: Content snapshot, SEO holder.
- `PageSection`: Predefined layout block, JSON holder.
- `PageSectionReference`: Relational integrity map for existing CMS items.

## 32. Open Questions
None. The architecture is fully resolved.

## 33. Phase 5 Implementation Plan
1. Generate Prisma Migration.
2. Build Zod schemas for JSON payloads.
3. Build Seed script.
4. Implement Admin UI.
