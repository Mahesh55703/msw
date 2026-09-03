import { resolveCmsText } from "@/lib/cms/utils";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import type { CtaBannerSectionInput } from "@/lib/validations/page";

interface Props {
  content: CtaBannerSectionInput;
}

export function HomeCtaBannerVisual({ content }: Props) {
  return (
    <section className="container mx-auto px-4 md:px-8">
      <div className="bg-[#12372A] text-white rounded-3xl p-10 md:p-16 text-center max-w-4xl mx-auto relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-grid-forest opacity-30 pointer-events-none"></div>
        <div className="relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-balance">
            {resolveCmsText(content.heading, "Not sure where your compliance gaps are?")}
          </h2>
          {resolveCmsText(content.description, "Request a preliminary compliance discussion and understand which areas of your workforce operations may need attention.") && (
            <p className="text-[#A2B3AA] text-base md:text-lg mb-8 max-w-2xl mx-auto leading-relaxed text-balance">
              {resolveCmsText(content.description, "Request a preliminary compliance discussion and understand which areas of your workforce operations may need attention.")}
            </p>
          )}
          {content.primaryCta && (
            <TrackedCtaLink 
              href={content.primaryCta.url} 
              ctaLocation="home_bottom_banner"
              ctaLabel={content.primaryCta.label}
              pageType="home"
              className={buttonVariants({ 
                size: "lg", 
                className: "bg-[#1F7A5C] hover:bg-[#165B44] text-white font-bold text-base px-8 py-4 rounded-xl shadow-lg transition-all group" 
              })}
            >
              <span>{content.primaryCta.label}</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </TrackedCtaLink>
          )}
        </div>
      </div>
    </section>
  );
}
