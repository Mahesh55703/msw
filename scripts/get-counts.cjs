const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function main() {
  const counts = {
    User: await prisma.user.count(),
    Enquiry: await prisma.enquiry.count(),
    EnquiryActivity: await prisma.enquiryActivity.count(),
    Article: await prisma.article.count(),
    ArticleTakeaway: await prisma.articleTakeaway.count(),
    ArticleRelatedService: await prisma.articleRelatedService.count(),
    ArticleToRelatedArticle: await prisma.articleToRelatedArticle.count(),
    JobPosting: await prisma.jobPosting.count(),
    JobApplication: await prisma.jobApplication.count(),
    TeamMember: await prisma.teamMember.count(),
    Media: await prisma.media.count(),
    Faq: await prisma.faq.count(),
  };

  const mdContent = `# Database Counts Before Migration (Phase 5A)

- User: ${counts.User}
- Enquiry: ${counts.Enquiry}
- EnquiryActivity: ${counts.EnquiryActivity}
- Article: ${counts.Article}
- ArticleTakeaway: ${counts.ArticleTakeaway}
- ArticleRelatedService: ${counts.ArticleRelatedService}
- ArticleToRelatedArticle: ${counts.ArticleToRelatedArticle}
- JobPosting: ${counts.JobPosting}
- JobApplication: ${counts.JobApplication}
- TeamMember: ${counts.TeamMember}
- Media: ${counts.Media}
- Faq: ${counts.Faq}
`;

  fs.writeFileSync('docs/PAGES-CMS-DB-BEFORE-MIGRATION.md', mdContent);
  console.log('Recorded counts to docs/PAGES-CMS-DB-BEFORE-MIGRATION.md');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
