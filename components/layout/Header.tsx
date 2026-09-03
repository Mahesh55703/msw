'use client';

import Link from 'next/link';
import Image from 'next/image';
import { mainNav } from '@/data/navigation';
import { buttonVariants } from '@/components/ui/button';
import { ChevronDown, ArrowRight } from 'lucide-react';
import MobileNav from './MobileNav';
import { trackConsultationCta } from '@/lib/analytics';
import { useSiteConfig } from '@/components/layout/SiteConfigProvider';

export default function Header() {
  const siteConfig = useSiteConfig();
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#D9E1DC] bg-[#FFFFFF]/95 backdrop-blur-md transition-all duration-200 shadow-2xs">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-8">
        
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center group transition-transform duration-200 hover:scale-[1.01]">
            <Image 
              src="/logo-transparent.png" 
              alt="LabourAxis Logo" 
              width={260} 
              height={65} 
              className="object-contain h-14 md:h-16 w-auto" 
              priority 
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {mainNav.map((item) => (
            item.items ? (
              <div key={item.href} className="relative group">
                <Link
                  href={item.href}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-[#202522] hover:text-[#1F7A5C] rounded-xl hover:bg-[#F7F4EC] transition-all duration-200"
                >
                  <span>{item.title}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#66736D] group-hover:text-[#1F7A5C] group-hover:rotate-180 transition-transform duration-200" />
                </Link>
                
                {/* Dropdown Menu */}
                <div className="absolute left-0 top-full hidden group-hover:block w-80 pt-2.5 z-50 animate-in fade-in-50 zoom-in-95 duration-150">
                  <div className="bg-white rounded-2xl shadow-xl border border-[#D9E1DC] p-3 flex flex-col gap-1 ring-1 ring-black/5">
                    <div className="px-3 py-1.5 text-[11px] font-bold text-[#66736D] uppercase tracking-wider border-b border-[#D9E1DC]/60 mb-1">
                      {item.title} Directory
                    </div>
                    {item.items.map((subItem) => (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className="group/item flex items-center justify-between text-sm font-medium text-[#202522] hover:text-[#1F7A5C] hover:bg-[#F7F4EC] px-3 py-2.5 rounded-xl transition-all duration-150"
                      >
                        <span className="truncate">{subItem.title}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#1F7A5C] opacity-0 -translate-x-1 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all" />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="px-3.5 py-2 text-sm font-semibold text-[#202522] hover:text-[#1F7A5C] rounded-xl hover:bg-[#F7F4EC] transition-all duration-200"
              >
                {item.title}
              </Link>
            )
          ))}
        </nav>

        {/* Action Button & Mobile Nav Trigger */}
        <div className="flex items-center gap-3">
          <Link 
            href="/contact" 
            onClick={() => trackConsultationCta('header', 'Request Consultation', 'navigation')}
            className={buttonVariants({ 
              className: "hidden md:inline-flex bg-[#1F7A5C] hover:bg-[#165B44] text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-xs transition-all duration-200 group" 
            })}
          >
            <span>Request Consultation</span>
            <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform duration-200" />
          </Link>

          {/* Mobile Nav Button */}
          <div className="lg:hidden">
            <MobileNav />
          </div>
        </div>

      </div>
    </header>
  );
}
