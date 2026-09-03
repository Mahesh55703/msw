const fs = require('fs');
const path = require('path');

const content = `// ==========================================
// PAGES CMS PROPOSED SCHEMA (PHASE 4 DESIGN)
// ==========================================
// Note: This is a design artifact. Do NOT inject into schema.prisma yet.

// --- EXISTING ENUMS (Do Not Modify) ---
// enum Role { ADMIN, EDITOR }
// enum EnquiryStatus { ... }
// enum EnquiryPriority { ... }
// enum ActivityType { ... }
// enum FaqCategory { ... }

// --- NEW ENUMS ---
enum PageStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

enum SectionType {
  HERO
  TEXT_IMAGE
  FEATURE_LIST
  CTA_BANNER
  CONTENT_REFERENCE
}

// --- NEW MODELS ---

model Page {
  id                  String         @id @default(cuid())
  key                 String         @unique // e.g. "HOME", "ABOUT"
  path                String         @unique // e.g. "/", "/about"
  status              PageStatus     @default(DRAFT)
  
  // Publishing Pointer
  publishedRevisionId String?        @unique
  publishedRevision   PageRevision?  @relation("PublishedRevision", fields: [publishedRevisionId], references: [id])

  // History
  revisions           PageRevision[] @relation("PageRevisions")

  createdAt           DateTime       @default(now())
  updatedAt           DateTime       @updatedAt
}

model PageRevision {
  id              String   @id @default(cuid())
  pageId          String
  page            Page     @relation("PageRevisions", fields: [pageId], references: [id], onDelete: Cascade)
  
  version         Int      // Increments sequentially per page

  // SEO Fields (Drafted securely)
  seoTitle        String?
  metaDescription String?
  canonicalUrl    String?
  ogImageId       String?
  ogImage         Media?   @relation("RevisionOgImage", fields: [ogImageId], references: [id], onDelete: SetNull)

  // Sections
  sections        PageSection[]

  // Reverse relation for active publish pointer
  activeForPage   Page?    @relation("PublishedRevision")

  // Audit
  createdById     String?
  createdBy       User?    @relation(fields: [createdById], references: [id], onDelete: SetNull)

  createdAt       DateTime @default(now())

  @@unique([pageId, version])
}

model PageSection {
  id              String   @id @default(cuid())
  revisionId      String
  revision        PageRevision @relation(fields: [revisionId], references: [id], onDelete: Cascade)

  type            SectionType
  sortOrder       Int
  isVisible       Boolean      @default(true)
  schemaVersion   Int          @default(1) // For future JSON migrations

  // The structured payload (Zod validated in app)
  content         Json         @default("{}")

  // Optional direct media link for Heroes/Banners
  mediaId         String?
  media           Media?       @relation("SectionMedia", fields: [mediaId], references: [id], onDelete: SetNull)

  // Relational references to existing CMS items
  references      PageSectionReference[]

  @@index([revisionId, sortOrder])
}

model PageSectionReference {
  id              String       @id @default(cuid())
  sectionId       String
  section         PageSection  @relation(fields: [sectionId], references: [id], onDelete: Cascade)
  sortOrder       Int          @default(0)

  // Polymorphic-style optional FKs to existing models
  articleId       String?
  article         Article?     @relation(fields: [articleId], references: [id], onDelete: Cascade)

  faqId           String?
  faq             Faq?         @relation(fields: [faqId], references: [id], onDelete: Cascade)

  teamMemberId    String?
  teamMember      TeamMember?  @relation(fields: [teamMemberId], references: [id], onDelete: Cascade)

  jobPostingId    String?
  jobPosting      JobPosting?  @relation(fields: [jobPostingId], references: [id], onDelete: Cascade)

  @@index([sectionId])
}

// --- EXISTING MODELS (Modified to add back-relations ONLY) ---

// model User {
//   ... existing fields ...
//   pageRevisions PageRevision[]
// }

// model Media {
//   ... existing fields ...
//   pageSections PageSection[] @relation("SectionMedia")
//   pageRevisions PageRevision[] @relation("RevisionOgImage")
// }

// model Article {
//   ... existing fields ...
//   pageSectionReferences PageSectionReference[]
// }

// model Faq {
//   ... existing fields ...
//   pageSectionReferences PageSectionReference[]
// }

// model TeamMember {
//   ... existing fields ...
//   pageSectionReferences PageSectionReference[]
// }

// model JobPosting {
//   ... existing fields ...
//   pageSectionReferences PageSectionReference[]
// }
`;
fs.writeFileSync(path.join(process.cwd(), 'docs', 'PAGES-CMS-PROPOSED-SCHEMA.prisma'), content);
console.log('Created docs/PAGES-CMS-PROPOSED-SCHEMA.prisma');
