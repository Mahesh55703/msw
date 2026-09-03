const { PrismaClient } = require('@prisma/client');
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

  for (const [key, val] of Object.entries(counts)) {
    console.log(`- ${key}: ${val}`);
  }
}

main().finally(() => prisma.$disconnect());
