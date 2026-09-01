import Link from "next/link";
import Image from "next/image";
import { buttonVariants } from "@/components/ui/button";
import { 
  ArrowRight, 
  Building2, 
  Network, 
  ShieldCheck, 
  Cog, 
  Scale, 
  ChevronRight, 
  Check, 
  Factory, 
  Wrench, 
  Car, 
  HardHat, 
  Truck, 
  UtensilsCrossed, 
  HeartPulse 
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About LabourAxis | Industrial HR & Labour Compliance",
  description: "Learn about LabourAxis, our mission, values, and our expertise in providing practical HR and statutory compliance support for workforce-intensive businesses.",
  alternates: {
    canonical: "/about"
  }
};

const FOCUS_PILLARS = [
  {
    icon: Cog,
    title: "HR Operations",
    description: "Building practical HR processes and documentation."
  },
  {
    icon: Scale,
    title: "Labour Compliance",
    description: "Helping businesses understand, organize and manage applicable compliance requirements."
  },
  {
    icon: Building2,
    title: "Industrial Relations",
    description: "Supporting employee relations and workforce-related processes."
  },
  {
    icon: ShieldCheck,
    title: "Compliance Management",
    description: "Helping businesses identify gaps, organize documentation and establish recurring compliance processes."
  }
];

const APPROACH_STEPS = [
  { step: "01", title: "Understand", desc: "We begin by understanding your establishment, workforce dynamics and current HR setup." },
  { step: "02", title: "Assess", desc: "We review existing processes, records and applicable requirements." },
  { step: "03", title: "Identify", desc: "We identify documentation gaps, process gaps and areas requiring attention." },
  { step: "04", title: "Implement", desc: "We help organize the required process, documentation and recurring activities." },
  { step: "05", title: "Monitor", desc: "We establish a process for ongoing compliance tracking and improvement." }
];

const WHY_LABOURAXIS = [
  {
    title: "Industrial Focus",
    description: "Designed around factories, MSMEs and workforce-intensive organizations."
  },
  {
    title: "Practical Approach",
    description: "Focused on operational processes rather than paperwork alone."
  },
  {
    title: "Integrated Perspective",
    description: "HR, labour compliance, workforce documentation and industrial relations considered together."
  },
  {
    title: "Professional Coordination",
    description: "Specialist matters can be coordinated with appropriately qualified professionals when required."
  }
];

const COMMITMENTS = [
  {
    title: "Accuracy",
    description: "We aim to provide clear, responsible and appropriately qualified guidance."
  },
  {
    title: "Transparency",
    description: "We clearly distinguish consultancy support from regulated professional services."
  },
  {
    title: "Practicality",
    description: "Our focus is on processes businesses can actually implement."
  },
  {
    title: "Continuous Learning",
    description: "Labour and compliance requirements evolve. Our knowledge and resources are developed accordingly."
  }
];

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

