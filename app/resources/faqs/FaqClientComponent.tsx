"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, HelpCircle } from "lucide-react";
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

  return (
    <div className="flex flex-col pb-24 bg-white min-h-screen">
      
      {/* Header Area */}
      <section className="bg-slate-900 text-white pt-20 pb-16">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl text-center">
          <HelpCircle className="w-12 h-12 mx-auto mb-6 text-blue-400" />
          <h1 className="text-3xl md:text-5xl font-bold mb-6 text-balance">Frequently Asked Questions</h1>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            Find practical answers to common HR, labour, statutory compliance and workforce-management questions.
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search FAQs (e.g. PF, ESIC, payroll...)" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white text-slate-900 rounded-full pl-12 pr-6 py-4 outline-none focus:ring-2 focus:ring-blue-500 shadow-lg text-lg"
            />
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-8 max-w-4xl py-12">
        
        {/* Popular Questions (Only show when not searching and active tab is 'all') */}
        {searchQuery === "" && activeTab === "all" && popularQuestions.length > 0 && (
          <div className="mb-16">
            <h2 className="text-xl font-bold text-slate-900 mb-6 uppercase tracking-wider text-sm border-b border-slate-200 pb-2">Popular Questions</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {popularQuestions.map((faq, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 p-4 rounded-lg shadow-sm">
                  <h3 className="font-bold text-slate-900 mb-2">{faq.question}</h3>
                  <p className="text-sm text-slate-600 line-clamp-2">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        {searchQuery === "" && (
          <div className="mb-12">
            <div className="flex flex-wrap gap-2 pb-4 border-b border-slate-200">
              <button
                onClick={() => setActiveTab("all")}
                className={`whitespace-nowrap px-4 py-2 rounded-full font-bold text-sm transition-colors ${
                  activeTab === "all" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                All
              </button>
              {initialData.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full font-bold text-sm transition-colors ${
                    activeTab === cat.id ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cat.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Results count */}
        {searchQuery !== "" && (
          <div className="mb-8 font-bold text-slate-600">
            Showing results for "{searchQuery}"
          </div>
        )}

        {/* FAQ Categories & Questions */}
        <div className="space-y-16">
          {filteredData.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-slate-600">No questions found matching your search.</p>
              <button onClick={() => setSearchQuery("")} className="mt-4 text-blue-600 font-bold hover:underline">
                Clear search
              </button>
            </div>
          ) : (
            filteredData.map(category => (
              <div key={category.id} className="scroll-mt-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 pb-2 border-b border-slate-200">{category.title}</h2>
                <div className="space-y-4">
                  {category.faqs.map((faq, idx) => (
                    <details key={idx} className="group bg-white border border-slate-200 rounded-lg [&_summary::-webkit-details-marker]:hidden shadow-sm">
                      <summary className="flex cursor-pointer items-center justify-between p-6 font-bold text-slate-900">
                        <span className="text-lg pr-4">{faq.question}</span>
                        <span className="ml-1.5 flex-shrink-0 bg-slate-50 shadow-sm border border-slate-200 p-1.5 rounded-full text-slate-500 group-open:bg-blue-100 group-open:border-blue-200 group-open:text-blue-700 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0 transition-transform duration-300 group-open:-rotate-180" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </span>
                      </summary>
                      <div className="px-6 pb-6 text-slate-600 leading-relaxed border-t border-slate-100 pt-4 mt-2">
                        <p>{faq.answer}</p>
                      </div>
                    </details>
                  ))}
                </div>

                {/* Category CTA (only show if not searching or if it's the only category shown) */}
                {(searchQuery === "" || filteredData.length === 1) && (
                  <div className="mt-8 bg-slate-50 p-8 rounded-xl border border-slate-200 text-center">
                    <h3 className="text-xl font-bold text-slate-900 mb-4">{category.ctaText}</h3>
                    <Link href={category.ctaLink} className={buttonVariants({ variant: "default" })}>
                      {category.ctaButton}
                    </Link>
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
