import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, ShieldAlert, FileSearch, ClipboardCheck, Settings, Users, BookOpen } from "lucide-react";
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
    <div className="flex flex-col pb-24">
      {/* Hero */}
      <section className="bg-slate-900 text-white pt-24 pb-20">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-balance">
              Labour & Statutory Compliance Health Check
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto text-balance leading-relaxed mb-10">
              Identify gaps in your HR documentation, workforce processes, and statutory records before they become costly liabilities.
            </p>
            <a href="#consultation-form" className={buttonVariants({ size: "lg", className: "bg-white text-slate-900 hover:bg-slate-100 text-lg px-8 py-6 h-auto" })}>
              Request a Compliance Health Check
            </a>
          </div>
        </div>
      </section>

      {/* What is a Compliance Health Check */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">What is a Compliance Health Check?</h2>
            <p className="text-xl text-slate-700 leading-relaxed mb-6">
              A Compliance Health Check is a proactive diagnostic review of your organization's HR operations and statutory records.
            </p>
            <p className="text-lg text-slate-600 leading-relaxed">
              Rather than waiting for an inspection or a notice from the authorities, we help you understand exactly where your business stands in relation to applicable labour laws, PF, ESIC, and factory compliance requirements. We don't just point out problems; we provide a clear roadmap to fix them.
            </p>
          </div>
        </div>
      </section>

      {/* What We Review */}
      <section className="py-24 bg-slate-50 border-y border-slate-200">
        <div className="container mx-auto px-4 md:px-8 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">What We Review</h2>
            <p className="text-lg text-slate-600">A comprehensive assessment covering critical workforce touchpoints.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {WHAT_WE_REVIEW.map((item, idx) => (
              <div key={idx} className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                <div className="w-12 h-12 bg-blue-50 text-blue-700 rounded-lg flex items-center justify-center mb-6">
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who Should Consider It */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Who Should Consider It?</h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Compliance requirements change as your workforce grows. If you are relying on outdated processes or lack a dedicated compliance officer, a health check is a critical first step.
              </p>
              <ul className="space-y-4">
                {WHO_SHOULD_CONSIDER.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-slate-700">
                    <CheckCircle2 className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
                    <span className="text-lg font-medium">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-slate-900 rounded-2xl p-10 text-white shadow-xl">
              <h3 className="text-2xl font-bold mb-4">The Cost of Non-Compliance</h3>
              <p className="text-slate-300 leading-relaxed mb-6">
                Failing to maintain proper statutory records can lead to financial penalties, operational disruptions, and legal liabilities. More importantly, it creates friction in employee relations and hinders organizational growth.
              </p>
              <div className="bg-white/10 p-4 rounded-lg border border-white/20 text-sm font-semibold">
                Proactive compliance is always more cost-effective than retroactive damage control.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Assessment Process */}
      <section className="py-24 bg-slate-50 border-y border-slate-200">
        <div className="container mx-auto px-4 md:px-8 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Assessment Process</h2>
            <p className="text-lg text-slate-600">A structured methodology to uncover risks and build solutions.</p>
          </div>
          <div className="grid md:grid-cols-5 gap-6">
            {ASSESSMENT_PROCESS.map((step, idx) => (
              <div key={idx} className="relative bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center mb-6 text-lg border border-blue-100">
                  {step.step}
                </div>
                <h3 className="font-bold text-slate-900 mb-3 text-lg">{step.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed flex-1">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What You Receive & Why LabourAxis */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">What You Receive</h2>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-8">
                <ul className="space-y-6">
                  <li className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                      <span className="font-bold text-blue-700">1</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">Detailed Gap Report</h4>
                      <p className="text-sm text-slate-600">Clear documentation of existing non-compliances and missing records.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                      <span className="font-bold text-blue-700">2</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">Risk Assessment</h4>
                      <p className="text-sm text-slate-600">Categorization of risks by severity (High/Medium/Low).</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                      <span className="font-bold text-blue-700">3</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">Corrective Roadmap</h4>
                      <p className="text-sm text-slate-600">Actionable, step-by-step recommendations to achieve full compliance.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Why LabourAxis?</h2>
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-slate-900 mb-2">Practical Focus</h4>
                  <p className="text-slate-600">We don't just quote the law; we focus on how to operationalize it within your specific business context.</p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-2">Integrated Approach</h4>
                  <p className="text-slate-600">We understand that HR, payroll, and compliance are interconnected. Our health check looks at the entire ecosystem.</p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-2">Actionable Results</h4>
                  <p className="text-slate-600">Our reports are designed for operational implementation, not just to sit in a legal filing cabinet.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-slate-50 border-y border-slate-200">
        <div className="container mx-auto px-4 md:px-8 max-w-3xl">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {FAQ.map((faq, idx) => (
              <details key={idx} className="group bg-white border border-slate-200 rounded-lg shadow-sm [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between p-6 font-bold text-slate-900">
                  <span className="text-lg pr-4">{faq.question}</span>
                  <span className="ml-1.5 flex-shrink-0 bg-slate-50 border border-slate-200 p-1.5 rounded-full text-slate-500 group-open:bg-blue-100 group-open:text-blue-700 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform duration-300 group-open:-rotate-180" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </span>
                </summary>
                <div className="px-6 pb-6 text-slate-600 leading-relaxed border-t border-slate-100 pt-4 mt-2">
                  <p>{faq.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Consultation Form CTA */}
      <section id="consultation-form" className="py-24 bg-slate-900 text-white">
        <div className="container mx-auto px-4 md:px-8 max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to understand where your compliance stands?</h2>
          <Link href="/contact" className={buttonVariants({ size: "lg", className: "bg-white text-slate-900 hover:bg-slate-100 text-lg px-8 py-6 h-auto mt-8" })}>
            Request a Compliance Health Check <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>

    </div>
  );
}
