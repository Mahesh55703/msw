const fs = require('fs');

function patchContact() {
  let code = fs.readFileSync('app/contact/page.tsx', 'utf8');
  if (code.charCodeAt(0) === 0xFEFF) code = code.slice(1);
  code = code.replace(/import \{ getPublicPageByPath \}[\s\S]*?CtaBannerSectionInput \} from "@\/lib\/validations\/page";\n/, '');
  code = code.replace('import type { Metadata } from "next";', `import type { Metadata } from "next";\nimport { getPublicPageByPath } from "@/lib/db/pages";\nimport { HeroSectionInput } from "@/lib/validations/page";`);
  
  code = code.replace(
    /export default function ContactPage\(\) \{[\s\S]*?const heroSection = [^\n]*;\n/g,
    'export default function ContactPage() {'
  );

  code = code.replace(
    'export default function ContactPage() {',
    `export default async function ContactPage() {\n  const pageData = await getPublicPageByPath("/contact");\n  const heroSection = pageData?.revision?.sections.find(s => s.type === "HERO")?.content as HeroSectionInput | undefined;`
  );

  code = code.replace('<span>Consultation & Enquiries</span>', '<span>{heroSection?.eyebrow || "Consultation & Enquiries"}</span>');
  code = code.replace(
    /<h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-balance leading-tight">\s*Discuss Your HR & Compliance Requirements\s*<\/h1>/,
    '<h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-balance leading-tight">\n            {heroSection?.heading || "Discuss Your HR & Compliance Requirements"}\n          </h1>'
  );
  code = code.replace(
    /<p className="text-lg md:text-xl text-\[\#A2B3AA\] max-w-2xl mx-auto text-balance leading-relaxed">\s*Whether you need a full compliance audit, routine HR support, or contractor compliance tracking, our team is ready to assist\.\s*<\/p>/,
    '<p className="text-lg md:text-xl text-[#A2B3AA] max-w-2xl mx-auto text-balance leading-relaxed">\n            {heroSection?.description || "Whether you need a full compliance audit, routine HR support, or contractor compliance tracking, our team is ready to assist."}\n          </p>'
  );
  fs.writeFileSync('app/contact/page.tsx', code, 'utf8');
}

function patchServices() {
  let code = fs.readFileSync('app/services/page.tsx', 'utf8');
  if (code.charCodeAt(0) === 0xFEFF) code = code.slice(1);
  code = code.replace(/import \{ getPublicPageByPath \}[\s\S]*?CtaBannerSectionInput \} from "@\/lib\/validations\/page";\n/, '');
  code = code.replace('import type { Metadata } from "next";', `import type { Metadata } from "next";\nimport { getPublicPageByPath } from "@/lib/db/pages";\nimport { HeroSectionInput } from "@/lib/validations/page";`);
  
  code = code.replace(
    /export default function ServicesPage\(\) \{[\s\S]*?const heroSection = [^\n]*;\n/g,
    'export default function ServicesPage() {'
  );

  code = code.replace(
    'export default function ServicesPage() {',
    `export default async function ServicesPage() {\n  const pageData = await getPublicPageByPath("/services");\n  const heroSection = pageData?.revision?.sections.find(s => s.type === "HERO")?.content as HeroSectionInput | undefined;`
  );

  code = code.replace('<span>Comprehensive Consultancy Suite</span>', '<span>{heroSection?.eyebrow || "Comprehensive Consultancy Suite"}</span>');
  code = code.replace(
    /<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight text-balance">Our Services<\/h1>/,
    '<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight text-balance">{heroSection?.heading || "Our Services"}</h1>'
  );
  code = code.replace(
    /<p className="text-lg md:text-xl text-\[\#A2B3AA\] leading-relaxed text-balance mb-8">\s*Structured HR and compliance solutions designed for businesses dealing with large workforces and strict statutory requirements\.\s*<\/p>/,
    '<p className="text-lg md:text-xl text-[#A2B3AA] leading-relaxed text-balance mb-8">\n                {heroSection?.description || "Structured HR and compliance solutions designed for businesses dealing with large workforces and strict statutory requirements."}\n              </p>'
  );
  fs.writeFileSync('app/services/page.tsx', code, 'utf8');
}

