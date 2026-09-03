const fs = require('fs');
let content = fs.readFileSync('components/admin/AdminSidebar.tsx', 'utf8');

content = content.replace(
  /<Link href="\/admin\/configuration" className=\{navLinkClass\('\/admin\/configuration'\)\}>\s*<Settings className=\{iconClass\('\/admin\/configuration'\)\} \/>\s*Configuration\s*<\/Link>/g,
  "{userRole === 'SUPER_ADMIN' && (\n            <Link href=\"/admin/configuration\" className={navLinkClass('/admin/configuration')}>\n              <Settings className={iconClass('/admin/configuration')} />\n              Configuration\n            </Link>\n          )}"
);

fs.writeFileSync('components/admin/AdminSidebar.tsx', content);
