import prisma from "@/lib/prisma";
import { buildIndustryFromCms } from "@/lib/cms/industry-adapter";
import Link from "next/link";
import Image from "next/image";
import { 
  ChevronRight, 
  ArrowRight, 
  ShieldCheck, 
  Factory, 
  Wrench, 
  Car, 
  HardHat, 
  Truck, 
  UtensilsCrossed, 
  HeartPulse, 
  GraduationCap, 
  ShoppingBag, 
  Building2,
  CheckCircle2
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import type { Metadata } from "next";
import { resolveCmsText } from "@/lib/cms/utils";
import { getPublicPageByPath } from "@/lib/db/pages";
import { HeroSectionInput } from "@/lib/validations/page";

export const metadata: Metadata = {
  title: "Industries We Serve | LabourAxis",
  description: "LabourAxis provides tailored HR and compliance solutions across manufacturing, construction, logistics, and other workforce-intensive industries.",
  alternates: {
    canonical: "/industries"
  }
};

const INDUSTRY_ICONS: Record<string, any> = {
  "manufacturing": Factory,
  "engineering": Wrench,
  "automotive": Car,
  "construction": HardHat,
  "logistics-warehousing": Truck,
  "hospitality": UtensilsCrossed,
  "healthcare": HeartPulse,
  "education": GraduationCap,
  "retail": ShoppingBag,
  "msmes": Building2,
};

export default async function IndustriesHubPage() {
  const pageData = await getPublicPageByPath("/industries");
  const heroSection = pageData?.revision?.sections.find(s => s.type === "HERO")?.content as HeroSectionInput | undefined;

  const industryPages = await prisma.page.findMany({
    where: { path: { startsWith: '/industries/' }, status: 'PUBLISHED' },
    include: {
      publishedRevision: {
        include: {
          sections: { orderBy: { sortOrder: 'asc' as const }, include: { media: true } }
        }
      }
    }
  });

  const industriesData = industryPages
    .filter(p => p.publishedRevision)
    .map(p => {
      const built = buildIndustryFromCms(p.publishedRevision, p.key, p.path.replace('/industries/', ''));
      return {
        ...built,
        hubRelevantServices: built.process.slice(0, 3).map((proc: any) => proc.title) || ["Compliance Review", "HR Audits"]
      };
    });
  return (
    <div className="flex flex-col pb-24 overflow-x-hidden bg-[#F7F4EC]">
      {/* Breadcrumbs */}
      <div className="bg-[#12372A] border-b border-white/10 pt-6 pb-4">
        <div className="container mx-auto px-4 md:px-8">
          <nav className="flex items-center text-xs md:text-sm text-[#A2B3AA] font-medium">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 mx-2 text-[#66736D]" />
            <span className="text-white">Industries</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-[#12372A] text-white pt-12 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-forest opacity-30 pointer-events-none"></div>
        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-[#D6A84F] uppercase tracking-wider mb-4 bg-[#1B4E3C]/80 border border-[#D6A84F]/30 px-3.5 py-1.5 rounded-full shadow-xs">
                <ShieldCheck className="w-4 h-4 text-[#D6A84F]" />
                <span>{resolveCmsText(heroSection?.eyebrow, "Industry-Focused HR & Compliance")}</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight text-balance leading-tight">
                {resolveCmsText(heroSection?.heading, "HR & Labour Compliance Solutions by Industry")}
              </h1>
              <p className="text-lg md:text-xl text-[#A2B3AA] leading-relaxed text-balance mb-8">
                {resolveCmsText(heroSection?.description, "Workforce requirements, labour compliance and HR challenges vary by industry. LabourAxis provides practical HR and compliance support tailored to the operational realities of different businesses.")}
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#A2B3AA] bg-[#0D281E]/60 px-3.5 py-1.5 rounded-lg border border-white/10">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#D6A84F]" />
                  <span>10+ Core Sectors</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#A2B3AA] bg-[#0D281E]/60 px-3.5 py-1.5 rounded-lg border border-white/10">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#1F7A5C]" />
                  <span>Tailored Risk Roadmaps</span>
                </div>
              </div>
            </div>

            {/* Right Hero Image Card */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl overflow-hidden border border-white/15 shadow-2xl bg-[#0D281E] group">
                <div className="relative h-72 sm:h-80 md:h-96 w-full">
                  <Image 
                    src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1200&auto=format&fit=crop" 
                    alt="Industries We Serve"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D281E] via-[#0D281E]/30 to-transparent"></div>
                  
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-center gap-2">
                    <span className="bg-[#12372A]/90 backdrop-blur-md text-[#D6A84F] text-xs font-bold px-3.5 py-1.5 rounded-full border border-[#D6A84F]/30 shadow-md">
                      Industry Expertise
                    </span>
                    <span className="bg-[#1F7A5C]/90 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full border border-white/20 shadow-md">
                      Sector Focus
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 p-4 bg-[#12372A]/90 backdrop-blur-md rounded-2xl border border-white/10">
                    <p className="text-xs font-bold text-white mb-1 flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#D6A84F]" />
                      <span>Specialized Industrial Frameworks</span>
                    </p>
                    <p className="text-[11px] text-[#A2B3AA] leading-snug">Manufacturing, Construction, Logistics, Pharma, FMCG & More</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Industries Grid */}
      <section className="py-24 bg-[#F7F4EC]">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {industriesData.map((industry) => {
              const IconComponent = INDUSTRY_ICONS[industry.slug] || Building2;
              return (
                <div 
                  key={industry.slug} 
                  className="bg-white rounded-3xl border border-[#D9E1DC] p-8 shadow-xs flex flex-col h-full hover:shadow-lg hover:-translate-y-1 hover:border-[#1F7A5C]/40 transition-all duration-200 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#1F7A5C]/10 text-[#1F7A5C] flex items-center justify-center mb-6 group-hover:bg-[#1F7A5C] group-hover:text-white transition-colors duration-200 shadow-2xs">
                    <IconComponent className="w-6 h-6" />
                  </div>

                  <h3 className="text-xl font-bold text-[#12372A] mb-3 group-hover:text-[#1F7A5C] transition-colors">
                    {industry.title}
                  </h3>
                  
                  <p className="text-[#66736D] text-sm leading-relaxed mb-6 flex-1">
                    {industry.shortDescription}
                  </p>
                  
                  <div className="mb-8 pt-4 border-t border-[#D9E1DC]/60">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#66736D] mb-3">Relevant Services:</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {industry.hubRelevantServices.map((service: string, idx: number) => (
                        <span key={idx} className="bg-[#F7F4EC] text-[#202522] text-xs px-2.5 py-1 rounded-lg font-medium border border-[#D9E1DC]/50">
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Link 
                    href={`/industries/${industry.slug}`} 
                    className="text-sm font-bold text-[#1F7A5C] group-hover:text-[#165B44] flex items-center gap-1.5 mt-auto pt-4 border-t border-[#D9E1DC]/60"
                  >
                    <span>Explore {industry.title}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final Consultation CTA */}
      <section className="container mx-auto px-4 md:px-8">
        <div className="bg-[#12372A] text-white rounded-3xl p-10 md:p-16 text-center max-w-4xl mx-auto relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-grid-forest opacity-30 pointer-events-none"></div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-balance">
              Need Industry-Specific Compliance Guidance?
            </h2>
            <p className="text-[#A2B3AA] text-base md:text-lg mb-8 max-w-2xl mx-auto leading-relaxed text-balance">
              Let our team review your workforce setup and deliver a tailored compliance roadmap for your sector.
            </p>
            <Link 
              href="/contact" 
              className={buttonVariants({ 
                size: "lg", 
                className: "bg-[#1F7A5C] hover:bg-[#165B44] text-white font-bold text-base px-8 py-4 rounded-xl shadow-lg transition-all group" 
              })}
            >
              <span>Request an Industry Consultation</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
