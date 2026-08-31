"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, HelpCircle, ChevronRight, Plus, ArrowRight, ShieldCheck } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import type { FaqCategory } from "@/data/faqs";

export default function FaqClientComponent({ initialData }: { initialData: FaqCategory[] }) {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Extract popular questions
  const popularQuestions = initialData
    .flatMap(cat => cat.faqs)
    .filter(faq => faq.isPopular)
    .slice(0, 6);

  // Filter data based on search and tab
  const filteredData = initialData.map(category => {
    // If a tab is selected (and not 'all'), and this is not the active tab, return no faqs
    if (activeTab !== "all" && category.id !== activeTab) {
      return { ...category, faqs: [] };
    }

    // Filter by search query
    const filteredFaqs = category.faqs.filter(faq => 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return { ...category, faqs: filteredFaqs };
  }).filter(category => category.faqs.length > 0);

  // Generate FAQ Schema (only for currently displayed FAQs to match what Google sees)
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": filteredData.flatMap(cat => cat.faqs).map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <div className="flex flex-col pb-24 bg-[#F7F4EC] min-h-screen overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      
      {/* Breadcrumbs */}
      <div className="bg-[#12372A] border-b border-white/10 pt-6 pb-4">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl">
          <nav className="flex items-center text-xs md:text-sm text-[#A2B3AA] font-medium">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 mx-2 text-[#66736D]" />
            <Link href="/resources" className="hover:text-white transition-colors">Resources</Link>
            <ChevronRight className="w-3.5 h-3.5 mx-2 text-[#66736D]" />
            <span className="text-white">FAQs</span>
          </nav>
        </div>
      </div>

      {/* Header Area */}
      <section className="bg-[#12372A] text-white pt-12 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-forest opacity-30 pointer-events-none"></div>
        <div className="container mx-auto px-4 md:px-8 max-w-4xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#D6A84F] uppercase tracking-wider mb-4 bg-[#1B4E3C]/80 border border-[#D6A84F]/30 px-3.5 py-1.5 rounded-full shadow-xs">
            <ShieldCheck className="w-4 h-4 text-[#D6A84F]" />
            <span>Compliance Knowledge Base</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-balance leading-tight">
            Frequently Asked Questions
          </h1>

          <p className="text-lg md:text-xl text-[#A2B3AA] mb-10 max-w-2xl mx-auto text-balance leading-relaxed">
            Find practical answers to common HR, labour, statutory compliance and workforce-management questions.
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#66736D]" />
            <input 
              type="text" 
              placeholder="Search FAQs (e.g. PF, ESIC, payroll...)" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white text-[#202522] rounded-2xl pl-13 pr-6 py-4 outline-none focus:ring-4 focus:ring-[#1F7A5C]/20 border border-[#D9E1DC] shadow-xl text-base"
            />
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-8 max-w-4xl py-12">
        
        {/* Popular Questions */}
        {searchQuery === "" && activeTab === "all" && popularQuestions.length > 0 && (
          <div className="mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#66736D] mb-4 pb-2 border-b border-[#D9E1DC]">
              Popular Questions
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {popularQuestions.map((faq, idx) => (
                <div key={idx} className="bg-white border border-[#D9E1DC] p-6 rounded-3xl shadow-2xs">
                  <h3 className="font-bold text-[#12372A] text-sm mb-2">{faq.question}</h3>
                  <div className="text-xs text-[#66736D] line-clamp-2 leading-relaxed" dangerouslySetInnerHTML={{ __html: faq.answer }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category Tabs */}
        <div className="mb-12">
          <div className="flex flex-wrap gap-2 pb-4 border-b border-[#D9E1DC]">
            <button
              onClick={() => setActiveTab("all")}
              className={`whitespace-nowrap px-4 py-2 rounded-full font-bold text-xs md:text-sm transition-all cursor-pointer ${
                activeTab === "all" ? "bg-[#12372A] text-white shadow-xs" : "bg-white border border-[#D9E1DC] text-[#202522] hover:bg-[#1F7A5C] hover:text-white"
              }`}
            >
              All Categories
            </button>
            {initialData.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`whitespace-nowrap px-4 py-2 rounded-full font-bold text-xs md:text-sm transition-all cursor-pointer ${
                  activeTab === cat.id ? "bg-[#12372A] text-white shadow-xs" : "bg-white border border-[#D9E1DC] text-[#202522] hover:bg-[#1F7A5C] hover:text-white"
                }`}
              >
                {cat.title}
              </button>
            ))}
          </div>
        </div>

        {/* Search Results count & Context Header */}
        {searchQuery !== "" ? (
          <div className="mb-8 font-bold text-[#66736D] text-sm">
            Showing results for "{searchQuery}" {activeTab !== "all" && `in ${initialData.find(c => c.id === activeTab)?.title}`}
          </div>
        ) : activeTab === "all" ? (
          <h2 className="text-2xl font-bold text-[#12372A] mb-6 pb-2 border-b border-[#D9E1DC]">All Frequently Asked Questions</h2>
        ) : null}

        {/* FAQ Categories & Questions */}
        <div className="space-y-12">
          {filteredData.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-[#D9E1DC] p-8">
              <HelpCircle className="w-12 h-12 text-[#66736D] mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-[#12372A] mb-2">No FAQs found</h3>
              <p className="text-base text-[#66736D] max-w-md mx-auto mb-8 text-balance">
                We couldn't find an answer matching your search. Try a different keyword or discuss your requirement with LabourAxis.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button onClick={() => setSearchQuery("")} className={buttonVariants({ variant: "outline", className: "rounded-xl font-semibold cursor-pointer border-[#D9E1DC]" })}>
                  Clear Search
                </button>
                <Link href="/contact" className={buttonVariants({ variant: "default", className: "bg-[#1F7A5C] hover:bg-[#165B44] text-white rounded-xl font-bold" })}>
                  Discuss Your HR Requirement
                </Link>
              </div>
            </div>
          ) : activeTab === "all" ? (
            // Flatten list for "All" tab
            <div className="space-y-4">
              {filteredData.flatMap(cat => cat.faqs).map((faq, idx) => (
                <details key={idx} className="group bg-white border border-[#D9E1DC] rounded-3xl [&_summary::-webkit-details-marker]:hidden shadow-2xs">
                  <summary className="flex cursor-pointer items-start sm:items-center justify-between p-5 md:p-6 font-bold text-[#12372A] select-none">
                    <span className="text-base md:text-lg pr-4 font-semibold text-[#12372A] group-open:text-[#1F7A5C] transition-colors">{faq.question}</span>
                    <span className="ml-2 flex-shrink-0 w-8 h-8 rounded-full bg-[#F7F4EC] border border-[#D9E1DC] flex items-center justify-center text-[#66736D] group-open:bg-[#1F7A5C] group-open:border-[#1F7A5C] group-open:text-white transition-all duration-200">
                      <Plus className="w-4 h-4 transition-transform duration-300 group-open:rotate-45" />
                    </span>
                  </summary>
                  <div className="px-5 md:px-6 pb-6 text-[#202522] text-sm md:text-base leading-relaxed border-t border-[#D9E1DC]/60 pt-4 mt-1">
                    <div className="prose prose-slate max-w-none prose-p:leading-relaxed prose-a:text-[#1F7A5C]" dangerouslySetInnerHTML={{ __html: faq.answer }} />
                  </div>
                </details>
              ))}
              {searchQuery === "" && (
                 <div className="mt-12 bg-[#12372A] p-8 md:p-12 rounded-3xl text-center text-white shadow-xl relative overflow-hidden">
                   <div className="absolute inset-0 bg-grid-forest opacity-30 pointer-events-none"></div>
                   <div className="relative z-10">
                     <h3 className="text-2xl md:text-3xl font-bold mb-4">Need help improving your HR processes?</h3>
                     <Link href="/contact" className={buttonVariants({ size: "lg", className: "bg-[#1F7A5C] hover:bg-[#165B44] text-white font-bold px-8 py-4 rounded-xl shadow-lg mt-2 group" })}>
                       <span>Discuss Your HR Requirement</span>
                       <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                     </Link>
                   </div>
                 </div>
              )}
            </div>
          ) : (
            // Categorized list when specific category selected
            filteredData.map(category => (
              <div key={category.id} className="scroll-mt-8">
                {searchQuery !== "" && (
                  <h2 className="text-2xl font-bold text-[#12372A] mb-6 pb-2 border-b border-[#D9E1DC]">{category.title}</h2>
                )}
                <div className="space-y-4">
                  {category.faqs.map((faq, idx) => (
                    <details key={idx} className="group bg-white border border-[#D9E1DC] rounded-3xl [&_summary::-webkit-details-marker]:hidden shadow-2xs">
                      <summary className="flex cursor-pointer items-start sm:items-center justify-between p-5 md:p-6 font-bold text-[#12372A] select-none">
                        <span className="text-base md:text-lg pr-4 font-semibold text-[#12372A] group-open:text-[#1F7A5C] transition-colors">{faq.question}</span>
                        <span className="ml-2 flex-shrink-0 w-8 h-8 rounded-full bg-[#F7F4EC] border border-[#D9E1DC] flex items-center justify-center text-[#66736D] group-open:bg-[#1F7A5C] group-open:border-[#1F7A5C] group-open:text-white transition-all duration-200">
                          <Plus className="w-4 h-4 transition-transform duration-300 group-open:rotate-45" />
                        </span>
                      </summary>
                      <div className="px-5 md:px-6 pb-6 text-[#202522] text-sm md:text-base leading-relaxed border-t border-[#D9E1DC]/60 pt-4 mt-1">
                        <div className="prose prose-slate max-w-none prose-p:leading-relaxed prose-a:text-[#1F7A5C]" dangerouslySetInnerHTML={{ __html: faq.answer }} />
                      </div>
                    </details>
                  ))}
                </div>

                {/* Contextual Category CTA */}
                {searchQuery === "" && (
                  <div className="mt-12 bg-[#12372A] p-8 md:p-12 rounded-3xl text-center text-white shadow-xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-grid-forest opacity-30 pointer-events-none"></div>
                    <div className="relative z-10">
                      <h3 className="text-2xl md:text-3xl font-bold mb-4">{category.ctaText}</h3>
                      <Link href={category.ctaLink} className={buttonVariants({ size: "lg", className: "bg-[#1F7A5C] hover:bg-[#165B44] text-white font-bold px-8 py-4 rounded-xl shadow-lg mt-2 group" })}>
                        <span>{category.ctaButton}</span>
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
