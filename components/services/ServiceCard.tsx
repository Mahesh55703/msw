import { Service } from "@/data/services";
import { ArrowRight, ShieldCheck, Briefcase, FileCheck, Users, Factory, Scale, FileSpreadsheet } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

const SERVICE_ICONS: Record<string, any> = {
  "hr-consulting": Briefcase,
  "labour-compliance": ShieldCheck,
  "pf-esic-compliance": FileCheck,
  "payroll-hr-operations": FileSpreadsheet,
  "factory-compliance": Factory,
  "contract-labour-compliance": Users,
  "industrial-relations": Scale,
};

export function ServiceCard({ service }: { service: Service }) {
  const IconComponent = SERVICE_ICONS[service.slug] || ShieldCheck;

  return (
    <div className="bg-white rounded-3xl border border-[#D9E1DC] p-8 shadow-xs flex flex-col h-full hover:shadow-lg hover:-translate-y-1 hover:border-[#1F7A5C]/40 transition-all duration-200 group">
      
      {/* Header with Icon & Category */}
      <div className="flex items-center justify-between mb-6">
        <div className="w-12 h-12 rounded-2xl bg-[#1F7A5C]/10 text-[#1F7A5C] flex items-center justify-center group-hover:bg-[#1F7A5C] group-hover:text-white transition-colors duration-200 shadow-2xs">
          <IconComponent className="w-6 h-6" />
        </div>
        <span className="text-[11px] font-bold text-[#1F7A5C] bg-[#1F7A5C]/10 border border-[#1F7A5C]/20 px-3 py-1 rounded-md uppercase tracking-wider">
          {service.category}
        </span>
      </div>

      <h3 className="text-xl font-bold text-[#12372A] mb-3 group-hover:text-[#1F7A5C] transition-colors">
        {service.title}
      </h3>
      
      <p className="text-[#66736D] text-sm leading-relaxed mb-6 flex-1">
        {service.heroSupportingText}
      </p>
      
      {/* Key Features Chips */}
      <div className="mb-6 pt-4 border-t border-[#D9E1DC]/60">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#66736D] mb-3">Key Areas:</h4>
        <div className="flex flex-wrap gap-1.5">
          {service.services.slice(0, 3).map((item, idx) => (
            <span key={idx} className="bg-[#F7F4EC] text-[#202522] text-xs px-2.5 py-1 rounded-lg font-medium border border-[#D9E1DC]/50">
              {item.title}
            </span>
          ))}
          {service.services.length > 3 && (
            <span className="bg-[#F7F4EC]/60 text-[#66736D] text-xs px-2 py-1 rounded-lg font-medium">
              +{service.services.length - 3} more
            </span>
          )}
        </div>
      </div>

      <Link 
        href={`/services/${service.slug}`} 
        className={buttonVariants({ 
          variant: "outline", 
          className: "w-full justify-between font-bold text-[#12372A] hover:text-white hover:bg-[#1F7A5C] hover:border-[#1F7A5C] border-[#D9E1DC] rounded-xl transition-all" 
        })}
      >
        <span>Explore Service</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  );
}
