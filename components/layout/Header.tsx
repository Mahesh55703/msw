import Link from 'next/link';
import Image from 'next/image';
import { mainNav } from '@/data/navigation';
import { Button, buttonVariants } from '@/components/ui/button';
import MobileNav from './MobileNav';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-24 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/logo-transparent.png" alt="LabourAxis Logo" width={400} height={100} className="object-contain h-20 w-auto" priority />
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {mainNav.map((item) => (
            item.items ? (
              <div key={item.href} className="relative group">
                <Link
                  href={item.href}
                  className="flex items-center gap-1 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 py-2"
                >
                  {item.title}
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70 group-hover:rotate-180 transition-transform"><path d="m6 9 6 6 6-6"/></svg>
                </Link>
                <div className="absolute left-0 top-full hidden group-hover:block w-72 pt-2">
                  <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-2 flex flex-col gap-1">
                    {item.items.map((subItem) => (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className="text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-3 py-2 rounded-md transition-colors"
                      >
                        {subItem.title}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
              >
                {item.title}
              </Link>
            )
          ))}
        </nav>

        <div className="hidden md:flex items-center">
          <Link href="/contact" className={buttonVariants({ className: "bg-slate-900 text-white hover:bg-slate-800" })}>
            Request Consultation
          </Link>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden">
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
