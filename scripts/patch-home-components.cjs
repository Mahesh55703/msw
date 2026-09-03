const fs = require('fs');

let code = fs.readFileSync('app/page.tsx', 'utf8');

if (code.charCodeAt(0) === 0xFEFF) {
  code = code.slice(1);
}

// Ensure clean slate if ran multiple times
code = code.replace(
  /import \{ getPublicPageByPath \} from "@\/lib\/db\/pages";\nimport \{ HeroSectionInput[\s\S]*?HomeHeroVisual";\n/,
  ''
)
code = code.replace(
  /import \{ HomeWhyUsVisual[\s\S]*?HomeCtaBannerVisual";\n/,
  ''
)

// Add Imports
code = code.replace(
  'import { Testimonials }',
  `import { getPublicPageByPath } from "@/lib/db/pages";\nimport { HeroSectionInput, FeatureListSectionInput, CtaBannerSectionInput } from "@/lib/validations/page";\nimport { HomeHeroVisual } from "@/components/cms/renderers/HomeHeroVisual";\nimport { HomeWhyUsVisual } from "@/components/cms/renderers/HomeWhyUsVisual";\nimport { HomeHowWeWorkVisual } from "@/components/cms/renderers/HomeHowWeWorkVisual";\nimport { HomeCtaBannerVisual } from "@/components/cms/renderers/HomeCtaBannerVisual";\nimport { Testimonials }`
);

// Strip previous injection if exists
code = code.replace(
  /export default async function Home\(\) \{[\s\S]*?const ctaSection = [^\n]*;\n/,
  'export default function Home() {'
)

// Fetch data
code = code.replace(
  'export default function Home() {',
  `export default async function Home() {
  const pageData = await getPublicPageByPath("/");
  const sections = pageData?.revision?.sections || [];
  
  const heroSection = sections.find(s => s.type === "HERO")?.content as HeroSectionInput | undefined;
  const whyUsSection = sections.find(s => s.type === "FEATURE_LIST" && (s.content as FeatureListSectionInput).heading === "Why businesses work with us")?.content as FeatureListSectionInput | undefined;
  const howWeWorkSection = sections.find(s => s.type === "FEATURE_LIST" && (s.content as FeatureListSectionInput).heading === "How We Work")?.content as FeatureListSectionInput | undefined;
  const ctaSection = sections.find(s => s.type === "CTA_BANNER")?.content as CtaBannerSectionInput | undefined;`
);

// Replace Hero Section
const heroRegex = /\{\/\* 01\. Hero Section \*\/\}\s*<div className="relative">[\s\S]*?\{\/\* 02\. Why businesses work with us \(Bento Grid\) \*\/\}/;
code = code.replace(heroRegex, `{/* 01. Hero Section */}\n      {heroSection && <HomeHeroVisual content={heroSection} />}\n\n      {/* 02. Why businesses work with us (Bento Grid) */}`);

// Replace Why Us Section
const whyUsRegex = /\{\/\* 02\. Why businesses work with us \(Bento Grid\) \*\/\}\s*<section className="container mx-auto px-4 md:px-8">[\s\S]*?\{\/\* 03\. Core Services Overview \*\/\}/;
code = code.replace(whyUsRegex, `{/* 02. Why businesses work with us (Bento Grid) */}\n      {whyUsSection && <HomeWhyUsVisual content={whyUsSection} />}\n\n      {/* 03. Core Services Overview */}`);

// Replace How We Work Section
const howWeWorkRegex = /\{\/\* 05\. How We Work \(Process Timeline\) \*\/\}\s*<section className="container mx-auto px-4 md:px-8">[\s\S]*?\{\/\* 06\. Testimonials \*\/\}/;
code = code.replace(howWeWorkRegex, `{/* 05. How We Work (Process Timeline) */}\n      {howWeWorkSection && <HomeHowWeWorkVisual content={howWeWorkSection} />}\n\n      {/* 06. Testimonials */}`);

// Replace CTA Banner Section
const ctaRegex = /\{\/\* 08\. Final CTA Banner \*\/\}\s*<section className="container mx-auto px-4 md:px-8">[\s\S]*?<\/section>/;
code = code.replace(ctaRegex, `{/* 08. Final CTA Banner */}\n      {ctaSection && <HomeCtaBannerVisual content={ctaSection} />}`);

fs.writeFileSync('app/page.tsx', code, 'utf8');
