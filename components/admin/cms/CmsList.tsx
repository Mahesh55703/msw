'use client'

import { useState } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Eye, Pencil, Trash2, Search, CheckCircle2 } from 'lucide-react'
import { format } from 'date-fns'
import { deleteContent, togglePublishContent } from '@/app/actions/cms'

type ColumnConfig = {
  key: string
  label: string
}

type CmsListProps = {
  items: any[]
  totalCount: number
  currentPage: number
  totalPages: number
  category: string
  columns: ColumnConfig[]
}

export default function CmsList({ items, totalCount, currentPage, totalPages, category, columns }: CmsListProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  
  // Local state for search to avoid rapid refetches while typing
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')

  const currentStatus = searchParams.get('status') || ''

  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(name, value)
    } else {
      params.delete(name)
    }
    // reset page to 1 on filter changes unless name is page
    if (name !== 'page') params.delete('page')
    return params.toString()
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(pathname + '?' + createQueryString('q', searchQuery))
  }

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.push(pathname + '?' + createQueryString('status', e.target.value))
  }

  const clearFilters = () => {
    setSearchQuery('')
    router.push(pathname)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Delete Article?\n\nThis will permanently remove this item and cannot be undone.')) {
      setIsDeleting(id)
      await deleteContent(id)
      setIsDeleting(null)
      router.refresh()
    }
  }

  const handleTogglePublish = async (id: string, currentPublished: boolean) => {
    await togglePublishContent(id, !currentPublished)
    router.refresh()
  }

  const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(items.map(i => i.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    setSelectedIds(newSet)
  }

  // Pagination Logic
  const startItem = (currentPage - 1) * 20 + 1
  const endItem = Math.min(currentPage * 20, totalCount)

  const getPageNumbers = () => {
    const maxVisible = 5
    let start = Math.max(1, currentPage - 2)
    const end = Math.min(totalPages, start + maxVisible - 1)
    
    if (totalPages >= maxVisible && end === totalPages) {
      start = totalPages - maxVisible + 1
    }

    const pages = []
    for (let i = start; i <= end; i++) pages.push(i)
    return pages
  }

  const renderCellValue = (item: any, col: ColumnConfig) => {
    if (col.key === 'title') {
      return <div className="font-medium text-slate-900">{item.title}</div>
    }
    if (col.key === 'question') {
      return <div className="font-medium text-slate-900 line-clamp-1">{item.title}</div>
    }
    if (col.key === 'status') {
      return item.published ? (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#1F7A5C]/10 text-[#1F7A5C] border border-[#1F7A5C]/20">Published</span>
      ) : (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#D6A84F]/15 text-[#9E731E] border border-[#D6A84F]/30">Draft</span>
      )
    }
    if (col.key === 'category') {
      const displayCategory = category === 'faqs' ? (item.excerpt || item.category) : item.category
      return <span className="capitalize text-[#66736D] font-medium whitespace-nowrap">{displayCategory.replace(/-/g, ' ')}</span>
    }
    if (col.key === 'author') {
      return <span className="text-[#66736D] font-medium">{item.author?.name || 'Editorial Team'}</span>
    }
    if (col.key === 'updated' || col.key === 'published') {
      const date = col.key === 'updated' ? item.updatedAt : (item.publishedAt || item.createdAt)
      return <span className="text-[#66736D] whitespace-nowrap text-xs">{format(new Date(date), 'MMM dd, yyyy')}</span>
    }
    return <span className="text-[#66736D]">{item[col.key]}</span>
  }

  return (
    <div className="flex flex-col space-y-4">
      
      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-[#D9E1DC] shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearch} className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#66736D]" />
          <input 
            type="text" 
            placeholder="Search titles, keywords..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[#D9E1DC] rounded-xl text-xs bg-[#F7F4EC]/30 text-[#202522] placeholder-[#66736D] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#1F7A5C] focus:border-[#1F7A5C] transition-all"
          />
        </form>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select 
            value={currentStatus}
            onChange={handleStatusChange}
            className="border border-[#D9E1DC] rounded-xl px-3.5 py-2 text-xs font-semibold text-[#202522] bg-[#F7F4EC]/30 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#1F7A5C] focus:border-[#1F7A5C]"
          >
            <option value="">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>

          {(searchQuery || currentStatus) && (
            <button 
              onClick={clearFilters}
              className="text-xs font-bold text-[#1F7A5C] hover:text-[#165B44] transition-colors px-2 py-1"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="bg-[#1F7A5C]/10 border border-[#1F7A5C]/20 p-3.5 rounded-xl flex items-center gap-4 text-xs">
          <span className="font-bold text-[#12372A]">{selectedIds.size} selected</span>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 bg-white border border-[#D9E1DC] text-[#12372A] hover:bg-[#F7F4EC] rounded-lg transition-colors font-bold shadow-2xs">
              Publish Selected
            </button>
            <button className="px-3 py-1.5 bg-white border border-[#D9E1DC] text-[#66736D] hover:bg-[#F7F4EC] rounded-lg transition-colors font-bold shadow-2xs">
              Unpublish
            </button>
            <button className="px-3 py-1.5 bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-lg transition-colors font-bold shadow-2xs">
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Data Table / List */}
      <div className="bg-white rounded-2xl border border-[#D9E1DC] shadow-xs overflow-hidden">
        {items.length === 0 ? (
          <div className="p-12 text-center text-xs font-medium text-[#66736D]">
            No records found matching your criteria.
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F7F4EC] border-b border-[#D9E1DC] text-[#66736D] text-[10px] uppercase font-bold tracking-wider">
                    <th className="px-4 py-3.5 w-12 text-center">
                      <input 
                        type="checkbox" 
                        className="rounded border-[#D9E1DC] text-[#1F7A5C] focus:ring-[#1F7A5C] cursor-pointer"
                        checked={items.length > 0 && selectedIds.size === items.length}
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th className="px-2 py-3.5 w-12 text-center">#</th>
                    {columns.map(col => (
                      <th key={col.key} className="px-4 py-3.5">{col.label}</th>
                    ))}
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9E1DC]/60 text-xs">
                  {items.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-[#F7F4EC]/60 transition-colors group">
                      <td className="px-4 py-3.5 text-center">
                        <input 
                          type="checkbox" 
                          className="rounded border-[#D9E1DC] text-[#1F7A5C] focus:ring-[#1F7A5C] cursor-pointer"
                          checked={selectedIds.has(item.id)}
                          onChange={() => toggleSelect(item.id)}
                        />
                      </td>
                      <td className="px-2 py-3.5 text-center text-[#66736D] font-mono">
                        {startItem + idx}
                      </td>
                      {columns.map(col => (
                        <td key={col.key} className="px-4 py-3.5">
                          {renderCellValue(item, col)}
                        </td>
                      ))}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link 
                            href={`/resources/${category}/${item.slug}`} 
                            target="_blank"
                            className="p-1.5 text-[#66736D] hover:text-[#12372A] hover:bg-[#F7F4EC] rounded-lg transition-colors"
                            title="Preview Public URL"
                            aria-label="Preview"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link 
                            href={`/admin/${category}/${item.id}/edit`}
                            className="p-1.5 text-[#66736D] hover:text-[#1F7A5C] hover:bg-[#1F7A5C]/10 rounded-lg transition-colors"
                            title="Edit"
                            aria-label="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          
                          {!item.published && (
                            <button
                              onClick={() => handleTogglePublish(item.id, item.published)}
                              className="p-1.5 text-[#66736D] hover:text-[#1F7A5C] hover:bg-[#1F7A5C]/10 rounded-lg transition-colors"
                              title="Publish Live"
                              aria-label="Publish"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleDelete(item.id)}
                            disabled={isDeleting === item.id}
                            className="p-1.5 text-[#66736D] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete"
                            aria-label="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List */}
            <div className="md:hidden divide-y divide-[#D9E1DC]/60">
              {items.map((item, idx) => (
                <div key={item.id} className="p-4 flex gap-3">
                  <div className="pt-1">
                    <input 
                      type="checkbox" 
                      className="rounded border-[#D9E1DC] text-[#1F7A5C] focus:ring-[#1F7A5C] cursor-pointer"
                      checked={selectedIds.has(item.id)}
                      onChange={() => toggleSelect(item.id)}
                    />
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-bold text-[#12372A] line-clamp-2">
                        {item.title}
                      </div>
                      {renderCellValue(item, { key: 'status', label: '' })}
                    </div>
                    <div className="text-[11px] text-[#66736D] flex flex-wrap gap-x-3 gap-y-1">
                      <span>#{startItem + idx}</span>
                      {columns.filter(c => c.key !== 'title' && c.key !== 'status' && c.key !== 'question').map(col => (
                        <span key={col.key} className="flex gap-1">
                          <span className="text-[#A2B3AA]">{col.label}:</span>
                          {renderCellValue(item, col)}
                        </span>
                      ))}
                    </div>
                    <div className="pt-2 flex items-center gap-4 text-[#66736D] border-t border-[#D9E1DC]/60">
                      <Link href={`/resources/${category}/${item.slug}`} className="flex items-center gap-1 hover:text-[#12372A] text-xs font-semibold">
                        <Eye className="w-3.5 h-3.5" /> Preview
                      </Link>
                      <Link href={`/admin/${category}/${item.id}/edit`} className="flex items-center gap-1 hover:text-[#1F7A5C] text-xs font-semibold">
                        <Pencil className="w-3.5 h-3.5" /> Edit
                      </Link>
                      <button onClick={() => handleDelete(item.id)} disabled={isDeleting === item.id} className="flex items-center gap-1 hover:text-rose-600 text-xs font-semibold ml-auto">
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 text-xs text-[#66736D]">
          <div>
            Showing <span className="font-bold text-[#12372A]">{startItem}</span>–<span className="font-bold text-[#12372A]">{endItem}</span> of <span className="font-bold text-[#12372A]">{totalCount}</span> records
          </div>
          <div className="flex items-center gap-1">
            <Link 
              href={currentPage > 1 ? pathname + '?' + createQueryString('page', (currentPage - 1).toString()) : '#'}
              className={`px-3 py-1.5 rounded-xl font-bold border ${currentPage > 1 ? 'border-[#D9E1DC] hover:bg-white text-[#12372A] bg-white/50' : 'border-transparent text-[#A2B3AA] pointer-events-none'}`}
              aria-disabled={currentPage <= 1}
            >
              ← Prev
            </Link>
            
            {getPageNumbers().map(num => (
              <Link
                key={num}
                href={pathname + '?' + createQueryString('page', num.toString())}
                className={`w-8 h-8 flex items-center justify-center rounded-xl font-bold transition-colors ${num === currentPage ? 'bg-[#1F7A5C] text-white shadow-xs' : 'hover:bg-white text-[#66736D]'}`}
              >
                {num}
              </Link>
            ))}
            
            {totalPages > 5 && currentPage + 2 < totalPages && (
              <span className="px-1 text-[#A2B3AA]">...</span>
            )}
            
            {(totalPages > 5 && currentPage + 2 < totalPages) && (
              <Link
                href={pathname + '?' + createQueryString('page', totalPages.toString())}
                className="w-8 h-8 flex items-center justify-center rounded-xl font-bold hover:bg-white text-[#66736D] transition-colors"
              >
                {totalPages}
              </Link>
            )}

            <Link 
              href={currentPage < totalPages ? pathname + '?' + createQueryString('page', (currentPage + 1).toString()) : '#'}
              className={`px-3 py-1.5 rounded-xl font-bold border ml-1 ${currentPage < totalPages ? 'border-[#D9E1DC] hover:bg-white text-[#12372A] bg-white/50' : 'border-transparent text-[#A2B3AA] pointer-events-none'}`}
              aria-disabled={currentPage >= totalPages}
            >
              Next →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
