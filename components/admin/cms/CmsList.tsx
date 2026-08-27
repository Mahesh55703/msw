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
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Published</span>
      ) : (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">Draft</span>
      )
    }
    if (col.key === 'category') {
      const displayCategory = category === 'faqs' ? (item.excerpt || item.category) : item.category
      return <span className="capitalize text-slate-600 whitespace-nowrap">{displayCategory.replace(/-/g, ' ')}</span>
    }
    if (col.key === 'author') {
      return <span className="text-slate-600">{item.author?.name || 'Unknown'}</span>
    }
    if (col.key === 'updated' || col.key === 'published') {
      const date = col.key === 'updated' ? item.updatedAt : (item.publishedAt || item.createdAt)
      return <span className="text-slate-500 whitespace-nowrap">{format(new Date(date), 'MMM dd, yyyy')}</span>
    }
    return <span className="text-slate-600">{item[col.key]}</span>
  }

  return (
    <div className="flex flex-col space-y-4">
      
      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearch} className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </form>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select 
            value={currentStatus}
            onChange={handleStatusChange}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>

          {(searchQuery || currentStatus) && (
            <button 
              onClick={clearFilters}
              className="text-sm text-slate-500 hover:text-slate-800 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg flex items-center gap-4 text-sm">
          <span className="font-semibold text-blue-800">{selectedIds.size} selected</span>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 bg-white border border-blue-200 text-blue-700 rounded-md hover:bg-blue-100 transition-colors font-medium shadow-sm">
              Publish
            </button>
            <button className="px-3 py-1.5 bg-white border border-amber-200 text-amber-700 rounded-md hover:bg-amber-50 transition-colors font-medium shadow-sm">
              Unpublish
            </button>
            <button className="px-3 py-1.5 bg-white border border-red-200 text-red-600 rounded-md hover:bg-red-50 transition-colors font-medium shadow-sm">
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Data Table / List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {items.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No items found matching your criteria.
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="px-4 py-3 w-12 text-center">
                      <input 
                        type="checkbox" 
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        checked={items.length > 0 && selectedIds.size === items.length}
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th className="px-2 py-3 w-12 text-center">#</th>
                    {columns.map(col => (
                      <th key={col.key} className="px-4 py-3 font-semibold">{col.label}</th>
                    ))}
                    <th className="px-4 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {items.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-4 py-3 text-center">
                        <input 
                          type="checkbox" 
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          checked={selectedIds.has(item.id)}
                          onChange={() => toggleSelect(item.id)}
                        />
                      </td>
                      <td className="px-2 py-3 text-center text-slate-400">
                        {startItem + idx}
                      </td>
                      {columns.map(col => (
                        <td key={col.key} className="px-4 py-3">
                          {renderCellValue(item, col)}
                        </td>
                      ))}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2 ">
                          <Link 
                            href={`/resources/${category}/${item.slug}`} 
                            target="_blank"
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="Preview"
                            aria-label="Preview"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link 
                            href={`/admin/${category}/${item.id}/edit`}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                            title="Edit"
                            aria-label="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          
                          {!item.published && (
                            <button
                              onClick={() => handleTogglePublish(item.id, item.published)}
                              className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                              title="Publish"
                              aria-label="Publish"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleDelete(item.id)}
                            disabled={isDeleting === item.id}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
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
            <div className="md:hidden divide-y divide-slate-100">
              {items.map((item, idx) => (
                <div key={item.id} className="p-4 flex gap-3">
                  <div className="pt-1">
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      checked={selectedIds.has(item.id)}
                      onChange={() => toggleSelect(item.id)}
                    />
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-semibold text-slate-900 line-clamp-2">
                        {item.title}
                      </div>
                      {renderCellValue(item, { key: 'status', label: '' })}
                    </div>
                    <div className="text-xs text-slate-500 flex flex-wrap gap-x-3 gap-y-1">
                      <span>#{startItem + idx}</span>
                      {columns.filter(c => c.key !== 'title' && c.key !== 'status' && c.key !== 'question').map(col => (
                        <span key={col.key} className="flex gap-1">
                          <span className="text-slate-400">{col.label}:</span>
                          {renderCellValue(item, col)}
                        </span>
                      ))}
                    </div>
                    <div className="pt-2 flex items-center gap-4 text-slate-400 border-t border-slate-50">
                      <Link href={`/resources/${category}/${item.slug}`} className="flex items-center gap-1 hover:text-blue-600 text-xs">
                        <Eye className="w-3.5 h-3.5" /> Preview
                      </Link>
                      <Link href={`/admin/${category}/${item.id}/edit`} className="flex items-center gap-1 hover:text-emerald-600 text-xs">
                        <Pencil className="w-3.5 h-3.5" /> Edit
                      </Link>
                      <button onClick={() => handleDelete(item.id)} disabled={isDeleting === item.id} className="flex items-center gap-1 hover:text-red-600 text-xs ml-auto">
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 text-sm text-slate-600">
          <div>
            Showing <span className="font-semibold text-slate-900">{startItem}</span>–<span className="font-semibold text-slate-900">{endItem}</span> of <span className="font-semibold text-slate-900">{totalCount}</span> records
          </div>
          <div className="flex items-center gap-1">
            <Link 
              href={currentPage > 1 ? pathname + '?' + createQueryString('page', (currentPage - 1).toString()) : '#'}
              className={`px-3 py-1.5 rounded-md font-medium border ${currentPage > 1 ? 'border-slate-200 hover:bg-slate-50 text-slate-700' : 'border-transparent text-slate-300 pointer-events-none'}`}
              aria-disabled={currentPage <= 1}
            >
              ← Previous
            </Link>
            
            {getPageNumbers().map(num => (
              <Link
                key={num}
                href={pathname + '?' + createQueryString('page', num.toString())}
                className={`w-8 h-8 flex items-center justify-center rounded-md font-medium transition-colors ${num === currentPage ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-600'}`}
              >
                {num}
              </Link>
            ))}
            
            {totalPages > 5 && currentPage + 2 < totalPages && (
              <span className="px-1 text-slate-400">...</span>
            )}
            
            {(totalPages > 5 && currentPage + 2 < totalPages) && (
              <Link
                href={pathname + '?' + createQueryString('page', totalPages.toString())}
                className="w-8 h-8 flex items-center justify-center rounded-md font-medium hover:bg-slate-50 text-slate-600 transition-colors"
              >
                {totalPages}
              </Link>
            )}

            <Link 
              href={currentPage < totalPages ? pathname + '?' + createQueryString('page', (currentPage + 1).toString()) : '#'}
              className={`px-3 py-1.5 rounded-md font-medium border ml-1 ${currentPage < totalPages ? 'border-slate-200 hover:bg-slate-50 text-slate-700' : 'border-transparent text-slate-300 pointer-events-none'}`}
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
