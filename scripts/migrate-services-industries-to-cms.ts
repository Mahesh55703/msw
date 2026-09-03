import { PrismaClient, SectionType } from '@prisma/client'
import { servicesData } from '../data/services.js'
import { industriesData } from '../data/industries.js'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting migration of Services and Industries to Pages CMS...\n')

  let servicesMigrated = 0
  let industriesMigrated = 0

  // 1. Migrate Services
  for (const service of servicesData) {
    const pagePath = `/services/${service.slug}`
    const pageKey = `SERVICE_${service.slug.replace(/-/g, '_').toUpperCase()}`
    
    // Check if page already exists
    let page = await prisma.page.findUnique({ where: { path: pagePath } })
    
    if (!page) {
      page = await prisma.page.create({
        data: {
          key: pageKey,
          path: pagePath,
          status: 'PUBLISHED',
        }
      })
    }

    // Create a new revision
    const version = (await prisma.pageRevision.count({ where: { pageId: page.id } })) + 1
    
    const revision = await prisma.pageRevision.create({
      data: {
        pageId: page.id,
        version,
        seoTitle: `${service.title} | LabourAxis`,
        metaDescription: service.heroSupportingText.slice(0, 160),
        canonicalUrl: `/services/${service.slug}`,
      }
    })

    // Create Sections
    let sortOrder = 0;

    // HERO
    await prisma.pageSection.create({
      data: {
        revisionId: revision.id,
        type: 'HERO',
        sortOrder: sortOrder++,
        content: {
          eyebrow: service.category,
          heading: service.title,
          description: service.heroSupportingText,
          primaryCta: { label: service.ctaText || 'Contact Us', url: '/contact' }
        }
      }
    })

    // HIGHLIGHTS (FEATURE_LIST)
    if (service.highlights?.length > 0) {
      await prisma.pageSection.create({
        data: {
          revisionId: revision.id,
          type: 'FEATURE_LIST',
          sortOrder: sortOrder++,
          content: {
            heading: "Highlights",
            features: service.highlights.map(h => ({ title: h }))
          }
        }
      })
    }

    // PROBLEM (TEXT_IMAGE)
    if (service.problemIntro || service.problemList?.length > 0 || service.problemOutro) {
      const bodyList = service.problemList?.map(item => `<li>${item}</li>`).join('') || ''
      const bodyHtml = `<p>${service.problemIntro || ''}</p><ul>${bodyList}</ul><p>${service.problemOutro || ''}</p>`
      
      await prisma.pageSection.create({
        data: {
          revisionId: revision.id,
          type: 'TEXT_IMAGE',
          sortOrder: sortOrder++,
          content: {
            heading: "The Challenge",
            body: bodyHtml,
            imagePosition: "right"
          }
        }
      })
    }

    // SERVICES (FEATURE_LIST)
    if (service.services?.length > 0) {
      await prisma.pageSection.create({
        data: {
          revisionId: revision.id,
          type: 'FEATURE_LIST',
          sortOrder: sortOrder++,
          content: {
            heading: "Our Services",
            features: service.services.map(s => ({ title: s.title, description: s.description }))
          }
        }
      })
    }

    // AUDIENCE (FEATURE_LIST)
    if (service.audience?.length > 0) {
      await prisma.pageSection.create({
        data: {
          revisionId: revision.id,
          type: 'FEATURE_LIST',
          sortOrder: sortOrder++,
          content: {
            heading: "Who We Support",
            features: service.audience.map(a => ({ title: a.title, description: a.description }))
          }
        }
      })
    }

    // DELIVERABLES & GAPS (FEATURE_LIST)
    const deliverableFeatures = (service.deliverables || []).map(d => ({ title: d }))
    const gapFeatures = (service.commonGaps || []).map(g => ({ title: g }))
    const combined = [...deliverableFeatures, ...gapFeatures].slice(0, 20) // max 20 per schema
    if (combined.length > 0) {
      await prisma.pageSection.create({
        data: {
          revisionId: revision.id,
          type: 'FEATURE_LIST',
          sortOrder: sortOrder++,
          content: {
            heading: "Deliverables & Common Gaps",
            features: combined
          }
        }
      })
    }

    // FAQS (FEATURE_LIST - since they are just text strings, we map them as features rather than ContentReferences)
    if (service.faqs?.length > 0) {
      await prisma.pageSection.create({
        data: {
          revisionId: revision.id,
          type: 'FEATURE_LIST',
          sortOrder: sortOrder++,
          content: {
            heading: "Frequently Asked Questions",
            features: service.faqs.map(f => ({ title: f.question, description: f.answer }))
          }
        }
      })
    }

    // CTA
    await prisma.pageSection.create({
      data: {
        revisionId: revision.id,
        type: 'CTA_BANNER',
        sortOrder: sortOrder++,
        content: {
          heading: service.trustLine || "Ready to get started?",
          primaryCta: { label: service.ctaText || "Contact Us", url: "/contact" }
        }
      }
    })

    // Publish this revision
    await prisma.page.update({
      where: { id: page.id },
      data: { publishedRevisionId: revision.id }
    })

    servicesMigrated++
    console.log(`Migrated Service: ${pagePath}`)
  }

  // 2. Migrate Industries
  for (const industry of industriesData) {
    const pagePath = `/industries/${industry.slug}`
    const pageKey = `INDUSTRY_${industry.slug.replace(/-/g, '_').toUpperCase()}`
    
    let page = await prisma.page.findUnique({ where: { path: pagePath } })
    
    if (!page) {
      page = await prisma.page.create({
        data: {
          key: pageKey,
          path: pagePath,
          status: 'PUBLISHED',
        }
      })
    }

    const version = (await prisma.pageRevision.count({ where: { pageId: page.id } })) + 1
    
    const revision = await prisma.pageRevision.create({
      data: {
        pageId: page.id,
        version,
        seoTitle: `${industry.title} | LabourAxis`,
        metaDescription: industry.shortDescription.slice(0, 160),
        canonicalUrl: `/industries/${industry.slug}`,
      }
    })

    let sortOrder = 0;

    // HERO
    await prisma.pageSection.create({
      data: {
        revisionId: revision.id,
        type: 'HERO',
        sortOrder: sortOrder++,
        content: {
          eyebrow: industry.title,
          heading: industry.heroH1 || industry.title,
          description: industry.heroSupportingText || industry.shortDescription,
          primaryCta: { label: industry.heroCtaText || industry.finalCtaButtonText || 'Contact Us', url: '/contact' }
        }
      }
    })

    // CHALLENGES (FEATURE_LIST)
    if (industry.challenges?.length > 0) {
      await prisma.pageSection.create({
        data: {
          revisionId: revision.id,
          type: 'FEATURE_LIST',
          sortOrder: sortOrder++,
          content: {
            heading: "Industry Challenges",
            features: industry.challenges.map(c => ({ title: c.title, description: c.description }))
          }
        }
      })
    }

    // HR & COMPLIANCE (TEXT_IMAGE or FEATURE_LIST)
    // industry.hrAndComplianceRequirements is Category { title, items[] }
    // We can map this to TEXT_IMAGE with HTML lists, or a FEATURE_LIST with text block.
    if (industry.hrAndComplianceRequirements?.length > 0) {
      const htmlBody = industry.hrAndComplianceRequirements.map(req => {
        return `<h3>${req.title}</h3><ul>${req.items.map(i => `<li>${i}</li>`).join('')}</ul>`
      }).join('')
      
      await prisma.pageSection.create({
        data: {
          revisionId: revision.id,
          type: 'TEXT_IMAGE',
          sortOrder: sortOrder++,
          content: {
            heading: "HR & Compliance Requirements",
            body: htmlBody,
            imagePosition: "right"
          }
        }
      })
    }

    // WHO WE SUPPORT (FEATURE_LIST)
    if (industry.whoWeSupport?.length > 0) {
      await prisma.pageSection.create({
        data: {
          revisionId: revision.id,
          type: 'FEATURE_LIST',
          sortOrder: sortOrder++,
          content: {
            heading: "Who We Support",
            features: industry.whoWeSupport.map(w => ({ title: w })).slice(0, 20)
          }
        }
      })
    }

    // PROCESS (FEATURE_LIST)
    if (industry.process?.length > 0) {
      await prisma.pageSection.create({
        data: {
          revisionId: revision.id,
          type: 'FEATURE_LIST',
          sortOrder: sortOrder++,
          content: {
            heading: "Our Process",
            features: industry.process.map(p => ({ title: `${p.step}: ${p.title}`, description: p.desc }))
          }
        }
      })
    }

    // FAQS (FEATURE_LIST)
    if (industry.faqs?.length > 0) {
      await prisma.pageSection.create({
        data: {
          revisionId: revision.id,
          type: 'FEATURE_LIST',
          sortOrder: sortOrder++,
          content: {
            heading: "Frequently Asked Questions",
            features: industry.faqs.map(f => ({ title: f.question, description: f.answer }))
          }
        }
      })
    }

    // CTA
    await prisma.pageSection.create({
      data: {
        revisionId: revision.id,
        type: 'CTA_BANNER',
        sortOrder: sortOrder++,
        content: {
          heading: industry.finalCtaTitle || "Ready to get started?",
          primaryCta: { label: industry.finalCtaButtonText || "Contact Us", url: "/contact" }
        }
      }
    })

    // Publish
    await prisma.page.update({
      where: { id: page.id },
      data: { publishedRevisionId: revision.id }
    })

    industriesMigrated++
    console.log(`Migrated Industry: ${pagePath}`)
  }

  console.log(`\nMigration complete.`)
  console.log(`Migrated Services: ${servicesMigrated}`)
  console.log(`Migrated Industries: ${industriesMigrated}`)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