export default function AboutPage() {
  return (
    <div className="flex flex-col pb-24 overflow-x-hidden bg-[#F7F4EC]">
      {/* Breadcrumbs */}
      <div className="bg-[#12372A] border-b border-white/10 pt-6 pb-4">
        <div className="container mx-auto px-4 md:px-8">
          <nav className="flex items-center text-xs md:text-sm text-[#A2B3AA] font-medium">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 mx-2 text-[#66736D]" />
            <span className="text-white">About Us</span>
          </nav>
        </div>
      </div>

      {/* 01. Hero */}
      <section className="bg-[#12372A] text-white pt-12 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-forest opacity-30 pointer-events-none"></div>
        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#D6A84F] uppercase tracking-wider mb-6 bg-[#1B4E3C]/80 border border-[#D6A84F]/30 px-3.5 py-1.5 rounded-full shadow-xs">
              <ShieldCheck className="w-4 h-4 text-[#D6A84F]" />
              <span>About LabourAxis</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-balance leading-tight">
              About LabourAxis
            </h1>

            <p className="text-xl md:text-2xl font-semibold text-white mb-6 text-balance">
              Practical HR and labour compliance for businesses that employ people.
            </p>

            <div className="w-16 h-1 bg-[#D6A84F] mx-auto mb-8 rounded-full"></div>

            <p className="text-base md:text-lg text-[#A2B3AA] max-w-2xl mx-auto text-balance leading-relaxed">
              LabourAxis focuses on the intersection of HR Operations, Labour Compliance, Industrial Relations, and Workforce Management.
            </p>
          </div>
        </div>
      </section>

      {/* 02. Who We Are & Vision */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1F7A5C] bg-[#1F7A5C]/10 border border-[#1F7A5C]/20 px-3.5 py-1.5 rounded-full inline-block mb-3">
              Our Identity
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#12372A] mb-6 tracking-tight">Who We Are</h2>
            <p className="text-xl text-[#202522] leading-relaxed mb-6 font-medium">
              LabourAxis is being built around a simple idea: HR and compliance should not operate as disconnected administrative functions.
            </p>
            <p className="text-[#66736D] text-base md:text-lg leading-relaxed">
              Businesses need structured HR processes, organized workforce records, clear compliance tracking and practical support to manage their people effectively.
            </p>
          </div>
          
          {/* Our Vision Card */}
          <div className="max-w-4xl mx-auto bg-[#F7F4EC] border border-[#D9E1DC] rounded-3xl p-8 md:p-12 text-center shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-[#D6A84F] bg-[#D6A84F]/10 border border-[#D6A84F]/30 px-3.5 py-1.5 rounded-full inline-block mb-4">
              North Star
            </span>
            <h3 className="text-2xl md:text-3xl font-bold text-[#12372A] mb-4">Our Vision</h3>
            <p className="text-xl md:text-2xl text-[#12372A] leading-relaxed font-semibold max-w-2xl mx-auto">
              "To build a trusted ecosystem for practical industrial HR, labour compliance and workforce management."
            </p>
          </div>
        </div>
      </section>

      {/* 03. What We Focus On */}
      <section className="py-24 bg-[#F7F4EC] border-y border-[#D9E1DC]">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1F7A5C] bg-[#1F7A5C]/10 border border-[#1F7A5C]/20 px-3.5 py-1.5 rounded-full inline-block mb-3">
              Core Pillars
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#12372A] mb-4 tracking-tight">What We Focus On</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {FOCUS_PILLARS.map((pillar, idx) => (
              <div key={idx} className="bg-white p-8 md:p-10 rounded-3xl border border-[#D9E1DC] shadow-xs flex items-start gap-6 hover:shadow-md hover:border-[#1F7A5C]/40 transition-all duration-200 group">
                <div className="w-14 h-14 bg-[#1F7A5C]/10 text-[#1F7A5C] rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-[#1F7A5C] group-hover:text-white transition-colors duration-200 shadow-2xs">
                  <pillar.icon className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#12372A] mb-2 group-hover:text-[#1F7A5C] transition-colors">{pillar.title}</h3>
                  <p className="text-[#66736D] text-sm md:text-base leading-relaxed">{pillar.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 04. Our Approach */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-8 max-w-6xl">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1F7A5C] bg-[#1F7A5C]/10 border border-[#1F7A5C]/20 px-3.5 py-1.5 rounded-full inline-block mb-3">
              Methodology
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#12372A] mb-4 tracking-tight">Our Approach</h2>
            <p className="text-lg text-[#66736D]">Our signature methodology applied to your establishment.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {APPROACH_STEPS.map((step, idx) => (
              <div key={idx} className="bg-[#F7F4EC]/60 p-6 rounded-3xl border border-[#D9E1DC] shadow-2xs flex flex-col justify-start relative">
                <span className="text-4xl font-black text-[#D6A84F] mb-4 block">{step.step}</span>
                <h3 className="text-lg font-bold text-[#12372A] mb-2">{step.title}</h3>
                <p className="text-[#66736D] text-xs sm:text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 05. Why LabourAxis */}
      <section className="py-24 bg-[#12372A] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-forest opacity-30 pointer-events-none"></div>
        <div className="container mx-auto px-4 md:px-8 max-w-5xl relative z-10">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#D6A84F] bg-[#1B4E3C]/80 border border-[#D6A84F]/30 px-3.5 py-1.5 rounded-full inline-block mb-3">
              The LabourAxis Edge
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Why LabourAxis</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 md:gap-8">
            {WHY_LABOURAXIS.map((item, idx) => (
              <div key={idx} className="flex items-start gap-4 p-6 bg-[#0D281E] border border-white/10 rounded-3xl shadow-md">
                <div className="w-8 h-8 rounded-full bg-[#1F7A5C]/20 text-[#1F7A5C] flex items-center justify-center shrink-0 border border-[#1F7A5C]/40 mt-0.5">
                  <Check className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-[#A2B3AA] text-sm leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 05.5 Who We Serve */}
      <section className="py-24 bg-white border-t border-[#D9E1DC]">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1F7A5C] bg-[#1F7A5C]/10 border border-[#1F7A5C]/20 px-3.5 py-1.5 rounded-full inline-block mb-3">
              Sector Reach
            </span>
            <h2 className="text-3xl font-bold text-[#12372A] mb-4">Who We Serve</h2>
            <p className="text-lg text-[#66736D]">Our services are tailored for environments with complex workforce dynamics.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
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
              return (
                <div key={idx} className="bg-[#F7F4EC]/60 border border-[#D9E1DC] rounded-3xl p-6 flex flex-col items-center justify-center font-bold text-[#202522] shadow-2xs hover:border-[#1F7A5C]/40 hover:bg-white transition-all">
                  <IconComponent className="w-6 h-6 text-[#1F7A5C] mb-2" />
                  <span className="text-sm md:text-base">{audience}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 06. Meet the Founder */}
      <section className="py-24 bg-[#F7F4EC]">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl">
          <div className="bg-white border border-[#D9E1DC] rounded-3xl p-8 md:p-12 shadow-sm flex flex-col md:flex-row gap-10 items-center md:items-start">
            <div className="w-36 h-36 md:w-48 md:h-48 bg-[#EDE8DE] rounded-3xl shrink-0 flex items-center justify-center overflow-hidden border-4 border-white shadow-md relative">
              <Image src="/lavish-chouhan.png" alt="Lavish Chouhan" fill sizes="192px" className="object-cover" />
            </div>

            <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold text-[#12372A] mb-1">Lavish Chouhan</h2>
              <div className="text-[#1F7A5C] font-bold mb-4 uppercase tracking-wider text-xs">Founder | LabourAxis</div>
              
              <a 
                href="https://www.linkedin.com/in/lavish-chouhan-8b29b4361/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-2 text-xs font-bold text-[#1F7A5C] hover:text-[#165B44] mb-6 bg-[#1F7A5C]/10 px-3.5 py-1.5 rounded-full transition-colors border border-[#1F7A5C]/20 shadow-2xs"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                Connect on LinkedIn
              </a>

              <p className="text-[#66736D] leading-relaxed mb-4 text-sm md:text-base">
                Currently pursuing an MSW with a specialization in Human Resource Management, with a growing focus on industrial HR, employee relations and labour compliance.
              </p>
              <p className="text-[#66736D] leading-relaxed mb-6 text-sm md:text-base">
                With a background in Social Work and HR, the long-term vision is to build LabourAxis into a practical HR and labour compliance consultancy serving factories, MSMEs and workforce-intensive organizations.
              </p>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="bg-[#F7F4EC] border border-[#D9E1DC] text-[#202522] text-xs font-bold px-3 py-1.5 rounded-xl shadow-2xs">MSW HR</span>
                <span className="bg-[#F7F4EC] border border-[#D9E1DC] text-[#202522] text-xs font-bold px-3 py-1.5 rounded-xl shadow-2xs">Industrial HR & Labour Compliance</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 07. Professional Network */}
      <section className="py-24 bg-white border-y border-[#D9E1DC]">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl text-center">
          <div className="w-14 h-14 rounded-3xl bg-[#1F7A5C]/10 text-[#1F7A5C] flex items-center justify-center mx-auto mb-6 shadow-2xs border border-[#1F7A5C]/20">
            <Network className="w-7 h-7" />
          </div>
          <h2 className="text-3xl font-bold text-[#12372A] mb-6 tracking-tight">A Connected Professional Approach</h2>
          <p className="text-base md:text-lg text-[#66736D] leading-relaxed max-w-3xl mx-auto">
            Some HR, compliance and business matters require specialized professional expertise. Where appropriate, LabourAxis can work alongside appropriately qualified professionals such as legal practitioners, Chartered Accountants, Company Secretaries and safety professionals. We are actively building relationships with domain experts to support our clients' broader needs.
          </p>
        </div>
      </section>

      {/* 08. Our Commitment */}
      <section className="py-24 bg-[#F7F4EC]">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1F7A5C] bg-[#1F7A5C]/10 border border-[#1F7A5C]/20 px-3.5 py-1.5 rounded-full inline-block mb-3">
              Guiding Principles
            </span>
            <h2 className="text-3xl font-bold text-[#12372A] mb-4 tracking-tight">Our Commitment</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {COMMITMENTS.map((item, idx) => (
              <div key={idx} className="bg-white border-l-4 border-[#1F7A5C] pl-6 pr-6 py-6 rounded-r-3xl border-y border-r border-[#D9E1DC] shadow-2xs">
                <h3 className="text-xl font-bold text-[#12372A] mb-2">{item.title}</h3>
                <p className="text-[#66736D] text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 09. Final Consultation CTA */}
      <section className="container mx-auto px-4 md:px-8">
        <div className="bg-[#12372A] text-white rounded-3xl p-10 md:p-16 text-center max-w-4xl mx-auto relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-grid-forest opacity-30 pointer-events-none"></div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-balance">
              Building better HR and compliance processes?
            </h2>
            <p className="text-[#A2B3AA] text-base md:text-lg mb-8 max-w-2xl mx-auto leading-relaxed text-balance">
              Connect with LabourAxis to discuss your organization's specific workforce setup and requirements.
            </p>
            <Link 
              href="/contact" 
              className={buttonVariants({ 
                size: "lg", 
                className: "bg-[#1F7A5C] hover:bg-[#165B44] text-white font-bold text-base px-8 py-4 rounded-xl shadow-lg transition-all group" 
              })}
            >
              <span>Discuss Your Requirements</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
