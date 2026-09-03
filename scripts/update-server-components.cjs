const fs = require('fs');

const files = [
  'app/actions/contact.ts',
  'app/contact/page.tsx',
  'app/privacy-policy/page.tsx',
  'app/terms/page.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/import \{ siteConfig \} from ['"]@\/lib\/site-config['"]/g, "import { getSiteConfig } from '@/lib/site-config-accessor'");
  
  if (file.includes('contact.ts')) {
    content = content.replace(/siteConfig\.contact/g, "(await getSiteConfig()).contact");
    content = content.replace(/siteConfig\.name/g, "(await getSiteConfig()).name");
  } else if (file.includes('page.tsx')) {
    content = content.replace(/export default function/g, "export default async function");
    // insert const siteConfig = await getSiteConfig(); at top of component body
    content = content.replace(/(export default async function[^{]+\{\n)/, "$1  const siteConfig = await getSiteConfig();\n");
  }
  
  fs.writeFileSync(file, content);
}
