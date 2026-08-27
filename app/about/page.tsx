import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, User, Building2, Network, BookOpen, ShieldCheck, Cog, Scale } from "lucide-react";
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

export default function AboutPage() {
  return (
    <div className="flex flex-col pb-24">
      {/* 01. Hero */}
      <section className="bg-slate-900 text-white pt-24 pb-20">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-balance">About LabourAxis</h1>
            <p className="text-2xl font-medium text-slate-200 mb-6 text-balance">
              Practical HR and labour compliance for businesses that employ people.
            </p>
            <div className="w-24 h-1 bg-blue-600 mx-auto mb-8 rounded-full"></div>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto text-balance leading-relaxed">
              LabourAxis focuses on the intersection of HR Operations, Labour Compliance, Industrial Relations, and Workforce Management.
            </p>
          </div>
        </div>
      </section>

      {/* 02. Who We Are */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-8">Who We Are</h2>
            <p className="text-xl text-slate-700 leading-relaxed mb-6">
              LabourAxis is being built around a simple idea: HR and compliance should not operate as disconnected administrative functions.
            </p>
            <p className="text-lg text-slate-600 leading-relaxed">
              Businesses need structured HR processes, organized workforce records, clear compliance tracking and practical support to manage their people effectively.
            </p>
          </div>
          
          {/* Our Vision */}
          <div className="max-w-4xl mx-auto bg-slate-50 border border-slate-200 rounded-2xl p-10 md:p-12 text-center shadow-sm">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Our Vision</h2>
            <p className="text-xl text-slate-700 leading-relaxed italic">
              "To build a trusted ecosystem for practical industrial HR, labour compliance and workforce management."
            </p>
          </div>
        </div>
      </section>

      {/* 03. What We Focus On */}
      <section className="py-24 bg-slate-50 border-y border-slate-200">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">What We Focus On</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {FOCUS_PILLARS.map((pillar, idx) => (
              <div key={idx} className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm flex items-start gap-6">
                <div className="bg-blue-50 text-blue-700 p-4 rounded-lg shrink-0">
                  <pillar.icon className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{pillar.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{pillar.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 04. Our Approach */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-8 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Approach</h2>
            <p className="text-lg text-slate-600">Our signature methodology applied to your establishment.</p>
          </div>
          <div className="grid md:grid-cols-5 gap-8">
            {APPROACH_STEPS.map((step, idx) => (
              <div key={idx} className="relative">
                <span className="text-5xl font-black text-slate-100 absolute -top-6 -left-2 z-0">{step.step}</span>
                <div className="relative z-10 pt-4">
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 05. Why LabourAxis */}
      <section className="py-24 bg-slate-900 text-white">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why LabourAxis</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-x-12 gap-y-10">
            {WHY_LABOURAXIS.map((item, idx) => (
              <div key={idx} className="flex items-start gap-4">
                <CheckCircle2 className="w-6 h-6 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xl font-bold text-slate-100 mb-2">{item.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 05.5 Who We Serve */}
      <section className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Who We Serve</h2>
            <p className="text-lg text-slate-600">Our services are tailored for environments with complex workforce dynamics.</p>
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
            ].map((audience, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-lg p-6 flex items-center justify-center font-semibold text-slate-700 shadow-sm">
                {audience}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 06. Meet the Founder */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 md:p-12 shadow-sm flex flex-col md:flex-row gap-10 items-center md:items-start">
            <div className="w-32 h-32 md:w-48 md:h-48 bg-slate-200 rounded-full shrink-0 flex items-center justify-center overflow-hidden border-4 border-white shadow-md">
              {/* Add your photo to the public folder as lavish-chouhan.png */}
              <img src="/lavish-chouhan.png" alt="Lavish Chouhan" className="w-full h-full object-cover" />
              {/* <User className="w-16 h-16 text-slate-400" /> */}
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Lavish Chouhan</h2>
              <div className="text-blue-700 font-bold mb-4 uppercase tracking-wider text-sm">Founder | LabourAxis</div>
              <a href="https://www.linkedin.com/in/lavish-chouhan-8b29b4361/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 mb-6 bg-blue-50 px-3 py-1.5 rounded-full transition-colors border border-blue-100">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                Connect on LinkedIn
              </a>
              <p className="text-slate-600 leading-relaxed mb-4">
                Currently pursuing an MSW with a specialization in Human Resource Management, with a growing focus on industrial HR, employee relations and labour compliance.
              </p>
              <p className="text-slate-600 leading-relaxed mb-6">
                With a background in Social Work and HR, the long-term vision is to build LabourAxis into a practical HR and labour compliance consultancy serving factories, MSMEs and workforce-intensive organizations.
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <span className="bg-white border border-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-full">MSW HR</span>
                {/* <span className="bg-white border border-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-full">LLB</span> */}
                <span className="bg-white border border-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-full">Industrial HR & Labour Compliance</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 07. Professional Network */}
      <section className="py-24 bg-slate-50 border-y border-slate-200">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl text-center">
          <Network className="w-12 h-12 text-blue-600 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-slate-900 mb-6">A Connected Professional Approach</h2>
          <p className="text-lg text-slate-600 leading-relaxed max-w-3xl mx-auto">
            Some HR, compliance and business matters require specialized professional expertise. Where appropriate, LabourAxis can work alongside appropriately qualified professionals such as legal practitioners, Chartered Accountants, Company Secretaries and safety professionals. We are actively building relationships with domain experts to support our clients' broader needs.
          </p>
        </div>
      </section>

      {/* 08. Our Commitment */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Commitment</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {COMMITMENTS.map((item, idx) => (
              <div key={idx} className="bg-white border-l-4 border-blue-600 pl-6 py-2">
                <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 09. Consultation CTA */}
      <section className="py-24 bg-slate-900 text-white text-center">
        <div className="container mx-auto px-4 md:px-8 max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-10 text-balance">Building better HR and compliance processes?</h2>
          <Link href="/contact" className={buttonVariants({ size: "lg", className: "bg-white text-slate-900 hover:bg-slate-100 text-lg px-8 py-6 h-auto" })}>
            Discuss Your Requirements
          </Link>
        </div>
      </section>

    </div>
  );
}
