import Link from "next/link";
import Image from "next/image";
import { footerNav } from "@/data/navigation";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 md:py-16">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <Image src="/logo-transparent.png" alt="LabourAxis Logo" width={400} height={100} className="object-contain h-20 w-auto brightness-0 invert" />
            </Link>
            <p className="text-slate-400 mb-6 max-w-sm">
              HR, Labour & Compliance, Aligned.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Services</h3>
            <ul className="flex flex-col gap-3">
              {footerNav.services.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-white transition-colors">
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Company & Resources</h3>
            <ul className="flex flex-col gap-3">
              {footerNav.company.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-white transition-colors">
                    {item.title}
                  </Link>
                </li>
              ))}
              {footerNav.resources.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-white transition-colors">
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="flex flex-col gap-3">
              <li>Phone: [PHONE NUMBER]</li>
              <li>WhatsApp: [WHATSAPP]</li>
              <li>Email: [EMAIL ADDRESS]</li>
              <li className="mt-2">
                <Link href="/contact" className="text-white underline hover:no-underline">
                  Request Consultation
                </Link>
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <p>© {new Date().getFullYear()} LabourAxis. All rights reserved.</p>
          <div className="flex gap-4">
            {footerNav.legal.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-slate-300 transition-colors">
                {item.title}
              </Link>
            ))}
          </div>
        </div>
        
        <div className="mt-8 text-xs text-slate-600 max-w-4xl">
          <p>
            Disclaimer: Information provided on this website is for general informational purposes and does not constitute legal advice. Services requiring representation or advice reserved for licensed legal professionals will be provided through or coordinated with appropriately qualified professionals.
          </p>
        </div>
      </div>
    </footer>
  );
}
