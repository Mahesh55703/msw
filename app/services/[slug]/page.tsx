import { servicesData } from "@/data/services";
import { notFound } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle2, ChevronRight, Check } from "lucide-react";
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
    <div className="flex flex-col pb-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* 01. Breadcrumb */}
      <div className="bg-slate-900 border-b border-slate-800 pt-6 pb-4">
        <div className="container mx-auto px-4 md:px-8">
          <nav className="flex text-sm text-slate-400">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight className="w-4 h-4 mx-2 mt-0.5" />
            <Link href="/services" className="hover:text-white">Services</Link>
            <ChevronRight className="w-4 h-4 mx-2 mt-0.5" />
            <span className="text-white">{service.category}</span>
          </nav>
        </div>
      </div>

      {/* 02. Hero */}
      <section className="bg-slate-900 text-white pt-12 pb-24">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-balance">{service.title}</h1>
            <p className="text-xl text-slate-300 mb-10 text-balance leading-relaxed">
              {service.heroSupportingText}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Link href="/contact" className={buttonVariants({ size: "lg", className: "bg-white text-slate-900 hover:bg-slate-100 text-base" })}>
                {service.ctaText}
              </Link>
              <Link href="/contact" className={buttonVariants({ size: "lg", variant: "outline", className: "bg-transparent border-white/20 text-white hover:bg-white/10 hover:border-white/30 text-base" })}>
                Check Your Compliance
              </Link>
            </div>
            <p className="text-sm text-slate-400 font-medium tracking-wide uppercase">
              {service.trustLine}
            </p>
          </div>
        </div>
      </section>

      {/* 03. Service Highlights */}
      <section className="-mt-10 mb-20 relative z-10">
        <div className="container mx-auto px-4 md:px-8">
          <div className="bg-white rounded-lg shadow-md border border-slate-200 p-6 flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm md:text-base font-bold text-slate-700">
            {service.highlights.map((highlight, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                <span>{highlight}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 04. The Problem */}
      <section className="py-16">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl text-center">
          <p className="text-2xl md:text-3xl font-medium text-slate-800 mb-12 text-balance leading-snug">
            {service.problemIntro}
          </p>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 mb-8 text-left">
            <h3 className="font-bold text-slate-900 mb-6 text-lg">Businesses may struggle with:</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {service.problemList.map((prob, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                  <span className="text-slate-700">{prob}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xl font-semibold text-slate-900">
            {service.problemOutro}
          </p>
        </div>
      </section>

      {/* 05. What We Help With */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">What We Help With</h2>
            <p className="text-lg text-slate-600">Structured solutions for your compliance challenges.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {service.services.map((item, idx) => (
              <div key={idx} className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 06. Who Needs This Service */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-12 text-center">Who Needs This Service?</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {service.audience.map((aud, idx) => (
                <div key={idx} className="flex flex-col p-6 bg-white border border-slate-200 rounded-lg shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{aud.title}</h3>
                  <p className="text-slate-600">{aud.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 07. Our Approach */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Approach</h2>
            <p className="text-lg text-slate-300">The LabourAxis signature process for structured compliance.</p>
          </div>
          <div className="grid md:grid-cols-5 gap-8 max-w-6xl mx-auto">
            {APPROACH_STEPS.map((step, idx) => (
              <div key={idx} className="relative">
                <span className="text-5xl font-black text-slate-800 absolute -top-6 -left-2 z-0">{step.step}</span>
                <div className="relative z-10 pt-4">
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 08. What You Receive */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl">
          <div className="bg-white p-8 md:p-12 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">What You Receive</h2>
            <p className="text-slate-600 mb-8 italic">Depending on the engagement, support may include:</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {service.deliverables.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-slate-700 shrink-0 mt-0.5" />
                  <span className="text-slate-700 font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 09. Why LabourAxis & 10. Common Gaps */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-8 grid lg:grid-cols-2 gap-16 max-w-6xl">
          {/* Why LabourAxis */}
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-8">Why LabourAxis</h2>
            <div className="space-y-8">
              {WHY_LABOURAXIS.map((item, idx) => (
                <div key={idx}>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Common Gaps */}
          <div>
            <div className="bg-red-50 border border-red-100 rounded-2xl p-8 md:p-10 h-full">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Common Compliance Gaps</h2>
              <ul className="space-y-4 mb-8">
                {service.commonGaps.map((gap, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-slate-700">
                    <span className="text-red-500 font-bold mt-0.5">•</span>
                    {gap}
                  </li>
                ))}
              </ul>
              <div className="p-4 bg-white rounded-lg border border-red-100 shadow-sm text-sm font-medium text-slate-800">
                If you're unsure whether your current process has gaps, request a compliance consultation.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 11. FAQ */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 md:px-8 max-w-3xl">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {service.faqs.map((faq, idx) => (
              <details key={idx} className="group bg-white border border-slate-200 rounded-lg [&_summary::-webkit-details-marker]:hidden shadow-sm">
                <summary className="flex cursor-pointer items-center justify-between p-6 font-bold text-slate-900">
                  <span className="text-lg pr-4">{faq.question}</span>
                  <span className="ml-1.5 flex-shrink-0 bg-slate-50 shadow-sm border border-slate-200 p-1.5 rounded-full text-slate-500 group-open:bg-blue-100 group-open:border-blue-200 group-open:text-blue-700 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0 transition-transform duration-300 group-open:-rotate-180" viewBox="0 0 20 20" fill="currentColor">
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

      {/* 12. Related Services */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl">
          <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">Related Services</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {relatedServicesData.map((related, idx) => (
              <Link key={idx} href={`/services/${related.slug}`} className="group block bg-white p-6 rounded-lg border border-slate-200 shadow-sm hover:border-slate-400 transition-colors">
                <h3 className="font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">{related.title}</h3>
                <span className="text-sm text-slate-500 font-medium">Explore service →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 13. Final CTA */}
      <section className="py-24 bg-slate-900 text-white text-center">
        <div className="container mx-auto px-4 md:px-8 max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Not sure where your compliance stands?</h2>
          <p className="text-xl text-slate-300 mb-10">
            Let LabourAxis help you identify the areas that may need attention.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/contact" className={buttonVariants({ size: "lg", className: "bg-white text-slate-900 hover:bg-slate-100 text-base" })}>
              Request a Compliance Health Check
            </Link>
            <Link href="/contact" className={buttonVariants({ size: "lg", variant: "outline", className: "border-slate-700 text-white hover:bg-slate-800 text-base" })}>
              Discuss Your Requirement
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
