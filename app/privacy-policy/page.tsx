import Link from "next/link";
import { ChevronRight, ShieldCheck, Clock } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | LabourAxis",
  description: "Read the LabourAxis Privacy Policy to understand how we collect, use, and protect your personal and business information.",
  alternates: {
    canonical: "/privacy-policy"
  }
};

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col pb-24 overflow-x-hidden bg-[#F7F4EC]">
      {/* Breadcrumbs */}
      <div className="bg-[#12372A] border-b border-white/10 pt-6 pb-4">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl">
          <nav className="flex items-center text-xs md:text-sm text-[#A2B3AA] font-medium">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 mx-2 text-[#66736D]" />
            <span className="text-white">Privacy Policy</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-[#12372A] text-white pt-12 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-forest opacity-30 pointer-events-none"></div>
        <div className="container mx-auto px-4 md:px-8 max-w-4xl relative z-10">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#D6A84F] uppercase tracking-wider mb-4 bg-[#1B4E3C]/80 border border-[#D6A84F]/30 px-3.5 py-1.5 rounded-full shadow-xs">
            <ShieldCheck className="w-4 h-4 text-[#D6A84F]" />
            <span>Legal Documentation</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-tight">Privacy Policy</h1>
          <div className="flex items-center gap-2 text-[#A2B3AA] text-xs md:text-sm font-medium">
            <Clock className="w-4 h-4 text-[#A2B3AA]" />
            <span>Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-[#F7F4EC]">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl">
          <div className="bg-white border border-[#D9E1DC] rounded-3xl p-8 md:p-12 shadow-xs text-[#202522] space-y-8 leading-relaxed">
            
            <p className="text-base md:text-lg font-medium text-[#12372A] leading-relaxed">
              At LabourAxis, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.
            </p>

            <div className="border-t border-[#D9E1DC] pt-6">
              <h2 className="text-xl md:text-2xl font-bold text-[#12372A] mb-4">1. Information We Collect</h2>
              <p className="mb-4">We may collect personal information that you voluntarily provide to us when you express an interest in obtaining information about us or our services, or when you contact us. The personal information we collect may include:</p>
              <ul className="list-disc pl-6 space-y-2 text-[#66736D]">
                <li>Names and job titles</li>
                <li>Email addresses and phone numbers</li>
                <li>Company names and organizational details</li>
                <li>Any other information you choose to provide in consultation forms or emails</li>
              </ul>
            </div>

            <div className="border-t border-[#D9E1DC] pt-6">
              <h2 className="text-xl md:text-2xl font-bold text-[#12372A] mb-4">2. How We Use Your Information</h2>
              <p className="mb-4">We use the information we collect or receive to:</p>
              <ul className="list-disc pl-6 space-y-2 text-[#66736D]">
                <li>Provide, operate, and maintain our services</li>
                <li>Respond to your inquiries and offer customer support</li>
                <li>Send you administrative information or updates regarding your inquiries</li>
                <li>Understand and analyze how you use our website to improve user experience</li>
              </ul>
            </div>

            <div className="border-t border-[#D9E1DC] pt-6">
              <h2 className="text-xl md:text-2xl font-bold text-[#12372A] mb-4">3. Information Sharing and Disclosure</h2>
              <p className="mb-4">We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following situations:</p>
              <ul className="list-disc pl-6 space-y-2 text-[#66736D]">
                <li><strong>With Service Providers:</strong> We may share your information with trusted third-party vendors who assist us in operating our website or conducting our business, provided they agree to keep this information confidential.</li>
                <li><strong>For Legal Reasons:</strong> We may disclose your information if required to do so by law or in response to valid requests by public authorities.</li>
                <li><strong>With Professional Network Partners:</strong> If your requirement involves specialized legal or accounting expertise, we may share basic details with our verified professional network partners only after obtaining your explicit consent.</li>
              </ul>
            </div>

            <div className="border-t border-[#D9E1DC] pt-6">
              <h2 className="text-xl md:text-2xl font-bold text-[#12372A] mb-4">4. Data Security</h2>
              <p className="text-[#66736D]">We use reasonable administrative, logical, and physical security measures to protect your personal information. However, please be aware that no data transmission over the Internet or method of electronic storage can be guaranteed to be 100% secure.</p>
            </div>

            <div className="border-t border-[#D9E1DC] pt-6">
              <h2 className="text-xl md:text-2xl font-bold text-[#12372A] mb-4">5. Contact Us</h2>
              <p className="text-[#66736D]">If you have questions or comments about this Privacy Policy, please contact us at:</p>
              <p className="mt-4 font-bold text-[#12372A]">Email: info@labouraxis.com</p>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
