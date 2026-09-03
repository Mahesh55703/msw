const fs = require('fs');

let content = fs.readFileSync('app/actions/articles.ts', 'utf8');

// Fix updateArticle publish check
content = content.replace(
  /const currentArticle = await prisma\.article\.findUnique\(\{ where: \{ id \} \}\)\r?\n\s*if \(!currentArticle\) \{\r?\n\s*return \{ success: false, error: 'Article not found\.' \}\r?\n\s*\}/,
  `const currentArticle = await prisma.article.findUnique({ where: { id } })
    if (!currentArticle) {
      return { success: false, error: 'Article not found.' }
    }

    if (data.published !== currentArticle.published && !hasPermission(session.role as Role, 'articles:publish')) {
      return { success: false, error: 'Unauthorized to change publish status.' }
    }`
);

fs.writeFileSync('app/actions/articles.ts', content);