function patchIndustries() {
  let code = fs.readFileSync('app/industries/page.tsx', 'utf8');
  if (code.charCodeAt(0) === 0xFEFF) code = code.slice(1);
  code = code.replace(/import \{ getPublicPageByPath \}[\s\S]*?CtaBannerSectionInput \} from "@\/lib\/validations\/page";\n/, '');
  code = code.replace('import type { Metadata } from "next";', `import type { Metadata } from "next";\nimport { getPublicPageByPath } from "@/lib/db/pages";\nimport { HeroSectionInput } from "@/lib/validations/page";`);
  
  code = code.replace(
    /export default function IndustriesHubPage\(\) \{[\s\S]*?const heroSection = [^\n]*;\n/g,
    'export default function IndustriesHubPage() {'
  );

  code = code.replace(
    'export default function IndustriesHubPage() {',
    `export default async function IndustriesHubPage() {\n  const pageData = await getPublicPageByPath("/industries");\n  const heroSection = pageData?.revision?.sections.find(s => s.type === "HERO")?.content as HeroSectionInput | undefined;`
  );

  code = code.replace('<span>Industry-Focused HR & Compliance</span>', '<span>{heroSection?.eyebrow || "Industry-Focused HR & Compliance"}</span>');
  code = code.replace(
    /<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight text-balance leading-tight">\s*HR & Labour Compliance Solutions by Industry\s*<\/h1>/,
    '<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight text-balance leading-tight">\n                {heroSection?.heading || "HR & Labour Compliance Solutions by Industry"}\n              </h1>'
  );
  code = code.replace(
    /<p className="text-lg md:text-xl text-\[\#A2B3AA\] leading-relaxed text-balance mb-8">\s*Workforce requirements, labour compliance and HR challenges vary by industry. LabourAxis provides practical HR and compliance support tailored to the operational realities of different businesses\.\s*<\/p>/,
    '<p className="text-lg md:text-xl text-[#A2B3AA] leading-relaxed text-balance mb-8">\n                {heroSection?.description || "Workforce requirements, labour compliance and HR challenges vary by industry. LabourAxis provides practical HR and compliance support tailored to the operational realities of different businesses."}\n              </p>'
  );
  fs.writeFileSync('app/industries/page.tsx', code, 'utf8');
}

function patchResources() {
  let code = fs.readFileSync('app/resources/page.tsx', 'utf8');
  if (code.charCodeAt(0) === 0xFEFF) code = code.slice(1);
  code = code.replace(/import \{ getPublicPageByPath \}[\s\S]*?CtaBannerSectionInput \} from "@\/lib\/validations\/page";\n/, '');
  code = code.replace('import type { Metadata } from "next";', `import type { Metadata } from "next";\nimport { getPublicPageByPath } from "@/lib/db/pages";\nimport { HeroSectionInput } from "@/lib/validations/page";`);
  
  code = code.replace(
    /export default function ResourcesHubPage\(\) \{[\s\S]*?const heroSection = [^\n]*;\n/g,
    'export default function ResourcesHubPage() {'
  );

  code = code.replace(
    'export default function ResourcesHubPage() {',
    `export default async function ResourcesHubPage() {\n  const pageData = await getPublicPageByPath("/resources");\n  const heroSection = pageData?.revision?.sections.find(s => s.type === "HERO")?.content as HeroSectionInput | undefined;`
  );

  code = code.replace('<span>Knowledge & Insights Center</span>', '<span>{heroSection?.eyebrow || "Knowledge & Insights Center"}</span>');
  code = code.replace(
    /<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight text-balance leading-tight">\s*HR, Labour & Compliance Resources\s*<\/h1>/,
    '<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight text-balance leading-tight">\n              {heroSection?.heading || "HR, Labour & Compliance Resources"}\n            </h1>'
  );
  code = code.replace(
    /<p className="text-lg md:text-xl text-\[\#A2B3AA\] leading-relaxed text-balance">\s*Practical guides, checklists, FAQs and compliance insights to help businesses understand and manage HR and labour requirements\.\s*<\/p>/,
    '<p className="text-lg md:text-xl text-[#A2B3AA] leading-relaxed text-balance">\n              {heroSection?.description || "Practical guides, checklists, FAQs and compliance insights to help businesses understand and manage HR and labour requirements."}\n            </p>'
  );
  fs.writeFileSync('app/resources/page.tsx', code, 'utf8');
}

