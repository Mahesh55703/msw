import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ArrowRight, BookOpen, TrendingUp, Hammer, HeartHandshake, ChevronRight, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import prisma from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Careers at LabourAxis | HR & Labour Compliance",
  description: "Join LabourAxis and help shape the future of industrial HR and labour compliance in India. Explore our current open roles and opportunities.",
  alternates: {
    canonical: "/careers"
  }
};

const WHY_CARDS = [
  {
    icon: BookOpen,
    title: "Learn",
    desc: "Work with real HR and compliance problems."
  },
  {
    icon: TrendingUp,
    title: "Grow",
    desc: "Develop practical industrial HR and compliance expertise."
  },
  {
    icon: Hammer,
    title: "Build",
    desc: "Help create structured processes and eventually technology-enabled compliance solutions."
  },
  {
    icon: HeartHandshake,
    title: "Impact",
    desc: "Help businesses build better workplaces and workforce processes."
  }
];

const DEPARTMENTS = [
  "HR Advisory",
  "Labour Compliance",
  "Factory Compliance",
  "Industrial Relations",
  "Payroll & Statutory Operations",
  "Business Development",
  "Client Success",
  "Technology"
];

const HIRING_PROCESS = [
  { step: "01", title: "Application", desc: "Submit your application with your resume and details." },
  { step: "02", title: "Screening", desc: "Initial discussion to understand mutual fit." },
  { step: "03", title: "Interviews", desc: "Role-specific evaluation and meeting with leadership." },
  { step: "04", title: "Offer", desc: "Selected candidates receive an offer to join LabourAxis." }
];

