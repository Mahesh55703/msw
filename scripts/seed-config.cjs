const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.siteConfiguration.upsert({
    where: { id: 'global' },
    update: {},
    create: {
      id: 'global',
      businessName: 'LabourAxis',
      email: 'info@labouraxis.com',
      phone: '+91 94250 55703',
      whatsapp: '+919425055703',
      addressCity: 'Indore',
      addressState: 'Madhya Pradesh',
      addressCountry: 'India',
      addressDisplay: 'Based in Indore, Madhya Pradesh. Serving clients remotely across India, with on-site support where applicable.',
      addressFooterDisplay: 'Based in Indore, MP • Serving clients across India',
      linkedin: 'https://www.linkedin.com/in/lavish-chouhan-8b29b4361/',
      seoTitle: 'LabourAxis | Operations & Statutory CRM',
      metaDescription: 'LabourAxis provides comprehensive Labour Law Compliance, Payroll Management, and HR Operations solutions.',
    },
  });
  console.log('SiteConfiguration seeded.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
