import { resolveCmsText } from "@/lib/cms/utils";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Scale, Check } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import type { HeroSectionInput } from "@/lib/validations/page";

interface Props {
  content: HeroSectionInput;
}

export function HomeHeroVisual({ content }: Props) {
  return (
    <div className="relative">
      <section className="bg-[#12372A] text-white pt-16 md:pt-24 pb-28 md:pb-36 relative overflow-hidden">
        {/* Ambient Background Grid */}
        <div className="absolute inset-0 bg-grid-forest opacity-30 pointer-events-none"></div>
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#1F7A5C]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Hero Content */}
            <div className="lg:col-span-7 max-w-2xl">
              {resolveCmsText(content.eyebrow, "Industrial HR & Labour Compliance Consultancy") && (
                <div className="inline-flex items-center gap-2 text-xs font-bold text-[#D6A84F] uppercase tracking-wider mb-6 bg-[#1B4E3C]/80 border border-[#D6A84F]/30 px-4 py-1.5 rounded-full shadow-xs">
                  <ShieldCheck className="w-4 h-4 text-[#D6A84F]" />
                  <span>{resolveCmsText(content.eyebrow, "Industrial HR & Labour Compliance Consultancy")}</span>
                </div>
              )}

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-balance leading-[1.12] text-white">
                {resolveCmsText(content.heading, 'Simplify HR. Strengthen Compliance. Reduce Risk.').split('Strengthen Compliance.').map((part, i, arr) => (
                  <span key={i}>
                    {part}
                    {i === 0 && arr.length > 1 && (
                      <span className="text-[#D6A84F]">Strengthen Compliance.</span>
                    )}
                  </span>
                ))}
              </h1>

              {resolveCmsText(content.description, "Industrial HR, Labour & Statutory Compliance solutions for factories, MSMEs and growing businesses.") && (
                <p className="text-lg md:text-xl text-[#A2B3AA] mb-10 text-balance leading-relaxed">
                  {resolveCmsText(content.description, "Industrial HR, Labour & Statutory Compliance solutions for factories, MSMEs and growing businesses.")}
                </p>
              )}

              <div className="flex flex-col sm:flex-row gap-4">
                {content.primaryCta && (
                  <TrackedCtaLink 
                    href={content.primaryCta.url} 
                    ctaLocation="home_hero"
                    ctaLabel={content.primaryCta.label}
                    pageType="home"
                    className={buttonVariants({ 
                      size: "lg", 
                      className: "bg-[#1F7A5C] hover:bg-[#165B44] text-white font-bold text-base px-8 py-4 rounded-xl shadow-lg transition-all duration-200 group" 
                    })}
                  >
                    <span>{content.primaryCta.label}</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </TrackedCtaLink>
                )}
                {content.secondaryCta && (
                  <Link 
                    href={content.secondaryCta.url} 
                    className={buttonVariants({ 
                      size: "lg", 
                      variant: "outline", 
                      className: "bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30 text-base px-8 py-4 rounded-xl transition-all duration-200" 
                    })}
                  >
                    {content.secondaryCta.label}
                  </Link>
                )}
              </div>
            </div>

            {/* Right Column: Hero Visual Graphic */}
            <div className="lg:col-span-5 relative hidden lg:block">
              <div className="relative mx-auto rounded-3xl overflow-hidden border border-white/15 shadow-2xl bg-[#0D281E] group">
                <div className="aspect-[4/3] relative">
                  <Image 
                    src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1000&q=80" 
                    alt={resolveCmsText(content.mediaAlt, "Industrial factory operations and engineering workforce compliance")}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-95" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D281E] via-[#0D281E]/30 to-transparent"></div>

                  {/* Floating Top Badge */}
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-center gap-2">
                    <span className="bg-[#12372A]/90 backdrop-blur-md text-[#D6A84F] text-xs font-bold px-3.5 py-1.5 rounded-full border border-[#D6A84F]/30 shadow-md">
                      Statutory Precision
                    </span>
                    <span className="bg-[#1F7A5C]/90 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full border border-white/20 shadow-md">
                      Pan-India
                    </span>
                  </div>
                </div>

                {/* Floating Trust Card Overlay */}
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-[#12372A]/90 backdrop-blur-md border border-white/10 text-white flex items-center gap-3 shadow-xl">
                  <div className="w-10 h-10 rounded-xl bg-[#1F7A5C]/20 border border-[#D6A84F]/40 flex items-center justify-center text-[#D6A84F] shrink-0">
                    <Scale className="w-5 h-5" />
                  </div>
                  <div className="text-xs">
                    <div className="font-bold text-white text-sm">Labour & Statutory Alignment</div>
                    <div className="text-[#A2B3AA]">Factories &middot; MSMEs &middot; Contractors</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Floating Trust Strip */}
      <div className="container mx-auto px-4 md:px-8 -mt-10 md:-mt-14 relative z-20">
        <div className="bg-white rounded-3xl shadow-xl border border-[#D9E1DC] p-6 md:p-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            {[
              "HR Operations",
              "Labour Compliance",
              "PF / ESIC",
              "Factory Compliance",
              "Contract Labour",
              "Industrial Relations"
            ].map((highlight, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-xs md:text-sm font-bold text-[#202522]">
                <div className="w-6 h-6 rounded-full bg-[#1F7A5C]/10 text-[#1F7A5C] flex items-center justify-center shrink-0 border border-[#1F7A5C]/20">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <span className="truncate">{highlight}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
