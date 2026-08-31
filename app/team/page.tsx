import Link from "next/link";
import Image from "next/image";
import { buttonVariants } from "@/components/ui/button";
import { 
  ArrowRight, 
  User, 
  Network, 
  Briefcase, 
  ChevronRight, 
  ShieldCheck, 
  CheckCircle2, 
  Award, 
  Building2, 
  Scale,
  Users,
  ExternalLink
} from "lucide-react";
import type { Metadata } from "next";
import prisma from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Our Team & Leadership | LabourAxis",
  description: "Meet the LabourAxis leadership team and advisory network dedicated to helping factories and MSMEs across India achieve pristine labour compliance and strong HR operations.",
  alternates: {
    canonical: "/team"
  }
};

const FUTURE_ROLES = [
  {
    role: "Director - Operations",
    department: "Executive Leadership",
    desc: "Overseeing pan-India compliance delivery, client relationship management, and operational workflows."
  },
  {
    role: "Head - Labour Compliance",
    department: "Regulatory Affairs",
    desc: "Directing statutory audit frameworks, factory licensing, and regulatory inspection defense."
  },
  {
    role: "Head - HR Advisory",
    department: "People & Organization",
    desc: "Leading organizational structuring, policy frameworks, and workplace culture development."
  },
  {
    role: "Compliance Manager",
    department: "Statutory Practice",
    desc: "Managing monthly PF, ESIC, CLRA registers, and vendor compliance governance."
  },
  {
    role: "Industrial Relations Manager",
    department: "IR & Employee Relations",
    desc: "Advising on union negotiations, grievance handling, and standing order enforcement."
  },
  {
    role: "Payroll & Statutory Executive",
    department: "HR Operations",
    desc: "Executing zero-error payroll processing, deductions, and state tax filings."
  }
];

const NETWORK_CATEGORIES = [
  { title: "Legal Professionals", desc: "Labour advocates & high court practitioners", icon: Scale },
  { title: "Chartered Accountants", desc: "Taxation & statutory audit specialists", icon: Building2 },
  { title: "Company Secretaries", desc: "Corporate governance & secretarial filings", icon: Award },
  { title: "Safety Professionals", desc: "Certified industrial safety & DISH experts", icon: ShieldCheck },
  { title: "Payroll Specialists", desc: "Compensation structure & tax computation", icon: Briefcase },
  { title: "Industrial Relations Experts", desc: "Union mediation & collective bargaining", icon: Users }
];

