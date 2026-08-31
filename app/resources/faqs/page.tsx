import type { Metadata } from "next";
import FaqClientComponent from "./FaqClientComponent";
import prisma from "@/lib/prisma";

export const metadata: Metadata = {
  title: "HR, Labour & Compliance FAQs | LabourAxis",
  description: "Find answers to frequently asked questions regarding PF, ESIC, factory compliance, contract labour, and general HR regulations in India.",
  alternates: {
    canonical: "/resources/faqs"
  }
};

const CATEGORIES_META: Record<string, { title: string, ctaText: string, ctaLink: string, ctaButton: string }> = {
  HR_OPERATIONS: { title: 'HR & HR Operations', ctaText: 'Need help improving your HR processes?', ctaLink: '/services/hr-consulting', ctaButton: 'Discuss Your HR Requirement' },
  LABOUR_COMPLIANCE: { title: 'Labour Compliance', ctaText: 'Unsure about your compliance status?', ctaLink: '/compliance-health-check', ctaButton: 'Request a Health Check' },
  PF_EPFO: { title: 'PF & EPFO', ctaText: 'Need assistance with PF compliance?', ctaLink: '/services/pf-esic-compliance', ctaButton: 'Get PF Support' },
  ESIC: { title: 'ESIC', ctaText: 'Need assistance with ESIC compliance?', ctaLink: '/services/pf-esic-compliance', ctaButton: 'Get ESIC Support' },
  PAYROLL: { title: 'Payroll & Attendance', ctaText: 'Looking for reliable payroll processing?', ctaLink: '/services/payroll-compliance', ctaButton: 'Explore Payroll Services' },
  FACTORY_COMPLIANCE: { title: 'Factory Compliance', ctaText: 'Need to review your factory compliance?', ctaLink: '/services/factory-compliance', ctaButton: 'Get Factory Support' },
  CONTRACT_LABOUR: { title: 'Contract Labour', ctaText: 'Managing contract workers?', ctaLink: '/services/contract-labour', ctaButton: 'Get Contract Labour Support' },
  INDUSTRIAL_RELATIONS: { title: 'Industrial Relations', ctaText: 'Need help with employee relations?', ctaLink: '/services/industrial-relations', ctaButton: 'Get IR Support' }
};

export default async function FaqsPage() {
  const dbFaqs = await prisma.faq.findMany({
    where: { published: true, category: { not: 'UNCATEGORIZED' } },
    orderBy: [
      { category: 'asc' },
      { displayOrder: 'asc' },
      { createdAt: 'desc' }
    ]
  });

  // Group FAQs by category
  const groupedFaqs: Record<string, any[]> = {};
  dbFaqs.forEach(faq => {
    if (!groupedFaqs[faq.category]) groupedFaqs[faq.category] = [];
    groupedFaqs[faq.category].push({
      question: faq.question,
      answer: faq.answer,
      isPopular: false
    });
  });

  const faqsData = Object.keys(CATEGORIES_META).map(key => {
    return {
      id: key,
      title: CATEGORIES_META[key].title,
      ctaText: CATEGORIES_META[key].ctaText,
      ctaLink: CATEGORIES_META[key].ctaLink,
      ctaButton: CATEGORIES_META[key].ctaButton,
      faqs: groupedFaqs[key] || []
    };
  }).filter(cat => cat.faqs.length > 0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqsData.flatMap(category => 
      category.faqs.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer.replace(/<[^>]+>/g, '') // strip HTML for schema
        }
      }))
    )
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <FaqClientComponent initialData={faqsData} />
    </>
  );
}
