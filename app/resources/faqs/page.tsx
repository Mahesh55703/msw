import { faqsData } from "@/data/faqs";
import type { Metadata } from "next";
import FaqClientComponent from "./FaqClientComponent";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | LabourAxis",
  description: "Find practical answers to common HR, labour, statutory compliance and workforce-management questions.",
};

export default function FaqsPage() {
  return <FaqClientComponent initialData={faqsData} />;
}
