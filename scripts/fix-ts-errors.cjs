const fs = require('fs');

// Fix Header.tsx
let headerContent = fs.readFileSync('components/layout/Header.tsx', 'utf8');
if (!headerContent.includes('useSiteConfig')) {
  // It uses it but doesn't import it
}
headerContent = headerContent.replace(
  "import { trackConsultationCta } from '@/lib/analytics';",
  "import { trackConsultationCta } from '@/lib/analytics';\nimport { useSiteConfig } from '@/components/layout/SiteConfigProvider';"
);
fs.writeFileSync('components/layout/Header.tsx', headerContent);

// Fix page.tsx
['app/privacy-policy/page.tsx', 'app/terms/page.tsx'].forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace("export default async\nfunction", "export default async function");
  content = content.replace(/export default async function [A-Za-z0-9_]+\(\) \{\r?\n/, (match) => {
    return match + "  const siteConfig = await getSiteConfig();\n";
  });
  // Also check if `export default async` happened to be split or something.
  // Wait, let's just do a simple replace:
  if (!content.includes('const siteConfig = await getSiteConfig()')) {
    content = content.replace(/export default async function\s+[a-zA-Z0-9_]+\(\)\s*\{/, match => match + "\n  const siteConfig = await getSiteConfig();\n");
  }
  fs.writeFileSync(file, content);
});

// Let's check contact/page.tsx too just in case
let contactContent = fs.readFileSync('app/contact/page.tsx', 'utf8');
if (!contactContent.includes('const siteConfig = await getSiteConfig()')) {
  contactContent = contactContent.replace(/export default async function\s+[a-zA-Z0-9_]+\(\)\s*\{/, match => match + "\n  const siteConfig = await getSiteConfig();\n");
  fs.writeFileSync('app/contact/page.tsx', contactContent);
}
