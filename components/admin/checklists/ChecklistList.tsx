'use client'

import { useState, useTransition } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Search,
  Eye,
  Edit,
  Trash2,
  Globe,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  FileCheck2,
  FileDown,
} from 'lucide-react'
import { togglePublishChecklist, deleteChecklist } from '@/app/actions/checklists'

interface ChecklistItem {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  published: boolean
  publishedAt: Date | null
  scheduledAt: Date | null
  updatedAt: Date
  author?: {
    name: string | null
    email: string
  } | null
}

interface ChecklistListProps {
  checklists: ChecklistItem[]
  totalCount: number
  currentPage: number
  pageSize: number
  currentStatus: string
  searchQuery: string
}

export default function ChecklistList({
  checklists,
  totalCount,
  currentPage,
  pageSize,
  currentStatus,
  searchQuery,
}: ChecklistListProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const [searchTerm, setSearchTerm] = useState(searchQuery)
  const [deleteTarget, setDeleteTarget] = useState<ChecklistItem | null>(null)

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const startItem = totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0
  const endItem = Math.min(currentPage * pageSize, totalCount)

  // Navigate with URL Search Params
  const updateFilters = (newPage: number, newStatus?: string, newSearch?: string) => {
    const params = new URLSearchParams()
    if (newPage > 1) params.set('page', newPage.toString())
    const statusVal = newStatus !== undefined ? newStatus : currentStatus
    if (statusVal && statusVal !== 'all') params.set('status', statusVal)
    const searchVal = newSearch !== undefined ? newSearch : searchQuery
    if (searchVal && searchVal.trim()) params.set('q', searchVal.trim())

    router.push(`${pathname}?${params.toString()}`)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilters(1, undefined, searchTerm)
  }

  const handleStatusChange = (status: string) => {
    updateFilters(1, status, undefined)
  }

  // Toggle publish
  const handleTogglePublish = (id: string) => {
    startTransition(async () => {
      await togglePublishChecklist(id)
      router.refresh()
    })
  }

  // Delete checklist
  const handleConfirmDelete = () => {
    if (!deleteTarget) return
    startTransition(async () => {
      await deleteChecklist(deleteTarget.id)
      setDeleteTarget(null)
      router.refresh()
    })
  }

  // Generate pagination page numbers (up to 5)
  const getPageNumbers = () => {
    const pages: number[] = []
    let start = Math.max(1, currentPage - 2)
    const end = Math.min(totalPages, start + 4)
    if (end - start < 4) {
      start = Math.max(1, end - 4)
    }
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    return pages
  }

  // Helper to extract item count from stored JSON
  const getItemCount = (contentStr: string) => {
    try {
      const parsed = JSON.parse(contentStr)
      if (Array.isArray(parsed.sections)) {
        return parsed.sections.reduce((acc: number, sec: any) => acc + (sec.items?.length || 0), 0)
      }
    } catch (e) {
      // legacy
    }
    return null
  }

  // Helper to check if downloadable PDF exists
  const hasDownloadablePdf = (contentStr: string) => {
    try {
      const parsed = JSON.parse(contentStr)
      return Boolean(parsed.downloadableFile?.url)
    } catch (e) {
      return false
    }
  }

  return (
    <div className="space-y-6">
      {/* Search & Filter Toolbar */}
      <div className="bg-white border border-[#D9E1DC] rounded-3xl p-4 sm:p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:max-w-md">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search checklists by title, description or content..."
            className="w-full text-xs font-semibold pl-10 pr-4 py-3 bg-[#F7F4EC]/60 border border-[#D9E1DC] rounded-2xl focus:bg-white focus:border-[#1F7A5C] focus:ring-2 focus:ring-[#1F7A5C]/20 outline-none transition-all"
          />
          <Search className="w-4 h-4 text-[#66736D] absolute left-3.5 top-3.5" />
        </form>

        {/* Filters */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <select
            value={currentStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="text-xs font-semibold px-4 py-3 bg-[#F7F4EC]/60 border border-[#D9E1DC] rounded-2xl outline-none focus:border-[#1F7A5C] cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-[#D9E1DC] rounded-3xl shadow-xs overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F4EC] border-b border-[#D9E1DC] text-[#12372A] uppercase tracking-wider font-bold">
              <tr>
                <th className="py-4 px-6 w-16 text-center">#</th>
                <th className="py-4 px-6">Checklist</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Author</th>
                <th className="py-4 px-6">Last Reviewed</th>
                <th className="py-4 px-6">Updated</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9E1DC]/60">
              {checklists.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#66736D]">
                    <FileCheck2 className="w-10 h-10 text-[#66736D]/40 mx-auto mb-2" />
                    <p className="text-sm font-semibold">No checklists found</p>
                    <p className="text-xs text-[#A2B3AA] mt-1">Try adjusting your search query or filter.</p>
                  </td>
                </tr>
              ) : (
                checklists.map((item, index) => {
                  const globalIndex = (currentPage - 1) * pageSize + index + 1
                  const serialStr = `#${String(globalIndex).padStart(2, '0')}`
                  const itemCount = getItemCount(item.content)
                  const hasPdf = hasDownloadablePdf(item.content)

                  return (
                    <tr key={item.id} className="hover:bg-[#F7F4EC]/40 transition-colors group">
                      <td className="py-4 px-6 text-center font-mono font-bold text-[#66736D]">
                        {serialStr}
                      </td>
                      <td className="py-4 px-6 max-w-md">
                        <Link
                          href={`/admin/checklists/${item.id}/edit`}
                          className="font-bold text-[#12372A] group-hover:text-[#1F7A5C] transition-colors text-sm line-clamp-1 block"
                        >
                          {item.title}
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-mono text-[11px] text-[#66736D]">/{item.slug}</span>
                          {itemCount !== null && (
                            <span className="bg-[#1F7A5C]/10 text-[#1F7A5C] text-[10px] font-bold px-2 py-0.5 rounded-md">
                              {itemCount} items
                            </span>
                          )}
                          {hasPdf && (
                            <span className="bg-red-50 text-red-600 border border-red-200 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                              <FileDown className="w-3 h-3" /> PDF
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-[11px] ${
                            item.published
                              ? 'bg-[#1F7A5C]/10 text-[#1F7A5C] border border-[#1F7A5C]/30'
                              : 'bg-[#D6A84F]/15 text-[#9E731E] border border-[#D6A84F]/40'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${item.published ? 'bg-[#1F7A5C]' : 'bg-[#D6A84F]'}`}
                          />
                          {item.published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-[#202522] font-semibold">
                        {item.author?.name || 'LabourAxis Editorial'}
                      </td>
                      <td className="py-4 px-6 text-[#66736D] font-medium">
                        {item.scheduledAt
                          ? new Date(item.scheduledAt).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '—'}
                      </td>
                      <td className="py-4 px-6 text-[#66736D] font-medium">
                        {new Date(item.updatedAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Preview Action */}
                          <Link
                            href={`/resources/checklists/${item.slug}`}
                            target="_blank"
                            className="p-2 text-[#66736D] hover:text-[#1F7A5C] hover:bg-[#1F7A5C]/10 rounded-xl transition-all"
                            title="Preview Public Checklist"
                            aria-label={`Preview ${item.title}`}
                          >
                            <Eye className="w-4 h-4" />
                          </Link>

                          {/* Edit Action */}
                          <Link
                            href={`/admin/checklists/${item.id}/edit`}
                            className="p-2 text-[#66736D] hover:text-[#12372A] hover:bg-[#F7F4EC] rounded-xl transition-all"
                            title="Edit Checklist"
                            aria-label={`Edit ${item.title}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Link>

                          {/* Toggle Publish Action */}
                          <button
                            type="button"
                            onClick={() => handleTogglePublish(item.id)}
                            disabled={isPending}
                            className={`p-2 rounded-xl transition-all ${
                              item.published
                                ? 'text-[#1F7A5C] hover:bg-[#1F7A5C]/10'
                                : 'text-[#D6A84F] hover:bg-[#D6A84F]/10'
                            }`}
                            title={item.published ? 'Unpublish to Draft' : 'Publish Live'}
                            aria-label={item.published ? 'Unpublish checklist' : 'Publish checklist'}
                          >
                            <Globe className="w-4 h-4" />
                          </button>

                          {/* Delete Action */}
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(item)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all"
                            title="Delete Checklist"
                            aria-label={`Delete ${item.title}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card List View */}
        <div className="md:hidden divide-y divide-[#D9E1DC]/60">
          {checklists.length === 0 ? (
            <div className="py-12 text-center text-[#66736D] px-4">
              <FileCheck2 className="w-10 h-10 text-[#66736D]/40 mx-auto mb-2" />
              <p className="text-sm font-semibold">No checklists found</p>
            </div>
          ) : (
            checklists.map((item, index) => {
              const globalIndex = (currentPage - 1) * pageSize + index + 1
              const serialStr = `#${String(globalIndex).padStart(2, '0')}`

              return (
                <div key={item.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-[#66736D]">{serialStr}</span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          item.published
                            ? 'bg-[#1F7A5C]/10 text-[#1F7A5C]'
                            : 'bg-[#D6A84F]/15 text-[#9E731E]'
                        }`}
                      >
                        {item.published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#66736D]">
                      {new Date(item.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>

                  <Link
                    href={`/admin/checklists/${item.id}/edit`}
                    className="font-bold text-[#12372A] text-sm block"
                  >
                    {item.title}
                  </Link>

                  <div className="flex items-center justify-between pt-2 border-t border-[#D9E1DC]/60">
                    <span className="text-xs text-[#66736D]">{item.author?.name || 'LabourAxis'}</span>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/resources/checklists/${item.slug}`}
                        target="_blank"
                        className="p-1.5 text-[#1F7A5C]"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link href={`/admin/checklists/${item.id}/edit`} className="p-1.5 text-[#12372A]">
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(item.id)}
                        className="p-1.5 text-[#1F7A5C]"
                      >
                        <Globe className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(item)}
                        className="p-1.5 text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Server-Side Pagination Footer */}
        <div className="bg-[#F7F4EC]/60 border-t border-[#D9E1DC] p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#66736D] font-medium">
            Showing <strong className="text-[#12372A]">{startItem}</strong>–
            <strong className="text-[#12372A]">{endItem}</strong> of{' '}
            <strong className="text-[#12372A]">{totalCount}</strong> checklists
          </p>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => updateFilters(currentPage - 1)}
              disabled={currentPage <= 1 || isPending}
              className="px-3 py-2 bg-white border border-[#D9E1DC] rounded-xl text-xs font-bold text-[#12372A] hover:bg-[#F7F4EC] disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1 shadow-2xs"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            {getPageNumbers().map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => updateFilters(p)}
                disabled={isPending}
                className={`w-8 h-8 rounded-xl text-xs font-bold transition-all shadow-2xs ${
                  p === currentPage
                    ? 'bg-[#12372A] text-white'
                    : 'bg-white border border-[#D9E1DC] text-[#202522] hover:bg-[#F7F4EC]'
                }`}
              >
                {p}
              </button>
            ))}

            <button
              type="button"
              onClick={() => updateFilters(currentPage + 1)}
              disabled={currentPage >= totalPages || isPending}
              className="px-3 py-2 bg-white border border-[#D9E1DC] rounded-xl text-xs font-bold text-[#12372A] hover:bg-[#F7F4EC] disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1 shadow-2xs"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#D9E1DC] space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-3 bg-red-100 rounded-2xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#12372A]">Delete this checklist?</h3>
                <p className="text-xs text-[#66736D]">This will permanently remove all sections and items.</p>
              </div>
            </div>
            <p className="text-xs text-[#66736D] leading-relaxed">
              Are you sure you want to delete <strong>{deleteTarget.title}</strong>? It will immediately be removed from the public website, search results, and dynamic sitemap.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 bg-white border border-[#D9E1DC] text-[#202522] rounded-xl text-xs font-bold hover:bg-[#F7F4EC]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 disabled:opacity-50"
              >
                {isPending ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
