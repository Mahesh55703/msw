const fs = require('fs');

let content = fs.readFileSync('app/actions/articles.ts', 'utf8');

// 1. Add imports
content = content.replace("import { requirePermission } from '@/lib/rbac'", "import { requirePermission, hasPermission, Role } from '@/lib/rbac'");

// 2. Fix authorId type
content = content.replace("authorId: authorId,", "authorId: authorId as string,");

// 3. Fix deleteArticle permission
content = content.replace(/export async function deleteArticle[\s\S]*?requirePermission\('articles:edit'\)/, match => match.replace("articles:edit", "articles:publish"));

// 4. Fix togglePublishArticle permission
content = content.replace(/export async function togglePublishArticle[\s\S]*?requirePermission\('articles:edit'\)/, match => match.replace("articles:edit", "articles:publish"));

// 5. Add createArticle publish check
content = content.replace(
  "const data = validated.data",
  "const data = validated.data\n\n    if (data.published && !hasPermission(session.role as Role, 'articles:publish')) {\n      return { success: false, error: 'Unauthorized to publish articles.' }\n    }"
);

// 6. Add updateArticle publish check
content = content.replace(
  "const currentArticle = await prisma.article.findUnique({ where: { id } })\n    if (!currentArticle) {\n      return { success: false, error: 'Article not found.' }\n    }",
  "const currentArticle = await prisma.article.findUnique({ where: { id } })\n    if (!currentArticle) {\n      return { success: false, error: 'Article not found.' }\n    }\n\n    if (data.published !== currentArticle.published && !hasPermission(session.role as Role, 'articles:publish')) {\n      return { success: false, error: 'Unauthorized to change publish status.' }\n    }"
);

fs.writeFileSync('app/actions/articles.ts', content);