export default async function TeamPage() {
  let teamMembers: any[] = [];
  try {
    teamMembers = await prisma.teamMember.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    });
  } catch (e) {
    console.error("Prisma error in team page", e);
  }

  // Fallback corporate team member data if DB has limited rows
  const fallbackMembers = [
    {
      id: "1",
      name: "Lavish Chouhan",
      role: "Founder & Lead Consultant",
      bio: "Practitioner and consultant with deep expertise in Indian labour laws, industrial relations, and factory compliance. Specializes in building audit-proof HR systems and mitigating workforce risks for MSMEs and industrial units.",
      imageUrl: "",
      linkedin: "https://www.linkedin.com/in/lavish-chouhan-8b29b4361/",
      expertise: ["Labour Compliance", "Industrial Relations", "Factory Licensing", "Statutory Audits"]
    },
    {
      id: "2",
      name: "Operations & Advisory Board",
      role: "Strategic Compliance Directorate",
      bio: "Our multidisciplinary advisory council brings decades of collective experience across labor inspection standards, corporate law, payroll governance, and organizational psychology.",
      imageUrl: "",
      linkedin: "",
      expertise: ["DISH Regulations", "CLRA Governance", "Corporate Structuring", "Workforce Policy"]
    }
  ];

  const displayMembers = teamMembers.length > 0 ? teamMembers.map((m: any) => ({
    id: String(m.id),
    name: m.name,
    role: m.role,
    bio: m.bio || "Dedicated specialist focused on delivering structured compliance and HR operations.",
    imageUrl: m.imageUrl || "",
    linkedin: m.name.includes("Lavish") ? "https://www.linkedin.com/in/lavish-chouhan-8b29b4361/" : "",
    expertise: m.name.includes("Lavish") 
      ? ["Labour Compliance", "Industrial Relations", "Factory Licensing", "Statutory Audits"]
      : ["HR Operations", "Statutory Governance", "Client Delivery"]
  })) : fallbackMembers;

  return (
    <div className="flex flex-col pb-24 overflow-x-hidden bg-[#F7F4EC]">
      {/* Breadcrumbs */}
      <div className="bg-[#12372A] border-b border-white/10 pt-6 pb-4">
        <div className="container mx-auto px-4 md:px-8">
          <nav className="flex items-center text-xs md:text-sm text-[#A2B3AA] font-medium">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 mx-2 text-[#66736D]" />
            <span className="text-white">Our Team</span>
          </nav>
        </div>
      </div>

      {/* 01. Hero */}
      <section className="bg-[#12372A] text-white pt-12 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-forest opacity-30 pointer-events-none"></div>
        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-[#D6A84F] uppercase tracking-wider mb-4 bg-[#1B4E3C]/80 border border-[#D6A84F]/30 px-3.5 py-1.5 rounded-full shadow-xs">
                <ShieldCheck className="w-4 h-4 text-[#D6A84F]" />
                <span>Leadership & Corporate Advisory</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-balance leading-tight">
                Meet the People Behind LabourAxis
              </h1>

              <p className="text-lg md:text-xl text-[#A2B3AA] mb-8 text-balance leading-relaxed">
                A multidisciplinary team focused on HR operations, labour compliance, workforce management and industrial relations.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link 
                  href="/careers" 
                  className={buttonVariants({ 
                    size: "lg", 
                    className: "bg-[#1F7A5C] hover:bg-[#165B44] text-white font-bold text-base px-7 py-3.5 rounded-xl shadow-lg transition-all group" 
                  })}
                >
                  <span>Explore Open Positions</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  href="/contact" 
                  className={buttonVariants({ 
                    size: "lg", 
                    variant: "outline", 
                    className: "bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30 text-base px-7 py-3.5 rounded-xl transition-all" 
                  })}
                >
                  Connect with Advisory
                </Link>
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#A2B3AA] bg-[#0D281E]/60 px-3.5 py-1.5 rounded-lg border border-white/10">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#D6A84F]" />
                  <span>Multidisciplinary Experts</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#A2B3AA] bg-[#0D281E]/60 px-3.5 py-1.5 rounded-lg border border-white/10">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#1F7A5C]" />
                  <span>Pan-India Statutory Network</span>
                </div>
              </div>
            </div>

            {/* Right Hero Image Card */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl overflow-hidden border border-white/15 shadow-2xl bg-[#0D281E] group">
                <div className="relative h-72 sm:h-80 md:h-96 w-full">
                  <Image 
                    src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1200&auto=format&fit=crop" 
                    alt="LabourAxis Leadership & Team"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D281E] via-[#0D281E]/30 to-transparent"></div>
                  
                  {/* Floating Top Badge */}
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-center gap-2">
                    <span className="bg-[#12372A]/90 backdrop-blur-md text-[#D6A84F] text-xs font-bold px-3.5 py-1.5 rounded-full border border-[#D6A84F]/30 shadow-md">
                      Executive Leadership
                    </span>
                    <span className="bg-[#1F7A5C]/90 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full border border-white/20 shadow-md">
                      Industry Veterans
                    </span>
                  </div>

                  {/* Bottom Caption Overlay */}
                  <div className="absolute bottom-4 left-4 right-4 p-4 bg-[#12372A]/90 backdrop-blur-md rounded-2xl border border-white/10">
                    <p className="text-xs font-bold text-white mb-1 flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#D6A84F]" />
                      <span>Corporate Advisory & Practice Heads</span>
                    </p>
                    <p className="text-[11px] text-[#A2B3AA] leading-snug">Combining statutory mastery with industrial operational excellence</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 02. Corporate Leadership Grid (No Tree/Hierarchy) */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-8 max-w-6xl">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1F7A5C] bg-[#1F7A5C]/10 border border-[#1F7A5C]/20 px-3.5 py-1.5 rounded-full inline-block mb-3">
              Core Leadership
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#12372A] tracking-tight mb-4">
              Executive & Advisory Profiles
            </h2>
            <p className="text-[#66736D] text-base md:text-lg leading-relaxed">
              Meet our leadership team bringing structured corporate governance, legal clarity, and hands-on operational support to employers.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {displayMembers.map((member: any) => (
              <div 
                key={member.id} 
                className="bg-[#F7F4EC] border border-[#D9E1DC] rounded-3xl p-8 shadow-xs hover:shadow-lg hover:border-[#1F7A5C]/40 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-[#EDE8DE] rounded-2xl shrink-0 flex items-center justify-center overflow-hidden border-2 border-white shadow-xs">
                        {member.imageUrl ? (
                          <img src={member.imageUrl} alt={member.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-[#12372A]/10 flex items-center justify-center text-[#12372A]">
                            <User className="w-8 h-8 text-[#12372A]" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-[#12372A] group-hover:text-[#1F7A5C] transition-colors">
                          {member.name}
                        </h3>
                        <div className="text-[#1F7A5C] font-bold text-xs uppercase tracking-wider mt-0.5">
                          {member.role}
                        </div>
                      </div>
                    </div>

                    {member.linkedin && (
                      <a 
                        href={member.linkedin} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="w-10 h-10 rounded-xl bg-white border border-[#D9E1DC] flex items-center justify-center text-[#1F7A5C] hover:bg-[#1F7A5C] hover:text-white hover:border-[#1F7A5C] transition-all shadow-2xs shrink-0"
                        title="View LinkedIn Profile"
                      >
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.48 1.48 0 1 0 0-2.96 1.48 1.48 0 0 0 0 2.96m1.4 9.74v-8.37H5.06v8.37h2.8z" />
                        </svg>
                      </a>
                    )}
                  </div>

                  <p className="text-[#202522] text-sm md:text-base leading-relaxed mb-6">
                    {member.bio}
                  </p>
                </div>

                {member.expertise && member.expertise.length > 0 && (
                  <div className="pt-6 border-t border-[#D9E1DC]/80">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#66736D] mb-3">
                      Key Practice Areas
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {member.expertise.map((exp: string, idx: number) => (
                        <span 
                          key={idx} 
                          className="bg-white border border-[#D9E1DC] text-[#12372A] text-xs font-semibold px-3 py-1 rounded-lg shadow-2xs"
                        >
                          {exp}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 03. Corporate Practice Expansion (Planned Practice Areas) */}
      <section className="py-24 bg-[#F7F4EC] border-y border-[#D9E1DC]">
        <div className="container mx-auto px-4 md:px-8 max-w-6xl">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1F7A5C] bg-[#1F7A5C]/10 border border-[#1F7A5C]/20 px-3.5 py-1.5 rounded-full inline-block mb-3">
              Practice Expansion
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#12372A] mb-3 tracking-tight">
              Corporate Divisions & Strategic Roles
            </h2>
            <p className="text-[#66736D] text-base md:text-lg leading-relaxed">
              We are actively scaling our domain divisions to support growing multi-site factory and enterprise mandates across India.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FUTURE_ROLES.map((item, idx) => (
              <div 
                key={idx} 
                className="bg-white border border-[#D9E1DC] rounded-3xl p-7 shadow-xs flex flex-col justify-between hover:border-[#1F7A5C]/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="text-[11px] font-bold text-[#1F7A5C] bg-[#1F7A5C]/10 border border-[#1F7A5C]/20 px-3 py-1 rounded-md uppercase tracking-wider">
                      {item.department}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-[#D6A84F]"></span>
                  </div>

                  <h3 className="font-bold text-[#12372A] text-lg mb-2 group-hover:text-[#1F7A5C] transition-colors">
                    {item.role}
                  </h3>

                  <p className="text-xs md:text-sm text-[#66736D] leading-relaxed mb-6">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#D9E1DC]/60 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#12372A]">Hiring Active</span>
                  <Link 
                    href="/careers" 
                    className="inline-flex items-center text-xs font-bold text-[#1F7A5C] hover:text-[#165B44] group-hover:translate-x-0.5 transition-all"
                  >
                    <span>View Role</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 04. Professional Collaboration Ecosystem */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-8 max-w-6xl">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1F7A5C] bg-[#1F7A5C]/10 border border-[#1F7A5C]/20 px-3.5 py-1.5 rounded-full inline-block mb-3">
              Advisory Ecosystem
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#12372A] mb-3 tracking-tight">
              Specialist Professional Network
            </h2>
            <p className="text-base md:text-lg text-[#66736D] leading-relaxed">
              Where complex matters require certified representation, forensic audit, or legal court appearances, LabourAxis coordinates seamlessly with qualified specialists.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {NETWORK_CATEGORIES.map((cat, idx) => {
              const IconComp = cat.icon;
              return (
                <div 
                  key={idx} 
                  className="bg-[#F7F4EC] border border-[#D9E1DC] p-6 rounded-3xl shadow-2xs hover:border-[#1F7A5C]/40 hover:shadow-md transition-all flex items-start gap-4"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white border border-[#D9E1DC] text-[#1F7A5C] flex items-center justify-center shrink-0 shadow-2xs">
                    <IconComp className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#12372A] text-base mb-1">{cat.title}</h3>
                    <p className="text-xs md:text-sm text-[#66736D] leading-relaxed">{cat.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 05. Final Careers CTA */}
      <section className="container mx-auto px-4 md:px-8">
        <div className="bg-[#12372A] text-white rounded-3xl p-10 md:p-16 text-center max-w-4xl mx-auto relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-grid-forest opacity-30 pointer-events-none"></div>
          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 text-xs font-bold text-[#D6A84F] uppercase tracking-wider mb-4 bg-[#1B4E3C]/80 border border-[#D6A84F]/30 px-3.5 py-1.5 rounded-full shadow-xs">
              Join Our Mission
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 tracking-tight text-balance">
              Want to build your career with LabourAxis?
            </h2>
            <p className="text-[#A2B3AA] text-base md:text-lg mb-8 max-w-xl mx-auto leading-relaxed text-balance">
              We're building India's premier multidisciplinary team in labour compliance, industrial relations, and HR operations.
            </p>
            <Link 
              href="/careers" 
              className={buttonVariants({ 
                size: "lg", 
                className: "bg-[#1F7A5C] hover:bg-[#165B44] text-white font-bold text-base px-8 py-4 rounded-xl shadow-lg transition-all group" 
              })}
            >
              <span>View Open Positions</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

