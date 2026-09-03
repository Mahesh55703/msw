const fs = require('fs');

['app/careers/page.tsx', 'app/team/page.tsx'].forEach(file => {
  let code = fs.readFileSync(file, 'utf8');
  if (!code.includes('import { getPublicPageByPath }')) {
    code = `import { getPublicPageByPath } from "@/lib/db/pages";\nimport { HeroSectionInput } from "@/lib/validations/page";\n` + code;
  }
  fs.writeFileSync(file, code, 'utf8');
});
