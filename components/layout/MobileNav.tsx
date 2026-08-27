"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ChevronDown, ChevronRight, X } from "lucide-react";
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

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  // Sync openAccordion with current route when drawer is opened
  useEffect(() => {
    if (open) {
      const activeItem = mainNav.find(item => 
        item.items && item.items.some(sub => pathname === sub.href || pathname.startsWith(sub.href))
      );
      setOpenAccordion(activeItem ? activeItem.title : null);
    }
  }, [open, pathname]);

  const toggleAccordion = (title: string) => {
    setOpenAccordion(prev => (prev === title ? null : title));
  };

  const handleLinkClick = () => {
    setOpen(false);
    // Reset happens on next open due to useEffect
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open navigation" />
        }
      >
        <Menu className="h-6 w-6" />
      </SheetTrigger>
      
      <SheetContent
        side="right"
        className="w-[85vw] max-w-[400px] p-0 flex flex-col h-[100dvh]"
        showCloseButton={false}
      >
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        
        {/* Header of Drawer */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0">
          <Link
            href="/"
            className="flex items-center"
            onClick={handleLinkClick}
          >
            <span className="text-xl font-bold text-slate-900">LabourAxis</span>
          </Link>
          <SheetClose
            render={<Button variant="ghost" size="icon" aria-label="Close navigation" />}
          >
            <X className="h-6 w-6" />
          </SheetClose>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <nav className="flex flex-col px-6 py-4">
            {mainNav.map((item) => {
              const hasItems = item.items && item.items.length > 0;
              const isAccordion = hasItems;
              const isOpen = openAccordion === item.title;

              if (isAccordion) {
                const sectionId = `mobile-${item.title.toLowerCase().replace(/\s+/g, '-')}-menu`;
                return (
                  <div key={item.href} className="flex flex-col border-b border-slate-100">
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={sectionId}
                      onClick={() => toggleAccordion(item.title)}
                      className="flex items-center justify-between py-4 w-full text-left text-lg font-bold text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                    >
                      {item.title}
                      <ChevronDown
                        className={cn(
                          "h-5 w-5 text-slate-500 transition-transform duration-200",
                          isOpen ? "rotate-180" : ""
                        )}
                      />
                    </button>
                    
                    <div
                      id={sectionId}
                      className={cn(
                        "overflow-hidden transition-all duration-200",
                        isOpen ? "max-h-[1000px] pb-4 opacity-100" : "max-h-0 opacity-0"
                      )}
                    >
                      <div className="flex flex-col gap-3 pl-4 border-l-2 border-slate-100 ml-2">
                        {item.items!.map((subItem) => {
                          const isSubActive = pathname === subItem.href;
                          return (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              onClick={handleLinkClick}
                              className={cn(
                                "text-base py-1 font-medium hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 min-h-[44px] flex items-center",
                                isSubActive ? "text-slate-900 font-bold" : "text-slate-600"
                              )}
                            >
                              {subItem.title}
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
                <div key={item.href} className="border-b border-slate-100">
                  <Link
                    href={item.href}
                    onClick={handleLinkClick}
                    className="flex items-center justify-between py-4 text-lg font-bold text-slate-900 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 min-h-[44px]"
                  >
                    {item.title}
                    {item.title !== "Home" && (
                      <ChevronRight className="h-5 w-5 text-slate-500" />
                    )}
                  </Link>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Footer with CTA */}
        <div className="p-6 border-t border-slate-100 shrink-0 bg-white">
          <Link
            href="/contact"
            onClick={handleLinkClick}
            className={buttonVariants({ className: "w-full bg-slate-900 text-white hover:bg-slate-800 h-12 text-base font-medium" })}
          >
            Request Consultation
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