function patchTeam() {
  let code = fs.readFileSync('app/team/page.tsx', 'utf8');
  if (code.charCodeAt(0) === 0xFEFF) code = code.slice(1);
  code = code.replace(/import \{ getPublicPageByPath \}[\s\S]*?CtaBannerSectionInput \} from "@\/lib\/validations\/page";\n/, '');
  code = code.replace('import type { Metadata } from "next"', `import type { Metadata } from 'next'\nimport { getPublicPageByPath } from "@/lib/db/pages";\nimport { HeroSectionInput } from "@/lib/validations/page";`);
  
  code = code.replace(
    /export default async function TeamPage\(\) \{[\s\S]*?const heroSection = [^\n]*;\n/g,
    'export default async function TeamPage() {'
  );

  code = code.replace(
    'export default async function TeamPage() {',
    `export default async function TeamPage() {\n  const pageData = await getPublicPageByPath("/team");\n  const heroSection = pageData?.revision?.sections.find(s => s.type === "HERO")?.content as HeroSectionInput | undefined;`
  );

  code = code.replace('<span>Leadership & Corporate Advisory</span>', '<span>{heroSection?.eyebrow || "Leadership & Corporate Advisory"}</span>');
  code = code.replace(
    /<h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-balance leading-tight">\s*Meet the People Behind LabourAxis\s*<\/h1>/,
    '<h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-balance leading-tight">\n                {heroSection?.heading || "Meet the People Behind LabourAxis"}\n              </h1>'
  );
  code = code.replace(
    /<p className="text-lg md:text-xl text-\[\#A2B3AA\] mb-8 text-balance leading-relaxed">\s*A multidisciplinary team focused on HR operations, labour compliance, workforce management and industrial relations\.\s*<\/p>/,
    '<p className="text-lg md:text-xl text-[#A2B3AA] mb-8 text-balance leading-relaxed">\n                {heroSection?.description || "A multidisciplinary team focused on HR operations, labour compliance, workforce management and industrial relations."}\n              </p>'
  );
  code = code.replace('<span>Explore Open Positions</span>', '<span>{heroSection?.primaryCta?.label || "Explore Open Positions"}</span>');
  code = code.replace('Connect with Advisory\n                </Link>', '{heroSection?.secondaryCta?.label || "Connect with Advisory"}\n                </Link>');
  fs.writeFileSync('app/team/page.tsx', code, 'utf8');
}

