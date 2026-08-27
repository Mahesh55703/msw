import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ArrowRight, BookOpen, TrendingUp, Hammer, HeartHandshake } from "lucide-react";
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
    <div className="flex flex-col pb-24">
      {/* Hero */}
      <section className="bg-slate-900 text-white pt-24 pb-20">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-balance">
              Build the Future of Industrial HR & Compliance
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto text-balance leading-relaxed mb-10">
              Join LabourAxis and work at the intersection of HR, labour compliance, industrial relations and technology.
            </p>
            <a href="#open-positions" className={buttonVariants({ size: "lg", className: "bg-white text-slate-900 hover:bg-slate-100 text-lg px-8 py-6 h-auto" })}>
              View Open Positions
            </a>
          </div>
        </div>
      </section>

      {/* Why LabourAxis */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Why LabourAxis?</h2>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {WHY_CARDS.map((card, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col items-center text-center">
                <div className="bg-blue-100 text-blue-700 p-3 rounded-full mb-4">
                  <card.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{card.title}</h3>
                <p className="text-sm text-slate-600">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Departments */}
      <section className="py-24 bg-slate-50 border-y border-slate-200">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">What You'll Work On</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              We are building capabilities across multiple disciplines.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {DEPARTMENTS.map((dept, idx) => (
              <div key={idx} className="bg-white border border-slate-200 px-6 py-3 rounded-lg font-semibold text-slate-700 shadow-sm">
                {dept}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Future Opportunities */}
      <section id="open-positions" className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold text-slate-900">Future Opportunities</h2>
            <span className="bg-blue-50 text-blue-700 text-sm font-bold px-3 py-1 rounded-full border border-blue-100">
              {openPositions.length} Career Paths Planned
            </span>
          </div>
          <div className="space-y-6">
            {openPositions.map((job, idx) => (
              <div key={idx} className="border border-slate-200 rounded-xl p-6 md:p-8 hover:border-slate-300 transition-colors shadow-sm flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{job.title}</h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500 mb-4 font-medium">
                    <span>{job.location}</span>
                    <span>•</span>
                    <span>{job.type}</span>
                    <span>•</span>
                    <span>{job.department}</span>
                  </div>
                  <div className="flex gap-2">
                    {/* Tags removed as they are not in schema */}
                  </div>
                </div>
                <div className="mt-4 md:mt-0 shrink-0 text-right">
                   <div className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
                      Future Opportunity
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hiring Process */}
      <section className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Hiring Process</h2>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {HIRING_PROCESS.map((step, idx) => (
              <div key={idx} className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm flex flex-col relative">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center mb-6 text-lg border border-blue-100">
                  {step.step}
                </div>
                <h3 className="font-bold text-slate-900 mb-3 text-lg">{step.title}</h3>
                <p className="text-slate-600 leading-relaxed flex-1">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* General Application CTA */}
      <section className="py-24 bg-slate-900 text-white text-center">
        <div className="container mx-auto px-4 md:px-8 max-w-3xl">
          <h2 className="text-3xl font-bold mb-6">Don't see a suitable opening right now?</h2>
          <p className="text-lg text-slate-300 mb-10 leading-relaxed">
            We're always interested in meeting people who are passionate about HR, labour compliance and industrial relations.
          </p>
          <Link href="/contact" className={buttonVariants({ size: "lg", className: "bg-white text-slate-900 hover:bg-slate-100 text-lg px-8 py-6 h-auto" })}>
            Send Your Resume <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
