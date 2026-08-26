"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { mainNav } from "@/data/navigation";

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" />}>
        <Menu className="h-6 w-6" />
        <span className="sr-only">Toggle Menu</span>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px]">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <div className="flex flex-col gap-6 py-6">
          <Link
            href="/"
            className="flex items-center"
            onClick={() => setOpen(false)}
          >
            <span className="text-xl font-bold">LabourAxis</span>
          </Link>
          <nav className="flex flex-col gap-4">
            {mainNav.map((item) => (
              <div key={item.href} className="flex flex-col">
                <Link
                  href={item.href}
                  className="text-lg font-bold text-slate-900 py-2 border-b border-slate-100"
                  onClick={() => setOpen(false)}
                >
                  {item.title}
                </Link>
                {item.items && (
                  <div className="flex flex-col ml-4 mt-2 gap-3 border-l-2 border-slate-100 pl-4">
                    {item.items.map((subItem) => (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className="text-base font-medium text-slate-600 hover:text-slate-900"
                        onClick={() => setOpen(false)}
                      >
                        {subItem.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="pt-6 border-t">
              <Link href="/contact" onClick={() => setOpen(false)} className={buttonVariants({ className: "w-full bg-slate-900 text-white hover:bg-slate-800" })}>
                Request Consultation
              </Link>
            </div>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}
