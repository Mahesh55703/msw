import { industriesData } from "@/data/industries";
import { buildServiceFromCms } from "@/lib/cms/service-adapter";
import { notFound } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { 
  ChevronRight, Check, ArrowRight, FileText, AlertTriangle, ShieldCheck, Plus, Clock, Network, HardHat, Truck, ShieldAlert, Scale, HeartHandshake, ClipboardCheck, Calculator, MapPin, TrendingUp, Award, Shield, GraduationCap, Smartphone, Building2
} from "lucide-react";
import type { Metadata, ResolvingMetadata } from "next";
import { getPublicPageByPath, getDraftRevisionForPreview } from "@/lib/db/pages";
import { buildIndustryFromCms } from "@/lib/cms/industry-adapter";
import prisma from "@/lib/prisma";
import { verifySession } from "@/lib/session";

export async function generateStaticParams() {
  const pages = await prisma.page.findMany({
    where: { path: { startsWith: '/industries/' }, status: 'PUBLISHED' }
  });
  return pages.map((p: any) => ({
    slug: p.path.replace('/industries/', ''),
  }));
}

export async function generateMetadata(
  { params, searchParams }: { params: Promise<{ slug: string }>, searchParams: Promise<{ preview?: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedParams = await params;
  const path = `/industries/${resolvedParams.slug}`;
  
  let page = await getPublicPageByPath(path);
  const resolvedSearch = await searchParams;

  if (resolvedSearch.preview) {
    const p = await prisma.page.findUnique({ where: { path } });
    if (p) {
      const draft = await getDraftRevisionForPreview(p.id, resolvedSearch.preview);
      if (draft) {
        page = { id: p.id, key: p.key, path: p.path, revision: draft as any };
      }
    }
  }

  if (!page || !page.revision) return { title: "Industry Not Found" };

  const industry = buildIndustryFromCms(page.revision, page.key, resolvedParams.slug);

  const meta: Metadata = {
    title: page.revision.seoTitle || `${industry.title} HR & Labour Compliance | LabourAxis`,
    description: page.revision.metaDescription || industry.shortDescription,
    alternates: { canonical: page.revision.canonicalUrl || path }
  };
  if (resolvedSearch.preview) meta.robots = { index: false, follow: false };
  return meta;
}

const INDUSTRY_HERO_IMAGES: Record<string, { url: string; badge: string; caption: string }> = {
  "manufacturing": {
    url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1200&auto=format&fit=crop",
    badge: "Factory & Plant Operations",
    caption: "Manufacturing Floor & Industrial Compliance"
  },
  "construction": {
    url: "https://images.unsplash.com/photo-1541888946425-d0fbb18015f6?q=80&w=1200&auto=format&fit=crop",
    badge: "BOCW & Site Safety",
    caption: "Construction Site & Multi-Contractor Operations"
  },
  "logistics-warehousing": {
    url: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1200&auto=format&fit=crop",
    badge: "Supply Chain & Hubs",
    caption: "Warehouse Logistics & Multi-Shift Workforce"
  },
  "auto-engineering": {
    url: "https://images.unsplash.com/photo-1617886903355-9354bb57751f?q=80&w=1200&auto=format&fit=crop",
    badge: "Precision Engineering",
    caption: "Automotive Assembly & Technical Workforce"
  },
  "pharmaceuticals": {
    url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop",
    badge: "GMP & Cleanroom Standards",
    caption: "Pharma & Chemical Statutory Hygiene Compliance"
  },
  "fmcg-food": {
    url: "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?q=80&w=1200&auto=format&fit=crop",
    badge: "Food Safety & Packaging",
    caption: "FMCG Processing & Seasonal Workforce Operations"
  },
  "textiles-garments": {
    url: "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?q=80&w=1200&auto=format&fit=crop",
    badge: "Apparel & Mills",
    caption: "Textile Mill Operations & Contract Worker Audits"
  },
  "msme-industrial": {
    url: "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?q=80&w=1200&auto=format&fit=crop",
    badge: "MSME Scale & Growth",
    caption: "Industrial Unit Compliance & Practical HR Frameworks"
  },
  "contractors-staffing": {
    url: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=1200&auto=format&fit=crop",
    badge: "CLRA & Staffing",
    caption: "Contractor Workforce & Multi-Client Deployments"
  },
  "services-corporate": {
    url: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop",
    badge: "Corporate & White-Collar",
    caption: "Service Sector HR Operations & Statutory Filings"
  },
};

function getChallengeIcon(title: string) {
  const t = title.toLowerCase();
  if (t.includes("shift") || t.includes("hour") || t.includes("overtime") || t.includes("timing") || t.includes("roster")) return Clock;
  if (t.includes("contract") || t.includes("vendor") || t.includes("agency") || t.includes("sub-contractor") || t.includes("staffing")) return Network;
  if (t.includes("bocw") || t.includes("construction") || t.includes("hard hat")) return HardHat;
  if (t.includes("transport") || t.includes("driver") || t.includes("logistics") || t.includes("supply")) return Truck;
  if (t.includes("safety") || t.includes("hazard") || t.includes("accident") || t.includes("hygiene") || t.includes("protection")) return ShieldAlert;
  if (t.includes("statutory") || t.includes("regulation") || t.includes("law") || t.includes("legal") || t.includes("registration")) return Scale;
  if (t.includes("relation") || t.includes("grievance") || t.includes("dispute") || t.includes("union") || t.includes("communication")) return HeartHandshake;
  if (t.includes("inspection") || t.includes("audit") || t.includes("review") || t.includes("readiness") || t.includes("exposure")) return ClipboardCheck;
  if (t.includes("document") || t.includes("record") || t.includes("register") || t.includes("file") || t.includes("kyc")) return FileText;
  if (t.includes("attendance") || t.includes("payroll") || t.includes("wage") || t.includes("salary") || t.includes("remuneration") || t.includes("piece-rate")) return Calculator;
  if (t.includes("geographic") || t.includes("location") || t.includes("multi-site") || t.includes("dispersed")) return MapPin;
  if (t.includes("attrition") || t.includes("turnover") || t.includes("scaling") || t.includes("growth") || t.includes("rapid")) return TrendingUp;
  if (t.includes("cleanroom") || t.includes("quality") || t.includes("standard") || t.includes("gmp") || t.includes("batch")) return Award;
  if (t.includes("posh") || t.includes("women") || t.includes("welfare") || t.includes("equality")) return Shield;
  if (t.includes("apprentice") || t.includes("training") || t.includes("skilling") || t.includes("neet")) return GraduationCap;
  if (t.includes("field") || t.includes("remote") || t.includes("mobile") || t.includes("app")) return Smartphone;
  if (t.includes("msme") || t.includes("unit") || t.includes("establishment")) return Building2;
  return AlertTriangle;
}

export default async function IndustryDetailPage({ params, searchParams }: { params: Promise<{ slug: string }>, searchParams: Promise<{ preview?: string }> }) {
  const resolvedParams = await params;
  const path = `/industries/${resolvedParams.slug}`;
  let page = await getPublicPageByPath(path);

  const resolvedSearch = await searchParams;
  let isPreview = false;
  
  if (resolvedSearch.preview) {
    const session = await verifySession();
    if (session.isAuth && (session.role === 'SUPER_ADMIN' || session.role === 'ADMIN' || session.role === 'EDITOR')) {
      const p = await prisma.page.findUnique({ where: { path } });
      if (p) {
        const draft = await getDraftRevisionForPreview(p.id, resolvedSearch.preview);
        if (draft) {
          page = { id: p.id, key: p.key, path: p.path, revision: draft as any };
          isPreview = true;
        }
      }
    }
  }

  if (!page || !page.revision) {
    notFound();
  }

  const industry = buildIndustryFromCms(page.revision, page.key, resolvedParams.slug);

  const heroImageInfo = {
    url: industry.heroImageUrl || INDUSTRY_HERO_IMAGES[industry.slug]?.url || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1200&auto=format&fit=crop",
    badge: industry.heroImageBadge || INDUSTRY_HERO_IMAGES[industry.slug]?.badge || "Industry Focus",
    caption: INDUSTRY_HERO_IMAGES[industry.slug]?.caption || `${industry.title} Operations`
  };

  const staticIndustry = industriesData.find(i => i.slug === resolvedParams.slug);
  const relevantServices = staticIndustry ? staticIndustry.relevantServices : ["hr-consulting", "labour-compliance", "pf-esic-compliance"];
  
  const relatedServicesPages = await prisma.page.findMany({
    where: { 
      path: { in: relevantServices.map(slug => `/services/${slug}`) }, 
      status: 'PUBLISHED' 
    },
    include: {
      publishedRevision: {
        include: {
          sections: { orderBy: { sortOrder: 'asc' as const }, include: { media: true } }
        }
      }
    }
  });

  const relatedServices = relatedServicesPages
    .filter(p => p.publishedRevision)
    .map(p => buildServiceFromCms(p.publishedRevision, p.key, p.path.replace('/services/', '')));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": (process.env.NEXT_PUBLIC_SITE_URL || "https://www.labouraxis.com") },
      { "@type": "ListItem", "position": 2, "name": "Industries", "item": `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.labouraxis.com"}/industries` },
      { "@type": "ListItem", "position": 3, "name": industry.title, "item": `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.labouraxis.com"}/industries/${industry.slug}` }
    ]
  };

  return (
    <div className="flex flex-col pb-24 overflow-x-hidden bg-[#F7F4EC]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {isPreview && (
        <div className="bg-[#D6A84F] text-[#12372A] px-4 py-2 text-center text-xs font-bold sticky top-0 z-50 shadow-md flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          You are viewing a draft preview. This content is not public.
        </div>
      )}
{/* 01. Breadcrumb */}
      <div className="bg-[#12372A] border-b border-white/10 pt-6 pb-4">
        <div className="container mx-auto px-4 md:px-8">
          <nav className="flex items-center text-xs md:text-sm text-[#A2B3AA] font-medium">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 mx-2 text-[#66736D]" />
            <Link href="/industries" className="hover:text-white transition-colors">Industries</Link>
            <ChevronRight className="w-3.5 h-3.5 mx-2 text-[#66736D]" />
            <span className="text-white truncate max-w-[200px] sm:max-w-none">{industry.title}</span>
          </nav>
        </div>
      </div>

      {/* 02. Hero */}
      <section className="bg-[#12372A] text-white pt-16 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-forest opacity-30 pointer-events-none"></div>
        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-[#D6A84F] uppercase tracking-wider mb-4 bg-[#1B4E3C]/80 border border-[#D6A84F]/30 px-3.5 py-1.5 rounded-full shadow-xs">
                <ShieldCheck className="w-4 h-4 text-[#D6A84F]" />
                <span>Industry Focus</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-balance leading-tight">
                {industry.heroH1}
              </h1>

              <p className="text-lg md:text-xl text-[#A2B3AA] mb-10 text-balance leading-relaxed">
                {industry.heroSupportingText}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <Link 
                  href="/contact" 
                  className={buttonVariants({ 
                    size: "lg", 
                    className: "bg-[#1F7A5C] hover:bg-[#165B44] text-white font-bold text-base px-7 py-3.5 rounded-xl shadow-lg transition-all group" 
                  })}
                >
                  <span>{industry.heroCtaText}</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  href="/services" 
                  className={buttonVariants({ 
                    size: "lg", 
                    variant: "outline", 
                    className: "bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30 text-base px-7 py-3.5 rounded-xl transition-all" 
                  })}
                >
                  Explore Services
                </Link>
              </div>
            </div>

            {/* Right Hero Image Card */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl overflow-hidden border border-white/15 shadow-2xl bg-[#0D281E] group">
                <div className="relative h-72 sm:h-80 md:h-96 w-full">
                  <Image 
                    src={heroImageInfo.url} 
                    alt={industry.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D281E] via-[#0D281E]/30 to-transparent"></div>
                  
                  {/* Floating Top Badge */}
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-center gap-2">
                    <span className="bg-[#12372A]/90 backdrop-blur-md text-[#D6A84F] text-xs font-bold px-3.5 py-1.5 rounded-full border border-[#D6A84F]/30 shadow-md">
                      {heroImageInfo.badge}
                    </span>
                    <span className="bg-[#1F7A5C]/90 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full border border-white/20 shadow-md">
                      Sector Tailored
                    </span>
                  </div>

                  {/* Bottom Caption Overlay */}
                  <div className="absolute bottom-4 left-4 right-4 p-4 bg-[#12372A]/90 backdrop-blur-md rounded-2xl border border-white/10">
                    <p className="text-xs font-bold text-white mb-1 flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#D6A84F]" />
                      <span>{industry.title} Compliance Framework</span>
                    </p>
                    <p className="text-[11px] text-[#A2B3AA] leading-snug">{heroImageInfo.caption}</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 03. Industry Challenges */}
      <section className="py-24 bg-white border-b border-[#D9E1DC]">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-[#D6A84F] bg-[#D6A84F]/10 border border-[#D6A84F]/30 px-3.5 py-1.5 rounded-full inline-block mb-3">
              Sector Complexities
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#12372A] mb-4 tracking-tight">
              Common HR & Compliance Challenges in {industry.title}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {industry.challenges.map((challenge: any, idx: number) => {
              const ChallengeIcon = getChallengeIcon(challenge.title);
              return (
                <div 
                  key={idx} 
                  className="bg-[#F7F4EC]/60 p-8 rounded-3xl border border-[#D9E1DC] shadow-xs hover:shadow-md hover:border-[#1F7A5C]/40 transition-all duration-200 flex flex-col justify-start"
                >
                  <div className="w-11 h-11 rounded-2xl bg-[#1F7A5C]/10 text-[#1F7A5C] flex items-center justify-center mb-5 border border-[#1F7A5C]/20">
                    <ChallengeIcon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-[#12372A] mb-3">{challenge.title}</h3>
                  <p className="text-[#66736D] text-sm leading-relaxed">{challenge.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 04 & 05. HR & Compliance Requirements */}
      <section className="py-24">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl">
          <div className="mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1F7A5C] bg-[#1F7A5C]/10 border border-[#1F7A5C]/20 px-3.5 py-1.5 rounded-full inline-block mb-3">
              Compliance Scope
            </span>
            <h2 className="text-3xl font-bold text-[#12372A] mb-4 tracking-tight">Specific HR & Compliance Requirements</h2>
            <p className="text-base md:text-lg text-[#66736D] italic border-l-4 border-[#1F7A5C] pl-4 py-2 bg-white rounded-r-2xl border border-[#D9E1DC]/50 shadow-2xs">
              Depending on the nature, size, location and applicable legal framework of the establishment, requirements often include:
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {industry.hrAndComplianceRequirements.map((cat: any, idx: number) => (
              <div key={idx} className="bg-white border border-[#D9E1DC] rounded-3xl p-8 shadow-2xs">
                <h3 className="text-xl font-bold text-[#12372A] mb-4 pb-2 border-b border-[#D9E1DC]/60">{cat.title}</h3>
                <ul className="space-y-3">
                  {cat.items.map((item: any, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-[#202522] font-medium">
                      <div className="w-2 h-2 rounded-full bg-[#1F7A5C] mt-2 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 06 & 07. How LabourAxis Helps / Relevant Services */}
      <section className="py-24 bg-[#12372A] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-forest opacity-30 pointer-events-none"></div>
        <div className="container mx-auto px-4 md:px-8 max-w-6xl relative z-10">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-[#D6A84F] bg-[#1B4E3C]/80 border border-[#D6A84F]/30 px-3.5 py-1.5 rounded-full inline-block mb-3">
              Solutions Mapped to Your Sector
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">How LabourAxis Helps</h2>
            <p className="text-lg text-[#A2B3AA]">
              We provide structured solutions that map directly to the operational realities of {industry.title}.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedServices.map((service: any, idx: number) => (
              <Link 
                key={idx} 
                href={`/services/${service.slug}`} 
                className="group flex items-center justify-between bg-[#0D281E] p-6 rounded-3xl border border-white/10 hover:border-[#1F7A5C] hover:bg-[#1B4E3C] transition-all duration-200 shadow-md"
              >
                <span className="font-bold text-base md:text-lg text-white group-hover:text-white transition-colors pr-4">
                  {service.title}
                </span>
                <ArrowRight className="w-5 h-5 text-[#D6A84F] group-hover:text-white group-hover:translate-x-1 transition-all shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 08. Our Approach */}
      <section className="py-24 bg-white border-b border-[#D9E1DC]">
        <div className="container mx-auto px-4 md:px-8 max-w-6xl">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1F7A5C] bg-[#1F7A5C]/10 border border-[#1F7A5C]/20 px-3.5 py-1.5 rounded-full inline-block mb-3">
              Industry Methodology
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#12372A] mb-4 tracking-tight">Our Approach</h2>
            <p className="text-lg text-[#66736D]">Our signature methodology applied to your industry.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {industry.process.map((step: any, idx: number) => (
              <div key={idx} className="bg-[#F7F4EC]/60 p-6 rounded-3xl border border-[#D9E1DC] shadow-2xs flex flex-col justify-start relative">
                <span className="text-4xl font-black text-[#D6A84F] mb-4 block">{step.step}</span>
                <h3 className="text-lg font-bold text-[#12372A] mb-2">{step.title}</h3>
                <p className="text-[#66736D] text-xs sm:text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 09. Who We Support */}
      <section className="py-24">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl">
          <div className="bg-white border border-[#D9E1DC] rounded-3xl p-8 md:p-12 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1F7A5C] bg-[#1F7A5C]/10 border border-[#1F7A5C]/20 px-3.5 py-1.5 rounded-full inline-block mb-3">
              Audience Scope
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-[#12372A] mb-8">Who We Support</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {industry.whoWeSupport.map((entity: any, idx: number) => (
                <div key={idx} className="flex items-center gap-3 p-4 bg-[#F7F4EC] rounded-2xl border border-[#D9E1DC]/50">
                  <div className="w-5 h-5 rounded-full bg-[#1F7A5C]/10 text-[#1F7A5C] flex items-center justify-center shrink-0 border border-[#1F7A5C]/20">
                    <Check className="w-3 h-3 stroke-[2.5]" />
                  </div>
                  <span className="text-[#202522] text-sm font-semibold">{entity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 10. FAQs */}
      <section className="py-24 bg-white border-y border-[#D9E1DC]">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1F7A5C] bg-[#1F7A5C]/10 border border-[#1F7A5C]/20 px-3.5 py-1.5 rounded-full inline-block mb-3">
              Sector Q&A
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#12372A] mb-4 tracking-tight">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {industry.faqs.map((faq: any, idx: number) => (
              <details key={idx} className="group bg-[#F7F4EC]/60 border border-[#D9E1DC] rounded-2xl [&_summary::-webkit-details-marker]:hidden shadow-2xs">
                <summary className="flex cursor-pointer items-center justify-between p-6 font-bold text-[#12372A] select-none">
                  <span className="text-base md:text-lg pr-4 font-semibold text-[#12372A] group-open:text-[#1F7A5C] transition-colors">{faq.question}</span>
                  <span className="ml-2 flex-shrink-0 w-8 h-8 rounded-full bg-white border border-[#D9E1DC] flex items-center justify-center text-[#66736D] group-open:bg-[#1F7A5C] group-open:border-[#1F7A5C] group-open:text-white transition-all duration-200">
                    <Plus className="w-4 h-4 transition-transform duration-300 group-open:rotate-45" />
                  </span>
                </summary>
                <div className="px-6 pb-6 text-[#202522] text-sm md:text-base leading-relaxed border-t border-[#D9E1DC]/60 pt-4 mt-1">
                  <p>{faq.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 11. Related Resources */}
      <section className="py-24">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1F7A5C] bg-[#1F7A5C]/10 border border-[#1F7A5C]/20 px-3.5 py-1.5 rounded-full inline-block mb-3">
              Knowledge Hub
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-[#12372A]">Recommended Resources</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {industry.relatedResources.map((resource: any, idx: number) => (
              <Link 
                key={idx} 
                href="/resources" 
                className="group flex items-start gap-4 p-6 bg-white border border-[#D9E1DC] rounded-3xl hover:border-[#1F7A5C]/50 hover:shadow-md transition-all duration-200 shadow-2xs"
              >
                <div className="p-3 rounded-2xl bg-[#1F7A5C]/10 text-[#1F7A5C] group-hover:bg-[#1F7A5C] group-hover:text-white transition-colors">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-[#12372A] mb-1 leading-snug text-sm md:text-base group-hover:text-[#1F7A5C] transition-colors">
                    {resource}
                  </h4>
                  <span className="text-xs font-bold text-[#1F7A5C] inline-flex items-center gap-1 mt-2">
                    <span>View Resource</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 12. Final CTA Banner */}
      <section className="container mx-auto px-4 md:px-8">
        <div className="bg-[#12372A] text-white rounded-3xl p-10 md:p-16 text-center max-w-4xl mx-auto relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-grid-forest opacity-30 pointer-events-none"></div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 tracking-tight text-balance">
              {industry.finalCtaTitle}
            </h2>
            <Link 
              href="/contact" 
              className={buttonVariants({ 
                size: "lg", 
                className: "bg-[#1F7A5C] hover:bg-[#165B44] text-white font-bold text-base px-8 py-4 rounded-xl shadow-lg transition-all group" 
              })}
            >
              <span>{industry.finalCtaButtonText}</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
