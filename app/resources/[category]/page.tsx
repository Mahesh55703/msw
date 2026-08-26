import { resourcesData } from "@/data/resources";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

const CATEGORY_MAP: Record<string, { title: string; type: string }> = {
  "guides": { title: "Guides", type: "guide" },
  "checklists": { title: "Checklists", type: "checklist" },
  "updates": { title: "Updates", type: "update" },
  "articles": { title: "Articles", type: "article" }
};

export async function generateStaticParams() {
  return Object.keys(CATEGORY_MAP).map(cat => ({ category: cat }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const categoryInfo = CATEGORY_MAP[resolvedParams.category];
  
  if (!categoryInfo) return { title: "Not Found" };
  
  return {
    title: `${categoryInfo.title} | LabourAxis Resources`,
  };
}

export default async function ResourceCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const resolvedParams = await params;
  const categoryInfo = CATEGORY_MAP[resolvedParams.category];
  
  if (!categoryInfo) notFound();

  // For FAQs, we should render the accordion view (but we will just render a list for now, or redirect to a dedicated FAQ component if needed. Let's render a clean list here).
  const items = resourcesData.filter(r => r.type === categoryInfo.type);

  return (
    <div className="flex flex-col pb-24">
      <div className="bg-slate-900 border-b border-slate-800 pt-6 pb-4">
        <div className="container mx-auto px-4 md:px-8">
          <nav className="flex text-sm text-slate-400">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight className="w-4 h-4 mx-2 mt-0.5" />
            <Link href="/resources" className="hover:text-white">Resources</Link>
            <ChevronRight className="w-4 h-4 mx-2 mt-0.5" />
            <span className="text-white">{categoryInfo.title}</span>
          </nav>
        </div>
      </div>

      <section className="bg-slate-900 text-white pt-12 pb-20">
        <div className="container mx-auto px-4 md:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{categoryInfo.title}</h1>
          <p className="text-xl text-slate-300">Browse our collection of {categoryInfo.title.toLowerCase()}.</p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl">
          {items.length === 0 ? (
            <p className="text-slate-500">No {categoryInfo.title.toLowerCase()} published yet. Check back soon.</p>
          ) : categoryInfo.type === 'faq' ? (
            <div className="space-y-4">
              {items.map(faq => (
                <details key={faq.slug} className="group bg-white border border-slate-200 rounded-lg [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer items-center justify-between p-6 font-bold text-slate-900">
                    <span className="text-lg">{faq.question}</span>
                    <span className="ml-1.5 flex-shrink-0 bg-slate-100 p-1.5 rounded-full text-slate-500 group-open:bg-blue-100 group-open:text-blue-700">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0 transition duration-300 group-open:-rotate-180" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </span>
                  </summary>
                  <div className="px-6 pb-6 text-slate-600 leading-relaxed">
                    <p>{faq.answer}</p>
                  </div>
                </details>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {items.map(item => (
                <Link key={item.slug} href={`/resources/${resolvedParams.category}/${item.slug}`} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col">
                  <div className="mb-4">
                    <span className="inline-block bg-slate-100 text-slate-700 text-xs font-bold px-2 py-1 rounded mb-3">{item.category}</span>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h2>
                    <p className="text-slate-600 line-clamp-2">{item.excerpt}</p>
                  </div>
                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100 text-sm">
                    <span className="text-slate-500">{item.publishedAt}</span>
                    <span className="font-bold text-blue-700 flex items-center">Read <ArrowRight className="w-4 h-4 ml-1" /></span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
