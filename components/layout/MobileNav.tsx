"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/lib/site-config";
import { Menu, ChevronDown, ChevronRight, X, Mail, ArrowRight } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetClose
} from "@/components/ui/sheet";
import { mainNav } from "@/data/navigation";
import { cn } from "@/lib/utils";
import {
  trackConsultationCta,
  trackEmailClick
} from "@/lib/analytics";

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      const activeItem = mainNav.find(item => 
        item.items && item.items.some(sub => pathname === sub.href || pathname.startsWith(sub.href))
      );
      setOpenAccordion(activeItem ? activeItem.title : null);
    }
  };

  const toggleAccordion = (title: string) => {
    setOpenAccordion(prev => (prev === title ? null : title));
  };

  const handleLinkClick = () => {
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger
        render={
          <Button 
            variant="outline" 
            size="icon" 
            className="lg:hidden h-10 w-10 border-[#D9E1DC] text-[#202522] hover:bg-[#F7F4EC] hover:text-[#12372A] rounded-xl" 
            aria-label="Open navigation" 
          />
        }
      >
        <Menu className="h-5 w-5" />
      </SheetTrigger>
      
      <SheetContent
        side="right"
        className="w-[88vw] max-w-[380px] p-0 flex flex-col h-[100dvh] bg-[#FFFFFF] border-l border-[#D9E1DC]"
        showCloseButton={false}
      >
        <SheetTitle className="sr-only">Mobile Navigation Menu</SheetTitle>
        
        {/* Header of Drawer */}
        <div className="flex items-center justify-between p-5 border-b border-[#D9E1DC] shrink-0 bg-[#F7F4EC]">
          <Link
            href="/"
            className="flex items-center"
            onClick={handleLinkClick}
          >
            <Image 
              src="/logo-transparent.png" 
              alt="LabourAxis Logo" 
              width={180} 
              height={45} 
              className="object-contain h-10 w-auto" 
            />
          </Link>
          <SheetClose
            render={<Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-[#66736D] hover:text-[#202522] hover:bg-[#D9E1DC]/50" aria-label="Close navigation" />}
          >
            <X className="h-5 w-5" />
          </SheetClose>
        </div>

        {/* Scrollable Navigation List */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden bg-[#FFFFFF]">
          <nav className="flex flex-col px-4 py-3">
            {mainNav.map((item) => {
              const hasItems = item.items && item.items.length > 0;
              const isAccordion = hasItems;
              const isOpen = openAccordion === item.title;
              const isDirectActive = pathname === item.href;

              if (isAccordion) {
                const sectionId = `mobile-${item.title.toLowerCase().replace(/\s+/g, '-')}-menu`;
                return (
                  <div key={item.href} className="flex flex-col border-b border-[#D9E1DC]/60 py-1">
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={sectionId}
                      onClick={() => toggleAccordion(item.title)}
                      className={cn(
                        "flex items-center justify-between py-3 px-3 w-full text-left font-bold rounded-xl transition-colors cursor-pointer",
                        isOpen ? "text-[#1F7A5C] bg-[#1F7A5C]/10" : "text-[#202522] hover:bg-[#F7F4EC]"
                      )}
                    >
                      <span className="text-base">{item.title}</span>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 text-[#66736D] transition-transform duration-200",
                          isOpen ? "rotate-180 text-[#1F7A5C]" : ""
                        )}
                      />
                    </button>
                    
                    <div
                      id={sectionId}
                      className={cn(
                        "overflow-hidden transition-all duration-200",
                        isOpen ? "max-h-[1000px] pb-3 opacity-100" : "max-h-0 opacity-0"
                      )}
                    >
                      <div className="flex flex-col gap-1 pl-3 pr-1 border-l-2 border-[#1F7A5C] ml-3 my-1">
                        {item.items!.map((subItem) => {
                          const isSubActive = pathname === subItem.href;
                          return (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              onClick={handleLinkClick}
                              className={cn(
                                "text-sm py-2 px-2.5 rounded-xl font-medium transition-colors flex items-center justify-between",
                                isSubActive 
                                  ? "text-[#1F7A5C] bg-[#1F7A5C]/10 font-bold" 
                                  : "text-[#66736D] hover:text-[#202522] hover:bg-[#F7F4EC]"
                              )}
                            >
                              <span>{subItem.title}</span>
                              {isSubActive && <span className="w-1.5 h-1.5 rounded-full bg-[#1F7A5C]"></span>}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              }

              // Direct link
              return (
                <div key={item.href} className="border-b border-[#D9E1DC]/60 py-1">
                  <Link
                    href={item.href}
                    onClick={handleLinkClick}
                    className={cn(
                      "flex items-center justify-between py-3 px-3 font-bold rounded-xl transition-colors",
                      isDirectActive 
                        ? "text-[#1F7A5C] bg-[#1F7A5C]/10" 
                        : "text-[#202522] hover:bg-[#F7F4EC]"
                    )}
                  >
                    <span className="text-base">{item.title}</span>
                    {item.title !== "Home" && (
                      <ChevronRight className="h-4 w-4 text-[#66736D]" />
                    )}
                  </Link>
                </div>
              );
            })}
          </nav>

          {/* Quick Contact Box */}
          <div className="mx-4 my-4 p-4 rounded-2xl bg-[#F7F4EC] border border-[#D9E1DC] text-xs text-[#66736D] space-y-2">
            <div className="font-bold text-[#12372A] uppercase tracking-wider text-[10px]">Contact Assistance</div>
            {siteConfig.contact.phone && (
              <a 
                href={`tel:${siteConfig.contact.phone.replace(/[^0-9+]/g, '')}`} 
                onClick={() => {
                  trackConsultationCta('mobile_nav', 'phone', 'contact');
                  setOpen(false);
                }}
                className="flex items-center gap-2 text-[#66736D] hover:text-[#1F7A5C]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-[#1F7A5C]"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <span>{siteConfig.contact.phone}</span>
              </a>
            )}
            {siteConfig.contact.whatsapp && (
              <a 
                href={`https://wa.me/${siteConfig.contact.whatsapp.replace(/[^0-9]/g, '')}`} 
                onClick={() => {
                  trackConsultationCta('mobile_nav', 'whatsapp', 'contact');
                  setOpen(false);
                }}
                className="flex items-center gap-2 text-[#66736D] hover:text-[#1F7A5C]"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-[#1F7A5C]"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                <span>WhatsApp Chat</span>
              </a>
            )}
            <a 
              href={`mailto:${siteConfig.contact.email}`} 
              onClick={() => {
                trackEmailClick('mobile_nav', 'navigation');
                setOpen(false);
              }}
              className="flex items-center gap-2 text-[#66736D] hover:text-[#1F7A5C]"
            >
              <Mail className="w-3.5 h-3.5 text-[#1F7A5C]" />
              <span>{siteConfig.contact.email}</span>
            </a>
          </div>
        </div>

        {/* Footer with CTA */}
        <div className="p-4 border-t border-[#D9E1DC] shrink-0 bg-[#FFFFFF] shadow-2xs">
          <Link
            href="/contact"
            onClick={() => {
              handleLinkClick();
              trackConsultationCta('mobile_nav', 'Request Consultation', 'navigation');
            }}
            className={buttonVariants({ className: "w-full bg-[#1F7A5C] hover:bg-[#165B44] text-white h-11 text-sm font-bold rounded-xl shadow-xs" })}
          >
            <span>Request Consultation</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
