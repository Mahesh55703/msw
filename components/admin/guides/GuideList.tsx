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
  FileText,
} from 'lucide-react'
import { togglePublishGuide, deleteGuide } from '@/app/actions/guides'

interface GuideItem {
  id: string
  title: string
  slug: string
  excerpt: string | null
  published: boolean
  publishedAt: Date | null
  scheduledAt: Date | null // Maps to Last Reviewed date
  updatedAt: Date
  author?: {
    name: string | null
    email: string
  } | null
}

interface GuideListProps {
  guides: GuideItem[]
  totalCount: number
  currentPage: number
  pageSize: number
  currentStatus: string
  searchQuery: string
}

export default function GuideList({
  guides,
  totalCount,
  currentPage,
  pageSize,
  currentStatus,
  searchQuery,
}: GuideListProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const [searchTerm, setSearchTerm] = useState(searchQuery)
  const [deleteTarget, setDeleteTarget] = useState<GuideItem | null>(null)

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
      await togglePublishGuide(id)
      router.refresh()
    })
  }

  // Delete Guide
  const handleConfirmDelete = () => {
    if (!deleteTarget) return
    startTransition(async () => {
      await deleteGuide(deleteTarget.id)
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

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return '—'
    return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div className="space-y-6">
      {/* Controls Bar: Search & Filter */}
      <div className="bg-white border border-[#D9E1DC] rounded-3xl p-4 md:p-6 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-[#A2B3AA] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search guides by title or content..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D9E1DC] text-xs text-[#12372A] focus:outline-none focus:ring-2 focus:ring-[#1F7A5C] focus:border-transparent placeholder-[#A2B3AA]"
          />
        </form>

        {/* Status Dropdown Filter */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <span className="text-xs font-bold text-[#66736D] uppercase tracking-wider">Status:</span>
          <select
            value={currentStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-[#D9E1DC] text-xs font-bold text-[#12372A] bg-white focus:outline-none focus:ring-2 focus:ring-[#1F7A5C]"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published Live</option>
            <option value="draft">Drafts Only</option>
          </select>
        </div>
      </div>

      {/* Guides Table / Mobile List */}
      <div className="bg-white border border-[#D9E1DC] rounded-3xl shadow-2xs overflow-hidden">
        {guides.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#F7F4EC] text-[#66736D] mx-auto flex items-center justify-center">
              <FileText className="w-6 h-6 text-[#1F7A5C]" />
            </div>
            <h3 className="text-base font-bold text-[#12372A]">No compliance guides found</h3>
            <p className="text-xs text-[#66736D] max-w-sm mx-auto">
              {searchQuery || currentStatus !== 'all'
                ? 'Try adjusting your search query or status filter.'
                : 'Get started by creating your first in-depth compliance guide.'}
            </p>
            <Link
              href="/admin/guides/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1F7A5C] text-white text-xs font-bold rounded-xl hover:bg-[#165B44] transition-colors mt-2"
            >
              + Create Guide
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F7F4EC] border-b border-[#D9E1DC] text-[11px] font-bold text-[#12372A] uppercase tracking-wider">
                    <th className="py-3.5 px-4 w-12 text-center">#</th>
                    <th className="py-3.5 px-4">Title & Details</th>
                    <th className="py-3.5 px-4 w-32">Status</th>
                    <th className="py-3.5 px-4 w-40">Author</th>
                    <th className="py-3.5 px-4 w-36">Last Reviewed</th>
                    <th className="py-3.5 px-4 w-32">Updated</th>
                    <th className="py-3.5 px-4 w-36 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9E1DC]/60 text-xs">
                  {guides.map((guide, idx) => {
                    const serialNumber = (currentPage - 1) * pageSize + idx + 1
                    const lastReviewed = guide.scheduledAt || guide.updatedAt
                    return (
                      <tr key={guide.id} className="hover:bg-[#F7F4EC]/50 transition-colors group">
                        {/* Serial Number */}
                        <td className="py-4 px-4 text-center font-mono font-bold text-[#66736D]">
                          {String(serialNumber).padStart(2, '0')}
                        </td>

                        {/* Title & Excerpt */}
                        <td className="py-4 px-4">
                          <Link
                            href={`/admin/guides/${guide.id}/edit`}
                            className="font-bold text-[#12372A] hover:text-[#1F7A5C] transition-colors line-clamp-1 block text-sm"
                          >
                            {guide.title}
                          </Link>
                          {guide.excerpt && (
                            <span className="text-[#66736D] text-[11px] line-clamp-1 mt-0.5">
                              {guide.excerpt}
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              guide.published
                                ? 'bg-[#1F7A5C]/15 text-[#1F7A5C] border border-[#1F7A5C]/30'
                                : 'bg-[#D6A84F]/15 text-[#916B16] border border-[#D6A84F]/30'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                guide.published ? 'bg-[#1F7A5C]' : 'bg-[#D6A84F]'
                              }`}
                            />
                            <span>{guide.published ? 'Published' : 'Draft'}</span>
                          </span>
                        </td>

                        {/* Author */}
                        <td className="py-4 px-4 font-medium text-[#202522]">
                          {guide.author?.name || 'LabourAxis Editorial'}
                        </td>

                        {/* Last Reviewed */}
                        <td className="py-4 px-4 text-[#66736D] font-medium">
                          {formatDate(lastReviewed)}
                        </td>

                        {/* Updated */}
                        <td className="py-4 px-4 text-[#66736D]">
                          {formatDate(guide.updatedAt)}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5 justify-end">
                            {/* Preview */}
                            <a
                              href={`/resources/guides/${guide.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Preview guide"
                              aria-label="Preview guide"
                              className="p-1.5 rounded-lg bg-white border border-[#D9E1DC] text-[#66736D] hover:text-[#12372A] hover:bg-[#EDE8DE] transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#1F7A5C]" />
                            </a>

                            {/* Edit */}
                            <Link
                              href={`/admin/guides/${guide.id}/edit`}
                              title="Edit guide"
                              aria-label="Edit guide"
                              className="p-1.5 rounded-lg bg-white border border-[#D9E1DC] text-[#66736D] hover:text-[#12372A] hover:bg-[#EDE8DE] transition-colors"
                            >
                              <Edit className="w-3.5 h-3.5 text-[#12372A]" />
                            </Link>

                            {/* Toggle Publish */}
                            <button
                              type="button"
                              onClick={() => handleTogglePublish(guide.id)}
                              disabled={isPending}
                              title={guide.published ? 'Unpublish to Draft' : 'Publish Live'}
                              aria-label={guide.published ? 'Unpublish to Draft' : 'Publish Live'}
                              className={`p-1.5 rounded-lg border transition-colors ${
                                guide.published
                                  ? 'bg-[#1F7A5C]/10 border-[#1F7A5C]/30 text-[#1F7A5C] hover:bg-[#1F7A5C]/20'
                                  : 'bg-[#F7F4EC] border-[#D9E1DC] text-[#66736D] hover:text-[#12372A]'
                              }`}
                            >
                              <Globe className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(guide)}
                              disabled={isPending}
                              title="Delete guide"
                              aria-label="Delete guide"
                              className="p-1.5 rounded-lg bg-white border border-[#D9E1DC] text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
            <div className="md:hidden divide-y divide-[#D9E1DC]/60 p-4 space-y-4">
              {guides.map((guide, idx) => {
                const serialNumber = (currentPage - 1) * pageSize + idx + 1
                return (
                  <div key={guide.id} className="pt-4 first:pt-0 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[#66736D]">
                        #{String(serialNumber).padStart(2, '0')}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          guide.published
                            ? 'bg-[#1F7A5C]/15 text-[#1F7A5C]'
                            : 'bg-[#D6A84F]/15 text-[#916B16]'
                        }`}
                      >
                        {guide.published ? 'Published' : 'Draft'}
                      </span>
                    </div>

                    <Link
                      href={`/admin/guides/${guide.id}/edit`}
                      className="font-bold text-sm text-[#12372A] block leading-snug"
                    >
                      {guide.title}
                    </Link>

                    <div className="text-[11px] text-[#66736D] flex flex-wrap gap-x-3 gap-y-1 pt-1">
                      <span>Author: {guide.author?.name || 'Editorial'}</span>
                      <span>•</span>
                      <span>Reviewed: {formatDate(guide.scheduledAt || guide.updatedAt)}</span>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <a
                        href={`/resources/guides/${guide.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-[#F7F4EC] rounded-lg text-xs font-bold text-[#12372A] border border-[#D9E1DC] flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#1F7A5C]" /> Preview
                      </a>
                      <Link
                        href={`/admin/guides/${guide.id}/edit`}
                        className="px-3 py-1.5 bg-[#12372A] text-white rounded-lg text-xs font-bold flex items-center gap-1"
                      >
                        <Edit className="w-3.5 h-3.5" /> Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(guide)}
                        className="p-1.5 bg-red-50 text-red-600 rounded-lg text-xs border border-red-200"
                        aria-label="Delete guide"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* Server-Side Pagination Controls */}
        {totalCount > 0 && (
          <div className="bg-[#F7F4EC] border-t border-[#D9E1DC] px-4 md:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-[#66736D] font-medium">
              Showing <span className="font-bold text-[#12372A]">{startItem}–{endItem}</span> of{' '}
              <span className="font-bold text-[#12372A]">{totalCount}</span> guides
            </span>

            <div className="flex items-center gap-1">
              {/* Previous Button */}
              <button
                type="button"
                disabled={currentPage <= 1 || isPending}
                onClick={() => updateFilters(currentPage - 1)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#D9E1DC] bg-white text-xs font-bold text-[#12372A] hover:bg-[#EDE8DE] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                aria-label="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Previous</span>
              </button>

              {/* Page Number Buttons */}
              {getPageNumbers().map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => updateFilters(num)}
                  disabled={isPending}
                  className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                    num === currentPage
                      ? 'bg-[#1F7A5C] text-white shadow-xs'
                      : 'bg-white border border-[#D9E1DC] text-[#12372A] hover:bg-[#EDE8DE]'
                  }`}
                >
                  {num}
                </button>
              ))}

              {/* Next Button */}
              <button
                type="button"
                disabled={currentPage >= totalPages || isPending}
                onClick={() => updateFilters(currentPage + 1)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#D9E1DC] bg-white text-xs font-bold text-[#12372A] hover:bg-[#EDE8DE] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                aria-label="Next Page"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#D9E1DC]">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#12372A]">Delete this guide?</h3>
              <p className="text-xs text-[#66736D] mt-1 leading-relaxed">
                This action will permanently remove <span className="font-bold text-[#12372A]">&quot;{deleteTarget.title}&quot;</span> and clean up its associated takeaways and related links.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 bg-[#F7F4EC] text-[#12372A] font-bold rounded-xl text-xs border border-[#D9E1DC] hover:bg-[#EDE8DE]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white font-bold rounded-xl text-xs hover:bg-red-700 disabled:opacity-50"
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
