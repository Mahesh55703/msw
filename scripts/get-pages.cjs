const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  console.log('Pages:', await prisma.page.count());
  console.log('Revisions:', await prisma.pageRevision.count());
  console.log('Sections:', await prisma.pageSection.count());
  console.log('References:', await prisma.pageSectionReference.count());
}
main().finally(() => prisma.$disconnect());
