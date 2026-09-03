const fs = require('fs');

const files = [
  'components/layout/Footer.tsx',
  'components/layout/Header.tsx',
  'components/layout/MobileNav.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/import \{ siteConfig \} from ['"]@\/lib\/site-config['"]/g, "import { useSiteConfig } from '@/components/layout/SiteConfigProvider'");
  
  if (file.includes('Footer.tsx')) {
    content = content.replace(/export default function Footer\(\) \{/g, "export default function Footer() {\n  const siteConfig = useSiteConfig();");
  } else if (file.includes('Header.tsx')) {
    content = content.replace(/export default function Header\(\) \{/g, "export default function Header() {\n  const siteConfig = useSiteConfig();");
  } else if (file.includes('MobileNav.tsx')) {
    content = content.replace(/export default function MobileNav\(\) \{/g, "export default function MobileNav() {\n  const siteConfig = useSiteConfig();");
  }
  
  fs.writeFileSync(file, content);
}
