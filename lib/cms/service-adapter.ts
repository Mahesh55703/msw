import { PageRevision, PageSection } from '@prisma/client'

// Transforms CMS sections back into the legacy Service object shape
export function buildServiceFromCms(revision: any, pageKey: string, slug: string) {
  const sections: PageSection[] = revision.sections || []
  
  // Helper to find a section by heading
  const findFeatureList = (heading: string) => 
    sections.find(s => s.type === 'FEATURE_LIST' && (s.content as any)?.heading === heading)
  
  const heroSection = sections.find(s => s.type === 'HERO')
  const problemSection = sections.find(s => s.type === 'TEXT_IMAGE' && (s.content as any)?.heading === 'The Challenge')
  const ctaSection = sections.find(s => s.type === 'CTA_BANNER')
  
  const highlightsSection = findFeatureList('Highlights')
  const servicesSection = findFeatureList('Our Services')
  const audienceSection = findFeatureList('Who We Support')
  const deliverablesSection = findFeatureList('Deliverables & Common Gaps')
  const faqsSection = findFeatureList('Frequently Asked Questions')

  // Parse HTML back to problemIntro, problemList, problemOutro
  let problemIntro = ''
  let problemList: string[] = []
  let problemOutro = ''
  if (problemSection) {
    const html = (problemSection.content as any)?.body || ''
    const match = html.match(/<p>(.*?)<\/p><ul>(.*?)<\/ul><p>(.*?)<\/p>/)
    if (match) {
      problemIntro = match[1]
      const liMatches = match[2].match(/<li>(.*?)<\/li>/g)
      if (liMatches) {
        problemList = liMatches.map((s: string) => s.replace(/<\/?li>/g, ''))
      }
      problemOutro = match[3]
    } else {
      // Fallback if manually edited in CMS to just standard HTML
      problemIntro = html.replace(/<[^>]+>/g, ' ')
    }
  }

  // Parse deliverables and gaps
  const delivFeatures = (deliverablesSection?.content as any)?.features || []
  const deliverables = delivFeatures.slice(0, Math.ceil(delivFeatures.length / 2)).map((f: any) => f.title)
  const commonGaps = delivFeatures.slice(Math.ceil(delivFeatures.length / 2)).map((f: any) => f.title)

  return {
    slug,
    category: "Service",
    title: (heroSection?.content as any)?.heading || revision.seoTitle || "Service",
    heroSupportingText: (heroSection?.content as any)?.description || "",
    ctaText: (ctaSection?.content as any)?.primaryCta?.label || "Contact Us",
    trustLine: (ctaSection?.content as any)?.heading || "Ready to get started?",
    
    highlights: ((highlightsSection?.content as any)?.features || []).map((f: any) => f.title),
    
    problemIntro,
    problemList,
    problemOutro,
    
    services: ((servicesSection?.content as any)?.features || []).map((f: any) => ({
      title: f.title,
      description: f.description
    })),
    
    audience: ((audienceSection?.content as any)?.features || []).map((f: any) => ({
      title: f.title,
      description: f.description
    })),
    
    deliverables: deliverables.length ? deliverables : ["Structured Compliance", "Process Audits"],
    commonGaps: commonGaps.length ? commonGaps : ["Missing documentation", "Non-compliant processes"],
    
    faqs: ((faqsSection?.content as any)?.features || []).map((f: any) => ({
      question: f.title,
      answer: f.description
    })),

    relatedServices: [],

    heroImageUrl: (heroSection as any)?.media?.url || null,
    heroImageAlt: (heroSection as any)?.media?.altText || (heroSection?.content as any)?.mediaAlt || null,
    heroImageBadge: (heroSection?.content as any)?.eyebrow || null,
  }
}
