import Link from "next/link";
import { ChevronRight, ShieldAlert, Clock } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disclaimer | LabourAxis",
  description: "Important legal disclaimer regarding the use of LabourAxis website content and our position on providing general informational compliance content.",
  alternates: {
    canonical: "/disclaimer"
  }
};

export default function DisclaimerPage() {
  return (
    <div className="flex flex-col pb-24 overflow-x-hidden bg-[#F7F4EC]">
      {/* Breadcrumbs */}
      <div className="bg-[#12372A] border-b border-white/10 pt-6 pb-4">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl">
          <nav className="flex items-center text-xs md:text-sm text-[#A2B3AA] font-medium">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 mx-2 text-[#66736D]" />
            <span className="text-white">Disclaimer</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-[#12372A] text-white pt-12 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-forest opacity-30 pointer-events-none"></div>
        <div className="container mx-auto px-4 md:px-8 max-w-4xl relative z-10">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#D6A84F] uppercase tracking-wider mb-4 bg-[#1B4E3C]/80 border border-[#D6A84F]/30 px-3.5 py-1.5 rounded-full shadow-xs">
            <ShieldAlert className="w-4 h-4 text-[#D6A84F]" />
            <span>Legal Notice</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-tight">Disclaimer</h1>
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
            
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-[#12372A] mb-4">1. General Information Purpose</h2>
              <p className="text-[#66736D]">The information contained on the LabourAxis website (the "Service") is for general informational purposes only. LabourAxis assumes no responsibility for errors or omissions in the contents of the Service.</p>
            </div>

            <div className="border-t border-[#D9E1DC] pt-6">
              <h2 className="text-xl md:text-2xl font-bold text-[#12372A] mb-4">2. Not Legal Advice</h2>
              <p className="text-[#66736D]">LabourAxis provides operational human resources and labour compliance consultancy. <strong>The materials on this website do not constitute legal advice and should not be relied upon as such.</strong></p>
              <p className="mt-4 text-[#66736D]">Labour compliance and industrial relations laws are complex and subject to change. While we endeavor to keep the information up to date and correct, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, or suitability with respect to the website or the information contained on the website for any purpose.</p>
            </div>

            <div className="border-t border-[#D9E1DC] pt-6">
              <h2 className="text-xl md:text-2xl font-bold text-[#12372A] mb-4">3. Professional Network Limitations</h2>
              <p className="text-[#66736D]">Where client requirements call for specialized legal, accounting, or company secretarial expertise, LabourAxis acts as a coordinator to connect clients with independent, appropriately qualified professionals (such as Lawyers or Chartered Accountants). LabourAxis itself does not provide services reserved for these regulated professions, and assumes no liability for the independent professional advice rendered by such network partners.</p>
            </div>

            <div className="border-t border-[#D9E1DC] pt-6">
              <h2 className="text-xl md:text-2xl font-bold text-[#12372A] mb-4">4. "As Is" Basis</h2>
              <p className="text-[#66736D]">All information on the site is provided "as is", with no guarantee of completeness, accuracy, timeliness, or of the results obtained from the use of this information, and without warranty of any kind, express or implied.</p>
            </div>

            <div className="border-t border-[#D9E1DC] pt-6">
              <h2 className="text-xl md:text-2xl font-bold text-[#12372A] mb-4">5. External Links</h2>
              <p className="text-[#66736D]">Our website may contain links to external websites that are not provided or maintained by or in any way affiliated with LabourAxis. Please note that LabourAxis does not guarantee the accuracy, relevance, timeliness, or completeness of any information on these external websites.</p>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
