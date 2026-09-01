import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, ArrowRight, ShieldCheck, FileText, Calendar, Plus, CheckCircle2, BellRing } from "lucide-react";
import type { Metadata } from "next";
import prisma from '@/lib/prisma';
import { resourcesData } from "@/data/resources";

const CATEGORY_MAP: Record<string, { 
  title: string; 
  dbCategory: string; 
  heroImage: string; 
  badge: string; 
  subtitle: string;
  filters: string[];
}> = {
  "guides": { 
    title: "Guides", 
    dbCategory: "guides",
    heroImage: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1200&auto=format&fit=crop",
    badge: "Step-by-Step Manuals",
    subtitle: "Practical, operational guides for HR leadership, factory managers, and labour compliance officers.",
    filters: ["All", "Labour Compliance", "HR Operations", "Factory", "Contract Labour"]
  },
  "checklists": { 
    title: "Checklists", 
    dbCategory: "checklists",
    heroImage: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=1200&auto=format&fit=crop",
    badge: "Actionable Audits",
    subtitle: "Comprehensive statutory verification checklists to evaluate your organization's compliance standing.",
    filters: ["All", "Factory Compliance", "Contract Labour", "PF/ESIC", "HR Audit"]
  },
  "updates": { 
    title: "Statutory Updates", 
    dbCategory: "updates",
    heroImage: "https://images.unsplash.com/photo-1450133064473-71024230f91b?q=80&w=1200&auto=format&fit=crop",
    badge: "Regulatory Intelligence",
    subtitle: "Timely alerts, gazette notifications, and operational advisories on Indian labour laws, EPFO, ESIC, and minimum wages.",
    filters: ["All", "Labour Codes", "EPFO / PF", "Minimum Wages", "ESIC", "Factory Laws", "Contract Labour"]
  },
  "articles": { 
    title: "Articles & Insights", 
    dbCategory: "articles",
    heroImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1200&auto=format&fit=crop",
    badge: "In-Depth Analysis",
    subtitle: "Expert commentary and deep-dives into Indian industrial relations, workforce strategy, and statutory risk management.",
    filters: ["All", "Labour Compliance", "HR", "PF/ESIC", "Factory"]
  }
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

  // 1. Fetch from Prisma DB
  let items: any[] = [];
  try {
    items = await prisma.article.findMany({
      where: { 
        category: { in: [categoryInfo.dbCategory, resolvedParams.category, resolvedParams.category.replace(/s$/, '')] },
        published: true 
      },
      orderBy: { publishedAt: 'desc' }
    });
  } catch (e) {
    console.error("Prisma error in category page, falling back to static data", e);
  }

  // 2. Fallback to static resourcesData if DB has no items
  if (!Array.isArray(items) || items.length === 0) {
    const rawType = resolvedParams.category.replace(/s$/, '');
    const staticFiltered = resourcesData.filter(r => 
      r.type === rawType || 
      r.type + 's' === resolvedParams.category ||
      (resolvedParams.category === 'updates' && r.type === 'update') ||
      (resolvedParams.category === 'articles' && r.type === 'article') ||
      (resolvedParams.category === 'guides' && r.type === 'guide') ||
      (resolvedParams.category === 'checklists' && r.type === 'checklist')
    );

    items = staticFiltered.map(r => ({
      id: r.slug,
      title: r.title,
      slug: r.slug,
      excerpt: r.excerpt,
      content: r.content || '',
      category: r.category,
      featuredImage: r.featuredImage || categoryInfo.heroImage,
      publishedAt: new Date(r.publishedAt),
      updatedAt: r.updatedAt ? new Date(r.updatedAt) : null,
      readingTime: r.readingTime || '5 min read',
      keyTakeaways: r.keyTakeaways || []
    }));
  }

  return (
    <div className="flex flex-col pb-24 overflow-x-hidden bg-[#F7F4EC]">
      {/* Breadcrumbs */}
      <div className="bg-[#12372A] border-b border-white/10 pt-6 pb-4">
        <div className="container mx-auto px-4 md:px-8">
          <nav className="flex items-center text-xs md:text-sm text-[#A2B3AA] font-medium">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 mx-2 text-[#66736D]" />
            <Link href="/resources" className="hover:text-white transition-colors">Resources</Link>
            <ChevronRight className="w-3.5 h-3.5 mx-2 text-[#66736D]" />
            <span className="text-white">{categoryInfo.title}</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-[#12372A] text-white pt-12 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-forest opacity-30 pointer-events-none"></div>
        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-[#D6A84F] uppercase tracking-wider mb-4 bg-[#1B4E3C]/80 border border-[#D6A84F]/30 px-3.5 py-1.5 rounded-full shadow-xs">
                {resolvedParams.category === 'updates' ? (
                  <BellRing className="w-4 h-4 text-[#D6A84F]" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-[#D6A84F]" />
                )}
                <span>{categoryInfo.badge}</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight text-balance leading-tight">
                {categoryInfo.title}
              </h1>

              <p className="text-lg md:text-xl text-[#A2B3AA] leading-relaxed text-balance mb-8">
                {categoryInfo.subtitle}
              </p>

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#A2B3AA] bg-[#0D281E]/60 px-3.5 py-1.5 rounded-lg border border-white/10">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#D6A84F]" />
                  <span>{items.length} Published {categoryInfo.title}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#A2B3AA] bg-[#0D281E]/60 px-3.5 py-1.5 rounded-lg border border-white/10">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#1F7A5C]" />
                  <span>Verified Statutory Insights</span>
                </div>
              </div>
            </div>

            {/* Right Hero Image Card */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl overflow-hidden border border-white/15 shadow-2xl bg-[#0D281E] group">
                <div className="relative h-72 sm:h-80 md:h-96 w-full">
                  <Image 
                    src={categoryInfo.heroImage} 
                    alt={categoryInfo.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D281E] via-[#0D281E]/30 to-transparent"></div>
                  
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-center gap-2">
                    <span className="bg-[#12372A]/90 backdrop-blur-md text-[#D6A84F] text-xs font-bold px-3.5 py-1.5 rounded-full border border-[#D6A84F]/30 shadow-md">
                      LabourAxis Knowledge
                    </span>
                    <span className="bg-[#1F7A5C]/90 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full border border-white/20 shadow-md">
                      Updated Regularly
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 p-4 bg-[#12372A]/90 backdrop-blur-md rounded-2xl border border-white/10">
                    <p className="text-xs font-bold text-white mb-1 flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#D6A84F]" />
                      <span>{categoryInfo.title} Repository</span>
                    </p>
                    <p className="text-[11px] text-[#A2B3AA] leading-snug">Curated compliance documentation & operational frameworks</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-16">
        <div className="container mx-auto px-4 md:px-8 max-w-6xl">
          
          {/* Category Filter Pills */}
          {categoryInfo.filters && categoryInfo.filters.length > 0 && (
            <div className="mb-12">
              <div className="flex flex-wrap gap-2 pt-2">
                {categoryInfo.filters.map((f, idx) => (
                  <span 
                    key={f} 
                    className={idx === 0 
                      ? "bg-[#12372A] text-white text-xs font-bold px-4 py-2 rounded-full cursor-pointer shadow-xs"
                      : "bg-white border border-[#D9E1DC] text-[#202522] hover:bg-[#1F7A5C] hover:text-white text-xs font-bold px-4 py-2 rounded-full cursor-pointer transition-colors"
                    }
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}

          {items.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-[#D9E1DC] p-8">
              <FileText className="w-12 h-12 text-[#66736D] mx-auto mb-4" />
              <p className="text-[#202522] font-medium">No {categoryInfo.title.toLowerCase()} published yet. Check back soon.</p>
            </div>
          ) : (
            <div className={items.length === 1 ? "max-w-2xl mx-auto" : "grid md:grid-cols-2 lg:grid-cols-3 gap-8"}>
              {items.map(item => (
                <Link 
                  key={item.slug} 
                  href={`/resources/${resolvedParams.category}/${item.slug}`} 
                  className="bg-white border border-[#D9E1DC] rounded-3xl overflow-hidden shadow-xs hover:shadow-lg hover:-translate-y-1 hover:border-[#1F7A5C]/40 transition-all duration-200 flex flex-col group"
                >
                  <div className="aspect-[16/9] bg-[#F7F4EC] relative overflow-hidden border-b border-[#D9E1DC] flex items-center justify-center">
                    {item.featuredImage ? (
                      <Image src={item.featuredImage} alt={item.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#F7F4EC] to-[#EDE8DE] flex items-center justify-center text-[#66736D] group-hover:scale-105 transition-transform duration-500">
                        <span className="font-bold text-xs tracking-wider uppercase text-[#66736D]">LabourAxis Knowledge</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6 md:p-8 flex flex-col flex-1">
                    <div className="mb-4">
                      <span className="inline-block bg-[#1F7A5C]/10 border border-[#1F7A5C]/20 text-[#1F7A5C] text-[11px] font-bold px-3 py-1 rounded-md mb-3 uppercase tracking-wider">
                        {item.category || categoryInfo.title}
                      </span>
                      <h2 className="text-xl font-bold text-[#12372A] mb-2 leading-snug group-hover:text-[#1F7A5C] transition-colors">
                        {item.title}
                      </h2>
                      {item.excerpt && (
                        <p className="text-sm text-[#66736D] leading-relaxed line-clamp-3 mt-2">
                          {item.excerpt}
                        </p>
                      )}
                    </div>

                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-[#D9E1DC]/60 text-xs md:text-sm">
                      <span className="text-[#66736D] font-medium flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#66736D]" />
                        {item.scheduledAt || item.updatedAt 
                          ? `${new Date(item.scheduledAt || item.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
                          : new Date(item.publishedAt || item.createdAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                        }
                      </span>
                      <span className="font-bold text-[#1F7A5C] flex items-center group-hover:text-[#165B44] transition-colors whitespace-nowrap">
                        <span>Read {resolvedParams.category === 'articles' ? 'Article' : resolvedParams.category === 'guides' ? 'Guide' : resolvedParams.category === 'checklists' ? 'Checklist' : 'Update'}</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
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

