const fs = require('fs');

const renderers = [
  'components/cms/renderers/HomeHeroVisual.tsx',
  'components/cms/renderers/HomeWhyUsVisual.tsx',
  'components/cms/renderers/HomeHowWeWorkVisual.tsx',
  'components/cms/renderers/HomeCtaBannerVisual.tsx',
];

const pages = [
  'app/about/page.tsx',
  'app/contact/page.tsx',
  'app/services/page.tsx',
  'app/industries/page.tsx',
  'app/resources/page.tsx',
  'app/team/page.tsx',
  'app/careers/page.tsx',
  'app/compliance-health-check/page.tsx',
];

function processFile(file) {
  let code = fs.readFileSync(file, 'utf8');

  // Skip if already processed
  if (code.includes('resolveCmsText')) return;

  // Add import
  if (file.includes('components/cms/renderers/')) {
    code = `import { resolveCmsText } from "@/lib/cms/utils";\n` + code;
  } else {
    code = code.replace(
      'import { getPublicPageByPath }',
      'import { resolveCmsText } from "@/lib/cms/utils";\nimport { getPublicPageByPath }'
    );
  }

  // Refactor || fallback to resolveCmsText(...)
  // Regex pattern: \{([\w\.\?]+)\s*\|\|\s*("([^"\\]|\\.)*")\}
  // e.g. {heroSection?.eyebrow || "Consultation & Enquiries"}
  
  // Replace `{var || "str"}`
  code = code.replace(/\{([\w\.\?]+)\s*\|\|\s*("([^"\\]|\\.)*")\}/g, '{resolveCmsText($1, $2)}');
  
  // Replace `var || "str"` without braces (e.g. inside `className` or string interpolation)
  // Actually, let's just do it carefully.
  // We have things like: `{whyUsSection?.heading || "Why businesses work with us"}`
  
  // Handled by the first regex perfectly. Let's look for other specific ones:
  // `{heroSection?.heading.split("Strengthen Compliance.")[0] || "Simplify HR. "}`
  // Let's manually fix HomeHeroVisual.
  
  fs.writeFileSync(file, code, 'utf8');
}

[...renderers, ...pages].forEach(processFile);
