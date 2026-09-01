import Link from "next/link";
import Image from "next/image";
import { buttonVariants } from "@/components/ui/button";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { 
  ArrowRight, 
  ShieldAlert, 
  FileSearch, 
  ClipboardCheck, 
  Settings, 
  Users, 
  BookOpen, 
  ShieldCheck, 
  Plus, 
  Check,
  ChevronRight,
  CheckCircle2
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Labour & Statutory Compliance Health Check | LabourAxis",
  description: "Request a comprehensive health check from LabourAxis to identify gaps, mitigate risks, and strengthen your statutory and labour compliance frameworks.",
  alternates: {
    canonical: "/compliance-health-check"
  }
};

const WHAT_WE_REVIEW = [
  {
    icon: FileSearch,
    title: "Statutory Registrations",
    desc: "Review of applicable registrations, licences and their validity based on the establishment's circumstances."
  },
  {
    icon: ClipboardCheck,
    title: "Statutory Registers",
    desc: "Review of mandatory registers under applicable labour laws (wages, attendance, deductions, etc.)."
  },
  {
    icon: ShieldAlert,
    title: "PF & ESIC Compliance",
    desc: "Assessment of accurate deduction, timely remittance, and proper filing of returns."
  },
  {
    icon: Users,
    title: "Contract Labour Records",
    desc: "Review of contractor compliance, principal employer obligations, and related documentation."
  },
  {
    icon: Settings,
    title: "HR Policies & Documents",
    desc: "Evaluation of employment contracts, standing orders, and HR policies for statutory alignment."
  },
  {
    icon: BookOpen,
    title: "Returns & Displays",
    desc: "Check for timely filing of statutory returns and mandatory workplace notice displays."
  }
];

const WHO_SHOULD_CONSIDER = [
  "Businesses rapidly scaling their workforce.",
  "Manufacturing units heavily reliant on contract labour.",
  "Organizations preparing for a due diligence audit.",
  "Companies that haven't formally reviewed their HR compliance recently.",
  "Establishments operating across multiple locations with varied state laws."
];

const ASSESSMENT_PROCESS = [
  { step: "01", title: "Initial Consultation", desc: "We discuss your workforce structure, industry, and current HR processes." },
  { step: "02", title: "Data Collection", desc: "You provide access to a sample of your current registers, policies, and returns." },
  { step: "03", title: "Thorough Review", desc: "Our team audits the provided documentation against applicable statutory frameworks." },
  { step: "04", title: "Gap Analysis", desc: "We identify non-compliance risks, missing documentation, and process inefficiencies." },
  { step: "05", title: "Actionable Reporting", desc: "We present a detailed report with practical recommendations to resolve issues." }
];

const FAQ = [
  {
    question: "How long does a health check take?",
    answer: "Typically, a health check takes 1 to 3 weeks depending on the size of your organization and the speed at which documentation is provided."
  },
  {
    question: "Is this a formal legal audit?",
    answer: "No, this is an operational compliance health check designed to help you identify gaps and improve your internal HR processes. For matters requiring formal legal certification, we can coordinate with our professional network."
  },
  {
    question: "What happens if you find major non-compliance?",
    answer: "Our goal is to help you fix it. The report will highlight the risk level, and we can guide you on the necessary corrective actions to regularize the compliance."
  }
];

