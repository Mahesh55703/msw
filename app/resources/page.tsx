import { resourcesData } from "@/data/resources";
import Link from "next/link";
import { BookOpen, CheckSquare, HelpCircle, Bell, FileText, ArrowRight, ChevronRight, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import { resolveCmsText } from "@/lib/cms/utils";
import { getPublicPageByPath } from "@/lib/db/pages";
import { HeroSectionInput } from "@/lib/validations/page";

export const metadata: Metadata = {
  title: "HR & Labour Compliance Resources | LabourAxis",
  description: "Access LabourAxis resources including guides, articles, checklists, and updates to stay compliant with Indian labour laws and statutory regulations.",
  alternates: {
    canonical: "/resources"
  }
};

const CATEGORIES = [
  {
    id: "guides",
    title: "Guides",
    description: "Detailed explanations of HR and compliance topics.",
    icon: BookOpen,
    href: "/resources/guides",
    linkText: "Explore Guides"
  },
  {
    id: "checklists",
    title: "Checklists",
    description: "Practical checklists businesses can use to review their processes.",
    icon: CheckSquare,
    href: "/resources/checklists",
    linkText: "Explore Checklists"
  },
  {
    id: "faqs",
    title: "FAQs",
    description: "Straightforward answers to common HR and compliance questions.",
    icon: HelpCircle,
    href: "/resources/faqs",
    linkText: "Browse FAQs"
  },
  {
    id: "updates",
    title: "Updates",
    description: "Important labour and compliance developments.",
    icon: Bell,
    href: "/resources/updates",
    linkText: "View Updates"
  },
  {
    id: "articles",
    title: "Articles",
    description: "Practical insights for HR teams and business owners.",
    icon: FileText,
    href: "/resources/articles",
    linkText: "Read Articles"
  }
];

export default async function ResourcesHubPage() {
  const pageData = await getPublicPageByPath("/resources");
  const heroSection = pageData?.revision?.sections.find(s => s.type === "HERO")?.content as HeroSectionInput | undefined;
  const featuredResources = resourcesData.filter(r => r.featured).slice(0, 3);

  return (
    <div className="flex flex-col pb-24 overflow-x-hidden bg-[#F7F4EC]">
      {/* Breadcrumbs */}
      <div className="bg-[#12372A] border-b border-white/10 pt-6 pb-4">
        <div className="container mx-auto px-4 md:px-8">
          <nav className="flex items-center text-xs md:text-sm text-[#A2B3AA] font-medium">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 mx-2 text-[#66736D]" />
            <span className="text-white">Resources</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-[#12372A] text-white pt-12 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-forest opacity-30 pointer-events-none"></div>
        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#D6A84F] uppercase tracking-wider mb-4 bg-[#1B4E3C]/80 border border-[#D6A84F]/30 px-3.5 py-1.5 rounded-full shadow-xs">
              <ShieldCheck className="w-4 h-4 text-[#D6A84F]" />
              <span>{resolveCmsText(heroSection?.eyebrow, "Knowledge & Insights Center")}</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight text-balance leading-tight">
              {resolveCmsText(heroSection?.heading, "HR, Labour & Compliance Resources")}
            </h1>
            <p className="text-lg md:text-xl text-[#A2B3AA] leading-relaxed text-balance">
              {resolveCmsText(heroSection?.description, "Practical guides, checklists, FAQs and compliance insights to help businesses understand and manage HR and labour requirements.")}
            </p>
          </div>
        </div>
      </section>

      {/* Featured Resources */}
      {featuredResources.length > 0 && (
        <section className="py-16 bg-white border-b border-[#D9E1DC]">
          <div className="container mx-auto px-4 md:px-8">
            <div className="mb-8">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1F7A5C] bg-[#1F7A5C]/10 border border-[#1F7A5C]/20 px-3.5 py-1.5 rounded-full inline-block mb-2">
                Curated Insights
              </span>
              <h2 className="text-2xl font-bold text-[#12372A]">Featured Resources</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {featuredResources.map(resource => (
                <Link 
                  key={resource.slug} 
                  href={`/resources/${resource.type}s/${resource.slug}`} 
                  className="bg-[#F7F4EC]/60 p-6 md:p-8 rounded-3xl border border-[#D9E1DC] shadow-2xs hover:shadow-md hover:border-[#1F7A5C]/40 hover:bg-white transition-all duration-200 flex flex-col group"
                >
                  <span className="text-[11px] font-bold text-[#1F7A5C] bg-[#1F7A5C]/10 border border-[#1F7A5C]/20 px-3 py-1 rounded-md uppercase tracking-wider self-start mb-4">
                    {resource.type}
                  </span>
                  <h3 className="font-bold text-[#12372A] text-lg mb-2 group-hover:text-[#1F7A5C] transition-colors leading-snug">
                    {resource.title}
                  </h3>
                  <p className="text-[#66736D] text-sm leading-relaxed line-clamp-2 mb-6 flex-1">
                    {resource.excerpt}
                  </p>
                  <span className="text-xs font-bold text-[#1F7A5C] group-hover:text-[#165B44] inline-flex items-center gap-1 mt-auto pt-4 border-t border-[#D9E1DC]/60">
                    <span>Read resource</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories Grid */}
      <section className="py-24 bg-[#F7F4EC]">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1F7A5C] bg-[#1F7A5C]/10 border border-[#1F7A5C]/20 px-3.5 py-1.5 rounded-full inline-block mb-3">
              Explore by Format
            </span>
            <h2 className="text-3xl font-bold text-[#12372A] tracking-tight">Resource Categories</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {CATEGORIES.map((cat) => (
              <div 
                key={cat.id} 
                className="bg-white border border-[#D9E1DC] p-8 md:p-10 rounded-3xl shadow-xs hover:border-[#1F7A5C]/40 hover:shadow-md transition-all duration-200 flex flex-col group"
              >
                <div className="w-12 h-12 bg-[#1F7A5C]/10 text-[#1F7A5C] rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#1F7A5C] group-hover:text-white transition-colors duration-200 shadow-2xs">
                  <cat.icon className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-[#12372A] mb-3 group-hover:text-[#1F7A5C] transition-colors">{cat.title}</h3>
                <p className="text-[#66736D] mb-8 flex-1 text-base leading-relaxed">{cat.description}</p>
                <Link 
                  href={cat.href} 
                  className="inline-flex items-center font-bold text-sm text-[#1F7A5C] group-hover:text-[#165B44] pt-4 border-t border-[#D9E1DC]/60"
                >
                  <span>{cat.linkText}</span>
                  <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
