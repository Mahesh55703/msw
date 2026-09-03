-- CreateEnum
CREATE TYPE "FaqCategory" AS ENUM ('UNCATEGORIZED', 'HR_OPERATIONS', 'LABOUR_COMPLIANCE', 'PF_EPFO', 'ESIC', 'PAYROLL', 'FACTORY_COMPLIANCE', 'CONTRACT_LABOUR', 'INDUSTRIAL_RELATIONS');

-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "category" TEXT NOT NULL DEFAULT 'updates',
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "scheduledAt" TIMESTAMP(3),
    "featuredImage" TEXT,
    "featuredImageAlt" TEXT,
    "ogImage" TEXT,
    "authorId" TEXT NOT NULL,
    "ctaHeading" TEXT,
    "ctaDescription" TEXT,
    "ctaPrimaryLabel" TEXT,
    "ctaPrimaryUrl" TEXT,
    "ctaSecondaryLabel" TEXT,
    "ctaSecondaryUrl" TEXT,
    "seoTitle" TEXT,
    "metaDescription" TEXT,
    "canonicalUrl" TEXT,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticleTakeaway" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "articleId" TEXT NOT NULL,

    CONSTRAINT "ArticleTakeaway_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticleRelatedService" (
    "id" TEXT NOT NULL,
    "serviceSlug" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "articleId" TEXT NOT NULL,

    CONSTRAINT "ArticleRelatedService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticleToRelatedArticle" (
    "id" TEXT NOT NULL,
    "fromId" TEXT NOT NULL,
    "toId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ArticleToRelatedArticle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "altText" TEXT,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobPosting" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "employmentType" TEXT NOT NULL DEFAULT 'Full-time',
    "type" TEXT NOT NULL DEFAULT 'Full-time',
    "workMode" TEXT NOT NULL DEFAULT 'On-site',
    "experience" TEXT,
    "salary" TEXT,
    "description" TEXT NOT NULL,
    "responsibilities" TEXT,
    "requirements" TEXT NOT NULL,
    "applicationMethod" TEXT NOT NULL DEFAULT 'Email',
    "applicationUrl" TEXT,
    "applicationEmail" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "publishedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "closingDate" TIMESTAMP(3),
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "seoTitle" TEXT,
    "metaDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobPosting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobApplication" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "resumeUrl" TEXT NOT NULL,
    "coverLetter" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamMember" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "designation" TEXT NOT NULL DEFAULT '',
    "role" TEXT,
    "department" TEXT,
    "bio" TEXT,
    "imageUrl" TEXT,
    "imageAlt" TEXT,
    "linkedinUrl" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "reportsToId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Faq" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "category" "FaqCategory" NOT NULL DEFAULT 'UNCATEGORIZED',
    "published" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Faq_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Article_slug_key" ON "Article"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ArticleToRelatedArticle_fromId_toId_key" ON "ArticleToRelatedArticle"("fromId", "toId");

-- CreateIndex
CREATE UNIQUE INDEX "Media_url_key" ON "Media"("url");

-- CreateIndex
CREATE UNIQUE INDEX "JobPosting_slug_key" ON "JobPosting"("slug");

-- CreateIndex
CREATE INDEX "JobPosting_status_closingDate_displayOrder_idx" ON "JobPosting"("status", "closingDate", "displayOrder");

-- CreateIndex
CREATE INDEX "JobPosting_slug_idx" ON "JobPosting"("slug");

-- CreateIndex
CREATE INDEX "TeamMember_reportsToId_isActive_displayOrder_idx" ON "TeamMember"("reportsToId", "isActive", "displayOrder");

-- CreateIndex
CREATE INDEX "TeamMember_isActive_displayOrder_idx" ON "TeamMember"("isActive", "displayOrder");

-- CreateIndex
CREATE INDEX "Faq_category_published_displayOrder_idx" ON "Faq"("category", "published", "displayOrder");

-- CreateIndex
CREATE INDEX "Faq_published_displayOrder_idx" ON "Faq"("published", "displayOrder");

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleTakeaway" ADD CONSTRAINT "ArticleTakeaway_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleRelatedService" ADD CONSTRAINT "ArticleRelatedService_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleToRelatedArticle" ADD CONSTRAINT "ArticleToRelatedArticle_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleToRelatedArticle" ADD CONSTRAINT "ArticleToRelatedArticle_toId_fkey" FOREIGN KEY ("toId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobPosting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_reportsToId_fkey" FOREIGN KEY ("reportsToId") REFERENCES "TeamMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