export default function ComplianceHealthCheckPage() {
  return (
    <div className="flex flex-col pb-24 overflow-x-hidden bg-[#F7F4EC]">
      {/* Breadcrumbs */}
      <div className="bg-[#12372A] border-b border-white/10 pt-6 pb-4">
        <div className="container mx-auto px-4 md:px-8">
          <nav className="flex items-center text-xs md:text-sm text-[#A2B3AA] font-medium">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 mx-2 text-[#66736D]" />
            <span className="text-white">Compliance Health Check</span>
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
                <span>Proactive Diagnostic Assessment</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-balance leading-tight">
                Labour & Statutory Compliance Health Check
              </h1>

              <p className="text-lg md:text-xl text-[#A2B3AA] mb-8 text-balance leading-relaxed">
                Identify gaps in your HR documentation, workforce processes, and statutory records before they become costly liabilities.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <TrackedCtaLink 
                  href="/contact" 
                  ctaLocation="health_check_hero"
                  ctaLabel="Request a Health Check"
                  pageType="compliance_health_check"
                  className={buttonVariants({ 
                    size: "lg", 
                    className: "bg-[#1F7A5C] hover:bg-[#165B44] text-white font-bold text-base px-7 py-3.5 rounded-xl shadow-lg transition-all group" 
                  })}
                >
                  <span>Request a Health Check</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </TrackedCtaLink>
                <Link 
                  href="#scope" 
                  className={buttonVariants({ 
                    size: "lg", 
                    variant: "outline", 
                    className: "bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30 text-base px-7 py-3.5 rounded-xl transition-all" 
                  })}
                >
                  Explore Review Scope
                </Link>
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#A2B3AA] bg-[#0D281E]/60 px-3.5 py-1.5 rounded-lg border border-white/10">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#D6A84F]" />
                  <span>Proactive Gap Analysis</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#A2B3AA] bg-[#0D281E]/60 px-3.5 py-1.5 rounded-lg border border-white/10">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#1F7A5C]" />
                  <span>Clear Remediation Roadmap</span>
                </div>
              </div>
            </div>

            {/* Right Hero Image Card */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl overflow-hidden border border-white/15 shadow-2xl bg-[#0D281E] group">
                <div className="relative h-72 sm:h-80 md:h-96 w-full">
                  <Image 
                    src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1200&auto=format&fit=crop" 
                    alt="Labour & Statutory Compliance Health Check"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D281E] via-[#0D281E]/30 to-transparent"></div>
                  
                  {/* Floating Top Badge */}
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-center gap-2">
                    <span className="bg-[#12372A]/90 backdrop-blur-md text-[#D6A84F] text-xs font-bold px-3.5 py-1.5 rounded-full border border-[#D6A84F]/30 shadow-md">
                      360° Diagnostic
                    </span>
                    <span className="bg-[#1F7A5C]/90 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full border border-white/20 shadow-md">
                      Risk Scorecard
                    </span>
                  </div>

                  {/* Bottom Caption Overlay */}
                  <div className="absolute bottom-4 left-4 right-4 p-4 bg-[#12372A]/90 backdrop-blur-md rounded-2xl border border-white/10">
                    <p className="text-xs font-bold text-white mb-1 flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#D6A84F]" />
                      <span>LabourAxis Health Check Framework</span>
                    </p>
                    <p className="text-[11px] text-[#A2B3AA] leading-snug">Multi-Act Risk Analysis, Missing Register Detection & Remediation Plan</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* What is a Compliance Health Check */}
      <section id="scope" className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1F7A5C] bg-[#1F7A5C]/10 border border-[#1F7A5C]/20 px-3.5 py-1.5 rounded-full inline-block mb-3">
              Overview
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#12372A] mb-6 tracking-tight">What is a Compliance Health Check?</h2>
            <p className="text-xl text-[#202522] leading-relaxed mb-6 font-medium">
              A Compliance Health Check is a proactive diagnostic review of your organization's HR operations and statutory records.
            </p>
            <p className="text-[#66736D] text-base md:text-lg leading-relaxed">
              Rather than waiting for an inspection or a notice from the authorities, we help you understand exactly where your business stands in relation to applicable labour laws, PF, ESIC, and factory compliance requirements. We don't just point out problems; we provide a clear roadmap to fix them.
            </p>
          </div>
        </div>
      </section>

      {/* What We Review */}
      <section className="py-24 bg-[#F7F4EC] border-y border-[#D9E1DC]">
        <div className="container mx-auto px-4 md:px-8 max-w-6xl">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1F7A5C] bg-[#1F7A5C]/10 border border-[#1F7A5C]/20 px-3.5 py-1.5 rounded-full inline-block mb-3">
              Audit Scope
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#12372A] mb-4 tracking-tight">What We Review</h2>
            <p className="text-lg text-[#66736D]">A comprehensive assessment covering critical workforce touchpoints.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {WHAT_WE_REVIEW.map((item, idx) => (
              <div 
                key={idx} 
                className="bg-white p-8 rounded-3xl border border-[#D9E1DC] shadow-xs hover:shadow-md hover:border-[#1F7A5C]/40 transition-all duration-200 flex flex-col group"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#1F7A5C]/10 text-[#1F7A5C] flex items-center justify-center mb-6 group-hover:bg-[#1F7A5C] group-hover:text-white transition-colors duration-200 shadow-2xs">
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#12372A] mb-3 group-hover:text-[#1F7A5C] transition-colors">
                  {item.title}
                </h3>
                <p className="text-[#66736D] text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who Should Consider It vs The Cost of Non-Compliance */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl">
          <div className="grid lg:grid-cols-2 gap-12 items-stretch">
            
            {/* Who Should Consider */}
            <div className="bg-[#F7F4EC]/60 border border-[#D9E1DC] rounded-3xl p-8 md:p-10 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#1F7A5C] bg-[#1F7A5C]/10 border border-[#1F7A5C]/20 px-3.5 py-1.5 rounded-full inline-block mb-3">
                  Eligibility
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-[#12372A] mb-4">Who Should Consider It?</h2>
                <p className="text-[#66736D] text-sm md:text-base mb-6 leading-relaxed">
                  Compliance requirements change as your workforce grows. If you are relying on outdated processes or lack a dedicated compliance officer, a health check is a critical first step.
                </p>
                <ul className="space-y-3.5">
                  {WHO_SHOULD_CONSIDER.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-[#202522] text-sm font-medium">
                      <div className="w-5 h-5 rounded-full bg-[#1F7A5C]/10 text-[#1F7A5C] flex items-center justify-center shrink-0 mt-0.5 border border-[#1F7A5C]/20">
                        <Check className="w-3 h-3 stroke-[2.5]" />
                      </div>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* The Cost of Non-Compliance */}
            <div className="bg-[#12372A] rounded-3xl p-8 md:p-10 text-white shadow-xl flex flex-col justify-between relative overflow-hidden">
              <div className="absolute inset-0 bg-grid-forest opacity-30 pointer-events-none"></div>
              <div className="relative z-10">
                <span className="text-xs font-bold uppercase tracking-wider text-[#D6A84F] bg-[#1B4E3C]/80 border border-[#D6A84F]/30 px-3.5 py-1.5 rounded-full inline-block mb-3">
                  Risk Factors
                </span>
                <h3 className="text-2xl md:text-3xl font-bold mb-4">The Cost of Non-Compliance</h3>
                <p className="text-[#A2B3AA] text-sm md:text-base leading-relaxed mb-8">
                  Failing to maintain proper statutory records can lead to financial penalties, operational disruptions, and legal liabilities. More importantly, it creates friction in employee relations and hinders organizational growth.
                </p>
              </div>
              <div className="bg-white/10 p-5 rounded-2xl border border-white/20 text-xs md:text-sm font-semibold relative z-10 text-white">
                Proactive compliance is always more cost-effective than retroactive damage control.
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Our Assessment Process */}
      <section className="py-24 bg-[#F7F4EC] border-y border-[#D9E1DC]">
        <div className="container mx-auto px-4 md:px-8 max-w-6xl">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1F7A5C] bg-[#1F7A5C]/10 border border-[#1F7A5C]/20 px-3.5 py-1.5 rounded-full inline-block mb-3">
              Step-by-Step
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#12372A] mb-4 tracking-tight">Our Assessment Process</h2>
            <p className="text-lg text-[#66736D]">A structured methodology to uncover risks and build solutions.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {ASSESSMENT_PROCESS.map((step, idx) => (
              <div key={idx} className="bg-white p-6 rounded-3xl border border-[#D9E1DC] shadow-2xs flex flex-col justify-start relative">
                <span className="text-4xl font-black text-[#D6A84F] mb-4 block">{step.step}</span>
                <h3 className="text-lg font-bold text-[#12372A] mb-2">{step.title}</h3>
                <p className="text-[#66736D] text-xs sm:text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What You Receive & Why LabourAxis */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl">
          <div className="grid lg:grid-cols-2 gap-12">
            
            {/* Deliverables */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#1F7A5C] bg-[#1F7A5C]/10 border border-[#1F7A5C]/20 px-3.5 py-1.5 rounded-full inline-block mb-3">
                Deliverables
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-[#12372A] mb-6">What You Receive</h2>
              <div className="bg-[#F7F4EC]/60 border border-[#D9E1DC] rounded-3xl p-8 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 bg-[#1F7A5C]/10 text-[#1F7A5C] font-bold rounded-xl flex items-center justify-center shrink-0 border border-[#1F7A5C]/20">1</div>
                  <div>
                    <h4 className="font-bold text-[#12372A] text-base">Detailed Gap Report</h4>
                    <p className="text-sm text-[#66736D] mt-0.5">Clear documentation of existing non-compliances and missing records.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 bg-[#1F7A5C]/10 text-[#1F7A5C] font-bold rounded-xl flex items-center justify-center shrink-0 border border-[#1F7A5C]/20">2</div>
                  <div>
                    <h4 className="font-bold text-[#12372A] text-base">Risk Assessment</h4>
                    <p className="text-sm text-[#66736D] mt-0.5">Categorization of risks by severity (High/Medium/Low).</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 bg-[#1F7A5C]/10 text-[#1F7A5C] font-bold rounded-xl flex items-center justify-center shrink-0 border border-[#1F7A5C]/20">3</div>
                  <div>
                    <h4 className="font-bold text-[#12372A] text-base">Corrective Roadmap</h4>
                    <p className="text-sm text-[#66736D] mt-0.5">Actionable, step-by-step recommendations to achieve full compliance.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Why LabourAxis */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#1F7A5C] bg-[#1F7A5C]/10 border border-[#1F7A5C]/20 px-3.5 py-1.5 rounded-full inline-block mb-3">
                Consultancy Edge
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-[#12372A] mb-6">Why LabourAxis?</h2>
              <div className="space-y-5">
                <div className="p-6 bg-[#F7F4EC]/60 border border-[#D9E1DC] rounded-2xl shadow-2xs">
                  <h4 className="font-bold text-[#12372A] mb-1">Practical Focus</h4>
                  <p className="text-[#66736D] text-sm leading-relaxed">We don't just quote the law; we focus on how to operationalize it within your specific business context.</p>
                </div>
                <div className="p-6 bg-[#F7F4EC]/60 border border-[#D9E1DC] rounded-2xl shadow-2xs">
                  <h4 className="font-bold text-[#12372A] mb-1">Integrated Approach</h4>
                  <p className="text-[#66736D] text-sm leading-relaxed">We understand that HR, payroll, and compliance are interconnected. Our health check looks at the entire ecosystem.</p>
                </div>
                <div className="p-6 bg-[#F7F4EC]/60 border border-[#D9E1DC] rounded-2xl shadow-2xs">
                  <h4 className="font-bold text-[#12372A] mb-1">Actionable Results</h4>
                  <p className="text-[#66736D] text-sm leading-relaxed">Our reports are designed for operational implementation, not just to sit in a legal filing cabinet.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-[#F7F4EC] border-y border-[#D9E1DC]">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1F7A5C] bg-[#1F7A5C]/10 border border-[#1F7A5C]/20 px-3.5 py-1.5 rounded-full inline-block mb-3">
              FAQ
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#12372A] mb-4 tracking-tight">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {FAQ.map((faq, idx) => (
              <details key={idx} className="group bg-white border border-[#D9E1DC] rounded-2xl [&_summary::-webkit-details-marker]:hidden shadow-2xs">
                <summary className="flex cursor-pointer items-center justify-between p-6 font-bold text-[#12372A] select-none">
                  <span className="text-base md:text-lg pr-4 font-semibold text-[#12372A] group-open:text-[#1F7A5C] transition-colors">{faq.question}</span>
                  <span className="ml-2 flex-shrink-0 w-8 h-8 rounded-full bg-[#F7F4EC] border border-[#D9E1DC] flex items-center justify-center text-[#66736D] group-open:bg-[#1F7A5C] group-open:border-[#1F7A5C] group-open:text-white transition-all duration-200">
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

      {/* Consultation Form CTA */}
      <section className="container mx-auto px-4 md:px-8">
        <div className="bg-[#12372A] text-white rounded-3xl p-10 md:p-16 text-center max-w-4xl mx-auto relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-grid-forest opacity-30 pointer-events-none"></div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-balance">
              Ready to understand where your compliance stands?
            </h2>
            <TrackedCtaLink 
              href="/contact" 
              ctaLocation="health_check_bottom_banner"
              ctaLabel="Request a Compliance Health Check"
              pageType="compliance_health_check"
              className={buttonVariants({ 
                size: "lg", 
                className: "bg-[#1F7A5C] hover:bg-[#165B44] text-white font-bold text-base px-8 py-4 rounded-xl shadow-lg transition-all group mt-6" 
              })}
            >
              <span>Request a Compliance Health Check</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </TrackedCtaLink>
          </div>
        </div>
      </section>

    </div>
  );
}
