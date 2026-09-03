const fs = require('fs');
const path = require('path');

const ACTIONS_DIR = path.join(__dirname, '../app/actions');

const mapping = {
  'articles.ts': { edit: 'articles:edit', publish: 'articles:publish' },
  'careers.ts': { edit: 'careers:manage', publish: 'careers:manage' },
  'checklists.ts': { edit: 'checklists:manage', publish: 'checklists:manage' },
  'cms.ts': { edit: 'articles:edit', publish: 'articles:publish' },
  'contact.ts': { edit: 'enquiries:manage', publish: 'enquiries:manage' },
  'enquiries.ts': { edit: 'enquiries:manage', publish: 'enquiries:manage' },
  'faq.ts': { edit: 'faqs:manage', publish: 'faqs:manage' },
  'guides.ts': { edit: 'guides:manage', publish: 'guides:manage' },
  'media.ts': { edit: 'media:manage', publish: 'media:manage' },
  'team.ts': { edit: 'team:manage', publish: 'team:manage' }
};

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const filename = path.basename(filePath);
  if (!mapping[filename]) return;

  const perms = mapping[filename];

  // Make sure we have the import
  if (!content.includes('requirePermission')) {
    content = content.replace("import { verifySession } from '@/lib/session'", "import { verifySession } from '@/lib/session'\nimport { requirePermission } from '@/lib/rbac'");
  }

  let newContent = content;
  
  if (filename === 'cms.ts') {
    newContent = newContent.replace(/const session = await verifySession\(\)/g, "const session = await requirePermission('articles:edit').catch(()=>null)");
    newContent = newContent.replace(/togglePublishContent[\s\S]*?requirePermission\('.*?'\)/g, match => match.replace("articles:edit", "articles:publish"));
    newContent = newContent.replace(/deleteContent[\s\S]*?requirePermission\('.*?'\)/g, match => match.replace("articles:edit", "articles:publish"));
  } else {
    newContent = newContent.replace(/const session = await verifySession\(\)/g, `const session = await requirePermission('${perms.edit}').catch(()=>null)`);
  }

  // Handle common authorization checks
  newContent = newContent.replace(/if \(!session\.isAuth\)/g, 'if (!session)');
  newContent = newContent.replace(/if \(!session\?.userId\)/g, 'if (!session)');
  newContent = newContent.replace(/if \(!session\.isAuth \|\| !session\.userId\)/g, 'if (!session)');

  fs.writeFileSync(filePath, newContent);
  console.log(`Updated ${filename}`);
}

fs.readdirSync(ACTIONS_DIR).forEach(file => {
  if (file.endsWith('.ts')) {
    processFile(path.join(ACTIONS_DIR, file));
  }
});
