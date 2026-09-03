# Phase 7B Sub-Phase E — Static Dependency Audit

## 1. `data/services.ts` Dependencies

### `app/page.tsx`
- **Function/Component**: Homepage services section
- **Current Purpose**: Maps over `servicesData` to render service summary cards.
- **Source**: `data/services.ts`
- **Can CMS Replace It?**: YES.
- **Risk**: MEDIUM. The homepage needs stable service summaries and icons. The CMS Service pages provide `category`, `title`, and `heroSupportingText` (which can act as a short description). Icons are mapped via a dictionary or can be passed.
- **Recommended Action**: Fetch published Services from CMS (`path: { startsWith: '/services/' }`) and map them to the format the homepage expects.

### `app/services/page.tsx`
- **Function/Component**: Services landing page
- **Current Purpose**: Maps over `servicesData` to render `ServiceCard` components.
- **Source**: `data/services.ts`
- **Can CMS Replace It?**: YES.
- **Risk**: MEDIUM. Same as homepage. We need to parse the CMS sections to extract the `category`, `title`, `heroSupportingText`, and the first 3 `services` (highlights) for the `ServiceCard` chips.
- **Recommended Action**: Create a helper to fetch published Service pages, pass them through `buildServiceFromCms`, and render the cards.

### `app/services/[slug]/page.tsx`
- **Function/Component**: Service detail page `relatedServicesData`
- **Current Purpose**: Filters `servicesData` to get 3 related services.
- **Source**: `data/services.ts`
- **Can CMS Replace It?**: YES.
- **Risk**: LOW. 
- **Recommended Action**: Fetch 3 other published services from the CMS instead of the static array.

### `app/sitemap.ts`
- **Function/Component**: Sitemap generation fallback
- **Current Purpose**: If the DB query fails, it uses `servicesData` as a fallback.
- **Source**: `data/services.ts`
- **Can CMS Replace It?**: N/A (It's a fallback).
- **Risk**: LOW.
- **Recommended Action**: We can remove the fallback once the DB is authoritative, or keep an empty array fallback if the DB fails.

### `components/services/ServiceCard.tsx`
- **Function/Component**: Reusable service card
- **Current Purpose**: Uses `Service` type from `data/services.ts`.
- **Source**: `data/services.ts`
- **Can CMS Replace It?**: YES.
- **Risk**: LOW.
- **Recommended Action**: Define a local `ServiceCardProp` type that matches the shape returned by `buildServiceFromCms`.

---

## 2. `data/industries.ts` Dependencies

### `app/industries/page.tsx`
- **Function/Component**: Industries landing page
- **Current Purpose**: Maps over `industriesData` to render industry cards.
- **Source**: `data/industries.ts`
- **Can CMS Replace It?**: YES.
- **Risk**: MEDIUM. The landing page needs `title`, `shortDescription`, and `hubRelevantServices`. The CMS Industry pages can provide this (using the hero description for `shortDescription`).
- **Recommended Action**: Fetch published Industry pages, pass them through `buildIndustryFromCms`, and render.

### `app/industries/[slug]/page.tsx`
- **Function/Component**: Industry detail page `relevantServices`
- **Current Purpose**: Finds the industry in `industriesData` and maps its `relevantServices` to titles using a dictionary.
- **Source**: `data/industries.ts`
- **Can CMS Replace It?**: YES.
- **Risk**: HIGH. The relationship between an Industry and its relevant Services is currently hardcoded in `industriesData[n].relevantServices` (an array of service slugs).
- **Recommended Action**: A CMS Industry page doesn't natively have a "related services" relation in the schema. We can either: (A) add a `ContentReference` section in CMS to store these, or (B) keep the static lookup dictionary just for this relationship. Since avoiding schema changes is preferred, we could store it in the `PageSection` of type `FEATURE_LIST` or simply query the CMS Services and map them if they exist.

### `app/sitemap.ts`
- **Function/Component**: Sitemap generation fallback
- **Current Purpose**: Fallback for industry routes.
- **Source**: `data/industries.ts`
- **Can CMS Replace It?**: YES.
- **Risk**: LOW.
- **Recommended Action**: Remove fallback.

---

## 3. `AVAILABLE_SERVICES` Dependencies

### `app/resources/[category]/[slug]/page.tsx`
- **Function/Component**: Article detail page `AVAILABLE_SERVICES` dictionary
- **Current Purpose**: Maps `serviceSlug` from `ArticleRelatedService` to a display title.
- **Source**: Hardcoded dictionary in the file.
- **Can CMS Replace It?**: YES.
- **Risk**: LOW.
- **Recommended Action**: Fetch all published Service pages from CMS, and use their `seoTitle` or hero `heading` as the display title.

### `components/admin/articles/ArticleEditor.tsx`
- **Function/Component**: Admin article editor service selector
- **Current Purpose**: Provides the dropdown list of services to tag an article with.
- **Source**: Hardcoded `AVAILABLE_SERVICES` array.
- **Can CMS Replace It?**: YES.
- **Risk**: MEDIUM. It's a client component.
- **Recommended Action**: Pass `availableServices: { slug: string, title: string }[]` as a prop from the server-side page (`app/admin/articles/new/page.tsx` and `app/admin/articles/[id]/edit/page.tsx`), fetching them from `prisma.page`.

### `components/admin/cms/CmsForm.tsx`
- **Function/Component**: Older Admin generic form
- **Current Purpose**: Same as above.
- **Source**: Hardcoded array.
- **Can CMS Replace It?**: YES.
- **Risk**: LOW.
- **Recommended Action**: Same approach (pass as prop).

---

## 4. `SERVICE_HERO_IMAGES` & `INDUSTRY_HERO_IMAGES`

### `app/services/[slug]/page.tsx`
- **Function/Component**: `SERVICE_HERO_IMAGES`
- **Current Purpose**: Provides `url`, `badge`, and `caption` for the hero section based on `slug`.
- **Source**: Hardcoded dictionary.
- **Can CMS Replace It?**: YES.
- **Risk**: MEDIUM.
- **Recommended Action**: `PageSection` has a `mediaId` and `media` relation. We can upload hero images via the Media Library, attach them to the `HERO` section, and the adapter will return `heroImageUrl`. We can use the CMS `eyebrow` field for the `badge`, and `mediaAlt` for the `caption`.

### `app/industries/[slug]/page.tsx`
- **Function/Component**: `INDUSTRY_HERO_IMAGES`
- **Current Purpose**: Same as above.
- **Source**: Hardcoded dictionary.
- **Can CMS Replace It?**: YES.
- **Risk**: MEDIUM.
- **Recommended Action**: Same approach.

---

## 5. Navigation

### Global Navigation Component (Header/Footer)
- **Investigation Needed**: Need to check if `components/layout/Header.tsx` or similar uses `data/services.ts` to build dropdowns.
- **Recommended Action**: Check header navigation. If it uses static arrays, it should be updated to query CMS, or kept static if it's a fixed menu.

---

## 6. `WHY_LABOURAXIS` / `APPROACH_STEPS`
- **Observation**: These are hardcoded in the detail page renderers.
- **Decision**: They represent global branding methodology. They should **remain static** because they apply universally to all services/industries and don't need to be uniquely managed per page right now.

---
