import type { Metadata } from 'next'
import FaqClientComponent from './FaqClientComponent'
import prisma from '@/lib/prisma'
import { FAQ_CATEGORY_LABELS, FaqCategoryType } from '@/lib/validations/faq'

export const metadata: Metadata = {
  title: 'HR, Labour & Statutory Compliance FAQs | LabourAxis',
  description:
    'Clear, practical answers to frequently asked questions on PF, ESIC, factory compliance, contract labour, payroll, and workforce regulations in India.',
  alternates: {
    canonical: 'https://www.labouraxis.com/resources/faqs',
  },
  openGraph: {
    title: 'HR, Labour & Statutory Compliance FAQs | LabourAxis',
    description:
      'Clear, practical answers to frequently asked questions on PF, ESIC, factory compliance, contract labour, payroll, and workforce regulations in India.',
    url: 'https://www.labouraxis.com/resources/faqs',
    type: 'website',
  },
}

const CATEGORIES_CONFIG: {
  id: FaqCategoryType
  title: string
  ctaText: string
  ctaLink: string
  ctaButton: string
}[] = [
  {
    id: 'HR_OPERATIONS',
    title: 'HR & HR Operations',
    ctaText: 'Need help structuring your HR operations and documentation?',
    ctaLink: '/services/hr-consulting',
    ctaButton: 'Discuss Your HR Requirement',
  },
  {
    id: 'LABOUR_COMPLIANCE',
    title: 'Labour Compliance',
    ctaText: 'Unsure about your current statutory labour compliance status?',
    ctaLink: '/compliance-health-check',
    ctaButton: 'Request a Health Check',
  },
  {
    id: 'PF_EPFO',
    title: 'PF & EPFO',
    ctaText: 'Need assistance with EPF registration, ECR filing, or inspections?',
    ctaLink: '/services/pf-esic-compliance',
    ctaButton: 'Get PF Support',
  },
  {
    id: 'ESIC',
    title: 'ESIC',
    ctaText: 'Need help managing ESIC registrations, challans, or worker coverage?',
    ctaLink: '/services/pf-esic-compliance',
    ctaButton: 'Get ESIC Support',
  },
  {
    id: 'PAYROLL',
    title: 'Payroll & Attendance',
    ctaText: 'Looking for accurate payroll processing and statutory deduction audits?',
    ctaLink: '/services/payroll-compliance',
    ctaButton: 'Explore Payroll Services',
  },
  {
    id: 'FACTORY_COMPLIANCE',
    title: 'Factory Compliance',
    ctaText: 'Need to review your factory licence, registers, or safety compliance?',
    ctaLink: '/services/factory-compliance',
    ctaButton: 'Get Factory Support',
  },
  {
    id: 'CONTRACT_LABOUR',
    title: 'Contract Labour',
    ctaText: 'Engaging contract workers? Ensure CLRA licensing and contractor audits.',
    ctaLink: '/services/contract-labour',
    ctaButton: 'Get Contract Labour Support',
  },
  {
    id: 'INDUSTRIAL_RELATIONS',
    title: 'Industrial Relations',
    ctaText: 'Need help with disciplinary processes, grievance redressal, or standing orders?',
    ctaLink: '/services/industrial-relations',
    ctaButton: 'Get IR Advisory',
  },
]

export default async function FaqsPage() {
  const dbFaqs = await prisma.faq.findMany({
    where: {
      published: true,
      category: { not: 'UNCATEGORIZED' },
    },
    orderBy: [
      { category: 'asc' },
      { displayOrder: 'asc' },
      { createdAt: 'asc' },
    ],
  })

  // Group FAQs by category
  const groupedFaqs: Record<string, { id: string; question: string; answer: string; displayOrder: number }[]> = {}
  dbFaqs.forEach((faq) => {
    if (!groupedFaqs[faq.category]) groupedFaqs[faq.category] = []
    groupedFaqs[faq.category].push({
      id: faq.id,
      question: faq.question,
      answer: faq.answer,
      displayOrder: faq.displayOrder,
    })
  })

  const structuredCategories = CATEGORIES_CONFIG.map((config) => ({
    id: config.id,
    title: config.title,
    ctaText: config.ctaText,
    ctaLink: config.ctaLink,
    ctaButton: config.ctaButton,
    faqs: groupedFaqs[config.id] || [],
  })).filter((cat) => cat.faqs.length > 0)

  // Clean, server-side FAQPage JSON-LD schema (only published FAQs)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: structuredCategories.flatMap((category) =>
      category.faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer.replace(/<[^>]+>/g, '').trim(),
        },
      }))
    ),
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
        name: 'FAQs',
        item: 'https://www.labouraxis.com/resources/faqs',
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <FaqClientComponent initialData={structuredCategories} />
    </>
  )
}
