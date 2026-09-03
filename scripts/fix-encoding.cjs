const fs = require('fs');
const content = fs.readFileSync('prisma/migrations/20260902_add_site_configuration/migration.sql', 'utf16le');
fs.writeFileSync('prisma/migrations/20260902_add_site_configuration/migration.sql', content, 'utf8');
