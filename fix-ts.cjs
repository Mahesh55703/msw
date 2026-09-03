
const fs = require('fs');

let indPage = fs.readFileSync('app/industries/page.tsx', 'utf8');
indPage = indPage.replace('built.process.slice(0, 3).map(proc => proc.title)', 'built.process.slice(0, 3).map((proc: any) => proc.title)');
fs.writeFileSync('app/industries/page.tsx', indPage);

let indSlugPage = fs.readFileSync('app/industries/[slug]/page.tsx', 'utf8');
indSlugPage = indSlugPage.replace('relatedServices.map((service, idx)', 'relatedServices.map((service: any, idx: number)');
fs.writeFileSync('app/industries/[slug]/page.tsx', indSlugPage);

let servSlugPage = fs.readFileSync('app/services/[slug]/page.tsx', 'utf8');
servSlugPage = servSlugPage.replace('path: { not: \/services/\\ }', '');
servSlugPage = servSlugPage.replace('path: { startsWith: \'/services/\' },', 'path: { startsWith: \'/services/\', not: \/services/\\ },');
fs.writeFileSync('app/services/[slug]/page.tsx', servSlugPage);

let servAdapter = fs.readFileSync('lib/cms/service-adapter.ts', 'utf8');
servAdapter = servAdapter.replace('heroSection?.media?.url', '(heroSection as any)?.media?.url');
servAdapter = servAdapter.replace('heroSection?.media?.altText', '(heroSection as any)?.media?.altText');
servAdapter = servAdapter.replace('faqs: ((faqsSection?.content as any)?.features || []).map((f: any) => ({\n      question: f.title,\n      answer: f.description\n    })),\n', 'faqs: ((faqsSection?.content as any)?.features || []).map((f: any) => ({\n      question: f.title,\n      answer: f.description\n    })),\n\n    relatedServices: [],\n');
fs.writeFileSync('lib/cms/service-adapter.ts', servAdapter);

let indAdapter = fs.readFileSync('lib/cms/industry-adapter.ts', 'utf8');
indAdapter = indAdapter.replace('heroSection?.media?.url', '(heroSection as any)?.media?.url');
indAdapter = indAdapter.replace('heroSection?.media?.altText', '(heroSection as any)?.media?.altText');
fs.writeFileSync('lib/cms/industry-adapter.ts', indAdapter);

