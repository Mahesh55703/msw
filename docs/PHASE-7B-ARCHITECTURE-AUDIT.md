# Phase 7B — Architecture Audit (Sub-Phase A)

## Current Service Architecture
Service data currently acts as a static repository independent of the database.
- **Data Source**: Statically defined in `@/data/services.ts` as an array of structured objects containing bespoke fields (`problemList`, `trustLine`, `deliverables`, etc.).
- **Dynamic Routing**: `app/services/[slug]/page.tsx` uses `generateStaticParams()` to iterate over the static array. It explicitly maps bespoke properties to custom React components and hardcodes hero images via a `SERVICE_HERO_IMAGES` dictionary.
- **Landing Page**: `app/services/page.tsx` iterates over `servicesData` to render `ServiceCard` components.
- **References**: Other pages (like Industries) filter `servicesData` by slug to render cross-links.

## Current Industry Architecture
Industry data follows the same static pattern.
- **Data Source**: Statically defined in `@/data/industries.ts` with custom fields (`challenges`, `hrAndComplianceRequirements`, `whoWeSupport`).
- **Dynamic Routing**: `app/industries/[slug]/page.tsx` renders routes from the static array and hardcodes assets.
- **Landing Page**: `app/industries/page.tsx` lists them using static map functions.

## Existing Routes
- `/services`
- `/services/[slug]`
- `/industries`
- `/industries/[slug]`

## Existing Data Sources
- `data/services.ts`
- `data/industries.ts`
- Hardcoded dictionaries for images/icons in the respective `page.tsx` components.

## Existing Dependencies
- **Article / Guide / Checklist CMS**: `ArticleRelatedService` tracks related services using the raw string `serviceSlug`.
- **Admin UI**: Components like `components/admin/articles/ArticleEditor.tsx` use a completely *hardcoded* `AVAILABLE_SERVICES` array to populate dropdowns, creating a secondary source of truth.
- **SEO & Sitemap**: `app/sitemap.ts` and `generateMetadata` statically read the arrays.

## Duplication Risk
If we blindly introduce a "Services CMS" using `Page` records without migrating dependencies, the system will fracture:
- A Service created in the CMS will not appear on the public `/services` landing page.
- It will not appear in the Admin Article Editor dropdowns (which are hardcoded).
- `ArticleRelatedService` relations might orphan if a slug is changed in the CMS but not in the static arrays.

## Recommended Architecture
The absolute safest approach that obeys the "integrate with the existing Pages CMS architecture" rule without requiring destructive database schema changes is to use the existing `Page`, `PageRevision`, and `PageSection` entities.

1. **Entity Identification**: 
   A Service is simply a `Page` where `path.startsWith('/services/')`.
   An Industry is simply a `Page` where `path.startsWith('/industries/')`.
2. **Visual Standardization**: 
   The bespoke fields (`problemList`, `deliverables`, `challenges`) must be programmatically transformed into a sequential stack of generic `PageSection` records (`HERO`, `TEXT_IMAGE`, `FEATURE_LIST`, `CTA_BANNER`).
3. **Data Retrieval**:
   - The `/services` and `/industries` landing pages will query the database for published pages under their respective path prefixes and extract `Hero` data for the cards.
   - The dynamic slug routes will utilize the existing `getPublicPageByPath()` CMS data layer and the `PageRenderer` from Phase 5G.
4. **Admin References**:
   Admin editors (like `ArticleEditor.tsx`) will be updated to query `getAdminPages()` instead of relying on hardcoded arrays.

## Migration Strategy
1. Create an idempotent Node/TS script (`scripts/migrate-services-industries.ts`).
2. For each item in `servicesData` and `industriesData`:
   - Create a `Page` with `path` = `/services/${slug}`.
   - Create a `PageRevision` (version 1) mapping `title` to `seoTitle`.
   - Map `heroSupportingText` and `trustLine` to a `HERO` section.
   - Map `problemList`, `deliverables`, and `services` to sequential `FEATURE_LIST` sections.
   - Map `faqs` to `CONTENT_REFERENCE` sections targeting existing FAQ IDs.
   - Map hardcoded `SERVICE_HERO_IMAGES` to `Media` uploads and link them to the `HERO`.
3. Set the `publishedRevisionId` to Version 1.

## Rollback Strategy
Because the migration creates new `Page` records, a rollback is as simple as:
1. Reverting the Git commit that replaces `servicesData` with DB calls.
2. The dynamic routes instantly fall back to the static arrays.
3. The DB records can be left dormant or purged by deleting `Page` records where `path` starts with `/services/`.

## SEO Strategy
- **Metadata**: Replaced seamlessly by the CMS `seoTitle`, `metaDescription`, and `canonicalUrl` native to `PageRevision`.
- **Sitemap**: `app/sitemap.ts` must query `getPublicPageByPath()` iterating over all active Pages to inject them dynamically.
- **Structured Data**: `app/services/[slug]/page.tsx` will programmatically construct `Service` JSON-LD utilizing the `Hero` section text.

## Risks
- **Visual Fidelity Loss**: Forcing highly bespoke Service/Industry designs into the generic `Hero`/`FeatureList`/`TextImage` sections might require slight CSS standardizations on the frontend to prevent layout breakage.
- **Referential Integrity**: `ArticleRelatedService.serviceSlug` is a string, not a foreign key to `Page.id`. If an Admin modifies a Service URL in the CMS, it will break the link to any Article that had the old slug saved. (Mitigation: Prevent URL edits on published Services, or implement a cleanup hook).

## Recommendation
Execute the extension of the Pages CMS using existing `Page` and `PageSection` tables. Map bespoke static properties into standard generic sections. Proceed sequentially: Migration Script → Update Admin Reference Dropdowns → Build Service/Industry Listing Fetchers → Switch Dynamic Route Renderer.
