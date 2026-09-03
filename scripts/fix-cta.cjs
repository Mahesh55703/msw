const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const sections = await prisma.pageSection.findMany({ where: { type: 'CTA_BANNER' } });
  for (const sec of sections) {
    if (sec.content && sec.content.ctaLabel) {
      const updated = {
         ...sec.content,
         primaryCta: { label: sec.content.ctaLabel, url: sec.content.ctaUrl }
      };
      delete updated.ctaLabel;
      delete updated.ctaUrl;
      await prisma.pageSection.update({
         where: { id: sec.id },
         data: { content: updated }
      });
    }
  }
}
main().finally(() => prisma.$disconnect());
