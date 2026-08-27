import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ArrowRight, User, Network, Briefcase } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Team & Professional Network | LabourAxis",
  description: "Meet the leadership and professional network behind LabourAxis.",
};

const FUTURE_ROLES = [
  "Director — Operations",
  "Head — Labour Compliance",
  "Head — HR Advisory",
  "Compliance Manager",
  "Industrial Relations Manager",
  "Payroll & Statutory Executive"
];

const NETWORK_CATEGORIES = [
  "Legal Professionals",
  "Chartered Accountants",
  "Company Secretaries",
  "Safety Professionals",
  "Payroll Specialists",
  "HR Professionals",
  "Industrial Relations Professionals"
];

export default function TeamPage() {
  return (
    <div className="flex flex-col pb-24">
      {/* 01. Hero */}
      <section className="bg-slate-900 text-white pt-24 pb-20">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
              Meet the People Behind LabourAxis
            </h1>
            <div className="w-24 h-1 bg-blue-600 mx-auto mb-8 rounded-full"></div>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto text-balance leading-relaxed mb-6">
              A multidisciplinary team focused on HR operations, labour compliance, workforce management and industrial relations.
            </p>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto text-balance leading-relaxed">
              <strong>Building the LabourAxis team:</strong> We are developing a multidisciplinary professional network combining HR, compliance, industrial relations and specialist professional expertise.
            </p>
          </div>
        </div>
      </section>

      {/* 02. Leadership */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Leadership</h2>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 md:p-12 shadow-sm flex flex-col md:flex-row gap-10 items-center md:items-start">
            <div className="w-32 h-32 md:w-48 md:h-48 bg-slate-200 rounded-full shrink-0 flex items-center justify-center overflow-hidden border-4 border-white shadow-md">
              <img src="/lavish-chouhan.png" alt="Lavish Chouhan" className="w-full h-full object-cover" />
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Lavish Chouhan</h2>
              <div className="text-blue-700 font-bold mb-4 uppercase tracking-wider text-sm">Founder & Chief Executive Officer</div>
              <a href="https://www.linkedin.com/in/lavish-chouhan-8b29b4361/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 mb-6 bg-blue-50 px-3 py-1.5 rounded-full transition-colors border border-blue-100">
                View LinkedIn →
              </a>
              <p className="text-slate-600 leading-relaxed mb-4">
                HR professional focused on building LabourAxis around practical industrial HR, labour compliance and workforce-management solutions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 03. Future Organization */}
      <section className="py-24 bg-slate-50 border-y border-slate-200">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Future Organizational Structure</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              We are actively building a structured organization. These roles represent our scalable architecture as we grow.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {FUTURE_ROLES.map((role, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <Briefcase className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{role}</h3>
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full uppercase tracking-wide">
                  Position Opening Soon
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 04. Professional Network */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl">
          <div className="text-center mb-16">
            <Network className="w-12 h-12 text-blue-600 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Professional Network</h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
              LabourAxis works with appropriately qualified professionals where a client requirement calls for specialist expertise. We are building relationships with domain experts.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {NETWORK_CATEGORIES.map((cat, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200 px-6 py-3 rounded-lg font-semibold text-slate-700 shadow-sm">
                {cat}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 05. CTA */}
      <section className="py-24 bg-slate-900 text-white text-center">
        <div className="container mx-auto px-4 md:px-8 max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Want to build your career with LabourAxis?</h2>
          <p className="text-xl text-slate-300 mb-10">
            We're building a team focused on HR, labour compliance and workforce management.
          </p>
          <Link href="/careers" className={buttonVariants({ size: "lg", className: "bg-white text-slate-900 hover:bg-slate-100 text-lg px-8 py-6 h-auto" })}>
            View Open Positions <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