export default async function CareersPage() {
  const openPositions = await prisma.jobPosting.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'asc' }
  });

  return (
    <div className="flex flex-col pb-24 overflow-x-hidden bg-[#F7F4EC]">
      {/* Breadcrumbs */}
      <div className="bg-[#12372A] border-b border-white/10 pt-6 pb-4">
        <div className="container mx-auto px-4 md:px-8">
          <nav className="flex items-center text-xs md:text-sm text-[#A2B3AA] font-medium">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 mx-2 text-[#66736D]" />
            <span className="text-white">Careers</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-[#12372A] text-white pt-12 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-forest opacity-30 pointer-events-none"></div>
        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#D6A84F] uppercase tracking-wider mb-4 bg-[#1B4E3C]/80 border border-[#D6A84F]/30 px-3.5 py-1.5 rounded-full shadow-xs">
              <ShieldCheck className="w-4 h-4 text-[#D6A84F]" />
              <span>Careers at LabourAxis</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-balance leading-tight">
              Build the Future of Industrial HR & Compliance
            </h1>

            <p className="text-lg md:text-xl text-[#A2B3AA] max-w-2xl mx-auto text-balance leading-relaxed mb-10">
              Join LabourAxis and work at the intersection of HR, labour compliance, industrial relations and technology.
            </p>

            <a 
              href="#open-positions" 
              className={buttonVariants({ 
                size: "lg", 
                className: "bg-[#1F7A5C] hover:bg-[#165B44] text-white font-bold text-base px-8 py-4 rounded-xl shadow-lg transition-all group" 
              })}
            >
              <span>View Open Positions</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </section>

      {/* Why LabourAxis */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1F7A5C] bg-[#1F7A5C]/10 border border-[#1F7A5C]/20 px-3.5 py-1.5 rounded-full inline-block mb-3">
              Culture & Growth
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#12372A] mb-4 tracking-tight">Why LabourAxis?</h2>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {WHY_CARDS.map((card, idx) => (
              <div 
                key={idx} 
                className="bg-[#F7F4EC]/60 border border-[#D9E1DC] rounded-3xl p-6 md:p-8 shadow-xs flex flex-col items-center text-center hover:shadow-md hover:border-[#1F7A5C]/40 hover:bg-white transition-all duration-200 group"
              >
                <div className="w-12 h-12 bg-[#1F7A5C]/10 text-[#1F7A5C] rounded-2xl flex items-center justify-center mb-5 group-hover:bg-[#1F7A5C] group-hover:text-white transition-colors duration-200 shadow-2xs">
                  <card.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-[#12372A] text-lg mb-2">{card.title}</h3>
                <p className="text-sm text-[#66736D] leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Departments */}
      <section className="py-24 bg-[#F7F4EC] border-y border-[#D9E1DC]">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1F7A5C] bg-[#1F7A5C]/10 border border-[#1F7A5C]/20 px-3.5 py-1.5 rounded-full inline-block mb-3">
              Specializations
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#12372A] mb-4 tracking-tight">What You'll Work On</h2>
            <p className="text-base md:text-lg text-[#66736D] max-w-2xl mx-auto">
              We are building capabilities across multiple disciplines.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {DEPARTMENTS.map((dept, idx) => (
              <div key={idx} className="bg-white border border-[#D9E1DC] px-6 py-3 rounded-2xl font-bold text-[#202522] shadow-2xs text-sm hover:border-[#1F7A5C]/40 transition-colors">
                {dept}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Future Opportunities */}
      <section id="open-positions" className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#1F7A5C] bg-[#1F7A5C]/10 border border-[#1F7A5C]/20 px-3.5 py-1.5 rounded-full inline-block mb-2">
                Openings
              </span>
              <h2 className="text-3xl font-bold text-[#12372A] tracking-tight">Future Opportunities</h2>
            </div>
            <span className="bg-[#1F7A5C]/10 text-[#1F7A5C] text-xs font-bold px-3.5 py-1.5 rounded-full border border-[#1F7A5C]/20 shadow-2xs">
              {openPositions.length} Career Paths Planned
            </span>
          </div>

          <div className="space-y-6">
            {openPositions.map((job, idx) => (
              <div 
                key={idx} 
                className="border border-[#D9E1DC] rounded-3xl p-6 md:p-8 hover:border-[#1F7A5C]/40 hover:shadow-md transition-all shadow-xs flex flex-col md:flex-row gap-6 justify-between items-start md:items-center bg-[#F7F4EC]/40 hover:bg-white"
              >
                <div>
                  <h3 className="text-xl font-bold text-[#12372A] mb-2">{job.title}</h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs md:text-sm text-[#66736D] font-medium">
                    <span>{job.location}</span>
                    <span>•</span>
                    <span>{job.type}</span>
                    <span>•</span>
                    <span>{job.department}</span>
                  </div>
                </div>
                <div className="shrink-0">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1F7A5C] bg-[#1F7A5C]/10 px-3.5 py-1.5 rounded-full border border-[#1F7A5C]/20">
                    Future Opportunity
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hiring Process */}
      <section className="py-24 bg-[#F7F4EC] border-t border-[#D9E1DC]">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1F7A5C] bg-[#1F7A5C]/10 border border-[#1F7A5C]/20 px-3.5 py-1.5 rounded-full inline-block mb-3">
              Application Roadmap
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#12372A] mb-4 tracking-tight">Our Hiring Process</h2>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {HIRING_PROCESS.map((step, idx) => (
              <div key={idx} className="bg-white p-6 md:p-8 rounded-3xl border border-[#D9E1DC] shadow-2xs flex flex-col relative">
                <span className="text-4xl font-black text-[#D6A84F] mb-4 block">{step.step}</span>
                <h3 className="font-bold text-[#12372A] mb-2 text-lg">{step.title}</h3>
                <p className="text-[#66736D] text-xs sm:text-sm leading-relaxed flex-1">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* General Application CTA */}
      <section className="container mx-auto px-4 md:px-8">
        <div className="bg-[#12372A] text-white rounded-3xl p-10 md:p-16 text-center max-w-4xl mx-auto relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-grid-forest opacity-30 pointer-events-none"></div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-balance">
              Don't see a suitable opening right now?
            </h2>
            <p className="text-[#A2B3AA] text-base md:text-lg mb-8 max-w-xl mx-auto leading-relaxed text-balance">
              We're always interested in meeting people who are passionate about HR, labour compliance and industrial relations.
            </p>
            <Link 
              href="/contact" 
              className={buttonVariants({ 
                size: "lg", 
                className: "bg-[#1F7A5C] hover:bg-[#165B44] text-white font-bold text-base px-8 py-4 rounded-xl shadow-lg transition-all group" 
              })}
            >
              <span>Send Your Resume</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
