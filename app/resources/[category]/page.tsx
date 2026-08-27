
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

import prisma from '@/lib/prisma'

const CATEGORY_MAP: Record<string, { title: string; dbCategory: string }> = {
  "guides": { title: "Guides", dbCategory: "guides" },
  "checklists": { title: "Checklists", dbCategory: "checklists" },
  "updates": { title: "Updates", dbCategory: "updates" },
  "articles": { title: "Articles", dbCategory: "articles" }
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
    description: `Browse all LabourAxis ${categoryInfo.title.toLowerCase()} regarding HR, PF, ESIC and labour compliance.`,
    alternates: {
      canonical: `/resources/${resolvedParams.category}`
    }
  };
}

export default async function ResourceCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const resolvedParams = await params;
  const categoryInfo = CATEGORY_MAP[resolvedParams.category];
  
  if (!categoryInfo) notFound();

  // Fetch from Prisma DB
  const items = await prisma.article.findMany({
    where: { 
      category: categoryInfo.dbCategory,
      published: true 
    },
    orderBy: { publishedAt: 'desc' }
  });

  return (
    <div className="flex flex-col">
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

      <section className="bg-slate-900 text-white pt-12 pb-16">
        <div className="container mx-auto px-4 md:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{categoryInfo.title}</h1>
          <p className="text-xl text-slate-300">
            {resolvedParams.category === 'articles' 
              ? "Practical insights on HR, labour compliance, industrial relations and workforce management." 
              : resolvedParams.category === 'guides'
              ? "Practical guides for HR, labour compliance and workforce management."
              : `Browse our collection of ${categoryInfo.title.toLowerCase()}.`}
          </p>
        </div>
      </section>

      <section className="py-12 mb-12">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl">
          
          {resolvedParams.category === 'articles' && (
            <div className="mb-12">
              <div className="max-w-md mb-6">
                <input type="text" placeholder="Search articles..." className="w-full h-12 rounded-lg border border-slate-200 px-4 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-slate-900" />
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="bg-slate-900 text-white text-sm font-semibold px-4 py-2 rounded-full cursor-pointer">All</span>
                <span className="bg-slate-100 text-slate-700 hover:bg-slate-200 text-sm font-semibold px-4 py-2 rounded-full cursor-pointer transition-colors">Labour Compliance</span>
                <span className="bg-slate-100 text-slate-700 hover:bg-slate-200 text-sm font-semibold px-4 py-2 rounded-full cursor-pointer transition-colors">HR</span>
                <span className="bg-slate-100 text-slate-700 hover:bg-slate-200 text-sm font-semibold px-4 py-2 rounded-full cursor-pointer transition-colors">PF/ESIC</span>
                <span className="bg-slate-100 text-slate-700 hover:bg-slate-200 text-sm font-semibold px-4 py-2 rounded-full cursor-pointer transition-colors">Factory</span>
              </div>
            </div>
          )}

          {items.length === 0 ? (
            <p className="text-slate-500">No {categoryInfo.title.toLowerCase()} published yet. Check back soon.</p>
          ) : resolvedParams.category === 'faqs' ? (
            <div className="space-y-4">
              {items.map(faq => (
                <details key={faq.slug} className="group bg-white border border-slate-200 rounded-lg [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer items-center justify-between p-6 font-bold text-slate-900">
                    <span className="text-lg">{faq.title}</span>
                    <span className="ml-1.5 flex-shrink-0 bg-slate-100 p-1.5 rounded-full text-slate-500 group-open:bg-blue-100 group-open:text-blue-700">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0 transition duration-300 group-open:-rotate-180" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </span>
                  </summary>
                  <div className="px-6 pb-6 text-slate-600 leading-relaxed prose max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: faq.content }} />
                  </div>
                </details>
              ))}
            </div>
          ) : (
            <div className={items.length === 1 ? "max-w-2xl mx-auto" : "grid md:grid-cols-2 lg:grid-cols-3 gap-8"}>
              {items.map(item => (
                <Link key={item.slug} href={`/resources/${resolvedParams.category}/${item.slug}`} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col group">
                  <div className="aspect-video bg-slate-100 relative overflow-hidden border-b border-slate-100 flex items-center justify-center">
                    {item.featuredImage ? (
                      <img src={item.featuredImage} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400 group-hover:scale-105 transition-transform duration-500">
                        <span className="font-semibold text-sm">LabourAxis</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="mb-4">
                      <span className="inline-block bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-md mb-3 uppercase tracking-wider">{item.category}</span>
                      <h2 className="text-xl font-bold text-slate-900 mb-2 leading-tight group-hover:text-blue-700 transition-colors">{item.title}</h2>
                    </div>
                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100 text-sm">
                      <span className="text-slate-500 font-medium truncate pr-4">
                        
                        {item.updatedAt 
                          ? `${item.category === 'guides' ? 'Updated' : 'Updated'} ${new Date(item.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
                          : new Date(item.publishedAt || item.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                        }
                      </span>
                      <span className="font-bold text-slate-900 flex items-center group-hover:text-blue-700 transition-colors whitespace-nowrap">
                        Read {item.category === 'guides' ? 'Guide' : item.category === 'articles' ? 'Article' : 'Resource'} <ArrowRight className="w-4 h-4 ml-1" />
                      </span>
                    </div>
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
