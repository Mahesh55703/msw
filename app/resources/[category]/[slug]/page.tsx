import prisma from '@/lib/prisma'
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronRight, ArrowRight, User, Calendar, Clock, List as ListIcon } from "lucide-react";
import type { Metadata } from "next";

export async function generateStaticParams() {
  const articles = await prisma.article.findMany({ select: { slug: true, category: true }, where: { category: { not: 'faqs' } } });
  return articles.map(a => ({ category: a.category, slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string; slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const resource = await prisma.article.findUnique({ where: { slug: resolvedParams.slug } });
  
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
      images: [resource.ogImage || resource.featuredImage || '/logo.png']
    }
  };
}

const AVAILABLE_SERVICES: Record<string, string> = {
  'hr-consulting': 'Practical HR Consulting for Growing Businesses',
  'labour-compliance': 'Labour & Statutory Compliance Support for Businesses',
  'pf-esic-compliance': 'PF / ESIC Compliance',
  'payroll-compliance': 'Payroll & HR Operations',
  'factory-compliance': 'Factory & Industrial Compliance',
  'contract-labour': 'Contract Labour Compliance',
  'compliance-health-check': 'Labour Compliance Health Checks & Internal Reviews',
  'industrial-relations': 'Industrial Relations'
}

export default async function ResourceDetailPage({ params }: { params: Promise<{ category: string; slug: string }> }) {
  const resolvedParams = await params;
  if (resolvedParams.category === 'faqs') redirect('/resources/faqs');
  
  const resource = await prisma.article.findUnique({
    where: { slug: resolvedParams.slug },
    include: { author: true, keyTakeaways: { orderBy: { sortOrder: 'asc' } }, relatedServices: { orderBy: { sortOrder: 'asc' } } }
  });
  
  if (!resource) notFound();

  // Automatic Reading Time
  const words = resource.content.replace(/<[^>]+>/g, '').split(/\s+/).length;
  const readingTime = Math.ceil(words / 200) + ' min read';

  // Extract H2s for TOC
  const h2Matches = Array.from(resource.content.matchAll(/<h2[^>]*>(.*?)<\/h2>/gi));
  const toc = h2Matches.map(m => m[1].replace(/<[^>]+>/g, ''));

  // Get related articles
  const relatedArticles = await prisma.article.findMany({
    where: { category: resource.category, slug: { not: resource.slug }, published: true },
    take: 3
  });

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
    return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div className="flex flex-col pb-24 bg-white min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* Breadcrumb */}
      <div className="bg-slate-50 border-b border-slate-200 pt-6 pb-4">
        <div className="container mx-auto px-4 md:px-8 max-w-7xl">
          <nav className="flex text-sm text-slate-500">
            <Link href="/" className="hover:text-slate-900">Home</Link>
            <ChevronRight className="w-4 h-4 mx-2 mt-0.5" />
            <Link href="/resources" className="hover:text-slate-900">Resources</Link>
            <ChevronRight className="w-4 h-4 mx-2 mt-0.5" />
            <Link href={`/resources/${resolvedParams.category}`} className="hover:text-slate-900 capitalize">
              {resolvedParams.category}
            </Link>
            <ChevronRight className="w-4 h-4 mx-2 mt-0.5" />
            <span className="text-slate-900 truncate max-w-[200px] sm:max-w-none">{resource.title}</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <section className="bg-slate-50 border-b border-slate-200 py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl text-center">
          <span className="inline-block bg-blue-50 text-blue-700 text-sm font-bold px-3 py-1 rounded-full mb-6 uppercase tracking-wider">
            {resource.category}
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 text-balance leading-tight">
            {resource.title}
          </h1>
          {resource.excerpt && (
            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              {resource.excerpt}
            </p>
          )}
          
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-4 text-slate-600 text-sm font-medium">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                <User className="w-4 h-4 text-slate-500" />
              </div>
              <span className="text-slate-900 font-semibold">By {resource.author?.name || 'LabourAxis Editorial'}</span>
            </div>
            {resource.publishedAt && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Published: {formatDate(resource.publishedAt)}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Updated: {formatDate(resource.updatedAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>{readingTime}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Image */}
      {resource.featuredImage && (
        <div className="container mx-auto px-4 md:px-8 max-w-5xl -mt-8 relative z-10 mb-12">
          <div className="aspect-video bg-slate-200 rounded-2xl overflow-hidden shadow-lg border border-slate-200">
            <img src={resource.featuredImage} alt={resource.featuredImageAlt || resource.title} className="w-full h-full object-cover" />
          </div>
        </div>
      )}

      {/* Content */}
      <section className="py-8 md:py-16">
        <div className="container mx-auto px-4 md:px-8 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Sidebar */}
            <div className="lg:col-span-4 order-2">
              <div className="sticky top-24 space-y-8">
                
                {/* TOC */}
                {toc.length > 0 && (
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-4 uppercase tracking-wider text-xs flex items-center gap-2">
                      <ListIcon className="w-4 h-4" /> IN THIS ARTICLE
                    </h3>
                    <ul className="space-y-4">
                      {toc.map((heading, i) => (
                        <li key={i}>
                          <span className="text-slate-600 hover:text-slate-900 transition-colors text-sm font-medium leading-relaxed block">{heading}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* NEED HELP? CTA */}
                <div className="bg-[#0f172a] rounded-2xl p-6 text-white shadow-lg">
                  <h3 className="font-bold text-lg mb-3 uppercase tracking-wider">NEED HELP?</h3>
                  <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                    Review your HR & labour compliance processes with our experts.
                  </p>
                  <Link href="/contact" className="block w-full text-center bg-white text-slate-900 font-bold py-3 px-4 rounded-xl hover:bg-slate-100 transition-colors">
                    Request a Compliance Health Check
                  </Link>
                </div>

                {/* Related Services */}
                {resource.relatedServices.length > 0 && (
                  <div>
                    <h3 className="font-bold text-slate-900 mb-4 uppercase tracking-wider text-sm">RELATED SERVICES</h3>
                    <ul className="space-y-3">
                      {resource.relatedServices.map(rs => (
                        <li key={rs.id}>
                          <Link href={`/services/${rs.serviceSlug}`} className="block bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 hover:shadow-sm transition-all group">
                            <span className="text-slate-900 font-bold text-sm leading-snug block pr-4">
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
            <div className="lg:col-span-8 order-1">
              {resource.keyTakeaways.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-10">
                  <h3 className="font-bold text-amber-900 mb-4 text-lg">Key Takeaways</h3>
                  <ul className="space-y-2 list-disc list-inside text-amber-800">
                    {resource.keyTakeaways.map(t => (
                      <li key={t.id}>{t.text}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="prose prose-lg prose-slate max-w-none prose-headings:font-bold prose-h2:text-3xl prose-a:text-blue-600 prose-img:rounded-xl">
                <div dangerouslySetInnerHTML={{ __html: resource.content }} />
                
                {(resource.ctaHeading || resource.ctaPrimaryLabel) && (
                  <div className="mt-12 bg-slate-50 border-l-4 border-blue-600 p-8 rounded-r-xl shadow-sm not-prose">
                    <h4 className="text-2xl font-bold text-slate-900 mb-3">{resource.ctaHeading || 'Ready to improve your compliance?'}</h4>
                    {resource.ctaDescription && <p className="text-slate-600 mb-6 text-lg">{resource.ctaDescription}</p>}
                    <div className="flex flex-wrap gap-4">
                      {resource.ctaPrimaryLabel && resource.ctaPrimaryUrl && (
                        <Link href={resource.ctaPrimaryUrl} className="inline-flex items-center justify-center px-6 py-3 border border-transparent font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors">
                          {resource.ctaPrimaryLabel}
                        </Link>
                      )}
                      {resource.ctaSecondaryLabel && resource.ctaSecondaryUrl && (
                        <Link href={resource.ctaSecondaryUrl} className="inline-flex items-center justify-center px-6 py-3 border border-slate-300 font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 shadow-sm transition-colors">
                          {resource.ctaSecondaryLabel}
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Author Bio Box */}
              <div className="mt-16 bg-slate-50 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start border border-slate-100">
                <div className="w-20 h-20 shrink-0 rounded-full bg-slate-200 flex items-center justify-center border-4 border-white shadow-sm">
                  <User className="w-8 h-8 text-slate-400" />
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="font-bold text-xl text-slate-900">{resource.author?.name || 'LabourAxis Editorial'}</h3>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-1">HR, LABOUR & COMPLIANCE CONTENT</p>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Practical insights on HR operations, labour compliance and workforce management.
                  </p>
                  <Link href="/about" className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800 text-sm">
                    View About LabourAxis <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="bg-slate-50 border-t border-slate-200 py-16">
          <div className="container mx-auto px-4 md:px-8 max-w-6xl">
            <h2 className="text-2xl font-bold text-slate-900 mb-8">Related {resource.category}</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {relatedArticles.map(article => (
                <Link key={article.slug} href={`/resources/${article.category}/${article.slug}`} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col group">
                  <div className="p-6 flex flex-col h-full">
                    <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-700 transition-colors">{article.title}</h3>
                    <p className="text-slate-600 text-sm line-clamp-2 mb-4">{article.excerpt}</p>
                    <span className="text-blue-600 font-medium text-sm mt-auto flex items-center">
                      Read more <ArrowRight className="w-4 h-4 ml-1" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
