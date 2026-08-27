import { ConsultationForm } from "@/components/forms/ConsultationForm";
import { Mail, MapPin, Phone } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact LabourAxis | HR & Labour Compliance Consultation",
  description: "Get in touch with LabourAxis for practical HR, labour compliance, PF, ESIC, and workforce support tailored to your business needs.",
  alternates: {
    canonical: "/contact"
  }
};

export default function ContactPage() {
  return (
    <div className="flex flex-col pb-24">
      {/* Hero */}
      <section className="bg-slate-900 text-white py-20">
        <div className="container mx-auto px-4 md:px-8 text-center max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-balance">Discuss Your HR & Compliance Requirements</h1>
          <p className="text-xl text-slate-300">
            Whether you need a full compliance audit, routine HR support, or contractor compliance tracking, our team is ready to assist.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 md:px-8 grid lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Request a Consultation</h2>
            <p className="text-slate-600 mb-8">
              Fill out the form below with details about your workforce and current challenges. We will review your requirement and get back to you.
            </p>
            <ConsultationForm />

            <div className="mt-16 bg-slate-50 border border-slate-200 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">What happens next?</h3>
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <div className="text-sm font-bold text-blue-600 mb-1">01</div>
                  <h4 className="font-bold text-slate-900 mb-2">Submit your requirement</h4>
                  <p className="text-sm text-slate-600">Provide initial details through our consultation form.</p>
                </div>
                <div>
                  <div className="text-sm font-bold text-blue-600 mb-1">02</div>
                  <h4 className="font-bold text-slate-900 mb-2">Initial discussion</h4>
                  <p className="text-sm text-slate-600">We will schedule a call to explore your needs.</p>
                </div>
                <div>
                  <div className="text-sm font-bold text-blue-600 mb-1">03</div>
                  <h4 className="font-bold text-slate-900 mb-2">Understand your requirements</h4>
                  <p className="text-sm text-slate-600">Deep dive into your workforce structure and compliance gaps.</p>
                </div>
                <div>
                  <div className="text-sm font-bold text-blue-600 mb-1">04</div>
                  <h4 className="font-bold text-slate-900 mb-2">Recommend an appropriate approach</h4>
                  <p className="text-sm text-slate-600">We outline a practical plan to bring your processes under control.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-8">
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-6">Get in Touch</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Mail className="w-5 h-5 text-slate-600 mt-1 shrink-0" />
                  <div>
                    <h4 className="font-semibold text-slate-900">Email</h4>
                    <a href="mailto:info@labouraxis.com" className="text-slate-600 hover:text-blue-600 transition-colors">info@labouraxis.com</a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <MapPin className="w-5 h-5 text-slate-600 mt-1 shrink-0" />
                  <div>
                    <h4 className="font-semibold text-slate-900">Location</h4>
                    <p className="text-slate-600">Based in Indore, Madhya Pradesh</p>
                    <p className="text-sm text-slate-500 mt-2">Serving clients remotely across India, with on-site support where applicable.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
