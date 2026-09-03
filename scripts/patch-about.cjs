const fs = require('fs');

let code = fs.readFileSync('app/about/page.tsx', 'utf8');

if (code.charCodeAt(0) === 0xFEFF) {
  code = code.slice(1);
}

// Ensure clean slate
code = code.replace(/import \{ getPublicPageByPath \}[\s\S]*?CtaBannerSectionInput \} from "@\/lib\/validations\/page";\n/, '');

// Add imports
code = code.replace(
  'import type { Metadata } from "next";',
  `import type { Metadata } from "next";\nimport { getPublicPageByPath } from "@/lib/db/pages";\nimport { HeroSectionInput, TextImageSectionInput, FeatureListSectionInput, CtaBannerSectionInput } from "@/lib/validations/page";`
);

// Inject data fetching
code = code.replace(
  'export default function AboutPage() {',
  `export default async function AboutPage() {
  const pageData = await getPublicPageByPath("/about");
  const sections = pageData?.revision?.sections || [];
  
  const heroSection = sections.find(s => s.type === "HERO")?.content as HeroSectionInput | undefined;
  const whoWeAreSection = sections.find(s => s.type === "TEXT_IMAGE" && (s.content as TextImageSectionInput).heading === "Who We Are")?.content as TextImageSectionInput | undefined;
  const whatWeFocusSection = sections.find(s => s.type === "FEATURE_LIST" && (s.content as FeatureListSectionInput).heading === "What We Focus On")?.content as FeatureListSectionInput | undefined;
  const approachSection = sections.find(s => s.type === "FEATURE_LIST" && (s.content as FeatureListSectionInput).heading === "Our Approach")?.content as FeatureListSectionInput | undefined;
  const whyLabourAxisSection = sections.find(s => s.type === "FEATURE_LIST" && (s.content as FeatureListSectionInput).heading === "Why LabourAxis")?.content as FeatureListSectionInput | undefined;
  const commitmentSection = sections.find(s => s.type === "FEATURE_LIST" && (s.content as FeatureListSectionInput).heading === "Our Commitment")?.content as FeatureListSectionInput | undefined;
  const ctaSection = sections.find(s => s.type === "CTA_BANNER")?.content as CtaBannerSectionInput | undefined;`
);

// 01. Hero
code = code.replace('<span>About LabourAxis</span>', '<span>{heroSection?.eyebrow || "About LabourAxis"}</span>');
code = code.replace(
  /<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-balance leading-tight">\s*About LabourAxis\s*<\/h1>/,
  '<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-balance leading-tight">\n              {heroSection?.heading || "About LabourAxis"}\n            </h1>'
);
code = code.replace(
  /<p className="text-xl md:text-2xl font-semibold text-white mb-6 text-balance">\s*Practical HR and labour compliance for businesses that employ people\.\s*<\/p>/,
  '<p className="text-xl md:text-2xl font-semibold text-white mb-6 text-balance">\n              {heroSection?.description?.split(". ")[0] ? heroSection.description.split(". ")[0] + "." : "Practical HR and labour compliance for businesses that employ people."}\n            </p>'
);
code = code.replace(
  /<p className="text-base md:text-lg text-\[\#A2B3AA\] max-w-2xl mx-auto text-balance leading-relaxed">\s*LabourAxis focuses on the intersection of HR Operations, Labour Compliance, Industrial Relations, and Workforce Management\.\s*<\/p>/,
  '<p className="text-base md:text-lg text-[#A2B3AA] max-w-2xl mx-auto text-balance leading-relaxed">\n              {heroSection?.description?.split(". ").slice(1).join(". ") || "LabourAxis focuses on the intersection of HR Operations, Labour Compliance, Industrial Relations, and Workforce Management."}\n            </p>'
);

// 02. Who We Are
code = code.replace(
  /<h2 className="text-3xl md:text-4xl font-bold text-\[\#12372A\] mb-6 tracking-tight">Who We Are<\/h2>/,
  '<h2 className="text-3xl md:text-4xl font-bold text-[#12372A] mb-6 tracking-tight">{whoWeAreSection?.heading || "Who We Are"}</h2>'
);
code = code.replace(
  /<p className="text-xl text-\[\#202522\] leading-relaxed mb-6 font-medium">\s*LabourAxis is being built around a simple idea: HR and compliance should not operate as disconnected administrative functions\.\s*<\/p>/,
  '<p className="text-xl text-[#202522] leading-relaxed mb-6 font-medium">\n              {whoWeAreSection?.body?.split("\\n\\n")[0] || "LabourAxis is being built around a simple idea: HR and compliance should not operate as disconnected administrative functions."}\n            </p>'
);
code = code.replace(
  /<p className="text-\[\#66736D\] text-base md:text-lg leading-relaxed">\s*Businesses need structured HR processes, organized workforce records, clear compliance tracking and practical support to manage their people effectively\.\s*<\/p>/,
  '<p className="text-[#66736D] text-base md:text-lg leading-relaxed">\n              {whoWeAreSection?.body?.split("\\n\\n")[1] || "Businesses need structured HR processes, organized workforce records, clear compliance tracking and practical support to manage their people effectively."}\n            </p>'
);

