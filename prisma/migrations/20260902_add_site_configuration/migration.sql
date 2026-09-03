-- CreateTable
CREATE TABLE "SiteConfiguration" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "businessName" TEXT NOT NULL DEFAULT 'LabourAxis',
    "tagline" TEXT,
    "shortDescription" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "whatsapp" TEXT,
    "addressCity" TEXT,
    "addressState" TEXT,
    "addressCountry" TEXT,
    "addressDisplay" TEXT,
    "addressFooterDisplay" TEXT,
    "linkedin" TEXT,
    "seoTitle" TEXT,
    "metaDescription" TEXT,
    "ogImageId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" TEXT,

    CONSTRAINT "SiteConfiguration_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SiteConfiguration" ADD CONSTRAINT "SiteConfiguration_ogImageId_fkey" FOREIGN KEY ("ogImageId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteConfiguration" ADD CONSTRAINT "SiteConfiguration_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

