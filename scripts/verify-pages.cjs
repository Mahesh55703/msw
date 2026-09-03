const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const pages = await prisma.page.findMany({
    include: {
      revisions: {
        include: {
          sections: {
            include: {
              references: true
            }
          }
        }
      }
    }
  });

  console.log(`Total Pages: ${pages.length}`);
  for (const page of pages) {
    console.log(`\n--- Page: ${page.key} ---`);
    console.log(`Path: ${page.path}`);
    console.log(`Status: ${page.status}`);
    console.log(`Revisions: ${page.revisions.length}`);
    if (page.revisions.length > 0) {
      const rev = page.revisions[0];
      console.log(`Revision Version: ${rev.version}`);
      console.log(`Sections: ${rev.sections.length}`);
      rev.sections.forEach(sec => {
         console.log(`  - Section [${sec.type}]: ${sec.schemaVersion}`);
      });
    }
  }
}

main().finally(() => prisma.$disconnect());
