import { PrismaClient, SectionType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting Phase 5F Content Migration...')

  // 1. Map HOME
  await migratePage('HOME', {
    seoTitle: 'LabourAxis | Industrial HR & Labour Compliance Consultancy',
    metaDescription: 'Practical HR, labour compliance, PF, ESIC and workforce support for factories, MSMEs and workforce-intensive businesses across India.',
    canonicalUrl: '/',
    sections: [
      {
        type: SectionType.HERO,
        content: {
          eyebrow: 'Industrial HR & Labour Compliance Consultancy',
          heading: 'Simplify HR. Strengthen Compliance. Reduce Risk.',
          description: 'Industrial HR, Labour & Statutory Compliance solutions for factories, MSMEs and growing businesses.',
          primaryCta: { label: 'Request a Consultation', url: '/contact' },
          secondaryCta: { label: 'Explore Services', url: '/services' }
        }
      },
      {
        type: SectionType.FEATURE_LIST,
        content: {
          heading: 'Why businesses work with us',
          description: 'More than routine HR paperwork. We provide structured compliance and HR support.',
          features: [
            { title: 'Practical Compliance Approach', description: 'We focus on actual operational compliance rather than paperwork alone.' },
            { title: 'Industry-Focused HR', description: 'Solutions designed around the realities of factories and workforce-intensive businesses.' },
            { title: 'End-to-End Support', description: 'From registration and documentation to ongoing statutory compliance.' },
            { title: 'Proactive Compliance', description: 'Identify gaps before they become costly problems.' }
          ]
        }
      },
      {
        type: SectionType.FEATURE_LIST,
        content: {
          heading: 'How We Work',
          description: 'A structured approach to bringing compliance under control.',
          features: [
            { title: 'Understand', description: 'Understand the organization\'s workforce and compliance requirements.' },
            { title: 'Assess', description: 'Review existing HR and compliance processes to identify gaps.' },
            { title: 'Implement', description: 'Help organize processes, records, and compliance activities.' },
            { title: 'Monitor', description: 'Track recurring compliance requirements and upcoming deadlines.' }
          ]
        }
      },
      {
        type: SectionType.CTA_BANNER,
        content: {
          heading: 'Not sure where your compliance gaps are?',
          description: 'Request a preliminary compliance discussion and understand which areas of your workforce operations may need attention.',
          ctaLabel: 'Discuss Your Compliance Requirements',
          ctaUrl: '/contact'
        }
      }
    ]
  })

  // 2. Map ABOUT
  await migratePage('ABOUT', {
    seoTitle: 'About LabourAxis | Industrial HR & Labour Compliance',
    metaDescription: 'Learn about LabourAxis, our mission, values, and our expertise in providing practical HR and statutory compliance support for workforce-intensive businesses.',
    canonicalUrl: '/about',
    sections: [
      {
        type: SectionType.HERO,
        content: {
          eyebrow: 'About LabourAxis',
          heading: 'About LabourAxis',
          description: 'Practical HR and labour compliance for businesses that employ people. LabourAxis focuses on the intersection of HR Operations, Labour Compliance, Industrial Relations, and Workforce Management.',
        }
      },
      {
        type: SectionType.TEXT_IMAGE,
        content: {
          heading: 'Who We Are',
          body: 'LabourAxis is being built around a simple idea: HR and compliance should not operate as disconnected administrative functions. Businesses need structured HR processes, organized workforce records, clear compliance tracking and practical support to manage their people effectively.\n\nOur Vision: To build a trusted ecosystem for practical industrial HR, labour compliance and workforce management.',
        }
      },
      {
        type: SectionType.FEATURE_LIST,
        content: {
          heading: 'What We Focus On',
          features: [
            { title: 'HR Operations', description: 'Building practical HR processes and documentation.' },
            { title: 'Labour Compliance', description: 'Helping businesses understand, organize and manage applicable compliance requirements.' },
            { title: 'Industrial Relations', description: 'Supporting employee relations and workforce-related processes.' },
            { title: 'Compliance Management', description: 'Helping businesses identify gaps, organize documentation and establish recurring compliance processes.' }
          ]
        }
      },
      {
        type: SectionType.FEATURE_LIST,
        content: {
          heading: 'Our Approach',
          description: 'Our signature methodology applied to your establishment.',
          features: [
            { title: 'Understand', description: 'We begin by understanding your establishment, workforce dynamics and current HR setup.' },
            { title: 'Assess', description: 'We review existing processes, records and applicable requirements.' },
            { title: 'Identify', description: 'We identify documentation gaps, process gaps and areas requiring attention.' },
            { title: 'Implement', description: 'We help organize the required process, documentation and recurring activities.' },
            { title: 'Monitor', description: 'We establish a process for ongoing compliance tracking and improvement.' }
          ]
        }
      },
      {
        type: SectionType.FEATURE_LIST,
        content: {
          heading: 'Why LabourAxis',
          features: [
            { title: 'Industrial Focus', description: 'Designed around factories, MSMEs and workforce-intensive organizations.' },
            { title: 'Practical Approach', description: 'Focused on operational processes rather than paperwork alone.' },
            { title: 'Integrated Perspective', description: 'HR, labour compliance, workforce documentation and industrial relations considered together.' },
            { title: 'Professional Coordination', description: 'Specialist matters can be coordinated with appropriately qualified professionals when required.' }
          ]
        }
      },
      {
        type: SectionType.FEATURE_LIST,
        content: {
          heading: 'Our Commitment',
          features: [
            { title: 'Accuracy', description: 'We aim to provide clear, responsible and appropriately qualified guidance.' },
            { title: 'Transparency', description: 'We clearly distinguish consultancy support from regulated professional services.' },
            { title: 'Practicality', description: 'Our focus is on processes businesses can actually implement.' },
            { title: 'Continuous Learning', description: 'Labour and compliance requirements evolve. Our knowledge and resources are developed accordingly.' }
          ]
        }
      },
      {
        type: SectionType.CTA_BANNER,
        content: {
          heading: 'Building better HR and compliance processes?',
          description: 'Connect with LabourAxis to discuss your organization\'s specific workforce setup and requirements.',
          ctaLabel: 'Discuss Your Requirements',
          ctaUrl: '/contact'
        }
      }
    ]
  })

  // 3. Map CONTACT
  await migratePage('CONTACT', {
    seoTitle: 'Contact LabourAxis | HR & Labour Compliance Consultation',
    metaDescription: 'Get in touch with LabourAxis for practical HR, labour compliance, PF, ESIC, and workforce support tailored to your business needs.',
    canonicalUrl: '/contact',
    sections: [
      {
        type: SectionType.HERO,
        content: {
          eyebrow: 'Consultation & Enquiries',
          heading: 'Discuss Your HR & Compliance Requirements',
          description: 'Whether you need a full compliance audit, routine HR support, or contractor compliance tracking, our team is ready to assist.'
        }
      }
    ]
  })

  // 4. Map SERVICES
  await migratePage('SERVICES', {
    seoTitle: 'HR & Labour Compliance Services | LabourAxis',
    metaDescription: 'Explore LabourAxis services including PF, ESIC, Factory Compliance, Contract Labour, and comprehensive HR consulting for Indian industries.',
    canonicalUrl: '/services',
    sections: [
      {
        type: SectionType.HERO,
        content: {
          eyebrow: 'Comprehensive Consultancy Suite',
          heading: 'Our Services',
          description: 'Structured HR and compliance solutions designed for businesses dealing with large workforces and strict statutory requirements.'
        }
      }
    ]
  })

  // 5. Map INDUSTRIES
  await migratePage('INDUSTRIES', {
    seoTitle: 'Industries We Serve | LabourAxis',
    metaDescription: 'LabourAxis provides tailored HR and compliance solutions across manufacturing, construction, logistics, and other workforce-intensive industries.',
    canonicalUrl: '/industries',
    sections: [
      {
        type: SectionType.HERO,
        content: {
          eyebrow: 'Industry-Focused HR & Compliance',
          heading: 'HR & Labour Compliance Solutions by Industry',
          description: 'Workforce requirements, labour compliance and HR challenges vary by industry. LabourAxis provides practical HR and compliance support tailored to the operational realities of different businesses.'
        }
      }
    ]
  })

  // 6. Map RESOURCES
  await migratePage('RESOURCES', {
    seoTitle: 'HR & Labour Compliance Resources | LabourAxis',
    metaDescription: 'Access LabourAxis resources including guides, articles, checklists, and updates to stay compliant with Indian labour laws and statutory regulations.',
    canonicalUrl: '/resources',
    sections: [
      {
        type: SectionType.HERO,
        content: {
          eyebrow: 'Knowledge & Insights Center',
          heading: 'HR, Labour & Compliance Resources',
          description: 'Practical guides, checklists, FAQs and compliance insights to help businesses understand and manage HR and labour requirements.'
        }
      }
    ]
  })

  // 7. Map TEAM
  await migratePage('TEAM', {
    seoTitle: 'Our Team & Leadership Hierarchy | LabourAxis',
    metaDescription: 'Meet the LabourAxis leadership team and practitioner hierarchy dedicated to helping factories and MSMEs across India achieve pristine labour compliance.',
    canonicalUrl: '/team',
    sections: [
      {
        type: SectionType.HERO,
        content: {
          eyebrow: 'Leadership & Corporate Advisory',
          heading: 'Meet the People Behind LabourAxis',
          description: 'A multidisciplinary team focused on HR operations, labour compliance, workforce management and industrial relations.',
          primaryCta: { label: 'Explore Open Positions', url: '/careers' },
          secondaryCta: { label: 'Connect with Advisory', url: '/contact' }
        }
      }
    ]
  })

  // 8. Map CAREERS
  await migratePage('CAREERS', {
    seoTitle: 'Careers at LabourAxis | Industrial HR & Labour Compliance Opportunities',
    metaDescription: 'Explore current job openings and career opportunities at LabourAxis. Join our team of factory compliance consultants, industrial relations experts, and HR specialists across India.',
    canonicalUrl: '/careers',
    sections: [
      {
        type: SectionType.HERO,
        content: {
          eyebrow: 'Careers at LabourAxis',
          heading: 'Build the Future of Industrial HR & Labour Compliance',
          description: 'Join LabourAxis and advise industrial plants, MSMEs, and enterprise employers on statutory integrity, inspection defense, and workforce operations.',
          primaryCta: { label: 'Explore Open Positions', url: '#open-positions' }
        }
      }
    ]
  })

  // 9. Map COMPLIANCE_HEALTH_CHECK
  await migratePage('COMPLIANCE_HEALTH_CHECK', {
    seoTitle: 'Labour & Statutory Compliance Health Check | LabourAxis',
    metaDescription: 'Request a comprehensive health check from LabourAxis to identify gaps, mitigate risks, and strengthen your statutory and labour compliance frameworks.',
    canonicalUrl: '/compliance-health-check',
    sections: [
      {
        type: SectionType.HERO,
        content: {
          eyebrow: 'Proactive Diagnostic Assessment',
          heading: 'Labour & Statutory Compliance Health Check',
          description: 'Identify gaps in your HR documentation, workforce processes, and statutory records before they become costly liabilities.',
          primaryCta: { label: 'Request a Health Check', url: '/contact' },
          secondaryCta: { label: 'Explore Review Scope', url: '#scope' }
        }
      }
    ]
  })

  console.log('Phase 5F Content Migration completed successfully.')
}

async function migratePage(key: string, data: any) {
  const page = await prisma.page.findUnique({ where: { key } })
  if (!page) {
    console.log(`Page ${key} not found, skipping.`)
    return
  }

  // Update Published Revision
  if (page.publishedRevisionId) {
    await prisma.pageRevision.update({
      where: { id: page.publishedRevisionId },
      data: {
        seoTitle: data.seoTitle,
        metaDescription: data.metaDescription,
        canonicalUrl: data.canonicalUrl,
      }
    })

    // Wipe existing sections
    await prisma.pageSection.deleteMany({
      where: { revisionId: page.publishedRevisionId }
    })

    // Insert new sections
    for (let i = 0; i < data.sections.length; i++) {
      const sec = data.sections[i]
      await prisma.pageSection.create({
        data: {
          revisionId: page.publishedRevisionId,
          type: sec.type,
          sortOrder: i,
          content: sec.content,
          isVisible: true
        }
      })
    }
    console.log(`Migrated content for ${key}`)
  }
}

main().finally(async () => {
  await prisma.$disconnect()
})
