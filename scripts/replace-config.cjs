const fs = require('fs');

function replaceInFile(filepath, isServer) {
  let content = fs.readFileSync(filepath, 'utf8');
  
  if (isServer) {
    content = content.replace(/import \{ siteConfig \} from ['"]@\/lib\/site-config['"]/g, "import { getSiteConfig } from '@/lib/site-config-accessor'");
    // Find where siteConfig is used and we need to await it. Wait, it's easier to just await getSiteConfig() where we need siteConfig.
    // Actually, for Server Components, let's just do it manually if there are few.
  } else {
    content = content.replace(/import \{ siteConfig \} from ['"]@\/lib\/site-config['"]/g, "import { useSiteConfig } from '@/components/layout/SiteConfigProvider'");
    // insert `const siteConfig = useSiteConfig()` at top of component
    // We'll do this manually for Client Components.
  }
}
