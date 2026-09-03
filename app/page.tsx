import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { buttonVariants } from "@/components/ui/button";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import prisma from "@/lib/prisma";
import { buildServiceFromCms } from "@/lib/cms/service-adapter";
import { 
  ArrowRight, 
  Check, 
  ShieldCheck, 
  Building2, 
  Factory, 
  Wrench, 
  Car, 
  HardHat, 
  Truck, 
  UtensilsCrossed, 
  HeartPulse, 
  Users, 
  Scale, 
  ClipboardCheck
} from "lucide-react";
import { getPublicPageByPath } from "@/lib/db/pages";
import { HeroSectionInput, FeatureListSectionInput, CtaBannerSectionInput } from "@/lib/validations/page";
import { HomeHeroVisual } from "@/components/cms/renderers/HomeHeroVisual";
import { HomeWhyUsVisual } from "@/components/cms/renderers/HomeWhyUsVisual";
import { HomeHowWeWorkVisual } from "@/components/cms/renderers/HomeHowWeWorkVisual";
import { HomeCtaBannerVisual } from "@/components/cms/renderers/HomeCtaBannerVisual";
import { Testimonials } from "@/components/home/Testimonials";
import { HomeFaqs } from "@/components/home/HomeFaqs";

export const metadata: Metadata = {
  title: "LabourAxis | Industrial HR & Labour Compliance Consultancy",
  description: "Practical HR, labour compliance, PF, ESIC and workforce support for factories, MSMEs and workforce-intensive businesses across India.",
  alternates: {
    canonical: "/"
  }
};

const INDUSTRY_ICONS: Record<string, any> = {
  "Manufacturing": Factory,
  "Engineering": Wrench,
  "Automotive": Car,
  "Construction": HardHat,
  "Logistics": Truck,
  "Hospitality": UtensilsCrossed,
  "Healthcare": HeartPulse,
  "MSMEs": Building2,
};

const INDUSTRY_SLUGS: Record<string, string> = {
  "Manufacturing": "manufacturing",
  "Engineering": "engineering",
  "Automotive": "automotive",
  "Construction": "construction",
  "Logistics": "logistics-warehousing",
  "Hospitality": "hospitality",
  "Healthcare": "healthcare",
  "MSMEs": "msmes",
};

