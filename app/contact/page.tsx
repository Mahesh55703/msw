import { ConsultationForm } from "@/components/forms/ConsultationForm";
import { Mail, MapPin, ChevronRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
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
    <div className="flex flex-col pb-24 overflow-x-hidden bg-[#F7F4EC]">
      {/* Breadcrumbs */}
      <div className="bg-[#12372A] border-b border-white/10 pt-6 pb-4">
        <div className="container mx-auto px-4 md:px-8 max-w-6xl">
          <nav className="flex items-center text-xs md:text-sm text-[#A2B3AA] font-medium">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 mx-2 text-[#66736D]" />
            <span className="text-white">Contact</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-[#12372A] text-white pt-12 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-forest opacity-30 pointer-events-none"></div>
        <div className="container mx-auto px-4 md:px-8 text-center max-w-4xl relative z-10">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#D6A84F] uppercase tracking-wider mb-4 bg-[#1B4E3C]/80 border border-[#D6A84F]/30 px-3.5 py-1.5 rounded-full shadow-xs">
            <ShieldCheck className="w-4 h-4 text-[#D6A84F]" />
            <span>Consultation & Enquiries</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-balance leading-tight">
            Discuss Your HR & Compliance Requirements
          </h1>

          <p className="text-lg md:text-xl text-[#A2B3AA] max-w-2xl mx-auto text-balance leading-relaxed">
            Whether you need a full compliance audit, routine HR support, or contractor compliance tracking, our team is ready to assist.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-20 bg-[#F7F4EC]">
        <div className="container mx-auto px-4 md:px-8 max-w-6xl grid lg:grid-cols-12 gap-12">
          
          {/* Form Column */}
          <div className="lg:col-span-8">
            <div className="mb-8">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1F7A5C] bg-[#1F7A5C]/10 border border-[#1F7A5C]/20 px-3.5 py-1.5 rounded-full inline-block mb-2">
                Consultation Request
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-[#12372A] mb-2">Request a Consultation</h2>
              <p className="text-[#66736D] text-sm md:text-base leading-relaxed">
                Fill out the form below with details about your workforce and current challenges. We will review your requirement and get back to you.
              </p>
            </div>

            <ConsultationForm />

            {/* What happens next roadmap */}
            <div className="mt-12 bg-white border border-[#D9E1DC] rounded-3xl p-8 md:p-10 shadow-xs">
              <div className="mb-8">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1F7A5C] bg-[#1F7A5C]/10 border border-[#1F7A5C]/20 px-3.5 py-1.5 rounded-full inline-block mb-2">
                  Engagement Roadmap
                </span>
                <h3 className="text-2xl font-bold text-[#12372A]">What happens next?</h3>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="p-6 bg-[#F7F4EC]/60 rounded-3xl border border-[#D9E1DC]">
                  <div className="text-xs font-black text-[#D6A84F] mb-1 tracking-widest uppercase">Step 01</div>
                  <h4 className="font-bold text-[#12372A] text-base mb-1">Submit your requirement</h4>
                  <p className="text-xs md:text-sm text-[#66736D] leading-relaxed">Provide initial details through our consultation form.</p>
                </div>
                <div className="p-6 bg-[#F7F4EC]/60 rounded-3xl border border-[#D9E1DC]">
                  <div className="text-xs font-black text-[#D6A84F] mb-1 tracking-widest uppercase">Step 02</div>
                  <h4 className="font-bold text-[#12372A] text-base mb-1">Initial discussion</h4>
                  <p className="text-xs md:text-sm text-[#66736D] leading-relaxed">We will schedule a call to explore your needs.</p>
                </div>
                <div className="p-6 bg-[#F7F4EC]/60 rounded-3xl border border-[#D9E1DC]">
                  <div className="text-xs font-black text-[#D6A84F] mb-1 tracking-widest uppercase">Step 03</div>
                  <h4 className="font-bold text-[#12372A] text-base mb-1">Understand your requirements</h4>
                  <p className="text-xs md:text-sm text-[#66736D] leading-relaxed">Deep dive into your workforce structure and compliance gaps.</p>
                </div>
                <div className="p-6 bg-[#F7F4EC]/60 rounded-3xl border border-[#D9E1DC]">
                  <div className="text-xs font-black text-[#D6A84F] mb-1 tracking-widest uppercase">Step 04</div>
                  <h4 className="font-bold text-[#12372A] text-base mb-1">Recommend an appropriate approach</h4>
                  <p className="text-xs md:text-sm text-[#66736D] leading-relaxed">We outline a practical plan to bring your processes under control.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Details & Info Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-[#D9E1DC] rounded-3xl p-8 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1F7A5C] bg-[#1F7A5C]/10 border border-[#1F7A5C]/20 px-3.5 py-1.5 rounded-full inline-block mb-4">
                Reach Us
              </span>
              <h3 className="text-xl font-bold text-[#12372A] mb-6">Direct Channels</h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-[#1F7A5C]/10 text-[#1F7A5C] flex items-center justify-center shrink-0 border border-[#1F7A5C]/20">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#12372A] text-sm">Email</h4>
                    <a href="mailto:info@labouraxis.com" className="text-[#202522] hover:text-[#1F7A5C] font-semibold text-sm transition-colors block mt-0.5">
                      info@labouraxis.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-[#1F7A5C]/10 text-[#1F7A5C] flex items-center justify-center shrink-0 border border-[#1F7A5C]/20">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#12372A] text-sm">Location</h4>
                    <p className="text-[#202522] text-sm mt-0.5 font-medium">Based in Indore, Madhya Pradesh</p>
                    <p className="text-xs text-[#66736D] mt-2 leading-relaxed">Serving clients remotely across India, with on-site support where applicable.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Assurance Card */}
            <div className="bg-[#12372A] text-white rounded-3xl p-8 shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-grid-forest opacity-30 pointer-events-none"></div>
              <div className="relative z-10">
                <ShieldCheck className="w-8 h-8 text-[#D6A84F] mb-4" />
                <h4 className="font-bold text-lg mb-2">Confidential & Direct</h4>
                <p className="text-[#A2B3AA] text-xs md:text-sm leading-relaxed">
                  All compliance discussions and workforce details submitted are kept strictly confidential under our privacy and operational standards.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
