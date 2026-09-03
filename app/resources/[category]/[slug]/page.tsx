import prisma from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronRight,
  ArrowRight,
  User,
  Calendar,
  Clock,
  List as ListIcon,
  ShieldCheck,
  AlertTriangle,
  FileDown,
  DownloadCloud,
  CheckCircle2,
  Users,
  Target,
  FileText,
} from 'lucide-react'
import type { Metadata } from 'next'
import { resourcesData } from '@/data/resources'
import { parseAndFormatArticleContent } from '@/lib/content-parser'
import { verifySession } from '@/lib/session'
import InteractiveChecklist from '@/components/resources/InteractiveChecklist'
import { ContentViewTracker } from '@/components/analytics/ContentViewTracker'
import { TrackedAnchor, TrackedCtaLink } from '@/components/analytics/TrackedCtaLink'

export async function generateStaticParams() {
  let dbArticles: { slug: string; category: string }[] = []
  try {
    dbArticles = await prisma.article.findMany({
      select: { slug: true, category: true },
      where: { published: true, category: { not: 'faqs' } },
    })
  } catch (e) {
    console.error('Prisma error in generateStaticParams', e)
  }

  const staticArticles = resourcesData.filter(r => r.type !== 'faq').map((r) => ({
    category:
      r.type === 'guide'
        ? 'guides'
        : r.type === 'checklist'
        ? 'checklists'
        : r.type === 'update'
        ? 'updates'
        : 'articles',
    slug: r.slug,
  }))

  const map = new Map<string, { category: string; slug: string }>()
  for (const a of staticArticles) map.set(a.slug, a)
  if (Array.isArray(dbArticles)) {
    for (const a of dbArticles) map.set(a.slug, { category: a.category, slug: a.slug })
  }

  return Array.from(map.values())
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>
}): Promise<Metadata> {
  const resolvedParams = await params
  if (resolvedParams.category === 'faqs' || resolvedParams.category === 'faq') {
    return { title: 'Not Found' }
  }

  let resource: any = null
  try {
    resource = await prisma.article.findUnique({
      where: { slug: resolvedParams.slug },
    })
  } catch (e) {
    // ignore
  }

  if (!resource) {
    const staticItem = resourcesData.find((r) => r.slug === resolvedParams.slug)
    if (staticItem) {
      resource = {
        title: staticItem.title,
        seoTitle: staticItem.seoTitle || staticItem.title,
        metaDescription: staticItem.seoDescription || staticItem.excerpt,
        excerpt: staticItem.excerpt,
        canonicalUrl: `/resources/${resolvedParams.category}/${staticItem.slug}`,
        featuredImage: staticItem.featuredImage,
        published: true,
      }
    }
  }

  if (!resource) return { title: 'Not Found' }

  // Non-published drafts should not be indexed
  if (!resource.published) {
    return {
      title: `[Draft Preview] ${resource.title} | LabourAxis`,
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  const pageTitle = resource.seoTitle || `${resource.title} | LabourAxis`
  const pageDescription = resource.metaDescription || resource.excerpt || ''
  const canonical = resource.canonicalUrl || `https://www.labouraxis.com/resources/${resolvedParams.category}/${resource.slug}`
  const ogImage = resource.ogImage || resource.featuredImage || '/logo-transparent.png'

  return {
    title: pageTitle,
    description: pageDescription,
    alternates: {
      canonical,
    },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: canonical,
      siteName: 'LabourAxis',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: resource.featuredImageAlt || resource.title,
        },
      ],
      locale: 'en_IN',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      images: [ogImage],
    },
  }
}

