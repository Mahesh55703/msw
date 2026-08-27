const fs = require('fs');

let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

const articleReplacement = `
model Article {
  id               String    @id @default(cuid())
  title            String
  slug             String    @unique
  content          String
  excerpt          String?
  category         String    @default("updates")
  
  // Publishing
  published        Boolean   @default(false)
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
  publishedAt      DateTime?
  scheduledAt      DateTime?

  // Media
  featuredImage    String?
  featuredImageAlt String?
  ogImage          String?

  // Author
  authorId         String
  author           User      @relation(fields: [authorId], references: [id])

  // Content Relations
  keyTakeaways     ArticleTakeaway[]

  // Relationships
  relatedServices  ArticleRelatedService[]
  
  // Self-referencing Many-to-Many for Related Articles
  relatedFrom      ArticleToRelatedArticle[] @relation("RelatedFrom")
  relatedTo        ArticleToRelatedArticle[] @relation("RelatedTo")

  // CTA
  ctaHeading       String?
  ctaDescription   String?
  ctaPrimaryLabel  String?
  ctaPrimaryUrl    String?
  ctaSecondaryLabel String?
  ctaSecondaryUrl  String?

  // SEO
  seoTitle         String?
  metaDescription  String?
  canonicalUrl     String?
}

model ArticleTakeaway {
  id        String   @id @default(cuid())
  text      String
  sortOrder Int      @default(0)
  articleId String
  article   Article  @relation(fields: [articleId], references: [id], onDelete: Cascade)
}

model ArticleRelatedService {
  id          String   @id @default(cuid())
  serviceSlug String
  sortOrder   Int      @default(0)
  articleId   String
  article     Article  @relation(fields: [articleId], references: [id], onDelete: Cascade)
}

model ArticleToRelatedArticle {
  id          String   @id @default(cuid())
  fromId      String
  toId        String
  sortOrder   Int      @default(0)
  
  fromArticle Article  @relation("RelatedFrom", fields: [fromId], references: [id], onDelete: Cascade)
  toArticle   Article  @relation("RelatedTo", fields: [toId], references: [id], onDelete: Cascade)

  @@unique([fromId, toId])
}
`;

// Replace the old model Article with the new one
schema = schema.replace(/model Article \{[\s\S]*?(?=model Media \{)/, articleReplacement);

fs.writeFileSync('prisma/schema.prisma', schema);
