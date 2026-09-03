import Link from "next/link";
import { ChevronRight, FileText, Clock, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import { getSiteConfig } from '@/lib/site-config-accessor';

export const metadata: Metadata = {
  title: "Terms of Service | LabourAxis",
  description: "Read the LabourAxis Terms of Service covering the usage of our website and HR and compliance consultation services.",
  alternates: {
    canonical: "/terms"
  }
};

export default async function TermsPage() {
  const siteConfig = await getSiteConfig();
  return (
    <div className="flex flex-col pb-24 overflow-x-hidden bg-[#F7F4EC]">
      {/* Breadcrumbs */}
      <div className="bg-[#12372A] border-b border-white/10 pt-6 pb-4">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl">
          <nav className="flex items-center text-xs md:text-sm text-[#A2B3AA] font-medium">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 mx-2 text-[#66736D]" />
            <span className="text-white">Terms of Use</span>
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

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-tight">Terms of Use</h1>
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
              Welcome to LabourAxis. By accessing or using our website, you agree to be bound by these Terms of Use and our Privacy Policy.
            </p>

            <div className="border-t border-[#D9E1DC] pt-6">
              <h2 className="text-xl md:text-2xl font-bold text-[#12372A] mb-4">1. Acceptance of Terms</h2>
              <p className="text-[#66736D]">By accessing this website, you accept these Terms of Use in full. If you disagree with these terms or any part of them, you must not use this website.</p>
            </div>

            <div className="border-t border-[#D9E1DC] pt-6">
              <h2 className="text-xl md:text-2xl font-bold text-[#12372A] mb-4">2. Nature of Services</h2>
              <p className="text-[#66736D]">LabourAxis provides operational HR and labour compliance consultancy. We help businesses organize processes and records. However, information provided on this website does not constitute formal legal advice. Where a matter requires specialized legal representation or regulated professional advice, we coordinate with appropriately qualified and independent professionals.</p>
            </div>

            <div className="border-t border-[#D9E1DC] pt-6">
              <h2 className="text-xl md:text-2xl font-bold text-[#12372A] mb-4">3. Intellectual Property Rights</h2>
              <p className="text-[#66736D]">Unless otherwise stated, LabourAxis and/or its licensors own the intellectual property rights for all material on this website. All intellectual property rights are reserved. You may view and/or print pages from the website for your own personal use, subject to restrictions set in these terms and conditions.</p>
              <p className="mt-4 font-bold text-[#12372A]">You must not:</p>
              <ul className="list-disc pl-6 space-y-2 mt-2 text-[#66736D]">
                <li>Republish material from this website without permission.</li>
                <li>Sell, rent, or sub-license material from the website.</li>
                <li>Reproduce, duplicate, or copy material from this website for commercial purposes.</li>
              </ul>
            </div>

            <div className="border-t border-[#D9E1DC] pt-6">
              <h2 className="text-xl md:text-2xl font-bold text-[#12372A] mb-4">4. User Submitted Information</h2>
              <p className="text-[#66736D]">Any information you submit through our contact forms, consultation requests, or career applications must be accurate and truthful. We handle all submitted data in accordance with our Privacy Policy.</p>
            </div>

            <div className="border-t border-[#D9E1DC] pt-6">
              <h2 className="text-xl md:text-2xl font-bold text-[#12372A] mb-4">5. Limitation of Liability</h2>
              <p className="text-[#66736D]">In no event shall LabourAxis, nor any of its officers, directors, and employees, be held liable for anything arising out of or in any way connected with your use of this website. LabourAxis shall not be held liable for any indirect, consequential, or special liability arising out of or in any way related to your use of this website.</p>
            </div>

            <div className="border-t border-[#D9E1DC] pt-6">
              <h2 className="text-xl md:text-2xl font-bold text-[#12372A] mb-4">6. Changes to Terms</h2>
              <p className="text-[#66736D]">We reserve the right to amend these Terms of Use at any time. By continuing to use the website after such changes are published, you agree to be bound by the amended terms.</p>
            </div>

            <div className="border-t border-[#D9E1DC] pt-6">
              <h2 className="text-xl md:text-2xl font-bold text-[#12372A] mb-4">7. Contact Us</h2>
              <p className="text-[#66736D]">If you have any questions about these Terms, please contact us at:</p>
              <p className="mt-4 font-bold text-[#12372A]">Email: {siteConfig.contact.email}</p>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
