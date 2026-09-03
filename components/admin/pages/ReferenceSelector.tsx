'use client'

import { useState, useTransition } from 'react'
import { searchContentReferences, addContentReference, removeContentReference, reorderContentReferences } from '@/app/actions/pages'
import { Search, Loader2, Plus, X, GripVertical, ChevronUp, ChevronDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function ReferenceSelector({ section, onSaved }: { section: any, onSaved: () => void }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    setIsSearching(true)
    const res = await searchContentReferences(query)
    if (res.success) {
      setResults(res.data)
    }
    setIsSearching(false)
  }

  const handleAdd = async (type: string, id: string) => {
    const payload = {
      sectionId: section.id,
      sortOrder: section.references.length,
      [type]: id
    }
    startTransition(async () => {
      await addContentReference(section.id, payload as any)
      onSaved() // triggers refresh
    })
  }

  const handleRemove = async (refId: string) => {
    startTransition(async () => {
      await removeContentReference(refId)
      onSaved()
    })
  }

  const handleMove = async (refId: string, direction: 'up' | 'down') => {
    const sorted = [...section.references].sort((a, b) => a.sortOrder - b.sortOrder)
    const idx = sorted.findIndex(r => r.id === refId)
    if (direction === 'up' && idx > 0) {
      const target = sorted[idx - 1]
      startTransition(async () => {
        await reorderContentReferences(section.id, [
          { id: sorted[idx].id, sortOrder: target.sortOrder },
          { id: target.id, sortOrder: sorted[idx].sortOrder }
        ])
        onSaved()
      })
    } else if (direction === 'down' && idx < sorted.length - 1) {
      const target = sorted[idx + 1]
      startTransition(async () => {
        await reorderContentReferences(section.id, [
          { id: sorted[idx].id, sortOrder: target.sortOrder },
          { id: target.id, sortOrder: sorted[idx].sortOrder }
        ])
        onSaved()
      })
    }
  }

  return (
    <div className="space-y-4 pt-2 border-t border-[#D9E1DC]">
      <h4 className="text-[10px] uppercase font-bold text-[#66736D]">Manage Linked References</h4>
      
      {/* Current References */}
      <div className="space-y-2">
        {section.references.length === 0 ? (
          <p className="text-xs text-[#66736D] italic">No references added yet.</p>
        ) : (
          section.references.map((ref: any, idx: number) => {
            const isFirst = idx === 0
            const isLast = idx === section.references.length - 1
            const title = ref.article?.title || ref.faq?.question || ref.teamMember?.name || ref.jobPosting?.title || 'Unknown Reference'
            const typeLabel = ref.article ? 'Article' : ref.faq ? 'FAQ' : ref.teamMember ? 'Team' : ref.jobPosting ? 'Job' : 'Unknown'
            
            return (
              <div key={ref.id} className="flex items-center justify-between bg-white border border-[#D9E1DC] rounded-xl p-2 px-3">
                <div className="flex items-center gap-3 overflow-hidden">
                  <GripVertical className="w-4 h-4 text-[#A2B3AA] shrink-0" />
                  <span className="text-[9px] font-bold bg-[#F7F4EC] px-1.5 py-0.5 rounded text-[#66736D] shrink-0">{typeLabel}</span>
                  <span className="text-xs font-medium text-[#12372A] truncate">{title}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => handleMove(ref.id, 'up')} disabled={isFirst || isPending} className="p-1 hover:bg-[#F7F4EC] rounded text-[#66736D] disabled:opacity-30">
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleMove(ref.id, 'down')} disabled={isLast || isPending} className="p-1 hover:bg-[#F7F4EC] rounded text-[#66736D] disabled:opacity-30">
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleRemove(ref.id)} disabled={isPending} className="p-1 hover:bg-rose-50 rounded text-rose-500 disabled:opacity-30">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Search and Add */}
      <div className="bg-[#F7F4EC] p-3 rounded-xl border border-[#D9E1DC]">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input 
            value={query} 
            onChange={(e) => setQuery(e.target.value)} 
            placeholder="Search Articles, FAQs, Team, Jobs..." 
            className="text-xs h-8 bg-white"
          />
          <Button type="submit" size="sm" variant="secondary" className="h-8" disabled={isSearching}>
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </Button>
        </form>

        {results && (
          <div className="mt-3 space-y-3">
            {results.articles?.length > 0 && (
              <div>
                <h5 className="text-[10px] font-bold text-[#66736D] uppercase mb-1">Articles</h5>
                {results.articles.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between py-1 border-b border-white/50 text-xs">
                    <span className="truncate pr-2">{item.title}</span>
                    <Button type="button" size="sm" variant="ghost" className="h-6 px-2 text-[10px]" onClick={() => handleAdd('articleId', item.id)} disabled={isPending}><Plus className="w-3 h-3 mr-1" /> Add</Button>
                  </div>
                ))}
              </div>
            )}
            {results.faqs?.length > 0 && (
              <div>
                <h5 className="text-[10px] font-bold text-[#66736D] uppercase mb-1">FAQs</h5>
                {results.faqs.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between py-1 border-b border-white/50 text-xs">
                    <span className="truncate pr-2">{item.question}</span>
                    <Button type="button" size="sm" variant="ghost" className="h-6 px-2 text-[10px]" onClick={() => handleAdd('faqId', item.id)} disabled={isPending}><Plus className="w-3 h-3 mr-1" /> Add</Button>
                  </div>
                ))}
              </div>
            )}
            {results.team?.length > 0 && (
              <div>
                <h5 className="text-[10px] font-bold text-[#66736D] uppercase mb-1">Team Members</h5>
                {results.team.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between py-1 border-b border-white/50 text-xs">
                    <span className="truncate pr-2">{item.name} <span className="text-gray-400">({item.designation})</span></span>
                    <Button type="button" size="sm" variant="ghost" className="h-6 px-2 text-[10px]" onClick={() => handleAdd('teamMemberId', item.id)} disabled={isPending}><Plus className="w-3 h-3 mr-1" /> Add</Button>
                  </div>
                ))}
              </div>
            )}
            {results.jobs?.length > 0 && (
              <div>
                <h5 className="text-[10px] font-bold text-[#66736D] uppercase mb-1">Job Postings</h5>
                {results.jobs.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between py-1 border-b border-white/50 text-xs">
                    <span className="truncate pr-2">{item.title}</span>
                    <Button type="button" size="sm" variant="ghost" className="h-6 px-2 text-[10px]" onClick={() => handleAdd('jobPostingId', item.id)} disabled={isPending}><Plus className="w-3 h-3 mr-1" /> Add</Button>
                  </div>
                ))}
              </div>
            )}
            {!results.articles?.length && !results.faqs?.length && !results.team?.length && !results.jobs?.length && (
              <p className="text-xs text-center text-[#66736D] italic py-2">No results found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
