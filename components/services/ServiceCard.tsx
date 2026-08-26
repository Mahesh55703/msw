import { Service } from "@/data/services";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export function ServiceCard({ service }: { service: Service }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-8 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
      <h3 className="text-xl font-bold text-slate-900 mb-3">{service.title}</h3>
      <p className="text-slate-600 mb-6 flex-1">{service.heroSupportingText}</p>
      
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-slate-900 mb-2">Key Areas:</h4>
        <ul className="flex flex-wrap gap-2">
          {service.services.slice(0, 3).map((item, idx) => (
            <li key={idx} className="bg-slate-100 text-slate-700 text-xs px-2 py-1 rounded-md">
              {item.title}
            </li>
          ))}
          {service.services.length > 3 && (
            <li className="bg-slate-100 text-slate-500 text-xs px-2 py-1 rounded-md">
              +{service.services.length - 3} more
            </li>
          )}
        </ul>
      </div>

      <Link href={`/services/${service.slug}`} className={buttonVariants({ variant: "outline", className: "w-full justify-between group" })}>
        Learn more
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  );
}
