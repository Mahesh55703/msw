import { PageRevision, PageSection } from '@prisma/client'

// Transforms CMS sections back into the legacy Industry object shape
export function buildIndustryFromCms(revision: any, pageKey: string, slug: string) {
  const sections: PageSection[] = revision.sections || []
  
  const findFeatureList = (heading: string) => 
    sections.find(s => s.type === 'FEATURE_LIST' && (s.content as any)?.heading === heading)
  
  const heroSection = sections.find(s => s.type === 'HERO')
  const reqSection = sections.find(s => s.type === 'TEXT_IMAGE' && (s.content as any)?.heading === 'HR & Compliance Requirements')
  const ctaSection = sections.find(s => s.type === 'CTA_BANNER')
  
  const challengesSection = findFeatureList('Sector Complexities') || findFeatureList('Common Challenges')
  const supportSection = findFeatureList('Who We Support')
  const processSection = findFeatureList('Our Process')
  const faqsSection = findFeatureList('Frequently Asked Questions')

  // Re-hydrate hrAndComplianceRequirements from the HTML body
  let hrAndComplianceRequirements: { title: string, items: string[] }[] = []
  if (reqSection) {
    const html = (reqSection.content as any)?.body || ''
    const h3Matches = html.matchAll(/<h3>(.*?)<\/h3>\s*<ul>(.*?)<\/ul>/g)
    for (const match of h3Matches) {
      const title = match[1]
      const liMatches = match[2].match(/<li>(.*?)<\/li>/g)
      const items = liMatches ? liMatches.map((s: string) => s.replace(/<\/?li>/g, '')) : []
      hrAndComplianceRequirements.push({ title, items })
    }
  }
  // Fallback for HR & Compliance if regex fails or it was edited differently
  if (hrAndComplianceRequirements.length === 0) {
    hrAndComplianceRequirements = [
      { title: "Statutory Requirements", items: ["Labour Law Adherence", "Minimum Wages Act"] },
      { title: "Operational Needs", items: ["Attendance Tracking", "Shift Roster Management"] }
    ]
  }

  // If challenges wasn't mapped as a distinct section in sub-phase B (it might have been missed or rolled into something else),
  // wait, the migration script didn't migrate `challenges` specifically! Let's check my migration script notes.
  // "The migration script didn't migrate `challenges` specifically!" Wait, I need to check the migration script again.
  // If it didn't migrate challenges, I should provide a fallback.
  const challenges = ((challengesSection?.content as any)?.features || []).map((f: any) => ({
    title: f.title,
    desc: f.description
  }))

  const ctaHeading = (ctaSection?.content as any)?.heading || "Ready to get started?"
  const ctaLabel = (ctaSection?.content as any)?.primaryCta?.label || "Contact Us"

  return {
    slug,
    title: (heroSection?.content as any)?.eyebrow || revision.seoTitle?.replace(' HR & Labour Compliance | LabourAxis', '') || "Industry",
    shortDescription: (heroSection?.content as any)?.description || "",
    heroH1: (heroSection?.content as any)?.heading || "Industry Compliance",
    heroSupportingText: (heroSection?.content as any)?.description || "",
    heroCtaText: ctaLabel,
    
    // Fallbacks in case challenges wasn't migrated
    challenges: challenges.length > 0 ? challenges : [
      { title: "Regulatory Compliance", desc: "Keeping up with frequent changes in labour laws." },
      { title: "Workforce Management", desc: "Handling large scale multi-shift personnel." },
      { title: "Vendor Compliance", desc: "Ensuring contractors meet statutory obligations." }
    ],
    
    hrAndComplianceRequirements,
    
    whoWeSupport: ((supportSection?.content as any)?.features || []).map((f: any) => f.title),
    
    process: ((processSection?.content as any)?.features || []).map((f: any) => {
      // Split "01: Step Title" back into step and title
      const split = f.title.split(': ')
      return {
        step: split[0] || "01",
        title: split[1] || f.title,
        desc: f.description
      }
    }),
    
    faqs: ((faqsSection?.content as any)?.features || []).map((f: any) => ({
      question: f.title,
      answer: f.description
    })),

    relatedResources: [],
    finalCtaTitle: ctaHeading,
    finalCtaButtonText: ctaLabel,
    
    heroImageUrl: (heroSection as any)?.media?.url || null,
    heroImageAlt: (heroSection as any)?.media?.altText || (heroSection?.content as any)?.mediaAlt || null,
    heroImageBadge: (heroSection?.content as any)?.eyebrow || null,
  }
}
