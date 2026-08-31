import prisma from '@/lib/prisma';
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronRight, ArrowRight, User, Calendar, Clock, List as ListIcon, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import { resourcesData } from '@/data/resources';

export async function generateStaticParams() {
  let dbArticles: any[] = [];
  try {
    dbArticles = await prisma.article.findMany({ select: { slug: true, category: true }, where: { category: { not: 'faqs' } } });
  } catch (e) {
    console.error("Prisma error in generateStaticParams", e);
  }

  const staticArticles = resourcesData.map(r => ({
    category: r.type === 'guide' ? 'guides' : r.type === 'checklist' ? 'checklists' : r.type === 'update' ? 'updates' : 'articles',
    slug: r.slug
  }));

  const map = new Map<string, { category: string; slug: string }>();
  for (const a of staticArticles) map.set(a.slug, a);
  if (Array.isArray(dbArticles)) {
    for (const a of dbArticles) map.set(a.slug, { category: a.category, slug: a.slug });
  }

  return Array.from(map.values());
}

export async function generateMetadata({ params }: { params: Promise<{ category: string; slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  let resource: any = null;
  try {
    resource = await prisma.article.findUnique({ where: { slug: resolvedParams.slug } });
  } catch (e) {
    // ignore
  }

  if (!resource) {
    const staticItem = resourcesData.find(r => r.slug === resolvedParams.slug);
    if (staticItem) {
      resource = {
        title: staticItem.title,
        seoTitle: staticItem.seoTitle || staticItem.title,
        metaDescription: staticItem.seoDescription || staticItem.excerpt,
        excerpt: staticItem.excerpt,
        canonicalUrl: `/resources/${resolvedParams.category}/${staticItem.slug}`,
        featuredImage: staticItem.featuredImage
      };
    }
  }
  
  if (!resource) return { title: "Not Found" };
  
  return {
    title: resource.seoTitle || `${resource.title} | LabourAxis`,
    description: resource.metaDescription || resource.excerpt || '',
    alternates: {
      canonical: resource.canonicalUrl || `/resources/${resolvedParams.category}/${resource.slug}`
    },
    openGraph: {
      title: resource.seoTitle || resource.title,
      description: resource.metaDescription || resource.excerpt || '',
      images: [resource.ogImage || resource.featuredImage || '/logo-transparent.png']
    }
  };
}

const AVAILABLE_SERVICES: Record<string, string> = {
  'hr-consulting': 'Practical HR Consulting for Growing Businesses',
  'labour-compliance': 'Labour & Statutory Compliance Support for Businesses',
  'pf-esic-compliance': 'PF / ESIC Compliance',
  'payroll-compliance': 'Payroll & HR Operations',
  'payroll-hr-operations': 'Payroll & HR Operations',
  'factory-compliance': 'Factory & Industrial Compliance',
  'contract-labour': 'Contract Labour Compliance',
  'contract-labour-compliance': 'Contract Labour Compliance',
  'compliance-health-check': 'Labour Compliance Health Checks & Internal Reviews',
  'compliance-audit': 'Labour Compliance Audits',
  'industrial-relations': 'Industrial Relations'
};

export default async function ResourceDetailPage({ params }: { params: Promise<{ category: string; slug: string }> }) {
  const resolvedParams = await params;
  if (resolvedParams.category === 'faqs') redirect('/resources/faqs');
  
  let resource: any = null;
  try {
    resource = await prisma.article.findUnique({
      where: { slug: resolvedParams.slug },
      include: { author: true, keyTakeaways: { orderBy: { sortOrder: 'asc' } }, relatedServices: { orderBy: { sortOrder: 'asc' } } }
    });
  } catch (e) {
    console.error("Prisma error, falling back to static", e);
  }
  
  if (!resource) {
    const staticItem = resourcesData.find(r => r.slug === resolvedParams.slug);
    if (staticItem) {
      resource = {
        id: staticItem.slug,
        title: staticItem.title,
        slug: staticItem.slug,
        content: staticItem.content || `<p>${staticItem.excerpt}</p>`,
        excerpt: staticItem.excerpt,
        category: resolvedParams.category,
        featuredImage: staticItem.featuredImage,
        publishedAt: new Date(staticItem.publishedAt),
        updatedAt: staticItem.updatedAt ? new Date(staticItem.updatedAt) : new Date(staticItem.publishedAt),
        author: { name: staticItem.author || "LabourAxis Editorial", bio: staticItem.authorBio || "Industrial HR and Compliance Advisory Team" },
        keyTakeaways: (staticItem.keyTakeaways || []).map((t, idx) => ({ id: `${idx}`, point: t, sortOrder: idx })),
        relatedServices: (staticItem.relatedServices || []).map((s, idx) => ({ id: `${idx}`, serviceSlug: s, sortOrder: idx }))
      };
    }
  }

  if (!resource) notFound();

  // Automatic Reading Time
  const words = (resource.content || '').replace(/<[^>]+>/g, '').split(/\s+/).length;
  const readingTime = Math.ceil(words / 200) + ' min read';

  // Extract H2s for TOC
  const h2Matches = Array.from((resource.content || '').matchAll(/<h2[^>]*>(.*?)<\/h2>/gi));
  const toc = h2Matches.map((m: any) => m[1].replace(/<[^>]+>/g, ''));

  // Get related articles
  let relatedArticles: any[] = [];
  try {
    relatedArticles = await prisma.article.findMany({
      where: { category: resource.category, slug: { not: resource.slug }, published: true },
      take: 3
    });
  } catch (e) {
    // fallback
  }

  if (!Array.isArray(relatedArticles) || relatedArticles.length === 0) {
    relatedArticles = resourcesData
      .filter(r => r.slug !== resource.slug && (r.type === resolvedParams.category.replace(/s$/, '') || r.type + 's' === resolvedParams.category))
      .slice(0, 3)
      .map(r => ({
        id: r.slug,
        title: r.title,
        slug: r.slug,
        category: r.category,
        publishedAt: new Date(r.publishedAt),
        featuredImage: r.featuredImage
      }));
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": resource.seoTitle || resource.title,
    "description": resource.metaDescription || resource.excerpt,
    "datePublished": resource.publishedAt,
    "dateModified": resource.updatedAt,
    "author": {
      "@type": "Person",
      "name": resource.author?.name || "LabourAxis"
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="flex flex-col pb-24 bg-[#FFFFFF] min-h-screen overflow-x-hidden">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      
      {/* Breadcrumbs */}
      <div className="bg-[#12372A] border-b border-white/10 pt-6 pb-4">
        <div className="container mx-auto px-4 md:px-8 max-w-7xl">
          <nav className="flex items-center text-xs md:text-sm text-[#A2B3AA] font-medium">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 mx-2 text-[#66736D]" />
            <Link href="/resources" className="hover:text-white transition-colors">Resources</Link>
            <ChevronRight className="w-3.5 h-3.5 mx-2 text-[#66736D]" />
            <Link href={`/resources/${resolvedParams.category}`} className="hover:text-white transition-colors capitalize">
              {resolvedParams.category}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 mx-2 text-[#66736D]" />
            <span className="text-white truncate max-w-[200px] sm:max-w-none">{resource.title}</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <section className="bg-[#12372A] text-white pt-12 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-forest opacity-30 pointer-events-none"></div>
        <div className="container mx-auto px-4 md:px-8 max-w-4xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#D6A84F] uppercase tracking-wider mb-4 bg-[#1B4E3C]/80 border border-[#D6A84F]/30 px-3.5 py-1.5 rounded-full shadow-xs">
            <ShieldCheck className="w-4 h-4 text-[#D6A84F]" />
            <span>{resource.category}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-balance leading-tight">
            {resource.title}
          </h1>

          {resource.excerpt && (
            <p className="text-lg md:text-xl text-[#A2B3AA] mb-8 max-w-2xl mx-auto leading-relaxed text-balance">
              {resource.excerpt}
            </p>
          )}
          
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[#A2B3AA] text-xs md:text-sm font-medium">
            <div className="flex items-center gap-2 bg-[#0D281E]/60 px-3 py-1.5 rounded-lg border border-white/10">
              <User className="w-3.5 h-3.5 text-[#A2B3AA]" />
              <span className="text-white">By {resource.author?.name || 'LabourAxis Editorial'}</span>
            </div>
            {resource.publishedAt && (
              <div className="flex items-center gap-2 bg-[#0D281E]/60 px-3 py-1.5 rounded-lg border border-white/10">
                <Calendar className="w-3.5 h-3.5 text-[#A2B3AA]" />
                <span>Published: {formatDate(resource.publishedAt)}</span>
              </div>
            )}
            <div className="flex items-center gap-2 bg-[#0D281E]/60 px-3 py-1.5 rounded-lg border border-white/10">
              <Calendar className="w-3.5 h-3.5 text-[#A2B3AA]" />
              <span>Updated: {formatDate(resource.updatedAt)}</span>
            </div>
            <div className="flex items-center gap-2 bg-[#0D281E]/60 px-3 py-1.5 rounded-lg border border-white/10">
              <Clock className="w-3.5 h-3.5 text-[#A2B3AA]" />
              <span>{readingTime}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Image */}
      {resource.featuredImage && (
        <div className="container mx-auto px-4 md:px-8 max-w-5xl -mt-8 relative z-10 mb-12">
          <div className="aspect-[16/9] bg-[#F7F4EC] rounded-3xl overflow-hidden shadow-xl border border-[#D9E1DC]">
            <img src={resource.featuredImage} alt={resource.featuredImageAlt || resource.title} className="w-full h-full object-cover" />
          </div>
        </div>
      )}

      {/* Content Section */}
      <section className="py-8 md:py-16">
        <div className="container mx-auto px-4 md:px-8 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Sidebar */}
            <div className="lg:col-span-4 order-2 lg:order-2">
              <div className="sticky top-24 space-y-8">
                
                {/* Table of Contents */}
                {toc.length > 0 && (
                  <div className="bg-[#F7F4EC] border border-[#D9E1DC] rounded-3xl p-6 shadow-2xs">
                    <h3 className="font-bold text-[#12372A] mb-4 uppercase tracking-wider text-xs flex items-center gap-2">
                      <ListIcon className="w-4 h-4 text-[#1F7A5C]" /> In This Article
                    </h3>
                    <ul className="space-y-3">
                      {toc.map((heading, i) => (
                        <li key={i} className="text-[#66736D] hover:text-[#1F7A5C] transition-colors text-sm font-medium leading-snug">
                          • {heading}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* NEED HELP? CTA */}
                <div className="bg-[#12372A] rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-grid-forest opacity-30 pointer-events-none"></div>
                  <div className="relative z-10">
                    <span className="text-[11px] font-bold text-[#D6A84F] uppercase tracking-wider bg-[#1B4E3C] px-3 py-1 rounded-md mb-3 inline-block border border-[#D6A84F]/30">
                      Need Assistance?
                    </span>
                    <h3 className="font-bold text-lg mb-2">Need Expert Support?</h3>
                    <p className="text-[#A2B3AA] text-sm mb-6 leading-relaxed">
                      Review your HR & labour compliance processes with our experts.
                    </p>
                    <Link 
                      href="/contact" 
                      className="block w-full text-center bg-[#1F7A5C] hover:bg-[#165B44] text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md"
                    >
                      Request a Health Check
                    </Link>
                  </div>
                </div>

                {/* Related Services */}
                {resource.relatedServices?.length > 0 && (
                  <div>
                    <h3 className="font-bold text-[#12372A] mb-4 uppercase tracking-wider text-xs">RELATED SERVICES</h3>
                    <ul className="space-y-3">
                      {resource.relatedServices.map((rs: any) => (
                        <li key={rs.id}>
                          <Link 
                            href={`/services/${rs.serviceSlug}`} 
                            className="block bg-white border border-[#D9E1DC] rounded-2xl p-4 hover:border-[#1F7A5C]/50 hover:shadow-sm transition-all group"
                          >
                            <span className="text-[#202522] font-bold text-sm leading-snug block pr-2 group-hover:text-[#1F7A5C] transition-colors">
                              {AVAILABLE_SERVICES[rs.serviceSlug] || rs.serviceSlug.replace(/-/g, ' ')}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Main Article Body */}
            <div className="lg:col-span-8 order-1 lg:order-1">
              {resource.keyTakeaways?.length > 0 && (
                <div className="bg-[#EDE8DE]/70 border border-[#D9E1DC] rounded-3xl p-6 md:p-8 mb-10 shadow-2xs">
                  <h3 className="font-bold text-[#12372A] mb-4 text-lg">Key Takeaways</h3>
                  <ul className="space-y-2.5 text-[#202522] text-sm md:text-base leading-relaxed">
                    {resource.keyTakeaways.map((t: any) => (
                      <li key={t.id} className="flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D6A84F] mt-2.5 shrink-0" />
                        <span>{t.text || t.point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="prose prose-lg prose-slate max-w-none prose-headings:font-bold prose-headings:text-[#12372A] prose-headings:tracking-tight prose-h2:text-2xl prose-h2:md:text-3xl prose-a:text-[#1F7A5C] prose-img:rounded-3xl">
                <div dangerouslySetInnerHTML={{ __html: resource.content }} />
                
                {(resource.ctaHeading || resource.ctaPrimaryLabel) && (
                  <div className="mt-12 bg-[#F7F4EC] border-l-4 border-[#1F7A5C] p-8 rounded-r-3xl shadow-xs not-prose">
                    <h4 className="text-2xl font-bold text-[#12372A] mb-3">{resource.ctaHeading || 'Ready to improve your compliance?'}</h4>
                    {resource.ctaDescription && <p className="text-[#66736D] mb-6 text-base md:text-lg leading-relaxed">{resource.ctaDescription}</p>}
                    <div className="flex flex-wrap gap-4">
                      {resource.ctaPrimaryLabel && resource.ctaPrimaryUrl && (
                        <Link href={resource.ctaPrimaryUrl} className="inline-flex items-center justify-center px-6 py-3.5 font-bold rounded-xl text-white bg-[#1F7A5C] hover:bg-[#165B44] shadow-md transition-all">
                          {resource.ctaPrimaryLabel}
                        </Link>
                      )}
                      {resource.ctaSecondaryLabel && resource.ctaSecondaryUrl && (
                        <Link href={resource.ctaSecondaryUrl} className="inline-flex items-center justify-center px-6 py-3.5 border border-[#D9E1DC] font-bold rounded-xl text-[#202522] bg-white hover:bg-[#EDE8DE] shadow-2xs transition-all">
                          {resource.ctaSecondaryLabel}
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Author Bio Box */}
              <div className="mt-16 bg-[#F7F4EC] rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start border border-[#D9E1DC] shadow-2xs">
                <div className="w-16 h-16 shrink-0 rounded-2xl bg-[#1F7A5C]/10 text-[#1F7A5C] font-bold text-xl flex items-center justify-center border border-[#1F7A5C]/20 shadow-2xs">
                  {resource.author?.name ? resource.author.name.charAt(0) : 'L'}
                </div>
                <div className="flex-1 space-y-2">
                  <div>
                    <h3 className="font-bold text-lg md:text-xl text-[#12372A]">{resource.author?.name || 'LabourAxis Editorial'}</h3>
                    <p className="text-[#66736D] text-xs font-bold uppercase tracking-wider mt-0.5">HR, LABOUR & COMPLIANCE CONTENT</p>
                  </div>
                  <p className="text-[#66736D] text-sm md:text-base leading-relaxed">
                    Practical insights on HR operations, labour compliance and workforce management.
                  </p>
                  <Link href="/about" className="inline-flex items-center text-[#1F7A5C] font-bold hover:text-[#165B44] text-xs md:text-sm pt-2">
                    <span>View About LabourAxis</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="bg-[#F7F4EC] border-t border-[#D9E1DC] py-16">
          <div className="container mx-auto px-4 md:px-8 max-w-6xl">
            <h2 className="text-2xl font-bold text-[#12372A] mb-8">Related {resource.category}</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedArticles.map(article => (
                <Link 
                  key={article.slug} 
                  href={`/resources/${article.category}/${article.slug}`} 
                  className="bg-white border border-[#D9E1DC] rounded-3xl overflow-hidden shadow-2xs hover:shadow-md hover:border-[#1F7A5C]/40 transition-all flex flex-col group p-6"
                >
                  <h3 className="text-lg font-bold text-[#12372A] mb-2 group-hover:text-[#1F7A5C] transition-colors leading-snug">{article.title}</h3>
                  <p className="text-[#66736D] text-sm line-clamp-2 mb-6 flex-1 leading-relaxed">{article.excerpt}</p>
                  <span className="text-[#1F7A5C] font-bold text-xs mt-auto flex items-center pt-4 border-t border-[#D9E1DC]/60">
                    <span>Read more</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
