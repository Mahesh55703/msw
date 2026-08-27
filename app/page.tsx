import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { servicesData } from "@/data/services";
import { industriesData } from "@/data/industries";
import { ArrowRight, CheckCircle2, Check } from "lucide-react";
import { Testimonials } from "@/components/home/Testimonials";
import { HomeFaqs } from "@/components/home/HomeFaqs";

export default function Home() {
  return (
    <div className="flex flex-col gap-24 pb-24">
      <div className="relative mb-8 md:mb-12">
        {/* Hero Section */}
        <section className="bg-slate-900 text-white pt-24 pb-32">
          <div className="container mx-auto px-4 md:px-8">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-balance">
                Simplify HR. Strengthen Compliance. Reduce Risk.
              </h1>
              <p className="text-xl text-slate-300 mb-10 max-w-2xl text-balance">
                Industrial HR, Labour & Statutory Compliance solutions for factories, MSMEs and growing businesses.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/contact" className={buttonVariants({ size: "lg", className: "bg-white text-slate-900 hover:bg-slate-100 text-base" })}>
                  Request a Consultation
                </Link>
                <Link href="/services" className={buttonVariants({ size: "lg", variant: "outline", className: "bg-transparent border-white/20 text-white hover:bg-white/10 hover:border-white/30 text-base" })}>
                  Explore Services
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Trust / Service Strip */}
        <section className="absolute bottom-0 left-0 w-full translate-y-1/2 z-10">
          <div className="container mx-auto px-4 md:px-8">
            <div className="bg-white rounded-lg shadow-md border border-slate-200 p-6 flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm md:text-base font-bold text-slate-700">
              {[
                "HR Operations",
                "Labour Compliance",
                "PF / ESIC",
                "Factory Compliance",
                "Contract Labour",
                "Industrial Relations"
              ].map((highlight, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <span>{highlight}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Why businesses work with us */}
      <section className="container mx-auto px-4 md:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Why businesses work with us</h2>
          <p className="text-lg text-slate-600">
            More than routine HR paperwork. We provide structured compliance and HR support.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {[
            { title: "Practical Compliance Approach", desc: "We focus on actual operational compliance rather than paperwork alone." },
            { title: "Industry-Focused HR", desc: "Solutions designed around the realities of factories and workforce-intensive businesses." },
            { title: "End-to-End Support", desc: "From registration and documentation to ongoing statutory compliance." },
            { title: "Proactive Compliance", desc: "Identify gaps before they become costly problems." }
          ].map((item, idx) => (
            <div key={idx} className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-center">
              <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
              <p className="text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services Overview */}
      <section className="bg-slate-100 py-24">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Core Services</h2>
              <p className="text-lg text-slate-600">
                Structured solutions designed for businesses dealing with large workforces and strict statutory requirements.
              </p>
            </div>
            <Link href="/services" className={buttonVariants({ variant: "ghost", className: "text-slate-900 hover:bg-slate-200 flex items-center gap-2" })}>
              View all services <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {servicesData.slice(0, 6).map((service) => (
              <div key={service.slug} className="bg-white rounded-lg border border-slate-200 p-8 shadow-sm flex flex-col">
                <h3 className="text-xl font-bold text-slate-900 mb-3">{service.title}</h3>
                <p className="text-slate-600 mb-6 flex-1">{service.heroSupportingText}</p>
                <Link href={`/services/${service.slug}`} className="text-sm font-semibold text-slate-900 flex items-center gap-1 hover:underline">
                  Learn more <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who We Help */}
      <section className="container mx-auto px-4 md:px-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Who We Help</h2>
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
      </section>

      {/* Process / How We Work */}
      <section className="container mx-auto px-4 md:px-8">
        <div className="max-w-3xl mx-auto mb-16 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">How We Work</h2>
          <p className="text-lg text-slate-600">A structured approach to bringing compliance under control.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { num: "01", title: "Understand", desc: "Understand the organization's workforce and compliance requirements." },
            { num: "02", title: "Assess", desc: "Review existing HR and compliance processes to identify gaps." },
            { num: "03", title: "Implement", desc: "Help organize processes, records, and compliance activities." },
            { num: "04", title: "Monitor", desc: "Track recurring compliance requirements and upcoming deadlines." }
          ].map((step, idx) => (
            <div key={idx} className="relative">
              <span className="text-5xl font-bold text-slate-100 absolute -top-4 -left-2 -z-10">{step.num}</span>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
              <p className="text-slate-600">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <Testimonials />
      <HomeFaqs />

      {/* Final CTA */}
      <section className="bg-slate-900 text-white py-20">
        <div className="container mx-auto px-4 md:px-8 text-center max-w-2xl">
          <h2 className="text-3xl font-bold mb-6">Not sure where your compliance gaps are?</h2>
          <p className="text-lg text-slate-300 mb-8">
            Request a preliminary compliance discussion and understand which areas of your workforce operations may need attention.
          </p>
          <Link href="/contact" className={buttonVariants({ size: "lg", className: "bg-white text-slate-900 hover:bg-slate-100 text-base" })}>
            Discuss Your Compliance Requirements
          </Link>
        </div>
      </section>
    </div>
  );
}
