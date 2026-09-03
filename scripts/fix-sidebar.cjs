const fs = require('fs');
let content = fs.readFileSync('components/admin/AdminSidebar.tsx', 'utf8');

// Change /admin/settings to /admin/configuration
content = content.replace(/\/admin\/settings/g, '/admin/configuration');
fs.writeFileSync('components/admin/AdminSidebar.tsx', content);
