const fs = require('fs');

let code = fs.readFileSync('app/page.tsx', 'utf8');

// Undo BOM if it was added
if (code.charCodeAt(0) === 0xFEFF) {
  code = code.slice(1);
}

// Ensure clean slate
code = code.replace(
  /import \{ getPublicPageByPath \} from "@\/lib\/db\/pages";\nimport \{ HeroSectionInput, FeatureListSectionInput, CtaBannerSectionInput \} from "@\/lib\/validations\/page";\n/,
  ''
)
code = code.replace(
  'import { Testimonials }',
  `import { getPublicPageByPath } from "@/lib/db/pages";\nimport { HeroSectionInput, FeatureListSectionInput, CtaBannerSectionInput } from "@/lib/validations/page";\nimport { Testimonials }`
);

code = code.replace(
  /export default async function Home\(\) \{[\s\S]*?const ctaSection = [^\n]*;\n/,
  'export default function Home() {'
)

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

// Apply Hero replacements
code = code.replace('Simplify HR. <br />', '{heroSection?.heading.split("Strengthen Compliance.")[0] || "Simplify HR. "}<br />');
code = code.replace('<span className="text-[#D6A84F]">', '<span className="text-[#D6A84F]">{heroSection ? "Strengthen Compliance." : "');
code = code.replace('Strengthen Compliance.', 'Strengthen Compliance.'); // unchanged part in middle
code = code.replace('</span> <br />\n                  Reduce Risk.', '</span> <br />\n                  {heroSection?.heading.split("Strengthen Compliance.")[1] || "Reduce Risk."}');

code = code.replace('Industrial HR, Labour & Statutory Compliance solutions for factories, MSMEs and growing businesses.', '{heroSection?.description || "Industrial HR, Labour & Statutory Compliance solutions for factories, MSMEs and growing businesses."}');

code = code.replace('ctaLabel="Request a Consultation"', 'ctaLabel={heroSection?.primaryCta?.label || "Request a Consultation"}');
code = code.replace('<span>Request a Consultation</span>', '<span>{heroSection?.primaryCta?.label || "Request a Consultation"}</span>');

code = code.replace('Explore Services', '{heroSection?.secondaryCta?.label || "Explore Services"}');

// Apply Why Us replacements
code = code.replace('Why businesses work with us', '{whyUsSection?.heading || "Why businesses work with us"}');
code = code.replace('More than routine HR paperwork. We provide structured compliance and HR support.', '{whyUsSection?.description || "More than routine HR paperwork. We provide structured compliance and HR support."}');

// Replace the Why Us array
code = code.replace(/\[\s*\{\s*icon: ClipboardCheck,[\s\S]*?\}\s*\]\.map/m, `(whyUsSection?.features || [
            { 
              icon: ClipboardCheck,
              title: "Practical Compliance Approach", 
              desc: "We focus on actual operational compliance rather than paperwork alone." 
            },
            { 
              icon: Factory,
              title: "Industry-Focused HR", 
              desc: "Solutions designed around the realities of factories and workforce-intensive businesses." 
            },
            { 
              icon: ShieldCheck,
              title: "End-to-End Support", 
              desc: "From registration and documentation to ongoing statutory compliance." 
            },
            { 
              icon: FileSearch,
              title: "Proactive Compliance", 
              desc: "Identify gaps before they become costly problems." 
            }
          ]).map`);

// Apply How We Work replacements
code = code.replace('How We Work', '{howWeWorkSection?.heading || "How We Work"}');
code = code.replace('A structured approach to bringing compliance under control.', '{howWeWorkSection?.description || "A structured approach to bringing compliance under control."}');

code = code.replace(/\[\s*\{\s*step: "01",[\s\S]*?\}\s*\]\.map/m, `(howWeWorkSection?.features?.map((f, i) => ({ step: \`0\${i+1}\`, title: f.title, desc: f.description })) || [
            { step: "01", title: "Understand", desc: "Understand the organization\\'s workforce and compliance requirements." },
            { step: "02", title: "Assess", desc: "Review existing HR and compliance processes to identify gaps." },
            { step: "03", title: "Implement", desc: "Help organize processes, records, and compliance activities." },
            { step: "04", title: "Monitor", desc: "Track recurring compliance requirements and upcoming deadlines." }
          ]).map`);


// Apply CTA Banner replacements
code = code.replace('Not sure where your compliance gaps are?', '{ctaSection?.heading || "Not sure where your compliance gaps are?"}');
code = code.replace('Request a preliminary compliance discussion and understand which areas of your workforce operations may need attention.', '{ctaSection?.description || "Request a preliminary compliance discussion and understand which areas of your workforce operations may need attention."}');
code = code.replace('Discuss Your Compliance Requirements', '{ctaSection?.ctaLabel || "Discuss Your Compliance Requirements"}');

fs.writeFileSync('app/page.tsx', code, 'utf8');
