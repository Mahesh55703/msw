import { faqsData } from "@/data/faqs";
import type { Metadata } from "next";
import FaqClientComponent from "./FaqClientComponent";

export const metadata: Metadata = {
  title: "HR, Labour & Compliance FAQs | LabourAxis",
  description: "Find answers to frequently asked questions regarding PF, ESIC, factory compliance, contract labour, and general HR regulations in India.",
  alternates: {
    canonical: "/resources/faqs"
  }
};

export default function FaqsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqsData.flatMap(category => 
      category.faqs.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
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
