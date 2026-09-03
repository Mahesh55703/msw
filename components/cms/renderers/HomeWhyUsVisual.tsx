import { resolveCmsText } from "@/lib/cms/utils";
import { ClipboardCheck, Factory, Users, ShieldCheck } from "lucide-react";
import type { FeatureListSectionInput } from "@/lib/validations/page";

interface Props {
  content: FeatureListSectionInput;
}

export function HomeWhyUsVisual({ content }: Props) {
  const defaultIcons = [ClipboardCheck, Factory, Users, ShieldCheck];

  return (
    <section className="container mx-auto px-4 md:px-8">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs font-bold uppercase tracking-wider text-[#1F7A5C] bg-[#1F7A5C]/10 border border-[#1F7A5C]/20 px-3.5 py-1.5 rounded-full inline-block mb-3">
          Our Advantage
        </span>
        <h2 className="text-3xl md:text-4xl font-bold text-[#12372A] mb-4 tracking-tight">
          {resolveCmsText(content.heading, "Why businesses work with us")}
        </h2>
        {resolveCmsText(content.description, "More than routine HR paperwork. We provide structured compliance and HR support.") && (
          <p className="text-lg text-[#66736D] text-balance">
            {resolveCmsText(content.description, "More than routine HR paperwork. We provide structured compliance and HR support.")}
          </p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {content.features.map((item, idx) => {
          const Icon = defaultIcons[idx % defaultIcons.length];
          return (
            <div 
              key={idx} 
              className="bg-white p-8 md:p-10 rounded-3xl border border-[#D9E1DC] shadow-xs hover:shadow-md hover:border-[#1F7A5C]/40 transition-all duration-200 flex flex-col justify-start group"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#1F7A5C]/10 text-[#1F7A5C] flex items-center justify-center mb-6 group-hover:bg-[#1F7A5C] group-hover:text-white transition-colors duration-200 shadow-2xs">
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#12372A] mb-3 group-hover:text-[#1F7A5C] transition-colors">{item.title}</h3>
              <p className="text-[#66736D] text-base leading-relaxed">{item.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
