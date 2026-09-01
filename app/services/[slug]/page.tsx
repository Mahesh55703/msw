import { servicesData } from "@/data/services";
import { notFound } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import Image from "next/image";
import { 
  ChevronRight, 
  Check, 
  ArrowRight, 
  AlertTriangle, 
  ShieldCheck, 
  Plus
} from "lucide-react";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return servicesData.map((service) => ({
    slug: service.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const service = servicesData.find((s) => s.slug === resolvedParams.slug);
  if (!service) {
    return { title: "Service Not Found" };
  }
  return {
    title: `${service.title} | LabourAxis`,
    description: service.heroSupportingText,
    alternates: {
      canonical: `/services/${service.slug}`
    }
  };
}

const SERVICE_HERO_IMAGES: Record<string, { url: string; badge: string; caption: string }> = {
  "hr-consulting": {
    url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1200&auto=format&fit=crop",
    badge: "Structured HR Systems",
    caption: "Operational HR Process & Policy Implementation"
  },
  "labour-compliance": {
    url: "https://images.unsplash.com/photo-1450133064473-71024230f91b?q=80&w=1200&auto=format&fit=crop",
    badge: "Statutory Law & Acts",
    caption: "Comprehensive Labour & Statutory Compliance Support"
  },
  "pf-esic-compliance": {
    url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=1200&auto=format&fit=crop",
    badge: "EPFO & ESIC Portal",
    caption: "Monthly Filings, Challans & Statutory Returns"
  },
  "factory-compliance": {
    url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=1200&auto=format&fit=crop",
    badge: "Factories Act 1948",
    caption: "Factory Licensing, Safety Registers & Periodic Returns"
  },
  "contract-labour-compliance": {
    url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=1200&auto=format&fit=crop",
    badge: "CLRA Governance",
    caption: "Principal Employer Licensing & Contractor Bill Audits"
  },
  "payroll-hr-operations": {
    url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop",
    badge: "100% Error-Free Payroll",
    caption: "Statutory Deductions, Pay-slips & Salary Processing"
  },
  "industrial-relations": {
    url: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1200&auto=format&fit=crop",
    badge: "IR & Harmony",
    caption: "Grievance Redressal, Standing Orders & Dispute Advisory"
  },
  "compliance-audit": {
    url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1200&auto=format&fit=crop",
    badge: "Risk Diagnostic",
    caption: "360-Degree Statutory Health Check & Gap Scorecard"
  }
};

const APPROACH_STEPS = [
  { step: "01", title: "Understand", desc: "We understand your organization, workforce structure and requirement." },
  { step: "02", title: "Assess", desc: "We review existing processes, records and applicable requirements." },
  { step: "03", title: "Identify", desc: "We identify documentation gaps, process gaps and areas requiring attention." },
  { step: "04", title: "Implement", desc: "We help organize the required process, documentation and recurring activities." },
  { step: "05", title: "Monitor", desc: "We establish a process for ongoing compliance tracking and improvement." }
];

const WHY_LABOURAXIS = [
  { title: "Industrial HR Focus", desc: "Our services are designed around workforce-intensive and industrial environments." },
  { title: "Compliance + HR Perspective", desc: "We look at compliance alongside the underlying HR process." },
  { title: "Structured Approach", desc: "We help turn recurring compliance requirements into organized processes." },
  { title: "Practical Support", desc: "The focus is on usable documentation, processes and operational implementation." },
  { title: "Professional Network", desc: "Where a matter requires specialist legal, accounting, safety or other professional expertise, we can coordinate with appropriately qualified professionals." }
];

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const service = servicesData.find((s) => s.slug === resolvedParams.slug);

  if (!service) {
    notFound();
  }

  const heroImageInfo = SERVICE_HERO_IMAGES[service.slug] || {
    url: "https://images.unsplash.com/photo-1450133064473-71024230f91b?q=80&w=1200&auto=format&fit=crop",
    badge: "Compliance Service",
    caption: `${service.title}`
  };

  const relatedServicesData = servicesData.filter(s => service.relatedServices.includes(s.slug));

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "name": service.title,
        "description": service.heroSupportingText,
        "provider": {
          "@type": "Organization",
          "name": "LabourAxis",
          "url": process.env.NEXT_PUBLIC_SITE_URL || "https://www.labouraxis.com"
        }
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": (process.env.NEXT_PUBLIC_SITE_URL || "https://www.labouraxis.com") },
          { "@type": "ListItem", "position": 2, "name": "Services", "item": `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.labouraxis.com"}/services` },
          { "@type": "ListItem", "position": 3, "name": service.title, "item": `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.labouraxis.com"}/services/${service.slug}` }
        ]
      }
    ]
  };

  return (
    <div className="flex flex-col pb-24 overflow-x-hidden bg-[#F7F4EC]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      
      {/* 01. Breadcrumb */}
      <div className="bg-[#12372A] border-b border-white/10 pt-6 pb-4">
        <div className="container mx-auto px-4 md:px-8">
          <nav className="flex items-center text-xs md:text-sm text-[#A2B3AA] font-medium">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 mx-2 text-[#66736D]" />
            <Link href="/services" className="hover:text-white transition-colors">Services</Link>
            <ChevronRight className="w-3.5 h-3.5 mx-2 text-[#66736D]" />
            <span className="text-white truncate max-w-[200px] sm:max-w-none">{service.category}</span>
          </nav>
        </div>
      </div>

      {/* 02. Hero */}
      <section className="bg-[#12372A] text-white pt-12 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-forest opacity-30 pointer-events-none"></div>
        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-[#D6A84F] uppercase tracking-wider mb-4 bg-[#1B4E3C]/80 border border-[#D6A84F]/30 px-3.5 py-1.5 rounded-full shadow-xs">
                <ShieldCheck className="w-4 h-4 text-[#D6A84F]" />
                <span>{service.category}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-balance leading-tight">
                {service.title}
              </h1>

              <p className="text-lg md:text-xl text-[#A2B3AA] mb-10 text-balance leading-relaxed">
                {service.heroSupportingText}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <TrackedCtaLink 
                  href="/contact" 
                  ctaLocation="service_hero"
                  ctaLabel={service.ctaText}
                  pageType="service"
                  className={buttonVariants({ 
                    size: "lg", 
                    className: "bg-[#1F7A5C] hover:bg-[#165B44] text-white font-bold text-base px-7 py-3.5 rounded-xl shadow-lg transition-all group" 
                  })}
                >
                  <span>{service.ctaText}</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </TrackedCtaLink>
                <Link 
                  href="/compliance-health-check" 
                  className={buttonVariants({ 
                    size: "lg", 
                    variant: "outline", 
                    className: "bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30 text-base px-7 py-3.5 rounded-xl transition-all" 
                  })}
                >
                  Check Your Compliance
                </Link>
              </div>

              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#A2B3AA] uppercase tracking-wider bg-[#0D281E]/60 px-3.5 py-1.5 rounded-lg border border-white/10">
                <span>{service.trustLine}</span>
              </div>
            </div>

            {/* Right Hero Image Card */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl overflow-hidden border border-white/15 shadow-2xl bg-[#0D281E] group">
                <div className="relative h-72 sm:h-80 md:h-96 w-full">
                  <Image 
                    src={heroImageInfo.url} 
                    alt={service.title}
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
                      Verified Process
                    </span>
                  </div>

                  {/* Bottom Caption Overlay */}
                  <div className="absolute bottom-4 left-4 right-4 p-4 bg-[#12372A]/90 backdrop-blur-md rounded-2xl border border-white/10">
                    <p className="text-xs font-bold text-white mb-1 flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#D6A84F]" />
                      <span>{service.category}</span>
                    </p>
                    <p className="text-[11px] text-[#A2B3AA] leading-snug">{heroImageInfo.caption}</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 03. Service Highlights Bar */}
      <section className="-mt-8 md:-mt-10 mb-20 relative z-20">
        <div className="container mx-auto px-4 md:px-8">
          <div className="bg-white rounded-3xl shadow-xl border border-[#D9E1DC] p-6 md:p-8">
            <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4">
              {service.highlights.map((highlight, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs md:text-sm font-bold text-[#202522]">
                  <div className="w-6 h-6 rounded-full bg-[#1F7A5C]/10 text-[#1F7A5C] flex items-center justify-center shrink-0 border border-[#1F7A5C]/20">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <span>{highlight}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 04. The Problem / Challenges */}
      <section className="py-16">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-[#D6A84F] bg-[#D6A84F]/10 border border-[#D6A84F]/30 px-3.5 py-1.5 rounded-full inline-block mb-4">
            Operational Reality
          </span>
          <p className="text-2xl md:text-3xl font-bold text-[#12372A] mb-12 text-balance leading-snug">
            {service.problemIntro}
          </p>

          <div className="bg-white border border-[#D9E1DC] rounded-3xl p-8 md:p-10 mb-10 text-left shadow-xs">
            <h3 className="font-bold text-[#12372A] mb-6 text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#D6A84F]" />
              Businesses may struggle with:
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {service.problemList.map((prob, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-[#F7F4EC] p-4 rounded-2xl border border-[#D9E1DC]/50">
                  <div className="w-2 h-2 rounded-full bg-[#D6A84F] mt-2 shrink-0" />
                  <span className="text-[#202522] text-sm font-medium leading-relaxed">{prob}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#1F7A5C]/10 border border-[#1F7A5C]/20 rounded-3xl p-6 text-[#12372A] font-semibold text-lg max-w-3xl mx-auto shadow-2xs">
            {service.problemOutro}
          </div>
        </div>
      </section>

      {/* 05. What We Help With */}
      <section className="py-24 bg-white border-y border-[#D9E1DC]">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1F7A5C] bg-[#1F7A5C]/10 border border-[#1F7A5C]/20 px-3.5 py-1.5 rounded-full inline-block mb-3">
              Scope of Assistance
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#12372A] mb-4 tracking-tight">What We Help With</h2>
            <p className="text-lg text-[#66736D]">Structured solutions for your compliance challenges.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {service.services.map((item, idx) => (
              <div 
                key={idx} 
                className="bg-[#F7F4EC]/60 p-8 rounded-3xl border border-[#D9E1DC] shadow-xs hover:shadow-md hover:border-[#1F7A5C]/40 hover:bg-white transition-all duration-200 flex flex-col group"
              >
                <div className="w-10 h-10 rounded-2xl bg-[#1F7A5C]/10 text-[#1F7A5C] flex items-center justify-center mb-5 group-hover:bg-[#1F7A5C] group-hover:text-white transition-colors duration-200">
                  <span className="font-bold text-sm">{idx + 1}</span>
                </div>
                <h3 className="text-xl font-bold text-[#12372A] mb-3 group-hover:text-[#1F7A5C] transition-colors">
                  {item.title}
                </h3>
                <p className="text-[#66736D] text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 06. Who Needs This Service */}
      <section className="py-24">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1F7A5C] bg-[#1F7A5C]/10 border border-[#1F7A5C]/20 px-3.5 py-1.5 rounded-full inline-block mb-3">
                Target Establishments
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-[#12372A] mb-4 tracking-tight">Who Needs This Service?</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {service.audience.map((aud, idx) => (
                <div key={idx} className="flex flex-col p-8 bg-white border border-[#D9E1DC] rounded-3xl shadow-xs hover:shadow-md hover:border-[#1F7A5C]/40 transition-all">
                  <h3 className="text-lg font-bold text-[#12372A] mb-2">{aud.title}</h3>
                  <p className="text-[#66736D] text-sm leading-relaxed">{aud.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 07. Our Approach (Process Timeline) */}
      <section className="py-24 bg-[#12372A] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-forest opacity-30 pointer-events-none"></div>
        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-[#D6A84F] bg-[#1B4E3C]/80 border border-[#D6A84F]/30 px-3.5 py-1.5 rounded-full inline-block mb-3">
              Standard Methodology
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Our Approach</h2>
            <p className="text-lg text-[#A2B3AA]">The LabourAxis signature process for structured compliance.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
            {APPROACH_STEPS.map((step, idx) => (
              <div 
                key={idx} 
                className="bg-[#0D281E] border border-white/10 p-6 rounded-3xl flex flex-col justify-start relative shadow-lg"
              >
                <span className="text-4xl font-black text-[#D6A84F] mb-4 block">
                  {step.step}
                </span>
                <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                <p className="text-[#A2B3AA] text-xs sm:text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 08. What You Receive */}
      <section className="py-24 bg-[#F7F4EC] border-b border-[#D9E1DC]">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl">
          <div className="bg-white p-8 md:p-12 rounded-3xl border border-[#D9E1DC] shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1F7A5C] bg-[#1F7A5C]/10 border border-[#1F7A5C]/20 px-3.5 py-1.5 rounded-full inline-block mb-3">
              Deliverables
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-[#12372A] mb-3">What You Receive</h2>
            <p className="text-[#66736D] mb-8 text-sm italic">Depending on the engagement, support may include:</p>
            
            <div className="grid sm:grid-cols-2 gap-4">
              {service.deliverables.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-4 bg-[#F7F4EC] rounded-2xl border border-[#D9E1DC]/50">
                  <div className="w-5 h-5 rounded-full bg-[#1F7A5C]/10 text-[#1F7A5C] flex items-center justify-center shrink-0 mt-0.5 border border-[#1F7A5C]/20">
                    <Check className="w-3 h-3 stroke-[2.5]" />
                  </div>
                  <span className="text-[#202522] text-sm font-semibold">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 09. Why LabourAxis & 10. Common Gaps */}
      <section className="py-24">
        <div className="container mx-auto px-4 md:px-8 grid lg:grid-cols-2 gap-12 max-w-6xl">
          {/* Why LabourAxis */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#1F7A5C] bg-[#1F7A5C]/10 border border-[#1F7A5C]/20 px-3.5 py-1.5 rounded-full inline-block mb-3">
              Consultancy Difference
            </span>
            <h2 className="text-3xl font-bold text-[#12372A] mb-8 tracking-tight">Why LabourAxis</h2>
            <div className="space-y-6">
              {WHY_LABOURAXIS.map((item, idx) => (
                <div key={idx} className="p-6 bg-white border border-[#D9E1DC] rounded-2xl shadow-2xs">
                  <h3 className="text-base font-bold text-[#12372A] mb-1.5">{item.title}</h3>
                  <p className="text-[#66736D] text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Common Gaps */}
          <div>
            <div className="bg-[#EDE8DE]/60 border border-[#D9E1DC] rounded-3xl p-8 md:p-10 h-full flex flex-col justify-between shadow-xs">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#12372A] bg-white px-3.5 py-1.5 rounded-full inline-block mb-3 border border-[#D9E1DC]">
                  Risk Warning
                </span>
                <h2 className="text-2xl font-bold text-[#12372A] mb-6">Common Compliance Gaps</h2>
                <ul className="space-y-3.5 mb-8">
                  {service.commonGaps.map((gap, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-[#202522] text-sm font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D6A84F] mt-2 shrink-0"></span>
                      <span>{gap}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-5 bg-white rounded-2xl border border-[#D9E1DC] shadow-2xs text-xs md:text-sm font-semibold text-[#12372A]">
                If you're unsure whether your current process has gaps, request a compliance consultation.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 11. FAQ */}
      <section className="py-24 bg-white border-y border-[#D9E1DC]">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1F7A5C] bg-[#1F7A5C]/10 border border-[#1F7A5C]/20 px-3.5 py-1.5 rounded-full inline-block mb-3">
              FAQ
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#12372A] mb-4 tracking-tight">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {service.faqs.map((faq, idx) => (
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

      {/* 12. Related Services */}
      <section className="py-24">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1F7A5C] bg-[#1F7A5C]/10 border border-[#1F7A5C]/20 px-3.5 py-1.5 rounded-full inline-block mb-3">
              Explore More
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-[#12372A]">Related Services</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedServicesData.map((related, idx) => (
              <Link 
                key={idx} 
                href={`/services/${related.slug}`} 
                className="group block bg-white p-6 rounded-3xl border border-[#D9E1DC] shadow-2xs hover:border-[#1F7A5C]/50 hover:shadow-md transition-all duration-200"
              >
                <h3 className="font-bold text-[#12372A] mb-2 group-hover:text-[#1F7A5C] transition-colors">
                  {related.title}
                </h3>
                <span className="text-xs font-bold text-[#1F7A5C] flex items-center gap-1 mt-4">
                  <span>Explore service</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 13. Final CTA Banner */}
      <section className="container mx-auto px-4 md:px-8">
        <div className="bg-[#12372A] text-white rounded-3xl p-10 md:p-16 text-center max-w-4xl mx-auto relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-grid-forest opacity-30 pointer-events-none"></div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-balance">
              Not sure where your compliance stands?
            </h2>
            <p className="text-[#A2B3AA] text-base md:text-lg mb-8 max-w-2xl mx-auto leading-relaxed text-balance">
              Let LabourAxis help you identify the areas that may need attention.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <TrackedCtaLink 
                href="/contact" 
                ctaLocation="service_bottom_banner"
                ctaLabel="Request a Compliance Health Check"
                pageType="service"
                className={buttonVariants({ 
                  size: "lg", 
                  className: "bg-[#1F7A5C] hover:bg-[#165B44] text-white font-bold text-base px-8 py-4 rounded-xl shadow-lg transition-all" 
                })}
              >
                Request a Compliance Health Check
              </TrackedCtaLink>
              <TrackedCtaLink 
                href="/contact" 
                ctaLocation="service_bottom_banner"
                ctaLabel="Discuss Your Requirement"
                pageType="service"
                className={buttonVariants({ 
                  size: "lg", 
                  variant: "outline", 
                  className: "bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30 text-base px-8 py-4 rounded-xl transition-all" 
                })}
              >
                Discuss Your Requirement
              </TrackedCtaLink>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