export default async function Home() {
  const pageData = await getPublicPageByPath("/");
  const sections = pageData?.revision?.sections || [];
  
  const heroSection = sections.find(s => s.type === "HERO")?.content as HeroSectionInput | undefined;
  const whyUsSection = sections.find(s => s.type === "FEATURE_LIST" && (s.content as FeatureListSectionInput).heading === "Why businesses work with us")?.content as FeatureListSectionInput | undefined;
  const howWeWorkSection = sections.find(s => s.type === "FEATURE_LIST" && (s.content as FeatureListSectionInput).heading === "How We Work")?.content as FeatureListSectionInput | undefined;
  const ctaSection = sections.find(s => s.type === "CTA_BANNER")?.content as CtaBannerSectionInput | undefined;

  const servicePages = await prisma.page.findMany({
    where: { path: { startsWith: '/services/' }, status: 'PUBLISHED' },
    include: {
      publishedRevision: {
        include: {
          sections: { orderBy: { sortOrder: 'asc' as const }, include: { media: true } }
        }
      }
    }
  });

  const servicesData = servicePages
    .filter(p => p.publishedRevision)
    .map(p => buildServiceFromCms(p.publishedRevision, p.key, p.path.replace('/services/', '')));
  return (
    <div className="flex flex-col gap-24 md:gap-32 pb-24 overflow-x-hidden bg-[#F7F4EC]">
      
      {/* 01. Hero Section */}
      {heroSection && <HomeHeroVisual content={heroSection} />}

      {/* 02. Why businesses work with us (Bento Grid) */}
      {whyUsSection && <HomeWhyUsVisual content={whyUsSection} />}

      {/* 03. Core Services Overview */}
      <section className="bg-white py-24 border-y border-[#D9E1DC] relative">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1F7A5C] bg-[#1F7A5C]/10 border border-[#1F7A5C]/20 px-3.5 py-1.5 rounded-full inline-block mb-3">
                Expertise & Capabilities
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-[#12372A] mb-4 tracking-tight">Core Services</h2>
              <p className="text-lg text-[#66736D] leading-relaxed">
                Structured solutions designed for businesses dealing with large workforces and strict statutory requirements.
              </p>
            </div>
            <Link 
              href="/services" 
              className={buttonVariants({ 
                variant: "outline", 
                className: "bg-[#F7F4EC] hover:bg-[#12372A] text-[#12372A] hover:text-white font-bold border-[#D9E1DC] shrink-0 flex items-center gap-2 rounded-xl group transition-all" 
              })}
            >
              <span>View all services</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {servicesData.slice(0, 6).map((service) => (
              <div 
                key={service.slug} 
                className="bg-[#F7F4EC]/60 rounded-3xl border border-[#D9E1DC] p-8 shadow-xs hover:shadow-md hover:-translate-y-1 hover:border-[#1F7A5C]/40 hover:bg-white transition-all duration-200 flex flex-col group"
              >
                <div className="inline-block self-start text-[11px] font-bold text-[#1F7A5C] bg-[#1F7A5C]/10 border border-[#1F7A5C]/20 px-3 py-1 rounded-md mb-4 uppercase tracking-wider">
                  {service.category}
                </div>
                <h3 className="text-xl font-bold text-[#12372A] mb-3 group-hover:text-[#1F7A5C] transition-colors">
                  {service.title}
                </h3>
                <p className="text-[#66736D] text-sm leading-relaxed mb-6 flex-1">
                  {service.heroSupportingText}
                </p>
                <Link 
                  href={`/services/${service.slug}`} 
                  className="text-sm font-bold text-[#1F7A5C] flex items-center gap-1.5 group-hover:text-[#165B44] mt-auto pt-4 border-t border-[#D9E1DC]/60"
                >
                  <span>Learn more</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 04. Who We Help (Industries) */}
      <section className="container mx-auto px-4 md:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-[#1F7A5C] bg-[#1F7A5C]/10 border border-[#1F7A5C]/20 px-3.5 py-1.5 rounded-full inline-block mb-3">
            Sector Experience
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#12372A] mb-4 tracking-tight">Who We Help</h2>
          <p className="text-lg text-[#66736D]">Tailored workforce and compliance frameworks built for diverse industry sectors.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto">
          {[
            "Manufacturing",
            "Engineering",
            "Automotive",
            "Construction",
            "Logistics",
            "Hospitality",
            "Healthcare",
            "MSMEs"
          ].map((audience, idx) => {
            const IconComponent = INDUSTRY_ICONS[audience] || Building2;
            const slug = INDUSTRY_SLUGS[audience] || "manufacturing";
            return (
              <Link 
                key={idx} 
                href={`/industries/${slug}`}
                className="bg-white border border-[#D9E1DC] hover:border-[#1F7A5C]/50 hover:shadow-md rounded-3xl p-6 flex flex-col items-center justify-center text-center transition-all duration-200 group shadow-xs"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#F7F4EC] text-[#12372A] flex items-center justify-center mb-3 group-hover:bg-[#1F7A5C] group-hover:text-white transition-colors duration-200">
                  <IconComponent className="w-6 h-6" />
                </div>
                <span className="font-bold text-[#202522] text-sm md:text-base group-hover:text-[#1F7A5C] transition-colors">
                  {audience}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 05. How We Work (Process Timeline) */}
      {howWeWorkSection && <HomeHowWeWorkVisual content={howWeWorkSection} />}

      {/* 06. Testimonials */}
      <Testimonials />

      {/* 07. FAQs */}
      <HomeFaqs />

      {/* 08. Final CTA Banner */}
      {ctaSection && <HomeCtaBannerVisual content={ctaSection} />}

    </div>
  );
}
