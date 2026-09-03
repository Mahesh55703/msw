import { resolveCmsText } from "@/lib/cms/utils";
import type { FeatureListSectionInput } from "@/lib/validations/page";

interface Props {
  content: FeatureListSectionInput;
}

export function HomeHowWeWorkVisual({ content }: Props) {
  return (
    <section className="container mx-auto px-4 md:px-8">
      <div className="max-w-3xl mx-auto mb-16 text-center">
        <span className="text-xs font-bold uppercase tracking-wider text-[#1F7A5C] bg-[#1F7A5C]/10 border border-[#1F7A5C]/20 px-3.5 py-1.5 rounded-full inline-block mb-3">
          Methodology
        </span>
        <h2 className="text-3xl md:text-4xl font-bold text-[#12372A] mb-4 tracking-tight">
          {resolveCmsText(content.heading, "How We Work")}
        </h2>
        {resolveCmsText(content.description, "A structured approach to bringing compliance under control.") && (
          <p className="text-lg text-[#66736D]">{resolveCmsText(content.description, "A structured approach to bringing compliance under control.")}</p>
        )}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {content.features.map((step, idx) => (
          <div 
            key={idx} 
            className="bg-white rounded-3xl border border-[#D9E1DC] p-6 md:p-8 relative flex flex-col shadow-xs hover:shadow-md hover:border-[#1F7A5C]/40 transition-all duration-200"
          >
            <span className="text-4xl md:text-5xl font-black text-[#D6A84F] mb-4 block">
              {`0${idx + 1}`}
            </span>
            <h3 className="text-xl font-bold text-[#12372A] mb-2">{step.title}</h3>
            <p className="text-[#66736D] text-sm leading-relaxed">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