export default async function ResourceDetailPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>
}) {
  const resolvedParams = await params
  if (resolvedParams.category === 'faqs' || resolvedParams.category === 'faq') notFound()

  let resource: any = null
  try {
    resource = await prisma.article.findUnique({
      where: { slug: resolvedParams.slug },
      include: {
        author: true,
        keyTakeaways: { orderBy: { sortOrder: 'asc' } },
        relatedServices: { orderBy: { sortOrder: 'asc' } },
        relatedFrom: {
          orderBy: { sortOrder: 'asc' },
          include: {
            toArticle: {
              select: { id: true, title: true, slug: true, category: true, excerpt: true, featuredImage: true, publishedAt: true },
            },
          },
        },
      },
    })
  } catch (e) {
    console.error('Prisma error in resource page', e)
  }

  if (!resource) {
    const staticItem = resourcesData.find((r) => r.slug === resolvedParams.slug)
    if (staticItem) {
      resource = {
        ...staticItem,
        author: staticItem.author ? { name: staticItem.author } : null,
        keyTakeaways: staticItem.keyTakeaways?.map(t => ({ text: t })),
        relatedServices: staticItem.relatedServices?.map(s => ({ serviceSlug: s }))
      }
    }
  }

  if (!resource) notFound()

  // Fetch dynamic service titles
  let dynamicServiceTitles: Record<string, string> = {}
  try {
    if (resource.relatedServices?.length > 0) {
      const slugs = resource.relatedServices.map((rs: any) => rs.serviceSlug)
      const services = await prisma.page.findMany({
        where: { path: { in: slugs.map((s: string) => `/services/${s}`) }, status: 'PUBLISHED' },
        select: { path: true, publishedRevision: { select: { seoTitle: true } } }
      })
      services.forEach(s => {
        const slug = s.path.replace('/services/', '')
        dynamicServiceTitles[slug] = s.publishedRevision?.seoTitle?.split(' |')[0] || slug.replace(/-/g, ' ')
      })
    }
  } catch (e) {
    // ignore
  }

  if (resource) {
    const dbCategory = resource.category?.toLowerCase() || 'articles'
    if (dbCategory !== resolvedParams.category) {
      notFound()
    }
  }

  // Fallback to static data
  if (!resource) {
    const staticItem = resourcesData.find((r) => r.slug === resolvedParams.slug)
    if (staticItem) {
      if (staticItem.type === 'faq') notFound()
      const expectedStaticCategory = staticItem.type === 'guide' ? 'guides' : staticItem.type === 'checklist' ? 'checklists' : staticItem.type === 'update' ? 'updates' : 'articles'
      if (expectedStaticCategory !== resolvedParams.category) {
        notFound()
      }
      resource = {
        id: staticItem.slug,
        title: staticItem.title,
        slug: staticItem.slug,
        content: staticItem.content || `<p>${staticItem.excerpt}</p>`,
        excerpt: staticItem.excerpt,
        category: resolvedParams.category,
        featuredImage: staticItem.featuredImage,
        published: true,
        publishedAt: new Date(staticItem.publishedAt),
        updatedAt: staticItem.updatedAt ? new Date(staticItem.updatedAt) : new Date(staticItem.publishedAt),
        author: {
          name: staticItem.author || 'LabourAxis Editorial',
          role: 'ADMIN',
        },
        keyTakeaways: (staticItem.keyTakeaways || []).map((t, idx) => ({ id: `${idx}`, text: t, sortOrder: idx })),
        relatedServices: (staticItem.relatedServices || []).map((s, idx) => ({ id: `${idx}`, serviceSlug: s, sortOrder: idx })),
        relatedFrom: [],
      }
    }
  }

  if (!resource) notFound()

  // Draft Access Control: If draft, require authenticated session
  let isPreviewMode = false
  if (!resource.published) {
    const session = await verifySession()
    if (!session.isAuth) {
      notFound()
    }
    isPreviewMode = true
  }

  const isChecklist = resolvedParams.category === 'checklists' || resource.category === 'checklists'

  // Structured Checklist Data parser
  let checklistPayload = {
    purpose: resource.excerpt || '',
    audience: ['Factory HR leadership', 'Compliance officers', 'Plant & factory managers'],
    sections: [] as any[],
    downloadableFile: null as any,
    notes: '',
  }

  if (isChecklist) {
    try {
      const parsed = JSON.parse(resource.content || '{}')
      if (parsed.purpose) checklistPayload.purpose = parsed.purpose
      if (Array.isArray(parsed.audience)) checklistPayload.audience = parsed.audience
      if (Array.isArray(parsed.sections)) checklistPayload.sections = parsed.sections
      if (parsed.downloadableFile) checklistPayload.downloadableFile = parsed.downloadableFile
      if (parsed.notes) checklistPayload.notes = parsed.notes
    } catch (e) {
      // Fallback to static checklist items
      const staticItem = resourcesData.find((r) => r.slug === resolvedParams.slug)
      if (staticItem && Array.isArray((staticItem as any).checklistItems)) {
        checklistPayload.sections = (staticItem as any).checklistItems.map((cat: any, cIdx: number) => ({
          id: `sec-${cIdx}`,
          title: cat.category,
          items: (cat.items || []).map((text: string, iIdx: number) => ({
            id: `item-${cIdx}-${iIdx}`,
            text,
          })),
        }))
      }
    }
  }

  // Format and parse content (cleans markdown tokens, generates stable anchor IDs for TOC, computes reading time)
  const contentToParse = isChecklist ? checklistPayload.notes || resource.excerpt || '' : resource.content || ''
  const parsedContent = parseAndFormatArticleContent(contentToParse)
  const toc = parsedContent.toc
  const readingTime = isChecklist
    ? `${Math.max(3, Math.ceil(checklistPayload.sections.reduce((a, s) => a + (s.items?.length || 0), 0) / 4))} min audit`
    : parsedContent.readingTimeText

  // Related Articles: use explicit CMS relations or fallback to category matches
  let relatedArticles: any[] = []
  const explicitRelated = resource.relatedFrom || resource.relatedTo
  if (explicitRelated && explicitRelated.length > 0) {
    relatedArticles = explicitRelated.map((r: any) => r.toArticle)
  } else {
    try {
      relatedArticles = await prisma.article.findMany({
        where: {
          category: resource.category,
          slug: { not: resource.slug },
          published: true,
        },
        take: 3,
        orderBy: { publishedAt: 'desc' },
      })
    } catch (e) {
      // fallback
    }

    if (!Array.isArray(relatedArticles) || relatedArticles.length === 0) {
      relatedArticles = resourcesData
        .filter(
          (r) =>
            r.slug !== resource.slug &&
            (r.type === resolvedParams.category.replace(/s$/, '') || r.type + 's' === resolvedParams.category)
        )
        .slice(0, 3)
        .map((r) => ({
          id: r.slug,
          title: r.title,
          slug: r.slug,
          category: r.category,
          excerpt: r.excerpt,
          publishedAt: new Date(r.publishedAt),
          featuredImage: r.featuredImage,
        }))
    }
  }

  // Structured Data (JSON-LD)
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: resource.seoTitle || resource.title,
    description: resource.metaDescription || resource.excerpt,
    image: resource.featuredImage ? [resource.featuredImage] : undefined,
    datePublished: resource.publishedAt || resource.createdAt,
    dateModified: resource.updatedAt || resource.publishedAt || resource.createdAt,
    author: {
      '@type': 'Person',
      name: resource.author?.name || 'LabourAxis Editorial',
    },
    publisher: {
      '@type': 'Organization',
      name: 'LabourAxis',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.labouraxis.com/logo-transparent.png',
      },
    },
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.labouraxis.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Resources',
        item: 'https://www.labouraxis.com/resources',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: resolvedParams.category.replace(/^\w/, (c) => c.toUpperCase()),
        item: `https://www.labouraxis.com/resources/${resolvedParams.category}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: resource.title,
        item: `https://www.labouraxis.com/resources/${resolvedParams.category}/${resource.slug}`,
      },
    ],
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div className="flex flex-col pb-24 bg-[#FFFFFF] min-h-screen overflow-x-hidden">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      {/* Analytics: Content View Tracking (Excluding Draft Previews) */}
      <ContentViewTracker
        type={
          resolvedParams.category === 'guides' || resource.category === 'guides'
            ? 'guide'
            : isChecklist
            ? 'checklist'
            : 'article'
        }
        contentId={resource.id || resource.slug}
        slug={resource.slug}
        category={resource.category || resolvedParams.category}
        isPreview={isPreviewMode}
      />

      {/* Preview Mode Banner for Authenticated Staff */}
      {isPreviewMode && (
        <div className="bg-[#D6A84F] text-[#12372A] px-4 py-3 font-bold text-xs sticky top-0 z-50 flex items-center justify-between shadow-md">
          <div className="container mx-auto flex items-center gap-2 max-w-7xl">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              Draft Preview Mode — This publication is currently unpublished and not visible to public visitors or search engines.
            </span>
          </div>
          <Link
            href={
              isChecklist
                ? `/admin/checklists/${resource.id}/edit`
                : resolvedParams.category === 'guides' || resource.category === 'guides'
                ? `/admin/guides/${resource.id}/edit`
                : `/admin/articles/${resource.id}/edit`
            }
            className="px-3 py-1 bg-[#12372A] text-white rounded-lg text-xs font-bold hover:bg-[#0D281E] transition-colors shrink-0 ml-4"
          >
            Edit in CMS
          </Link>
        </div>
      )}

      {/* Breadcrumbs */}
      <div className="bg-[#12372A] border-b border-white/10 pt-6 pb-4">
        <div className="container mx-auto px-4 md:px-8 max-w-7xl">
          <nav className="flex items-center text-xs md:text-sm text-[#A2B3AA] font-medium" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 mx-2 text-[#66736D]" />
            <Link href="/resources" className="hover:text-white transition-colors">
              Resources
            </Link>
            <ChevronRight className="w-3.5 h-3.5 mx-2 text-[#66736D]" />
            <Link href={`/resources/${resolvedParams.category}`} className="hover:text-white transition-colors capitalize">
              {resolvedParams.category}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 mx-2 text-[#66736D]" />
            <span className="text-white truncate max-w-[200px] sm:max-w-none">{resource.title}</span>
          </nav>
        </div>
      </div>

      {/* Hero Header */}
      <section className="bg-[#12372A] text-white pt-12 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-forest opacity-30 pointer-events-none" />
        <div className="container mx-auto px-4 md:px-8 max-w-4xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#D6A84F] uppercase tracking-wider mb-4 bg-[#1B4E3C]/80 border border-[#D6A84F]/30 px-3.5 py-1.5 rounded-full shadow-xs">
            <ShieldCheck className="w-4 h-4 text-[#D6A84F]" />
            <span>{resource.category || resolvedParams.category}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-balance leading-tight">
            {resource.title}
          </h1>

          {resource.excerpt && (
            <p className="text-base md:text-lg text-[#A2B3AA] mb-8 max-w-2xl mx-auto leading-relaxed text-balance">
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
            {/* Last Reviewed / Updated Date */}
            <div className="flex items-center gap-2 bg-[#0D281E]/60 px-3 py-1.5 rounded-lg border border-white/10">
              <Calendar className="w-3.5 h-3.5 text-[#A2B3AA]" />
              <span>
                {isChecklist || resolvedParams.category === 'guides' || resource.category === 'guides'
                  ? `Last reviewed: ${formatDate(resource.scheduledAt || resource.updatedAt)}`
                  : `Updated: ${formatDate(resource.updatedAt || resource.publishedAt)}`}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-[#0D281E]/60 px-3 py-1.5 rounded-lg border border-white/10">
              <Clock className="w-3.5 h-3.5 text-[#A2B3AA]" />
              <span>{readingTime}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Cover Image */}
      {resource.featuredImage && (
        <div className="container mx-auto px-4 md:px-8 max-w-5xl -mt-8 relative z-10 mb-12">
          <div className="aspect-[16/9] bg-[#F7F4EC] rounded-3xl overflow-hidden shadow-xl border border-[#D9E1DC]">
            <img
              src={resource.featuredImage}
              alt={resource.featuredImageAlt || resource.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Main Content Layout */}
      <section className="py-8 md:py-16">
        <div className="container mx-auto px-4 md:px-8 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Sidebar (Desktop Right, Mobile Bottom) */}
            <div className="lg:col-span-4 order-2 lg:order-2">
              <div className="sticky top-24 space-y-8">
                
                {/* Downloadable PDF Sidebar Card if available */}
                {isChecklist && checklistPayload.downloadableFile?.url && (
                  <div className="bg-[#12372A] rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-grid-forest opacity-30 pointer-events-none" />
                    <div className="relative z-10 space-y-4">
                      <span className="text-[11px] font-bold text-[#D6A84F] uppercase tracking-wider bg-[#1B4E3C] px-3 py-1 rounded-md inline-block border border-[#D6A84F]/30">
                        Official Document
                      </span>
                      <h3 className="font-bold text-lg text-white">Download Checklist</h3>
                      <p className="text-xs text-[#A2B3AA] leading-relaxed truncate">
                        {checklistPayload.downloadableFile.filename}
                      </p>
                      <TrackedAnchor
                        href={checklistPayload.downloadableFile.url}
                        ctaType="checklist"
                        contentId={resource.id || resource.slug}
                        contentSlug={resource.slug}
                        fileType="pdf"
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-full gap-2 bg-[#1F7A5C] hover:bg-[#165B44] text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md text-xs"
                      >
                        <DownloadCloud className="w-4 h-4" />
                        <span>Download PDF</span>
                      </TrackedAnchor>
                    </div>
                  </div>
                )}

                {/* Automatic Table of Contents for Guides/Articles */}
                {!isChecklist && toc.length > 0 && (
                  <div className="bg-[#F7F4EC] border border-[#D9E1DC] rounded-3xl p-6 shadow-2xs">
                    <h3 className="font-bold text-[#12372A] mb-4 uppercase tracking-wider text-xs flex items-center gap-2">
                      <ListIcon className="w-4 h-4 text-[#1F7A5C]" />
                      <span>{`In This ${resolvedParams.category === 'guides' || resource.category === 'guides' ? 'Guide' : 'Article'}`}</span>
                    </h3>
                    <ul className="space-y-2.5">
                      {toc.map((heading, i) => (
                        <li key={i}>
                          <a
                            href={`#${heading.id}`}
                            className="text-[#66736D] hover:text-[#1F7A5C] transition-colors text-xs font-semibold leading-snug block hover:translate-x-0.5 transform duration-150"
                          >
                            • {heading.text}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Sidebar Support Box */}
                <div className="bg-[#12372A] rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-grid-forest opacity-30 pointer-events-none" />
                  <div className="relative z-10">
                    <span className="text-[11px] font-bold text-[#D6A84F] uppercase tracking-wider bg-[#1B4E3C] px-3 py-1 rounded-md mb-3 inline-block border border-[#D6A84F]/30">
                      Advisory Support
                    </span>
                    <h3 className="font-bold text-lg mb-2">Need Expert Support?</h3>
                    <p className="text-[#A2B3AA] text-xs mb-6 leading-relaxed">
                      Review your HR & labour compliance processes with our experienced consultants.
                    </p>
                    <Link
                      href="/compliance-health-check"
                      className="block w-full text-center bg-[#1F7A5C] hover:bg-[#165B44] text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md text-xs"
                    >
                      Request a Health Check
                    </Link>
                  </div>
                </div>

                {/* Related Practice Areas */}
                {resource.relatedServices?.length > 0 && (
                  <div>
                    <h3 className="font-bold text-[#12372A] mb-4 uppercase tracking-wider text-xs">
                      RELATED PRACTICE AREAS
                    </h3>
                    <ul className="space-y-3">
                      {resource.relatedServices.map((rs: any) => (
                        <li key={rs.id || rs.serviceSlug}>
                          <Link
                            href={`/services/${rs.serviceSlug}`}
                            className="block bg-white border border-[#D9E1DC] rounded-2xl p-4 hover:border-[#1F7A5C]/50 hover:shadow-sm transition-all group"
                          >
                            <span className="text-[#202522] font-bold text-sm leading-snug block pr-2 group-hover:text-[#1F7A5C] transition-colors">
                              {dynamicServiceTitles[rs.serviceSlug] || rs.serviceSlug.replace(/-/g, ' ')}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-8 order-1 lg:order-1 space-y-12">
              {isChecklist ? (
                /* Dedicated Checklist Layout */
                <div className="space-y-12">
                  {/* Purpose Box: What is this checklist for? */}
                  <div className="bg-[#F7F4EC] border border-[#D9E1DC] rounded-3xl p-6 sm:p-8 space-y-3 shadow-2xs">
                    <div className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-[#1F7A5C]" />
                      <h2 className="text-lg font-bold text-[#12372A]">What Is This Checklist For?</h2>
                    </div>
                    <p className="text-sm sm:text-base text-[#202522] leading-relaxed">
                      {checklistPayload.purpose || resource.excerpt}
                    </p>
                  </div>

                  {/* Audience Box: Who should use this checklist? */}
                  {checklistPayload.audience?.length > 0 && (
                    <div className="bg-white border border-[#D9E1DC] rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xs">
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-[#1F7A5C]" />
                        <h2 className="text-lg font-bold text-[#12372A]">Who Should Use This Checklist?</h2>
                      </div>
                      <div className="flex flex-wrap gap-2.5">
                        {checklistPayload.audience.map((role: string, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 bg-[#F7F4EC] border border-[#D9E1DC] text-[#12372A] font-semibold text-xs sm:text-sm px-3.5 py-2 rounded-xl"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#1F7A5C]" />
                            <span>{role}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Interactive Checklist Sections & Checkboxes */}
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-[#12372A] mb-6">
                      What This Checklist Covers
                    </h2>
                    <InteractiveChecklist sections={checklistPayload.sections} />
                  </div>

                  {/* Download / Access Box */}
                  <div className="bg-[#12372A] text-white rounded-3xl p-6 sm:p-8 space-y-4 relative overflow-hidden shadow-xl">
                    <div className="absolute inset-0 bg-grid-forest opacity-30 pointer-events-none" />
                    <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                      <div className="space-y-2 max-w-md">
                        <span className="text-[11px] font-bold text-[#D6A84F] uppercase tracking-wider bg-[#1B4E3C] px-3 py-1 rounded-md inline-block border border-[#D6A84F]/30">
                          {checklistPayload.downloadableFile?.url ? 'Download Available' : 'Digital Resource'}
                        </span>
                        <h3 className="text-xl font-bold text-white">Download / Access Checklist</h3>
                        <p className="text-xs sm:text-sm text-[#A2B3AA] leading-relaxed">
                          {checklistPayload.downloadableFile?.url
                            ? `Download the complete printable PDF copy (${checklistPayload.downloadableFile.filename}) for offline audits.`
                            : 'This checklist is ready for live digital audits across your desktop and mobile devices.'}
                        </p>
                      </div>

                      <div className="shrink-0">
                        {checklistPayload.downloadableFile?.url ? (
                          <TrackedAnchor
                            href={checklistPayload.downloadableFile.url}
                            ctaType="checklist"
                            contentId={resource.id || resource.slug}
                            contentSlug={resource.slug}
                            fileType="pdf"
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#1F7A5C] hover:bg-[#165B44] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md hover:shadow-lg"
                          >
                            <DownloadCloud className="w-4 h-4" />
                            <span>Download Checklist PDF</span>
                          </TrackedAnchor>
                        ) : (
                          <span className="inline-flex items-center gap-2 px-5 py-3 bg-[#1B4E3C] text-[#D6A84F] font-bold text-xs rounded-xl border border-[#D6A84F]/30">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>View Checklist Online</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Optional Explanatory Notes */}
                  {checklistPayload.notes && parsedContent.html && (
                    <div className="prose prose-lg prose-slate max-w-none prose-headings:font-bold prose-headings:text-[#12372A] prose-headings:tracking-tight prose-h2:text-2xl prose-h2:md:text-3xl prose-h2:mt-10 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-p:text-[#202522] prose-p:leading-relaxed prose-a:text-[#1F7A5C] prose-img:rounded-3xl prose-blockquote:border-l-4 prose-blockquote:border-[#1F7A5C] prose-blockquote:bg-[#F7F4EC]/60 prose-blockquote:py-3 prose-blockquote:px-5 prose-blockquote:rounded-r-2xl">
                      <div dangerouslySetInnerHTML={{ __html: parsedContent.html }} />
                    </div>
                  )}

                  {/* Dynamic In-Checklist CTA Banner */}
                  {(resource.ctaHeading || resource.ctaPrimaryLabel) && (
                    <div className="bg-[#F7F4EC] border-l-4 border-[#1F7A5C] p-8 rounded-r-3xl shadow-xs space-y-4">
                      <h4 className="text-2xl font-bold text-[#12372A]">
                        {resource.ctaHeading || 'Need help reviewing your compliance?'}
                      </h4>
                      {resource.ctaDescription && (
                        <p className="text-[#66736D] text-base md:text-lg leading-relaxed">
                          {resource.ctaDescription}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-4 pt-2">
                        {resource.ctaPrimaryLabel && resource.ctaPrimaryUrl && (
                          <TrackedCtaLink
                            href={resource.ctaPrimaryUrl}
                            ctaLocation="resource_in_content_cta"
                            ctaLabel={resource.ctaPrimaryLabel}
                            pageType={resolvedParams.category}
                            className="inline-flex items-center justify-center px-6 py-3.5 font-bold rounded-xl text-white bg-[#1F7A5C] hover:bg-[#165B44] shadow-md transition-all text-sm"
                          >
                            {resource.ctaPrimaryLabel}
                          </TrackedCtaLink>
                        )}
                        {resource.ctaSecondaryLabel && resource.ctaSecondaryUrl && (
                          <TrackedCtaLink
                            href={resource.ctaSecondaryUrl}
                            ctaLocation="resource_in_content_cta_sec"
                            ctaLabel={resource.ctaSecondaryLabel}
                            pageType={resolvedParams.category}
                            className="inline-flex items-center justify-center px-6 py-3.5 border border-[#D9E1DC] font-bold rounded-xl text-[#202522] bg-white hover:bg-[#EDE8DE] shadow-2xs transition-all text-sm"
                          >
                            {resource.ctaSecondaryLabel}
                          </TrackedCtaLink>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Standard Article / Guide Layout */
                <div>
                  {/* Key Takeaways Highlight Box */}
                  {resource.keyTakeaways?.length > 0 && (
                    <div className="bg-[#EDE8DE]/70 border border-[#D9E1DC] rounded-3xl p-6 md:p-8 mb-10 shadow-2xs">
                      <h3 className="font-bold text-[#12372A] mb-4 text-lg">Key Takeaways</h3>
                      <ul className="space-y-3 text-[#202522] text-sm md:text-base leading-relaxed">
                        {resource.keyTakeaways.map((t: any) => (
                          <li key={t.id || t.text} className="flex items-start gap-3">
                            <span className="w-2 h-2 rounded-full bg-[#D6A84F] mt-2 shrink-0" />
                            <span>{t.text || t.point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Semantic Formatted Body */}
                  <div className="prose prose-lg prose-slate max-w-none prose-headings:font-bold prose-headings:text-[#12372A] prose-headings:tracking-tight prose-h2:text-2xl prose-h2:md:text-3xl prose-h2:mt-10 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-p:text-[#202522] prose-p:leading-relaxed prose-a:text-[#1F7A5C] prose-img:rounded-3xl prose-blockquote:border-l-4 prose-blockquote:border-[#1F7A5C] prose-blockquote:bg-[#F7F4EC]/60 prose-blockquote:py-3 prose-blockquote:px-5 prose-blockquote:rounded-r-2xl">
                    <div dangerouslySetInnerHTML={{ __html: parsedContent.html }} />
                    
                    {/* Dynamic In-Article CTA Banner */}
                    {(resource.ctaHeading || resource.ctaPrimaryLabel) && (
                      <div className="mt-12 bg-[#F7F4EC] border-l-4 border-[#1F7A5C] p-8 rounded-r-3xl shadow-xs not-prose space-y-4">
                        <h4 className="text-2xl font-bold text-[#12372A]">
                          {resource.ctaHeading || 'Need help with HR or labour compliance?'}
                        </h4>
                        {resource.ctaDescription && (
                          <p className="text-[#66736D] text-base md:text-lg leading-relaxed">
                            {resource.ctaDescription}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-4 pt-2">
                          {resource.ctaPrimaryLabel && resource.ctaPrimaryUrl && (
                            <TrackedCtaLink
                              href={resource.ctaPrimaryUrl}
                              ctaLocation="article_in_content_cta"
                              ctaLabel={resource.ctaPrimaryLabel}
                              pageType={resolvedParams.category}
                              className="inline-flex items-center justify-center px-6 py-3.5 font-bold rounded-xl text-white bg-[#1F7A5C] hover:bg-[#165B44] shadow-md transition-all text-sm"
                            >
                              {resource.ctaPrimaryLabel}
                            </TrackedCtaLink>
                          )}
                          {resource.ctaSecondaryLabel && resource.ctaSecondaryUrl && (
                            <TrackedCtaLink
                              href={resource.ctaSecondaryUrl}
                              ctaLocation="article_in_content_cta_sec"
                              ctaLabel={resource.ctaSecondaryLabel}
                              pageType={resolvedParams.category}
                              className="inline-flex items-center justify-center px-6 py-3.5 border border-[#D9E1DC] font-bold rounded-xl text-[#202522] bg-white hover:bg-[#EDE8DE] shadow-2xs transition-all text-sm"
                            >
                              {resource.ctaSecondaryLabel}
                            </TrackedCtaLink>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Author Bio Box */}
              <div className="mt-16 bg-[#F7F4EC] rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start border border-[#D9E1DC] shadow-2xs">
                <div className="w-16 h-16 shrink-0 rounded-2xl bg-[#1F7A5C]/10 text-[#1F7A5C] font-bold text-xl flex items-center justify-center border border-[#1F7A5C]/20 shadow-2xs">
                  {resource.author?.name ? resource.author.name.charAt(0).toUpperCase() : 'L'}
                </div>
                <div className="flex-1 space-y-2">
                  <div>
                    <h3 className="font-bold text-lg md:text-xl text-[#12372A]">
                      {resource.author?.name || 'LabourAxis Editorial'}
                    </h3>
                    <p className="text-[#66736D] text-xs font-bold uppercase tracking-wider mt-0.5">
                      HR, LABOUR & STATUTORY COMPLIANCE ADVISORY
                    </p>
                  </div>
                  <p className="text-[#66736D] text-sm leading-relaxed">
                    Practical insights on HR operations, factory regulations, PF/ESIC compliance, and workforce management.
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

      {/* Related Articles / Resources Section */}
      {relatedArticles.length > 0 && (
        <section className="bg-[#F7F4EC] border-t border-[#D9E1DC] py-16">
          <div className="container mx-auto px-4 md:px-8 max-w-6xl">
            <h2 className="text-2xl font-bold text-[#12372A] mb-8">
              {isChecklist
                ? 'Related Checklists & Resources'
                : `Related ${
                    resolvedParams.category === 'guides' || resource.category === 'guides'
                      ? 'Resources'
                      : resource.category?.replace(/^\w/, (c: string) => c.toUpperCase()) || 'Articles'
                  }`}
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedArticles.map((article) => {
                const targetCategory = article.category || (resolvedParams.category === 'guides' ? 'guides' : resolvedParams.category === 'checklists' ? 'checklists' : resolvedParams.category === 'updates' ? 'updates' : 'articles')
                const targetUrl = `/resources/${targetCategory === 'guides' ? 'guides' : targetCategory === 'checklists' ? 'checklists' : targetCategory === 'updates' ? 'updates' : 'articles'}/${article.slug}`
                return (
                  <Link
                    key={article.slug}
                    href={targetUrl}
                    className="bg-white border border-[#D9E1DC] rounded-3xl overflow-hidden shadow-2xs hover:shadow-md hover:border-[#1F7A5C]/40 transition-all flex flex-col group p-6"
                  >
                    <h3 className="text-lg font-bold text-[#12372A] mb-2 group-hover:text-[#1F7A5C] transition-colors leading-snug">
                      {article.title}
                    </h3>
                    <p className="text-[#66736D] text-sm line-clamp-2 mb-6 flex-1 leading-relaxed">
                      {article.excerpt}
                    </p>
                    <span className="text-[#1F7A5C] font-bold text-xs mt-auto flex items-center pt-4 border-t border-[#D9E1DC]/60">
                      <span>{targetCategory === 'guides' ? 'Explore guide' : targetCategory === 'checklists' ? 'View checklist' : 'Read article'}</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
