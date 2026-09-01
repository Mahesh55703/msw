import { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { servicesData } from "@/data/services";
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

export default function Home() {
  return (
    <div className="flex flex-col gap-24 md:gap-32 pb-24 overflow-x-hidden bg-[#F7F4EC]">
      
      {/* 01. Hero Section */}
      <div className="relative">
        <section className="bg-[#12372A] text-white pt-16 md:pt-24 pb-28 md:pb-36 relative overflow-hidden">
          {/* Ambient Background Grid */}
          <div className="absolute inset-0 bg-grid-forest opacity-30 pointer-events-none"></div>
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#1F7A5C]/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="container mx-auto px-4 md:px-8 relative z-10">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              
              {/* Left Column: Hero Content */}
              <div className="lg:col-span-7 max-w-2xl">
                <div className="inline-flex items-center gap-2 text-xs font-bold text-[#D6A84F] uppercase tracking-wider mb-6 bg-[#1B4E3C]/80 border border-[#D6A84F]/30 px-4 py-1.5 rounded-full shadow-xs">
                  <ShieldCheck className="w-4 h-4 text-[#D6A84F]" />
                  <span>Industrial HR & Labour Compliance Consultancy</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-balance leading-[1.12] text-white">
                  Simplify HR. <br />
                  <span className="text-[#D6A84F]">
                    Strengthen Compliance.
                  </span> <br />
                  Reduce Risk.
                </h1>

                <p className="text-lg md:text-xl text-[#A2B3AA] mb-10 text-balance leading-relaxed">
                  Industrial HR, Labour & Statutory Compliance solutions for factories, MSMEs and growing businesses.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <TrackedCtaLink 
                    href="/contact" 
                    ctaLocation="home_hero"
                    ctaLabel="Request a Consultation"
                    pageType="home"
                    className={buttonVariants({ 
                      size: "lg", 
                      className: "bg-[#1F7A5C] hover:bg-[#165B44] text-white font-bold text-base px-8 py-4 rounded-xl shadow-lg transition-all duration-200 group" 
                    })}
                  >
                    <span>Request a Consultation</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </TrackedCtaLink>
                  <Link 
                    href="/services" 
                    className={buttonVariants({ 
                      size: "lg", 
                      variant: "outline", 
                      className: "bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30 text-base px-8 py-4 rounded-xl transition-all duration-200" 
                    })}
                  >
                    Explore Services
                  </Link>
                </div>
              </div>

              {/* Right Column: Hero Visual Graphic */}
              <div className="lg:col-span-5 relative hidden lg:block">
                <div className="relative mx-auto rounded-3xl overflow-hidden border border-white/15 shadow-2xl bg-[#0D281E] group">
                  <div className="aspect-[4/3] relative">
                    <img 
                      src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1000&q=80" 
                      alt="Industrial factory operations and engineering workforce compliance" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-95" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0D281E] via-[#0D281E]/30 to-transparent"></div>

                    {/* Floating Top Badge */}
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-center gap-2">
                      <span className="bg-[#12372A]/90 backdrop-blur-md text-[#D6A84F] text-xs font-bold px-3.5 py-1.5 rounded-full border border-[#D6A84F]/30 shadow-md">
                        Statutory Precision
                      </span>
                      <span className="bg-[#1F7A5C]/90 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full border border-white/20 shadow-md">
                        Pan-India
                      </span>
                    </div>
                  </div>

                  {/* Floating Trust Card Overlay */}
                  <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-[#12372A]/90 backdrop-blur-md border border-white/10 text-white flex items-center gap-3 shadow-xl">
                    <div className="w-10 h-10 rounded-xl bg-[#1F7A5C]/20 border border-[#D6A84F]/40 flex items-center justify-center text-[#D6A84F] shrink-0">
                      <Scale className="w-5 h-5" />
                    </div>
                    <div className="text-xs">
                      <div className="font-bold text-white text-sm">Labour & Statutory Alignment</div>
                      <div className="text-[#A2B3AA]">Factories • MSMEs • Contractors</div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Floating Trust Strip */}
        <div className="container mx-auto px-4 md:px-8 -mt-10 md:-mt-14 relative z-20">
          <div className="bg-white rounded-3xl shadow-xl border border-[#D9E1DC] p-6 md:p-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
              {[
                "HR Operations",
                "Labour Compliance",
                "PF / ESIC",
                "Factory Compliance",
                "Contract Labour",
                "Industrial Relations"
              ].map((highlight, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs md:text-sm font-bold text-[#202522]">
                  <div className="w-6 h-6 rounded-full bg-[#1F7A5C]/10 text-[#1F7A5C] flex items-center justify-center shrink-0 border border-[#1F7A5C]/20">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <span className="truncate">{highlight}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 02. Why businesses work with us (Bento Grid) */}
      <section className="container mx-auto px-4 md:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-[#1F7A5C] bg-[#1F7A5C]/10 border border-[#1F7A5C]/20 px-3.5 py-1.5 rounded-full inline-block mb-3">
            Our Advantage
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#12372A] mb-4 tracking-tight">Why businesses work with us</h2>
          <p className="text-lg text-[#66736D] text-balance">
            More than routine HR paperwork. We provide structured compliance and HR support.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {[
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
              icon: Users,
              title: "End-to-End Support", 
              desc: "From registration and documentation to ongoing statutory compliance." 
            },
            { 
              icon: ShieldCheck,
              title: "Proactive Compliance", 
              desc: "Identify gaps before they become costly problems." 
            }
          ].map((item, idx) => (
            <div 
              key={idx} 
              className="bg-white p-8 md:p-10 rounded-3xl border border-[#D9E1DC] shadow-xs hover:shadow-md hover:border-[#1F7A5C]/40 transition-all duration-200 flex flex-col justify-start group"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#1F7A5C]/10 text-[#1F7A5C] flex items-center justify-center mb-6 group-hover:bg-[#1F7A5C] group-hover:text-white transition-colors duration-200 shadow-2xs">
                <item.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#12372A] mb-3 group-hover:text-[#1F7A5C] transition-colors">{item.title}</h3>
              <p className="text-[#66736D] text-base leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

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
      <section className="container mx-auto px-4 md:px-8">
        <div className="max-w-3xl mx-auto mb-16 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-[#1F7A5C] bg-[#1F7A5C]/10 border border-[#1F7A5C]/20 px-3.5 py-1.5 rounded-full inline-block mb-3">
            Methodology
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#12372A] mb-4 tracking-tight">How We Work</h2>
          <p className="text-lg text-[#66736D]">A structured approach to bringing compliance under control.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {[
            { num: "01", title: "Understand", desc: "Understand the organization's workforce and compliance requirements." },
            { num: "02", title: "Assess", desc: "Review existing HR and compliance processes to identify gaps." },
            { num: "03", title: "Implement", desc: "Help organize processes, records, and compliance activities." },
            { num: "04", title: "Monitor", desc: "Track recurring compliance requirements and upcoming deadlines." }
          ].map((step, idx) => (
            <div 
              key={idx} 
              className="bg-white rounded-3xl border border-[#D9E1DC] p-6 md:p-8 relative flex flex-col shadow-xs hover:shadow-md hover:border-[#1F7A5C]/40 transition-all duration-200"
            >
              <span className="text-4xl md:text-5xl font-black text-[#D6A84F] mb-4 block">
                {step.num}
              </span>
              <h3 className="text-xl font-bold text-[#12372A] mb-2">{step.title}</h3>
              <p className="text-[#66736D] text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 06. Testimonials */}
      <Testimonials />

      {/* 07. FAQs */}
      <HomeFaqs />

      {/* 08. Final CTA Banner */}
      <section className="container mx-auto px-4 md:px-8">
        <div className="bg-[#12372A] text-white rounded-3xl p-10 md:p-16 text-center max-w-4xl mx-auto relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-grid-forest opacity-30 pointer-events-none"></div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-balance">
              Not sure where your compliance gaps are?
            </h2>
            <p className="text-[#A2B3AA] text-base md:text-lg mb-8 max-w-2xl mx-auto leading-relaxed text-balance">
              Request a preliminary compliance discussion and understand which areas of your workforce operations may need attention.
            </p>
            <TrackedCtaLink 
              href="/contact" 
              ctaLocation="home_bottom_banner"
              ctaLabel="Discuss Your Compliance Requirements"
              pageType="home"
              className={buttonVariants({ 
                size: "lg", 
                className: "bg-[#1F7A5C] hover:bg-[#165B44] text-white font-bold text-base px-8 py-4 rounded-xl shadow-lg transition-all group" 
              })}
            >
              <span>Discuss Your Compliance Requirements</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </TrackedCtaLink>
          </div>
        </div>
      </section>

    </div>
  );
}
