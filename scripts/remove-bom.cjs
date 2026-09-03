const fs = require('fs');
let content = fs.readFileSync('prisma/migrations/20260902_add_site_configuration/migration.sql', 'utf8');

if (content.charCodeAt(0) === 0xFEFF) {
  content = content.slice(1);
}

fs.writeFileSync('prisma/migrations/20260902_add_site_configuration/migration.sql', content, 'utf8');
