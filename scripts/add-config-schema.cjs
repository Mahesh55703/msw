const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

// 1. Add SiteConfiguration model at the end
const modelDef = `
model SiteConfiguration {
  id                    String   @id @default("global")
  
  // Business Information
  businessName          String   @default("LabourAxis")
  tagline               String?
  shortDescription      String?
  
  // Contact Information
  email                 String?
  phone                 String?
  whatsapp              String?
  addressCity           String?
  addressState          String?
  addressCountry        String?
  addressDisplay        String?
  addressFooterDisplay  String?
  
  // Social Links
  linkedin              String?
  
  // SEO & Branding Defaults
  seoTitle              String?
  metaDescription       String?
  
  ogImageId             String?
  ogImage               Media?   @relation("ConfigOgImage", fields: [ogImageId], references: [id], onDelete: SetNull)
  
  updatedAt             DateTime @updatedAt
  updatedById           String?
  updatedBy             User?    @relation("UserSiteConfigs", fields: [updatedById], references: [id], onDelete: SetNull)
}
`;
schema += modelDef;

// 2. Add relation to User
schema = schema.replace(
  "auditLogsTargeted AdminAuditLog[] @relation(\"TargetAuditLogs\")\n}",
  "auditLogsTargeted AdminAuditLog[] @relation(\"TargetAuditLogs\")\n  siteConfigurations SiteConfiguration[] @relation(\"UserSiteConfigs\")\n}"
);

// 3. Add relation to Media
schema = schema.replace(
  "pageRevisions PageRevision[] @relation(\"RevisionOgImage\")\n}",
  "pageRevisions PageRevision[] @relation(\"RevisionOgImage\")\n  siteConfigurations SiteConfiguration[] @relation(\"ConfigOgImage\")\n}"
);

fs.writeFileSync('prisma/schema.prisma', schema);
