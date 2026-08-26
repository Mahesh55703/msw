import { servicesData } from "@/data/services";
import { ServiceCard } from "@/components/services/ServiceCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services | LabourAxis",
  description: "Comprehensive HR, labour, and statutory compliance services for factories, MSMEs, and contractors.",
};

export default function ServicesPage() {
  return (
    <div className="flex flex-col">
      <section className="bg-slate-900 text-white py-20">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Services</h1>
            <p className="text-xl text-slate-300">
              Structured HR and compliance solutions designed for businesses dealing with large workforces and strict statutory requirements.
            </p>
          </div>
        </div>
      </section>

      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {servicesData.map((service) => (
              <ServiceCard key={service.slug} service={service} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
