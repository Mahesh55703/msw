import Link from "next/link";
import Image from "next/image";
import { footerNav } from "@/data/navigation";
import { Phone, Mail, ChevronDown } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

function FooterColumn({ title, items }: { title: string, items: {title: string, href: string}[] }) {
  return (
    <>
      {/* Desktop View */}
      <div className="hidden md:block">
        <h3 className="font-bold text-white mb-4">{title}</h3>
        <ul className="flex flex-col gap-2.5 text-sm">
          {items.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="text-slate-400 hover:text-white transition-colors">
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Mobile View */}
      <details className="group md:hidden">
        <summary className="flex items-center justify-between font-bold text-white mb-2 cursor-pointer list-none [&::-webkit-details-marker]:hidden border-b border-slate-800 pb-3">
          {title}
          <ChevronDown className="w-4 h-4 group-open:rotate-180 transition-transform" />
        </summary>
        <ul className="flex flex-col gap-3 py-3 text-sm">
          {items.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="text-slate-400 hover:text-white transition-colors block">
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
    <footer className="bg-slate-950 text-slate-300">
      
      {/* CTA Strip */}
      <div className="border-t border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 md:px-8 py-10 md:py-14">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Need help with HR or labour compliance?</h2>
              <p className="text-slate-400 text-lg">Let's discuss your workforce and compliance needs.</p>
            </div>
            <Link href="/contact" className={buttonVariants({ size: "lg", className: "bg-blue-600 hover:bg-blue-700 text-white shrink-0" })}>
              Request a Consultation &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6">
          
          {/* Column 1: LabourAxis */}
          <div className="lg:pr-8 mb-4 md:mb-0">
            <Link href="/" className="inline-block mb-6">
              <Image src="/logo-transparent.png" alt="LabourAxis Logo" width={200} height={50} className="object-contain h-12 w-auto brightness-0 invert" />
            </Link>
            <p className="text-white font-bold mb-2">HR, Labour & Compliance, Aligned.</p>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              Practical support for HR operations, labour compliance, workforce management and industrial relations.
            </p>
            
            <div className="space-y-3 text-sm text-slate-400">
              <a href="tel:18001800000" className="flex items-center gap-3 hover:text-white transition-colors group">
                <Phone className="w-4 h-4 group-hover:text-blue-400" />
                1800-180-0000
              </a>
              <a href="mailto:info@labouraxis.com" className="flex items-center gap-3 hover:text-white transition-colors group">
                <Mail className="w-4 h-4 group-hover:text-blue-400" />
                info@labouraxis.com
              </a>
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

          {/* Column 4: Company & Resources */}
          <div className="flex flex-col gap-6 md:gap-8">
            <div>
              <FooterColumn title="Company" items={footerNav.company} />
            </div>
            <div>
              <FooterColumn title="Resources" items={footerNav.resources} />
            </div>
          </div>

        </div>

        {/* Legal Bar */}
        <div className="mt-12 md:mt-16 pt-8 border-t border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400 mb-6">
            <p>&copy; {new Date().getFullYear()} LabourAxis. All rights reserved.</p>
            <div className="flex flex-wrap justify-center gap-6">
              {footerNav.legal.map((item) => (
                <Link key={item.href} href={item.href} className="hover:text-white transition-colors">
                  {item.title}
                </Link>
              ))}
            </div>
          </div>
          
          <p className="text-xs text-slate-500 leading-relaxed text-balance md:text-left text-center">
            Information provided on this website is for general informational purposes only and does not constitute legal advice. Applicability of labour and statutory requirements may vary based on the establishment, workforce, location and applicable legal framework.
          </p>
        </div>
      </div>
    </footer>
  );
}