// 03. What We Focus On
code = code.replace(
  /<h2 className="text-3xl md:text-4xl font-bold text-\[\#12372A\] mb-4 tracking-tight">What We Focus On<\/h2>/,
  '<h2 className="text-3xl md:text-4xl font-bold text-[#12372A] mb-4 tracking-tight">{whatWeFocusSection?.heading || "What We Focus On"}</h2>'
);
code = code.replace(/\{FOCUS_PILLARS\.map/g, '{whatWeFocusSection?.features?.map((pillar, idx) => {\n              const Icon = FOCUS_PILLARS[idx % FOCUS_PILLARS.length].icon;\n              return {\n                ...pillar,\n                icon: Icon\n              };\n            })?.map' || '{(whatWeFocusSection?.features || FOCUS_PILLARS).map');

// Because of complex mappings, let's just use the arrays defined at the top and replace them if CMS data is present.
code = code.replace(
  'const FOCUS_PILLARS = [',
  `// Replaced by CMS if present, fallback below
const FOCUS_PILLARS = [`
);
code = code.replace(
  /\{FOCUS_PILLARS\.map/g,
  `{(whatWeFocusSection?.features?.map((f, i) => ({ ...f, icon: FOCUS_PILLARS[i % FOCUS_PILLARS.length].icon })) || FOCUS_PILLARS).map`
);
code = code.replace(
  /\{APPROACH_STEPS\.map/g,
  `{(approachSection?.features?.map((f, i) => ({ step: \`0\${i+1}\`, title: f.title, desc: f.description })) || APPROACH_STEPS).map`
);
code = code.replace(
  /\{WHY_LABOURAXIS\.map/g,
  `{(whyLabourAxisSection?.features || WHY_LABOURAXIS).map`
);
code = code.replace(
  /\{COMMITMENTS\.map/g,
  `{(commitmentSection?.features || COMMITMENTS).map`
);

// 04. Our Approach
code = code.replace(
  /<h2 className="text-3xl md:text-4xl font-bold text-\[\#12372A\] mb-4 tracking-tight">Our Approach<\/h2>/,
  '<h2 className="text-3xl md:text-4xl font-bold text-[#12372A] mb-4 tracking-tight">{approachSection?.heading || "Our Approach"}</h2>'
);
code = code.replace(
  /<p className="text-lg text-\[\#66736D\]">Our signature methodology applied to your establishment\.<\/p>/,
  '<p className="text-lg text-[#66736D]">{approachSection?.description || "Our signature methodology applied to your establishment."}</p>'
);

// 05. Why LabourAxis
code = code.replace(
  /<h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Why LabourAxis<\/h2>/,
  '<h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">{whyLabourAxisSection?.heading || "Why LabourAxis"}</h2>'
);

// 08. Our Commitment
code = code.replace(
  /<h2 className="text-3xl font-bold text-\[\#12372A\] mb-4 tracking-tight">Our Commitment<\/h2>/,
  '<h2 className="text-3xl font-bold text-[#12372A] mb-4 tracking-tight">{commitmentSection?.heading || "Our Commitment"}</h2>'
);

// 09. Final CTA
code = code.replace(
  /<h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-balance">\s*Building better HR and compliance processes\?\s*<\/h2>/,
  '<h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-balance">\n              {ctaSection?.heading || "Building better HR and compliance processes?"}\n            </h2>'
);
code = code.replace(
  /<p className="text-\[\#A2B3AA\] text-base md:text-lg mb-8 max-w-2xl mx-auto leading-relaxed text-balance">\s*Connect with LabourAxis to discuss your organization's specific workforce setup and requirements\.\s*<\/p>/,
  '<p className="text-[#A2B3AA] text-base md:text-lg mb-8 max-w-2xl mx-auto leading-relaxed text-balance">\n              {ctaSection?.description || "Connect with LabourAxis to discuss your organization\'s specific workforce setup and requirements."}\n            </p>'
);
code = code.replace(
  /<span>Discuss Your Requirements<\/span>/,
  '<span>{ctaSection?.primaryCta?.label || "Discuss Your Requirements"}</span>'
);

fs.writeFileSync('app/about/page.tsx', code, 'utf8');
