import { PrismaClient, PageStatus, SectionType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial pages...');

  const pages = [
    { key: 'HOME', path: '/', title: 'Home' },
    { key: 'ABOUT', path: '/about', title: 'About' },
    { key: 'CONTACT', path: '/contact', title: 'Contact' },
    { key: 'SERVICES', path: '/services', title: 'Services' },
    { key: 'INDUSTRIES', path: '/industries', title: 'Industries' },
    { key: 'RESOURCES', path: '/resources', title: 'Resources' },
    { key: 'TEAM', path: '/team', title: 'Team' },
    { key: 'CAREERS', path: '/careers', title: 'Careers' },
    { key: 'COMPLIANCE_HEALTH_CHECK', path: '/compliance-health-check', title: 'Compliance Health Check' },
  ];

  for (const p of pages) {
    let page = await prisma.page.findUnique({ where: { key: p.key } });

    if (!page) {
      page = await prisma.page.create({
        data: {
          key: p.key,
          path: p.path,
          status: PageStatus.PUBLISHED,
        },
      });
      console.log(`Created page: ${p.key}`);

      // Create initial revision
      const revision = await prisma.pageRevision.create({
        data: {
          pageId: page.id,
          version: 1,
          seoTitle: `${p.title} - LabourAxis`,
          metaDescription: 'Initial seeded description for ' + p.title,
        },
      });

      // Update page to point to published revision
      await prisma.page.update({
        where: { id: page.id },
        data: { publishedRevisionId: revision.id },
      });

      // Add dummy hero section for all
      await prisma.pageSection.create({
        data: {
          revisionId: revision.id,
          type: SectionType.HERO,
          sortOrder: 1,
          content: {
            eyebrow: p.title,
            heading: 'Welcome to ' + p.title,
            description: 'This is the ' + p.title + ' page.',
            primaryCta: { label: 'Explore', url: '/services' }
          },
        },
      });
      console.log(`Seeded revision and sections for: ${p.key}`);
    } else {
      console.log(`Page already exists: ${p.key}`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
