const fs = require('fs');

const content = `

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

model Page {
  id                  String         @id @default(cuid())
  key                 String         @unique
  path                String         @unique
  status              PageStatus     @default(DRAFT)
  publishedRevisionId String?        @unique
  publishedRevision   PageRevision?  @relation("PublishedRevision", fields: [publishedRevisionId], references: [id])
  revisions           PageRevision[] @relation("PageRevisions")
  createdAt           DateTime       @default(now())
  updatedAt           DateTime       @updatedAt
}

model PageRevision {
  id              String   @id @default(cuid())
  pageId          String
  page            Page     @relation("PageRevisions", fields: [pageId], references: [id], onDelete: Cascade)
  version         Int
  seoTitle        String?
  metaDescription String?
  canonicalUrl    String?
  ogImageId       String?
  ogImage         Media?   @relation("RevisionOgImage", fields: [ogImageId], references: [id], onDelete: SetNull)
  sections        PageSection[]
  activeForPage   Page?    @relation("PublishedRevision")
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
  schemaVersion   Int          @default(1)
  content         Json         @default("{}")
  mediaId         String?
  media           Media?       @relation("SectionMedia", fields: [mediaId], references: [id], onDelete: SetNull)
  references      PageSectionReference[]
  @@index([revisionId, sortOrder])
}

model PageSectionReference {
  id              String       @id @default(cuid())
  sectionId       String
  section         PageSection  @relation(fields: [sectionId], references: [id], onDelete: Cascade)
  sortOrder       Int          @default(0)
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
`;
fs.appendFileSync('prisma/schema.prisma', content);
