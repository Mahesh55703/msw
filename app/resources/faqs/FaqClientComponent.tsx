'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, HelpCircle, ChevronRight, Plus, ArrowRight, ShieldCheck, X } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'

interface FaqItem {
  id?: string
  question: string
  answer: string
  displayOrder?: number
}

interface CategoryGroup {
  id: string
  title: string
  ctaText: string
  ctaButton: string
  ctaLink: string
  faqs: FaqItem[]
}

interface FaqClientComponentProps {
  initialData: CategoryGroup[]
}

export default function FaqClientComponent({ initialData }: FaqClientComponentProps) {
  const [activeTab, setActiveTab] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Compute filtered categories and items based on search and active tab
  const filteredData = useMemo(() => {
    const trimmedQuery = searchQuery.trim().toLowerCase()

    return initialData
      .map((category) => {
        // If a specific category tab is selected, only consider that category
        if (activeTab !== 'all' && category.id !== activeTab) {
          return { ...category, faqs: [] }
        }

        // If no search query, return all faqs in this category
        if (!trimmedQuery) {
          return category
        }

        // Filter FAQs by question or answer
        const matchingFaqs = category.faqs.filter(
          (faq) =>
            faq.question.toLowerCase().includes(trimmedQuery) ||
            faq.answer.toLowerCase().includes(trimmedQuery)
        )

        return { ...category, faqs: matchingFaqs }
      })
      .filter((category) => category.faqs.length > 0)
  }, [initialData, activeTab, searchQuery])

  const totalFilteredCount = filteredData.reduce((acc, cat) => acc + cat.faqs.length, 0)
  const currentCategoryObj = initialData.find((c) => c.id === activeTab)

  return (
    <div className="flex flex-col pb-24 bg-[#F7F4EC] min-h-screen overflow-x-hidden">
      {/* Breadcrumbs */}
      <div className="bg-[#12372A] border-b border-white/10 pt-6 pb-4">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl">
          <nav className="flex items-center text-xs md:text-sm text-[#A2B3AA] font-medium" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 mx-2 text-[#66736D]" />
            <Link href="/resources" className="hover:text-white transition-colors">
              Resources
            </Link>
            <ChevronRight className="w-3.5 h-3.5 mx-2 text-[#66736D]" />
            <span className="text-white">FAQs</span>
          </nav>
        </div>
      </div>

      {/* Hero Header */}
      <section className="bg-[#12372A] text-white pt-12 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-forest opacity-30 pointer-events-none" />
        <div className="container mx-auto px-4 md:px-8 max-w-4xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#D6A84F] uppercase tracking-wider mb-4 bg-[#1B4E3C]/80 border border-[#D6A84F]/30 px-3.5 py-1.5 rounded-full shadow-xs">
            <ShieldCheck className="w-4 h-4 text-[#D6A84F]" />
            <span>Compliance Knowledge Base</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-balance leading-tight">
            Frequently Asked Questions
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-[#A2B3AA] mb-10 max-w-2xl mx-auto text-balance leading-relaxed">
            Find practical, authoritative answers to common HR, labour law, factory regulation, and statutory compliance questions.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#66736D]" />
            <input
              type="text"
              placeholder="Search FAQs (e.g. PF, ESIC, payroll, muster rolls...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white text-[#202522] rounded-2xl pl-13 pr-12 py-4 outline-none focus:ring-4 focus:ring-[#1F7A5C]/20 border border-[#D9E1DC] shadow-xl text-sm sm:text-base font-medium placeholder-[#66736D]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-[#66736D] hover:text-[#12372A] rounded-lg transition-colors"
                title="Clear search query"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Main FAQ Content Area */}
      <div className="container mx-auto px-4 md:px-8 max-w-4xl py-12">
        {/* Horizontal Category Navigation Tabs */}
        <div className="mb-10">
          <div className="flex items-center gap-2 overflow-x-auto pb-3 no-scrollbar scroll-smooth" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'all'}
              onClick={() => setActiveTab('all')}
              className={`whitespace-nowrap px-4 py-2.5 rounded-full font-bold text-xs sm:text-sm transition-all shrink-0 cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-[#12372A] text-white shadow-xs'
                  : 'bg-white border border-[#D9E1DC] text-[#202522] hover:bg-[#1F7A5C] hover:text-white'
              }`}
            >
              All FAQs
            </button>
            {initialData.map((cat) => (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={activeTab === cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`whitespace-nowrap px-4 py-2.5 rounded-full font-bold text-xs sm:text-sm transition-all shrink-0 cursor-pointer ${
                  activeTab === cat.id
                    ? 'bg-[#12372A] text-white shadow-xs'
                    : 'bg-white border border-[#D9E1DC] text-[#202522] hover:bg-[#1F7A5C] hover:text-white'
                }`}
              >
                {cat.title}
              </button>
            ))}
          </div>
        </div>

        {/* Search Results Summary Header */}
        {searchQuery.trim() !== '' ? (
          <div className="mb-6 flex items-center justify-between text-xs sm:text-sm text-[#66736D] font-bold pb-2 border-b border-[#D9E1DC]">
            <span>
              Found {totalFilteredCount} result{totalFilteredCount === 1 ? '' : 's'} for "{searchQuery}"
              {activeTab !== 'all' && currentCategoryObj ? ` in ${currentCategoryObj.title}` : ''}
            </span>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-[#1F7A5C] hover:underline font-bold"
            >
              Clear Search
            </button>
          </div>
        ) : activeTab === 'all' ? (
          <h2 className="text-xl sm:text-2xl font-bold text-[#12372A] mb-6 pb-2 border-b border-[#D9E1DC]">
            All Frequently Asked Questions
          </h2>
        ) : currentCategoryObj ? (
          <h2 className="text-xl sm:text-2xl font-bold text-[#12372A] mb-6 pb-2 border-b border-[#D9E1DC]">
            {currentCategoryObj.title}
          </h2>
        ) : null}

        {/* FAQ Accordion List or Empty State */}
        <div className="space-y-12">
          {filteredData.length === 0 ? (
            /* No Results Empty State */
            <div className="text-center py-16 bg-white rounded-3xl border border-[#D9E1DC] p-8 shadow-xs space-y-4">
              <HelpCircle className="w-12 h-12 text-[#66736D] mx-auto" />
              <h3 className="text-xl sm:text-2xl font-bold text-[#12372A]">No FAQs found</h3>
              <p className="text-xs sm:text-sm text-[#66736D] max-w-md mx-auto leading-relaxed">
                We couldn't find an answer matching your search query. Try searching with different keywords or speak with our compliance advisors.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className={buttonVariants({
                    variant: 'outline',
                    className: 'rounded-xl font-bold text-xs border-[#D9E1DC] cursor-pointer',
                  })}
                >
                  Clear Search
                </button>
                <Link
                  href="/contact"
                  className={buttonVariants({
                    variant: 'default',
                    className: 'bg-[#1F7A5C] hover:bg-[#165B44] text-white rounded-xl font-bold text-xs shadow-xs',
                  })}
                >
                  Discuss Your HR Requirement
                </Link>
              </div>
            </div>
          ) : activeTab === 'all' ? (
            /* Flat Accordion View for "All" Tab */
            <div className="space-y-4">
              {filteredData
                .flatMap((cat) => cat.faqs)
                .map((faq, idx) => (
                  <details
                    key={faq.id || idx}
                    className="group bg-white border border-[#D9E1DC] rounded-3xl [&_summary::-webkit-details-marker]:hidden shadow-2xs transition-all hover:border-[#1F7A5C]/40"
                  >
                    <summary className="flex cursor-pointer items-start sm:items-center justify-between p-5 md:p-6 font-bold text-[#12372A] select-none">
                      <span className="text-sm sm:text-base md:text-lg pr-4 font-semibold text-[#12372A] group-open:text-[#1F7A5C] transition-colors">
                        {faq.question}
                      </span>
                      <span className="ml-2 shrink-0 w-8 h-8 rounded-full bg-[#F7F4EC] border border-[#D9E1DC] flex items-center justify-center text-[#66736D] group-open:bg-[#1F7A5C] group-open:border-[#1F7A5C] group-open:text-white transition-all duration-200">
                        <Plus className="w-4 h-4 transition-transform duration-300 group-open:rotate-45" />
                      </span>
                    </summary>
                    <div className="px-5 md:px-6 pb-6 text-[#202522] text-xs sm:text-sm md:text-base leading-relaxed border-t border-[#D9E1DC]/60 pt-4 mt-1">
                      <div
                        className="prose prose-slate max-w-none prose-p:leading-relaxed prose-a:text-[#1F7A5C] text-xs sm:text-sm"
                        dangerouslySetInnerHTML={{ __html: faq.answer }}
                      />
                    </div>
                  </details>
                ))}

              {/* Bottom CTA for All FAQs */}
              {searchQuery === '' && (
                <div className="mt-12 bg-[#12372A] p-8 md:p-12 rounded-3xl text-center text-white shadow-xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-grid-forest opacity-30 pointer-events-none" />
                  <div className="relative z-10 space-y-4">
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">
                      Need help improving your HR & statutory compliance?
                    </h3>
                    <p className="text-xs sm:text-sm text-[#A2B3AA] max-w-lg mx-auto leading-relaxed">
                      Our certified labour law experts provide comprehensive audits, payroll checks, and on-site support.
                    </p>
                    <div className="pt-2">
                      <Link
                        href="/contact"
                        className={buttonVariants({
                          size: 'lg',
                          className:
                            'bg-[#1F7A5C] hover:bg-[#165B44] text-white font-bold px-8 py-4 rounded-xl shadow-lg group text-xs sm:text-sm',
                        })}
                      >
                        <span>Discuss Your HR Requirement</span>
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Categorized Accordion View */
            filteredData.map((category) => (
              <div key={category.id} className="space-y-4">
                {category.faqs.map((faq, idx) => (
                  <details
                    key={faq.id || idx}
                    className="group bg-white border border-[#D9E1DC] rounded-3xl [&_summary::-webkit-details-marker]:hidden shadow-2xs transition-all hover:border-[#1F7A5C]/40"
                  >
                    <summary className="flex cursor-pointer items-start sm:items-center justify-between p-5 md:p-6 font-bold text-[#12372A] select-none">
                      <span className="text-sm sm:text-base md:text-lg pr-4 font-semibold text-[#12372A] group-open:text-[#1F7A5C] transition-colors">
                        {faq.question}
                      </span>
                      <span className="ml-2 shrink-0 w-8 h-8 rounded-full bg-[#F7F4EC] border border-[#D9E1DC] flex items-center justify-center text-[#66736D] group-open:bg-[#1F7A5C] group-open:border-[#1F7A5C] group-open:text-white transition-all duration-200">
                        <Plus className="w-4 h-4 transition-transform duration-300 group-open:rotate-45" />
                      </span>
                    </summary>
                    <div className="px-5 md:px-6 pb-6 text-[#202522] text-xs sm:text-sm md:text-base leading-relaxed border-t border-[#D9E1DC]/60 pt-4 mt-1">
                      <div
                        className="prose prose-slate max-w-none prose-p:leading-relaxed prose-a:text-[#1F7A5C] text-xs sm:text-sm"
                        dangerouslySetInnerHTML={{ __html: faq.answer }}
                      />
                    </div>
                  </details>
                ))}

                {/* Contextual Category CTA Banner */}
                {searchQuery === '' && (
                  <div className="mt-12 bg-[#12372A] p-8 md:p-12 rounded-3xl text-center text-white shadow-xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-grid-forest opacity-30 pointer-events-none" />
                    <div className="relative z-10 space-y-4">
                      <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">
                        {category.ctaText}
                      </h3>
                      <div className="pt-2">
                        <Link
                          href={category.ctaLink}
                          className={buttonVariants({
                            size: 'lg',
                            className:
                              'bg-[#1F7A5C] hover:bg-[#165B44] text-white font-bold px-8 py-4 rounded-xl shadow-lg group text-xs sm:text-sm',
                          })}
                        >
                          <span>{category.ctaButton}</span>
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
