'use client'

import { useState } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Eye, Pencil, Trash2, Search, CheckCircle2, Globe, FileText, Loader2, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { deleteArticle, togglePublishArticle } from '@/app/actions/articles'
import { Button } from '@/components/ui/button'

export interface ArticleListItem {
  id: string
  title: string
  slug: string
  category: string
  published: boolean
  publishedAt: Date | string | null
  createdAt: Date | string
  updatedAt: Date | string
  author: {
    id: string
    name: string | null
    email?: string
  } | null
}

interface ArticleListProps {
  items: ArticleListItem[]
  totalCount: number
  currentPage: number
  totalPages: number
}

export default function ArticleList({ items, totalCount, currentPage, totalPages }: ArticleListProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [deleteTarget, setDeleteTarget] = useState<ArticleListItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isTogglingId, setIsTogglingId] = useState<string | null>(null)

  const currentStatus = searchParams.get('status') || ''

  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(name, value)
    } else {
      params.delete(name)
    }
    if (name !== 'page') params.delete('page')
    return params.toString()
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(pathname + '?' + createQueryString('q', searchQuery.trim()))
  }

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.push(pathname + '?' + createQueryString('status', e.target.value))
  }

  const clearFilters = () => {
    setSearchQuery('')
    router.push(pathname)
  }

  const handleTogglePublish = async (item: ArticleListItem) => {
    setIsTogglingId(item.id)
    try {
      await togglePublishArticle(item.id, !item.published)
      router.refresh()
    } catch (err) {
      console.error('Failed to toggle publish status:', err)
    } finally {
      setIsTogglingId(null)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await deleteArticle(deleteTarget.id)
      setDeleteTarget(null)
      router.refresh()
    } catch (err) {
      console.error('Failed to delete article:', err)
    } finally {
      setIsDeleting(false)
    }
  }

  // Pagination bounds
  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * 20 + 1
  const endItem = Math.min(currentPage * 20, totalCount)

  // 5 page window calculation
  const getPageNumbers = () => {
    const maxVisible = 5
    let start = Math.max(1, currentPage - 2)
    let end = Math.min(totalPages, start + maxVisible - 1)

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1)
    }

    const pages = []
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    return pages
  }

  return (
    <div className="space-y-6">
      {/* ---------------------------------------------------- */}
      {/* HEADER                                               */}
      {/* ---------------------------------------------------- */}
      <div className="bg-[#12372A] p-6 md:p-8 rounded-3xl shadow-sm text-white flex flex-col sm:flex-row sm:items-center sm:justify-between max-w-[1600px] mx-auto w-full gap-4 border border-[#0D281E]">
        <div>
          <span className="text-[10px] font-bold text-[#D6A84F] uppercase tracking-wider">
            Editorial Knowledge Base
          </span>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mt-1">
            Articles
          </h1>
          <p className="text-[#A2B3AA] text-xs md:text-sm mt-1">
            Manage articles and news updates.
          </p>
        </div>
        <div className="shrink-0">
          <Link
            href="/admin/articles/new"
            className="inline-flex items-center justify-center px-4 py-2.5 font-bold rounded-xl shadow-xs transition-colors text-xs text-white bg-[#1F7A5C] hover:bg-[#165B44]"
          >
            + Create Article
          </Link>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* TOOLBAR: SEARCH & STATUS FILTER                      */}
      {/* ---------------------------------------------------- */}
      <div className="bg-white p-4 rounded-2xl border border-[#D9E1DC] shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearch} className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#66736D]" />
          <input
            type="text"
            placeholder="Search article titles, keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[#D9E1DC] rounded-xl text-xs bg-[#F7F4EC]/30 text-[#202522] placeholder-[#66736D] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#1F7A5C] focus:border-[#1F7A5C] transition-all"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={currentStatus}
            onChange={handleStatusChange}
            className="border border-[#D9E1DC] rounded-xl px-3.5 py-2 text-xs font-semibold text-[#202522] bg-[#F7F4EC]/30 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#1F7A5C]"
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

      {/* ---------------------------------------------------- */}
      {/* ARTICLES TABLE (DESKTOP & MOBILE)                    */}
      {/* ---------------------------------------------------- */}
      <div className="bg-white rounded-3xl border border-[#D9E1DC] shadow-xs overflow-hidden">
        {items.length === 0 ? (
          <div className="p-16 text-center text-xs font-medium text-[#66736D] space-y-3">
            <FileText className="w-10 h-10 mx-auto text-[#A2B3AA]" />
            <p className="text-sm font-bold text-[#12372A]">No articles found</p>
            <p className="max-w-sm mx-auto">
              {searchQuery || currentStatus
                ? 'Try adjusting your search query or status filter.'
                : 'Get started by creating your first thought leadership article.'}
            </p>
            <Link
              href="/admin/articles/new"
              className="inline-block mt-2 px-4 py-2 bg-[#1F7A5C] text-white font-bold rounded-xl text-xs"
            >
              + Create Article
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F7F4EC] border-b border-[#D9E1DC] text-[#66736D] text-[10px] uppercase font-bold tracking-wider">
                    <th className="px-4 py-3.5 w-12 text-center">#</th>
                    <th className="px-4 py-3.5">Title</th>
                    <th className="px-4 py-3.5 w-28">Status</th>
                    <th className="px-4 py-3.5 w-40">Category</th>
                    <th className="px-4 py-3.5 w-36">Author</th>
                    <th className="px-4 py-3.5 w-36">Published/Updated</th>
                    <th className="px-4 py-3.5 text-right w-36">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9E1DC]/60 text-xs">
                  {items.map((item, idx) => {
                    const serialNumber = String(startItem + idx).padStart(2, '0')
                    const dateToShow = item.published && item.publishedAt
                      ? item.publishedAt
                      : item.updatedAt || item.createdAt

                    return (
                      <tr key={item.id} className="hover:bg-[#F7F4EC]/60 transition-colors group">
                        <td className="px-4 py-4 text-center text-[#66736D] font-mono text-[11px] font-bold">
                          {serialNumber}
                        </td>
                        <td className="px-4 py-4">
                          <Link
                            href={`/admin/articles/${item.id}/edit`}
                            className="font-bold text-[#12372A] hover:text-[#1F7A5C] transition-colors line-clamp-1 block"
                            title={item.title}
                          >
                            {item.title}
                          </Link>
                          <span className="text-[10px] text-[#66736D] font-mono block mt-0.5">
                            /resources/articles/{item.slug}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          {item.published ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#1F7A5C]/10 text-[#1F7A5C] border border-[#1F7A5C]/20">
                              Published
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#D6A84F]/15 text-[#9E731E] border border-[#D6A84F]/30">
                              Draft
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-[#66736D] font-medium capitalize whitespace-nowrap">
                          {item.category.replace(/-/g, ' ')}
                        </td>
                        <td className="px-4 py-4 text-[#66736D] font-medium whitespace-nowrap">
                          {item.author?.name || 'Editorial Team'}
                        </td>
                        <td className="px-4 py-4 text-[#66736D] whitespace-nowrap font-mono text-[11px]">
                          {format(new Date(dateToShow), 'dd MMM yyyy')}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* Eye: Preview */}
                            <Link
                              href={`/resources/articles/${item.slug}`}
                              target="_blank"
                              className="p-2 text-[#66736D] hover:text-[#12372A] hover:bg-[#F7F4EC] rounded-xl transition-colors"
                              title="Preview Article"
                              aria-label="Preview Article"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>

                            {/* Pencil: Edit */}
                            <Link
                              href={`/admin/articles/${item.id}/edit`}
                              className="p-2 text-[#66736D] hover:text-[#1F7A5C] hover:bg-[#1F7A5C]/10 rounded-xl transition-colors"
                              title="Edit Article"
                              aria-label="Edit Article"
                            >
                              <Pencil className="w-4 h-4" />
                            </Link>

                            {/* Globe / Toggle Publish */}
                            <button
                              type="button"
                              onClick={() => handleTogglePublish(item)}
                              disabled={isTogglingId === item.id}
                              className={`p-2 rounded-xl transition-colors ${
                                item.published
                                  ? 'text-[#1F7A5C] hover:bg-[#1F7A5C]/10'
                                  : 'text-[#66736D] hover:text-[#1F7A5C] hover:bg-[#1F7A5C]/10'
                              }`}
                              title={item.published ? 'Unpublish to Draft' : 'Publish Live'}
                              aria-label={item.published ? 'Unpublish to Draft' : 'Publish Live'}
                            >
                              {isTogglingId === item.id ? (
                                <Loader2 className="w-4 h-4 animate-spin text-[#1F7A5C]" />
                              ) : (
                                <Globe className="w-4 h-4" />
                              )}
                            </button>

                            {/* Trash: Delete */}
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(item)}
                              className="p-2 text-[#66736D] hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                              title="Delete Article"
                              aria-label="Delete Article"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="md:hidden divide-y divide-[#D9E1DC]/60">
              {items.map((item, idx) => {
                const serialNumber = String(startItem + idx).padStart(2, '0')
                const dateToShow = item.published && item.publishedAt
                  ? item.publishedAt
                  : item.updatedAt || item.createdAt

                return (
                  <div key={item.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#66736D]">#{serialNumber}</span>
                        {item.published ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#1F7A5C]/10 text-[#1F7A5C] border border-[#1F7A5C]/20">
                            Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#D6A84F]/15 text-[#9E731E] border border-[#D6A84F]/30">
                            Draft
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#66736D] font-mono">
                        {format(new Date(dateToShow), 'dd MMM yyyy')}
                      </span>
                    </div>

                    <Link
                      href={`/admin/articles/${item.id}/edit`}
                      className="font-bold text-sm text-[#12372A] hover:text-[#1F7A5C] block leading-snug"
                    >
                      {item.title}
                    </Link>

                    <div className="text-[11px] text-[#66736D] flex flex-wrap gap-x-4 gap-y-1">
                      <span>Author: <strong className="text-[#12372A]">{item.author?.name || 'Editorial'}</strong></span>
                      <span>Category: <strong className="text-[#12372A] capitalize">{item.category}</strong></span>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-[#D9E1DC]/60 text-xs">
                      <Link
                        href={`/resources/articles/${item.slug}`}
                        target="_blank"
                        className="flex items-center gap-1 text-[#66736D] font-bold hover:text-[#12372A]"
                      >
                        <Eye className="w-3.5 h-3.5" /> Preview
                      </Link>
                      <Link
                        href={`/admin/articles/${item.id}/edit`}
                        className="flex items-center gap-1 text-[#1F7A5C] font-bold hover:text-[#165B44]"
                      >
                        <Pencil className="w-3.5 h-3.5" /> Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(item)}
                        className="flex items-center gap-1 text-rose-600 font-bold hover:text-rose-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* PAGINATION                                           */}
      {/* ---------------------------------------------------- */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 text-xs text-[#66736D]">
          <div>
            Showing <span className="font-bold text-[#12372A]">{startItem}</span>–
            <span className="font-bold text-[#12372A]">{endItem}</span> of{' '}
            <span className="font-bold text-[#12372A]">{totalCount}</span> articles
          </div>

          <div className="flex items-center gap-1">
            {/* Previous */}
            <Link
              href={currentPage > 1 ? pathname + '?' + createQueryString('page', (currentPage - 1).toString()) : '#'}
              className={`px-3 py-1.5 rounded-xl font-bold border transition-colors ${
                currentPage > 1
                  ? 'border-[#D9E1DC] hover:bg-white text-[#12372A] bg-white/60 shadow-2xs'
                  : 'border-transparent text-[#A2B3AA] pointer-events-none'
              }`}
              aria-disabled={currentPage <= 1}
            >
              ← Previous
            </Link>

            {/* Page number buttons */}
            {getPageNumbers().map((num) => (
              <Link
                key={num}
                href={pathname + '?' + createQueryString('page', num.toString())}
                className={`w-8 h-8 flex items-center justify-center rounded-xl font-bold transition-colors ${
                  num === currentPage
                    ? 'bg-[#1F7A5C] text-white shadow-xs'
                    : 'hover:bg-white text-[#66736D] bg-white/40 border border-[#D9E1DC]/60'
                }`}
              >
                {num}
              </Link>
            ))}

            {/* Next */}
            <Link
              href={currentPage < totalPages ? pathname + '?' + createQueryString('page', (currentPage + 1).toString()) : '#'}
              className={`px-3 py-1.5 rounded-xl font-bold border ml-1 transition-colors ${
                currentPage < totalPages
                  ? 'border-[#D9E1DC] hover:bg-white text-[#12372A] bg-white/60 shadow-2xs'
                  : 'border-transparent text-[#A2B3AA] pointer-events-none'
              }`}
              aria-disabled={currentPage >= totalPages}
            >
              Next →
            </Link>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* DELETE CONFIRMATION DIALOG                           */}
      {/* ---------------------------------------------------- */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 border border-[#D9E1DC] shadow-2xl animate-in fade-in-50 zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#12372A]">Delete this article?</h3>
              <p className="text-xs text-[#66736D] mt-2 leading-relaxed">
                Are you sure you want to permanently delete &quot;<strong className="text-[#12372A]">{deleteTarget.title}</strong>&quot;?
                This will remove the article, its takeaways, service links, and related references from the database.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="rounded-xl border-[#D9E1DC] text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Deleting...
                  </>
                ) : (
                  'Yes, Delete Article'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
