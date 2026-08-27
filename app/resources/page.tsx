import { resourcesData } from "@/data/resources";
import Link from "next/link";
import { BookOpen, CheckSquare, HelpCircle, Bell, FileText, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HR & Labour Compliance Resources | LabourAxis",
  description: "Access LabourAxis resources including guides, articles, checklists, and updates to stay compliant with Indian labour laws and statutory regulations.",
  alternates: {
    canonical: "/resources"
  }
};

const CATEGORIES = [
  {
    id: "guides",
    title: "Guides",
    description: "Detailed explanations of HR and compliance topics.",
    icon: BookOpen,
    href: "/resources/guides",
    linkText: "Explore Guides"
  },
  {
    id: "checklists",
    title: "Checklists",
    description: "Practical checklists businesses can use to review their processes.",
    icon: CheckSquare,
    href: "/resources/checklists",
    linkText: "Explore Checklists"
  },
  {
    id: "faqs",
    title: "FAQs",
    description: "Straightforward answers to common HR and compliance questions.",
    icon: HelpCircle,
    href: "/resources/faqs",
    linkText: "Browse FAQs"
  },
  {
    id: "updates",
    title: "Updates",
    description: "Important labour and compliance developments.",
    icon: Bell,
    href: "/resources/updates",
    linkText: "View Updates"
  },
  {
    id: "articles",
    title: "Articles",
    description: "Practical insights for HR teams and business owners.",
    icon: FileText,
    href: "/resources/articles",
    linkText: "Read Articles"
  }
];

export default function ResourcesHubPage() {
  const featuredResources = resourcesData.filter(r => r.featured).slice(0, 3);

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-slate-900 text-white py-20">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">HR, Labour & Compliance Resources</h1>
            <p className="text-xl text-slate-300">
              Practical guides, checklists, FAQs and compliance insights to help businesses understand and manage HR and labour requirements.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Resources (Optional but good UX) */}
      {featuredResources.length > 0 && (
        <section className="py-12 bg-slate-50 border-b border-slate-200">
          <div className="container mx-auto px-4 md:px-8">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-6">Featured Resources</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {featuredResources.map(resource => (
                <Link key={resource.slug} href={`/resources/${resource.type}s/${resource.slug}`} className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                  <span className="text-xs font-bold text-blue-700 uppercase mb-2 tracking-wider">{resource.type}</span>
                  <h3 className="font-bold text-slate-900 text-lg mb-2">{resource.title}</h3>
                  <p className="text-slate-600 text-sm line-clamp-2">{resource.excerpt}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories Grid */}
      <section className="py-24">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-8">
            {CATEGORIES.map((cat) => (
              <div key={cat.id} className="bg-white border border-slate-200 p-8 rounded-xl shadow-sm hover:border-slate-400 transition-colors flex flex-col">
                <div className="w-12 h-12 bg-slate-100 text-slate-700 rounded-lg flex items-center justify-center mb-6">
                  <cat.icon className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3">{cat.title}</h2>
                <p className="text-slate-600 mb-8 flex-1 text-lg">{cat.description}</p>
                <Link href={cat.href} className="inline-flex items-center font-bold text-blue-700 hover:text-blue-800 hover:underline">
                  {cat.linkText} <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
