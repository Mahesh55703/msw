# Pages CMS Migration Plan

## 1. Tables to Add
The following new tables and enums will be created in PostgreSQL:
- **Enums**: `PageStatus`, `SectionType`
- **Tables**: `Page`, `PageRevision`, `PageSection`, `PageSectionReference`

## 2. Existing Tables Touched
The following tables will only be altered to add Foreign Key constraints/reverse relations:
- `User` (Adds relation for `PageRevision.createdById`)
- `Media` (Adds relation for `PageSection.mediaId` & `PageRevision.ogImageId`)
- `Article`, `Faq`, `TeamMember`, `JobPosting` (Adds relation for `PageSectionReference`)

## 3. Existing Tables NOT Touched
- `Enquiry`, `EnquiryActivity`, `ArticleTakeaway`, `ArticleRelatedService`, `ArticleToRelatedArticle`, `JobApplication`.

## 4. Data Migration Steps
No existing data needs to be modified or deleted. 
This is a purely additive migration. 
We will NOT run `prisma migrate reset`. We will generate a standard `prisma migrate dev --name init_pages_cms`.

## 5. Seed Steps
After the tables are created, a seed script will be run to generate the initial `Page` records:
1. Insert `Page` (key: "HOME", path: "/").
2. Insert `PageRevision` (version: 1).
3. Insert `PageSection` records mapped to Phase 2 content JSON payloads.
4. Update `Page.publishedRevisionId` to the newly created revision.
5. Repeat for ABOUT, CONTACT, SERVICES, INDUSTRIES.

## 6. Rollback
If the deployment fails, the rollback strategy is:
1. Revert to the previous application codebase.
2. The database schema can remain as-is (the new tables will just sit unused), or we can run `prisma migrate down` if needed, which drops the new tables without touching the old ones.

## 7. Verification
- Verify that `npx prisma validate` succeeds.
- Verify that existing `/admin/articles` and `/admin/faqs` pages still load correctly.
- Verify that the `PageSectionReference` cascades appropriately when an `Article` is deleted.

## 8. Production Deployment Sequence
1. Deploy database migration (`npx prisma migrate deploy`).
2. Run database seed script for Pages (`npx tsx scripts/seed-pages.ts`).
3. Deploy new Next.js frontend code.
4. Verify CMS access in production.
