import { industriesData } from "@/data/industries";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Industries | LabourAxis",
  description: "Workforce requirements, labour compliance and HR challenges vary by industry. Discover tailored compliance support.",
};

export default function IndustriesHubPage() {
  return (
    <div className="flex flex-col">
      <section className="bg-slate-900 text-white py-20">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">HR & Labour Compliance Solutions by Industry</h1>
            <p className="text-xl text-slate-300">
              Workforce requirements, labour compliance and HR challenges vary by industry. LabourAxis provides practical HR and compliance support tailored to the operational realities of different businesses.
            </p>
          </div>
        </div>
      </section>

      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {industriesData.map((industry) => (
              <div key={industry.slug} className="bg-white rounded-lg border border-slate-200 p-8 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
                <h3 className="text-xl font-bold text-slate-900 mb-3">{industry.title}</h3>
                <p className="text-slate-600 mb-6 flex-1">{industry.shortDescription}</p>
                
                <div className="mb-8">
                  <h4 className="text-sm font-semibold text-slate-900 mb-3">Relevant Services:</h4>
                  <div className="flex flex-wrap gap-2 text-sm text-slate-600">
                    {industry.hubRelevantServices.map((service, idx) => (
                      <span key={idx} className="bg-slate-100 px-2 py-1 rounded-md text-xs font-medium">
                        {service}
                      </span>
                    ))}
                  </div>
                </div>

                <Link href={`/industries/${industry.slug}`} className="text-sm font-bold text-blue-700 flex items-center gap-1 hover:underline mt-auto">
                  Explore {industry.title} <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