function patchCareers() {
  let code = fs.readFileSync('app/careers/page.tsx', 'utf8');
  if (code.charCodeAt(0) === 0xFEFF) code = code.slice(1);
  code = code.replace(/import \{ getPublicPageByPath \}[\s\S]*?CtaBannerSectionInput \} from "@\/lib\/validations\/page";\n/, '');
  code = code.replace('import type { Metadata } from "next"', `import type { Metadata } from 'next'\nimport { getPublicPageByPath } from "@/lib/db/pages";\nimport { HeroSectionInput } from "@/lib/validations/page";`);
  
  code = code.replace(
    /export default async function CareersPage\(\) \{[\s\S]*?const heroSection = [^\n]*;\n/g,
    'export default async function CareersPage() {'
  );

  code = code.replace(
    'export default async function CareersPage() {',
    `export default async function CareersPage() {\n  const pageData = await getPublicPageByPath("/careers");\n  const heroSection = pageData?.revision?.sections.find(s => s.type === "HERO")?.content as HeroSectionInput | undefined;`
  );

  code = code.replace('<span>Careers at LabourAxis</span>', '<span>{heroSection?.eyebrow || "Careers at LabourAxis"}</span>');
  code = code.replace(
    /<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-balance leading-tight">\s*Build the Future of Industrial HR & Labour Compliance\s*<\/h1>/,
    '<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-balance leading-tight">\n              {heroSection?.heading || "Build the Future of Industrial HR & Labour Compliance"}\n            </h1>'
  );
  code = code.replace(
    /<p className="text-lg md:text-xl text-\[\#A2B3AA\] max-w-2xl mx-auto text-balance leading-relaxed mb-10">\s*Join LabourAxis and advise industrial plants, MSMEs, and enterprise employers on statutory integrity, inspection defense, and workforce operations\.\s*<\/p>/,
    '<p className="text-lg md:text-xl text-[#A2B3AA] max-w-2xl mx-auto text-balance leading-relaxed mb-10">\n              {heroSection?.description || "Join LabourAxis and advise industrial plants, MSMEs, and enterprise employers on statutory integrity, inspection defense, and workforce operations."}\n            </p>'
  );
  
  code = code.replace(
    /<span>\{activeJobs\.length > 0 \? `Explore Open Positions \(\$\{activeJobs\.length\}\)` : 'View Practice Areas'\}<\/span>/,
    '<span>{heroSection?.primaryCta?.label ? `${heroSection.primaryCta.label} (${activeJobs.length})` : activeJobs.length > 0 ? `Explore Open Positions (${activeJobs.length})` : \'View Practice Areas\'}</span>'
  );
  fs.writeFileSync('app/careers/page.tsx', code, 'utf8');
}

function patchHealthCheck() {
  let code = fs.readFileSync('app/compliance-health-check/page.tsx', 'utf8');
  if (code.charCodeAt(0) === 0xFEFF) code = code.slice(1);
  code = code.replace(/import \{ getPublicPageByPath \}[\s\S]*?CtaBannerSectionInput \} from "@\/lib\/validations\/page";\n/, '');
  code = code.replace('import type { Metadata } from "next";', `import type { Metadata } from "next";\nimport { getPublicPageByPath } from "@/lib/db/pages";\nimport { HeroSectionInput } from "@/lib/validations/page";`);
  
  code = code.replace(
    /export default function ComplianceHealthCheckPage\(\) \{[\s\S]*?const heroSection = [^\n]*;\n/g,
    'export default function ComplianceHealthCheckPage() {'
  );

  code = code.replace(
    'export default function ComplianceHealthCheckPage() {',
    `export default async function ComplianceHealthCheckPage() {\n  const pageData = await getPublicPageByPath("/compliance-health-check");\n  const heroSection = pageData?.revision?.sections.find(s => s.type === "HERO")?.content as HeroSectionInput | undefined;`
  );

  code = code.replace('<span>Proactive Diagnostic Assessment</span>', '<span>{heroSection?.eyebrow || "Proactive Diagnostic Assessment"}</span>');
  code = code.replace(
    /<h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-balance leading-tight">\s*Labour & Statutory Compliance Health Check\s*<\/h1>/,
    '<h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-balance leading-tight">\n                {heroSection?.heading || "Labour & Statutory Compliance Health Check"}\n              </h1>'
  );
  code = code.replace(
    /<p className="text-lg md:text-xl text-\[\#A2B3AA\] mb-8 text-balance leading-relaxed">\s*Identify gaps in your HR documentation, workforce processes, and statutory records before they become costly liabilities\.\s*<\/p>/,
    '<p className="text-lg md:text-xl text-[#A2B3AA] mb-8 text-balance leading-relaxed">\n                {heroSection?.description || "Identify gaps in your HR documentation, workforce processes, and statutory records before they become costly liabilities."}\n              </p>'
  );
  
  code = code.replace('<span>Request a Health Check</span>', '<span>{heroSection?.primaryCta?.label || "Request a Health Check"}</span>');
  code = code.replace('Explore Review Scope\n                </Link>', '{heroSection?.secondaryCta?.label || "Explore Review Scope"}\n                </Link>');
  fs.writeFileSync('app/compliance-health-check/page.tsx', code, 'utf8');
}

patchContact();
patchServices();
patchIndustries();
patchResources();
patchTeam();
patchCareers();
patchHealthCheck();
