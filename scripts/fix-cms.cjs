const fs = require('fs');

let content = fs.readFileSync('app/actions/cms.ts', 'utf8');

// 1. Add imports
content = content.replace("import { requirePermission } from '@/lib/rbac'", "import { requirePermission, hasPermission, Role } from '@/lib/rbac'");

// 2. Fix createContent
content = content.replace(
  "  if (!data.title || !data.slug || !data.content) {\n    throw new Error('Missing required fields')\n  }",
  "  if (!data.title || !data.slug || !data.content) {\n    throw new Error('Missing required fields')\n  }\n\n  if (data.published && !hasPermission(session.role as Role, 'articles:publish')) {\n    throw new Error('Unauthorized to publish content.')\n  }"
);

// 3. Fix updateContent
content = content.replace(
  "  const existing = await prisma.article.findUnique({ where: { slug: data.slug } })\n  if (existing && existing.id !== id) throw new Error('An item with this slug already exists')",
  "  const existing = await prisma.article.findUnique({ where: { slug: data.slug } })\n  if (existing && existing.id !== id) throw new Error('An item with this slug already exists')\n\n  const currentRecord = await prisma.article.findUnique({ where: { id } })\n  if (currentRecord && data.published !== currentRecord.published && !hasPermission(session.role as Role, 'articles:publish')) {\n    throw new Error('Unauthorized to change publish status.')\n  }"
);

// 4. Fix delete and togglePublish
content = content.replace(/deleteContent[\s\S]*?requirePermission\('articles:edit'\)/, match => match.replace("articles:edit", "articles:publish"));
content = content.replace(/togglePublishContent[\s\S]*?requirePermission\('articles:edit'\)/, match => match.replace("articles:edit", "articles:publish"));

fs.writeFileSync('app/actions/cms.ts', content);
