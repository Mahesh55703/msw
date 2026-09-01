import Link from "next/link";
import { ChevronRight, ShieldCheck, Clock } from "lucide-react";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

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
              <p className="mb-4">We collect personal and professional information that you voluntarily provide when you submit a consultation request or contact us. The information we collect includes:</p>
              <ul className="list-disc pl-6 space-y-2 text-[#66736D]">
                <li><strong>Identity and Contact Data:</strong> Name, email address, phone number, and preferred contact method.</li>
                <li><strong>Professional Details:</strong> Company name, job title (designation), industry, location, and workforce size (employee and contractor counts).</li>
                <li><strong>Enquiry Details:</strong> The specific services you are interested in and the contents of your message.</li>
                <li><strong>Attribution Data:</strong> How you heard about us, the referring website, landing page, and standard marketing parameters (such as UTM source and campaign).</li>
              </ul>
            </div>

            <div className="border-t border-[#D9E1DC] pt-6">
              <h2 className="text-xl md:text-2xl font-bold text-[#12372A] mb-4">2. How We Use Your Information</h2>
              <p className="mb-4">We use the information we collect or receive to:</p>
              <ul className="list-disc pl-6 space-y-2 text-[#66736D]">
                <li><strong>Manage Enquiries:</strong> Your submission is stored in our internal customer relationship management (CRM) system to maintain records, respond to your consultation requests, and track service requirements.</li>
                <li><strong>Communicate:</strong> To contact you via your preferred method (e.g., email or phone) and send administrative notifications regarding your enquiry.</li>
                <li><strong>Analyze Marketing Performance:</strong> To understand how visitors reach our website and evaluate the effectiveness of our marketing campaigns.</li>
                <li><strong>Improve Our Website:</strong> We use privacy-conscious analytics to track website interactions (such as page views, content downloads, and form submissions) to improve the user experience.</li>
              </ul>
            </div>

            <div className="border-t border-[#D9E1DC] pt-6">
              <h2 className="text-xl md:text-2xl font-bold text-[#12372A] mb-4">3. Information Sharing and Third-Party Services</h2>
              <p className="mb-4">We do not sell, trade, or rent your personal information. We only share information with trusted third-party service providers necessary to operate our website and business. These categories include:</p>
              <ul className="list-disc pl-6 space-y-2 text-[#66736D]">
                <li><strong>Hosting and Database Providers:</strong> Your data is securely hosted and stored using established infrastructure providers (such as Vercel and Neon PostgreSQL).</li>
                <li><strong>Email Delivery Providers:</strong> We use transactional email services (such as Resend) to process and send administrative notifications related to your enquiries.</li>
                <li><strong>Security Providers:</strong> We use Cloudflare Turnstile to protect our forms from automated spam and abuse. This service may process technical information (such as your IP address and browser characteristics) necessary for security verification.</li>
                <li><strong>Analytics Providers:</strong> We use Google Analytics and Google Tag Manager to analyze website traffic. Our analytics implementation is configured to sanitize and strip personally identifiable information (PII)—such as names, emails, and phone numbers—before any data is transmitted to our analytics providers.</li>
                <li><strong>For Legal Reasons:</strong> We may disclose your information if required to do so by law or in response to valid requests by public authorities.</li>
              </ul>
            </div>

            <div className="border-t border-[#D9E1DC] pt-6">
              <h2 className="text-xl md:text-2xl font-bold text-[#12372A] mb-4">4. Cookies and Local Storage</h2>
              <p className="mb-4 text-[#66736D]">Our website uses cookies and similar browser storage technologies (such as session storage) to:</p>
              <ul className="list-disc pl-6 space-y-2 text-[#66736D]">
                <li>Remember how you arrived at our website (e.g., attribution parameters like UTM tags) during your active browsing session.</li>
                <li>Facilitate aggregate, zero-PII website analytics via Google Analytics to help us understand content performance.</li>
                <li>Ensure the security of our forms via Cloudflare Turnstile.</li>
              </ul>
              <p className="mt-4 text-[#66736D]">Depending on your jurisdiction, you may have the right to restrict these cookies through your browser settings. We currently do not deploy an intrusive cookie banner because our analytics implementation avoids capturing direct personally identifiable information.</p>
            </div>

            <div className="border-t border-[#D9E1DC] pt-6">
              <h2 className="text-xl md:text-2xl font-bold text-[#12372A] mb-4">5. Data Retention</h2>
              <p className="text-[#66736D]">We retain the personal information collected through our CRM only for as long as is reasonably necessary to fulfill the purposes outlined in this Privacy Policy, such as responding to your enquiries, maintaining necessary business records, or complying with our legal and operational obligations.</p>
            </div>

            <div className="border-t border-[#D9E1DC] pt-6">
              <h2 className="text-xl md:text-2xl font-bold text-[#12372A] mb-4">6. Data Security</h2>
              <p className="text-[#66736D]">We use reasonable administrative, logical, and physical security measures to protect your personal information within our CRM and database architecture. However, please be aware that no data transmission over the Internet or method of electronic storage can be guaranteed to be 100% secure.</p>
            </div>

            <div className="border-t border-[#D9E1DC] pt-6">
              <h2 className="text-xl md:text-2xl font-bold text-[#12372A] mb-4">7. Your Rights</h2>
              <p className="text-[#66736D]">Depending on your jurisdiction, you may have the right to request access to, correction of, or deletion of the personal data we hold about you. For any such requests, or to withdraw consent for future communications, please contact us using the details below.</p>
            </div>

            <div className="border-t border-[#D9E1DC] pt-6">
              <h2 className="text-xl md:text-2xl font-bold text-[#12372A] mb-4">8. Contact Us</h2>
              <p className="text-[#66736D]">If you have questions or comments about this Privacy Policy, please contact us at:</p>
              <p className="mt-4 font-bold text-[#12372A]">Email: {siteConfig.contact.email}</p>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
