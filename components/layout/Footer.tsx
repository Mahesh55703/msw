'use client'

import Link from "next/link";
import Image from "next/image";
import { footerNav } from "@/data/navigation";
import { Mail, ChevronDown, ArrowRight, ShieldCheck, MapPin } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { trackConsultationCta, trackEmailClick } from "@/lib/analytics";

function FooterColumn({ title, items }: { title: string, items: {title: string, href: string}[] }) {
  return (
    <>
      {/* Desktop View */}
      <div className="hidden md:block">
        <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-4 pb-2 border-b border-white/10">{title}</h3>
        <ul className="flex flex-col gap-2.5 text-sm">
          {items.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="text-[#A2B3AA] hover:text-white hover:translate-x-0.5 transition-all inline-block">
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Mobile View with collapsible accordion */}
      <details className="group md:hidden border-b border-white/10 py-1">
        <summary className="flex items-center justify-between font-bold text-white py-3 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
          <span className="text-sm uppercase tracking-wider">{title}</span>
          <ChevronDown className="w-4 h-4 text-[#A2B3AA] group-open:rotate-180 transition-transform duration-200" />
        </summary>
        <ul className="flex flex-col gap-2.5 pb-4 pt-1 text-sm pl-2 border-l-2 border-[#1F7A5C] ml-1">
          {items.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="text-[#A2B3AA] hover:text-white transition-colors block py-0.5">
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      </details>
    </>
  );
}

export default function Footer() {
  return (
    <footer className="bg-[#12372A] text-[#A2B3AA] border-t border-[#12372A]">
      
      {/* Top Consultation Strip */}
      <div className="border-b border-white/10 bg-[#0D281E] relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-forest opacity-40 pointer-events-none"></div>
        <div className="container mx-auto px-4 md:px-8 py-10 md:py-12 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 text-center lg:text-left">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold text-[#D6A84F] uppercase tracking-wider mb-2 bg-[#1B4E3C]/60 border border-[#D6A84F]/30 px-3.5 py-1 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5 text-[#D6A84F]" />
                Strategic Compliance & Workforce Support
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Need help with HR or labour compliance?</h2>
              <p className="text-[#A2B3AA] text-base md:text-lg max-w-2xl">Let&apos;s discuss your workforce and compliance needs.</p>
            </div>
            <Link 
              href="/contact" 
              onClick={() => trackConsultationCta('footer_strip', 'Request a Consultation', 'footer')}
              className={buttonVariants({ 
                size: "lg", 
                className: "bg-[#1F7A5C] hover:bg-[#165B44] text-white shrink-0 font-bold px-7 py-3.5 rounded-xl shadow-lg shadow-black/20 group" 
              })}
            >
              <span>Request a Consultation</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="container mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-x-10 gap-y-8">
          
          {/* Column 1: LabourAxis Brand */}
          <div className="lg:pr-4 mb-2 md:mb-0">
            <Link href="/" className="inline-block mb-5">
              <Image 
                src="/logo-transparent.png" 
                alt="LabourAxis Logo" 
                width={220} 
                height={55} 
                className="object-contain h-12 w-auto brightness-0 invert" 
              />
            </Link>
            <p className="text-white font-bold text-sm mb-2">HR, Labour & Compliance, Aligned.</p>
            <p className="text-[#A2B3AA] text-xs sm:text-sm leading-relaxed mb-6">
              Practical support for HR operations, labour compliance, workforce management and industrial relations.
            </p>
            
            <div className="space-y-2.5 text-xs sm:text-sm text-[#A2B3AA]">
              <a 
                href="mailto:info@labouraxis.com" 
                onClick={() => trackEmailClick('footer', 'footer')}
                className="flex items-center gap-2.5 hover:text-white transition-colors group"
              >
                <div className="w-7 h-7 rounded-lg bg-[#1B4E3C] flex items-center justify-center text-[#D6A84F] group-hover:bg-[#1F7A5C] group-hover:text-white transition-all">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <span>info@labouraxis.com</span>
              </a>
              <div className="flex items-start gap-2.5 text-[#A2B3AA]">
                <div className="w-7 h-7 rounded-lg bg-[#1B4E3C] flex items-center justify-center text-[#D6A84F] shrink-0 mt-0.5">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs">Based in Indore, MP • Serving clients across India</span>
              </div>
            </div>
          </div>

          {/* Column 2: Services */}
          <div>
            <FooterColumn title="Services" items={footerNav.services} />
          </div>

          {/* Column 3: Industries */}
          <div>
            <FooterColumn title="Industries" items={footerNav.industries} />
          </div>

          {/* Column 4: Company */}
          <div>
            <FooterColumn title="Company" items={footerNav.company} />
          </div>

          {/* Column 5: Resources */}
          <div>
            <FooterColumn title="Resources" items={footerNav.resources} />
          </div>

        </div>

        {/* Legal Bar */}
        <div className="mt-12 md:mt-16 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs md:text-sm text-[#A2B3AA] mb-6">
            <p>&copy; {new Date().getFullYear()} LabourAxis. All rights reserved.</p>
            <div className="flex flex-wrap justify-center gap-6">
              {footerNav.legal.map((item) => (
                <Link key={item.href} href={item.href} className="hover:text-white transition-colors">
                  {item.title}
                </Link>
              ))}
            </div>
          </div>
          
          <p className="text-[11px] md:text-xs text-[#A2B3AA]/70 leading-relaxed text-balance md:text-left text-center">
            Information provided on this website is for general informational purposes only and does not constitute legal advice. Applicability of labour and statutory requirements may vary based on the establishment, workforce, location and applicable legal framework.
          </p>
        </div>
      </div>
    </footer>
  );
}
