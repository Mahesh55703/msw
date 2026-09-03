const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function main() {
  const pages = await db.page.findMany({
    where: { status: 'PUBLISHED', publishedRevisionId: { not: null } },
    select: { path: true, key: true }
  });
  
  const svcs = pages.filter(p => p.path.startsWith('/services/'));
  const inds = pages.filter(p => p.path.startsWith('/industries/'));
  const core = pages.filter(p => !p.path.startsWith('/services/') && !p.path.startsWith('/industries/'));
  
  console.log('\n=== CMS DATABASE STATE ===');
  console.log('Total published pages:', pages.length);
  console.log('\nCore CMS pages:', core.length);
  core.forEach(p => console.log('  -', p.path));
  console.log('\nPublished services:', svcs.length);
  svcs.forEach(p => console.log('  -', p.path));
  console.log('\nPublished industries:', inds.length);
  inds.forEach(p => console.log('  -', p.path));

  // Verify sections exist
  const sections = await db.pageSection.count();
  const revisions = await db.pageRevision.count();
  console.log('\nTotal revisions:', revisions);
  console.log('Total sections:', sections);
}

main().finally(() => db.$disconnect());
