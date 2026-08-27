import { industriesData } from "@/data/industries";
import { servicesData } from "@/data/services";
import { notFound } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle2, ChevronRight, Check, ArrowRight, FileText } from "lucide-react";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return industriesData.map((ind) => ({
    slug: ind.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const industry = industriesData.find((s) => s.slug === resolvedParams.slug);
  if (!industry) {
    return { title: "Industry Not Found" };
  }
  return {
    title: `${industry.title} HR & Labour Compliance | LabourAxis`,
    description: industry.shortDescription,
    alternates: {
      canonical: `/industries/${industry.slug}`
    }
  };
}

export default async function IndustryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const industry = industriesData.find((s) => s.slug === resolvedParams.slug);

  if (!industry) {
    notFound();
  }

  // Filter actual service data based on the industry's relevantServices array
  const relatedServices = servicesData.filter(s => industry.relevantServices.includes(s.slug));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": (process.env.NEXT_PUBLIC_SITE_URL || "https://www.labouraxis.com") },
      { "@type": "ListItem", "position": 2, "name": "Industries", "item": `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.labouraxis.com"}/industries` },
      { "@type": "ListItem", "position": 3, "name": industry.title, "item": `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.labouraxis.com"}/industries/${industry.slug}` }
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
            <Link href="/industries" className="hover:text-white">Industries</Link>
            <ChevronRight className="w-4 h-4 mx-2 mt-0.5" />
            <span className="text-white">{industry.title}</span>
          </nav>
        </div>
      </div>

      {/* 02. Hero */}
      <section className="bg-slate-900 text-white pt-16 pb-24">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-balance">{industry.heroH1}</h1>
            <p className="text-xl text-slate-300 mb-10 text-balance leading-relaxed">
              {industry.heroSupportingText}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Link href="/contact" className={buttonVariants({ size: "lg", className: "bg-white text-slate-900 hover:bg-slate-100 text-base" })}>
                {industry.heroCtaText}
              </Link>
              <Link href="/services" className={buttonVariants({ size: "lg", variant: "outline", className: "bg-transparent border-white/20 text-white hover:bg-white/10 hover:border-white/30 text-base" })}>
                Explore Services
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 03. Industry Challenges */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Common HR & Compliance Challenges in {industry.title}</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {industry.challenges.map((challenge, idx) => (
              <div key={idx} className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-3">{challenge.title}</h3>
                <p className="text-slate-600 leading-relaxed">{challenge.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 04 & 05. HR & Compliance Requirements */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Specific HR & Compliance Requirements</h2>
          <p className="text-lg text-slate-600 mb-12 italic border-l-4 border-slate-300 pl-4">
            Depending on the nature, size, location and applicable legal framework of the establishment, requirements often include:
          </p>
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-12">
            {industry.hrAndComplianceRequirements.map((cat, idx) => (
              <div key={idx}>
                <h3 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">{cat.title}</h3>
                <ul className="space-y-3">
                  {cat.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0" />
                      <span className="text-slate-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 06 & 07. How LabourAxis Helps / Relevant Services */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="container mx-auto px-4 md:px-8 max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How LabourAxis Helps</h2>
              <p className="text-lg text-slate-300 max-w-2xl">
                We provide structured solutions that map directly to the operational realities of {industry.title}.
              </p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatedServices.map((service, idx) => (
              <Link key={idx} href={`/services/${service.slug}`} className="group flex items-center justify-between bg-slate-800 p-6 rounded-lg border border-slate-700 hover:border-slate-500 hover:bg-slate-750 transition-all">
                <span className="font-bold text-lg text-slate-100 group-hover:text-white">{service.title}</span>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 08. Our Approach */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 md:px-8 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Our Approach</h2>
            <p className="text-lg text-slate-600">Our signature methodology applied to your industry.</p>
          </div>
          <div className="grid md:grid-cols-5 gap-8">
            {industry.process.map((step, idx) => (
              <div key={idx} className="relative">
                <span className="text-5xl font-black text-slate-200 absolute -top-6 -left-2 z-0">{step.step}</span>
                <div className="relative z-10 pt-4">
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 09. Who We Support */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl">
          <div className="bg-white border border-slate-200 rounded-2xl p-10 shadow-sm">
            <h2 className="text-3xl font-bold text-slate-900 mb-8">Who We Support</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {industry.whoWeSupport.map((entity, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-slate-700 shrink-0" />
                  <span className="text-slate-800 font-medium">{entity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 10. FAQs */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 md:px-8 max-w-3xl">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {industry.faqs.map((faq, idx) => (
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

      {/* 11. Related Resources */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Recommended Resources</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {industry.relatedResources.map((resource, idx) => (
              <Link key={idx} href="/resources" className="group flex items-start gap-4 p-6 bg-white border border-slate-200 rounded-xl hover:border-slate-400 hover:shadow-sm transition-all">
                <div className="p-3 rounded-lg bg-slate-100 text-slate-700 group-hover:bg-slate-200 transition-colors">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1 leading-snug">{resource}</h4>
                  <span className="text-sm font-medium text-blue-700">View Resource &rarr;</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 12. Final CTA */}
      <section className="py-24 bg-slate-900 text-white text-center">
        <div className="container mx-auto px-4 md:px-8 max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-10 text-balance">{industry.finalCtaTitle}</h2>
          <Link href="/contact" className={buttonVariants({ size: "lg", className: "bg-white text-slate-900 hover:bg-slate-100 text-base" })}>
            {industry.finalCtaButtonText}
          </Link>
        </div>
      </section>

    </div>
  );
}
