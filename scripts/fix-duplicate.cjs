const fs = require('fs');
let content = fs.readFileSync('app/actions/articles.ts', 'utf8');

const regex = /if \(data\.published && !hasPermission\(session\.role as Role, 'articles:publish'\)\) \{\r?\n\s*return \{ success: false, error: 'Unauthorized to publish articles\.' \}\r?\n\s*\}/g;

let matches = 0;
content = content.replace(regex, (match) => {
  matches++;
  if (matches === 1) return match; // Keep the first one
  return ""; // Remove subsequent ones
});

fs.writeFileSync('app/actions/articles.ts', content);
