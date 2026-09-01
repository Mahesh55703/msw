'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Eye,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  Search,
  Globe,
  AlertTriangle,
  X,
  CheckCircle2,
} from 'lucide-react'
import { updateFaqOrder, deleteFaq, togglePublishFaq } from '@/app/actions/faq'
import { useRouter } from 'next/navigation'
import { FAQ_CATEGORY_LABELS, FaqCategoryType } from '@/lib/validations/faq'

interface FaqItem {
  id: string
  question: string
  answer: string
  category: FaqCategoryType
  published: boolean
  displayOrder: number
  createdAt: Date | string
  updatedAt: Date | string
}

interface FaqListProps {
  items: FaqItem[]
  totalCount: number
  currentQuery: string
  currentCategory: string
  currentStatus: string
}

export default function FaqList({
  items,
  totalCount,
  currentQuery,
  currentCategory,
  currentStatus,
}: FaqListProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState(currentQuery)
  const [isMutating, setIsMutating] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<FaqItem | null>(null)
  const [previewTarget, setPreviewTarget] = useState<FaqItem | null>(null)

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchTerm) params.set('q', searchTerm)
    if (currentCategory) params.set('category', currentCategory)
    if (currentStatus) params.set('status', currentStatus)
    router.push(`/admin/faqs?${params.toString()}`)
  }

  const handleFilterChange = (key: 'category' | 'status', value: string) => {
    const params = new URLSearchParams()
    if (searchTerm) params.set('q', searchTerm)
    if (key === 'category') {
      if (value && value !== 'all') params.set('category', value)
      if (currentStatus) params.set('status', currentStatus)
    } else if (key === 'status') {
      if (currentCategory) params.set('category', currentCategory)
      if (value && value !== 'all') params.set('status', value)
    }
    router.push(`/admin/faqs?${params.toString()}`)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsMutating(deleteTarget.id)
    try {
      await deleteFaq(deleteTarget.id)
      setDeleteTarget(null)
      router.refresh()
    } finally {
      setIsMutating(null)
    }
  }

  const handleTogglePublish = async (id: string) => {
    setIsMutating(id)
    try {
      await togglePublishFaq(id)
      router.refresh()
    } finally {
      setIsMutating(null)
    }
  }

  const handleChangeOrder = async (id: string, currentOrder: number, change: number) => {
    const nextOrder = Math.max(0, currentOrder + change)
    setIsMutating(id)
    try {
      await updateFaqOrder(id, nextOrder)
      router.refresh()
    } finally {
      setIsMutating(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 bg-white p-4 rounded-3xl shadow-xs border border-[#D9E1DC]">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#66736D]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search FAQs by question or answer..."
            className="w-full h-11 pl-11 pr-4 border border-[#D9E1DC] rounded-2xl text-xs bg-[#F7F4EC]/30 text-[#202522] placeholder-[#66736D] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#1F7A5C]"
          />
        </form>

        <div className="flex flex-wrap gap-2.5">
          <select
            value={currentCategory || 'all'}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="h-11 px-4 border border-[#D9E1DC] rounded-2xl text-xs font-semibold text-[#202522] bg-[#F7F4EC]/30 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#1F7A5C]"
          >
            <option value="all">All Categories</option>
            {Object.entries(FAQ_CATEGORY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>

          <select
            value={currentStatus || 'all'}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="h-11 px-4 border border-[#D9E1DC] rounded-2xl text-xs font-semibold text-[#202522] bg-[#F7F4EC]/30 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#1F7A5C]"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-3xl border border-[#D9E1DC] shadow-xs overflow-hidden">
        {items.length === 0 ? (
          <div className="p-16 text-center text-xs font-medium text-[#66736D] space-y-2">
            <p className="text-base font-bold text-[#12372A]">No FAQs found</p>
            <p>Try adjusting your search query or category filters.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[10px] text-[#66736D] uppercase font-bold tracking-wider bg-[#F7F4EC] border-b border-[#D9E1DC]">
                  <tr>
                    <th className="px-4 py-3.5 font-bold w-12 text-center">#</th>
                    <th className="px-4 py-3.5 font-bold w-24">Order</th>
                    <th className="px-4 py-3.5 font-bold">Question</th>
                    <th className="px-4 py-3.5 font-bold">Category</th>
                    <th className="px-4 py-3.5 font-bold">Status</th>
                    <th className="px-4 py-3.5 font-bold">Updated</th>
                    <th className="px-4 py-3.5 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9E1DC]/60">
                  {items.map((item, index) => {
                    const serialNumber = `#${String(index + 1).padStart(2, '0')}`
                    const isUncategorized = item.category === 'UNCATEGORIZED'

                    return (
                      <tr key={item.id} className="hover:bg-[#F7F4EC]/60 transition-colors group">
                        {/* Serial Number */}
                        <td className="px-4 py-4 text-center font-mono font-bold text-[#66736D]">
                          {serialNumber}
                        </td>

                        {/* Display Order Controls */}
                        <td className="px-4 py-4 text-[#66736D]">
                          <div className="flex items-center gap-1.5">
                            <div className="flex flex-col">
                              <button
                                type="button"
                                onClick={() => handleChangeOrder(item.id, item.displayOrder, -1)}
                                disabled={isMutating === item.id}
                                className="text-[#A2B3AA] hover:text-[#12372A] p-0.5"
                                title="Move up"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleChangeOrder(item.id, item.displayOrder, 1)}
                                disabled={isMutating === item.id}
                                className="text-[#A2B3AA] hover:text-[#12372A] p-0.5"
                                title="Move down"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                            </div>
                            <span className="w-6 text-center font-mono font-bold text-[#12372A]">
                              {item.displayOrder}
                            </span>
                          </div>
                        </td>

                        {/* Question */}
                        <td className="px-4 py-4 font-bold text-[#12372A] max-w-md">
                          <p className="line-clamp-2 leading-relaxed" title={item.question}>
                            {item.question}
                          </p>
                        </td>

                        {/* Category */}
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              isUncategorized
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-[#F7F4EC] text-[#12372A] border border-[#D9E1DC]'
                            }`}
                          >
                            {FAQ_CATEGORY_LABELS[item.category] || item.category}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              item.published
                                ? 'bg-[#1F7A5C]/10 text-[#1F7A5C] border border-[#1F7A5C]/20'
                                : 'bg-[#D6A84F]/15 text-[#9E731E] border border-[#D6A84F]/30'
                            }`}
                          >
                            {item.published ? 'Published' : 'Draft'}
                          </span>
                        </td>

                        {/* Updated Date */}
                        <td className="px-4 py-4 text-[#66736D] font-medium">
                          {new Date(item.updatedAt).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Preview Modal */}
                            <button
                              type="button"
                              onClick={() => setPreviewTarget(item)}
                              className="p-2 text-[#66736D] hover:text-[#12372A] hover:bg-[#F7F4EC] rounded-xl transition-colors"
                              title="Preview FAQ"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Edit */}
                            <Link
                              href={`/admin/faqs/${item.id}/edit`}
                              className="p-2 text-[#66736D] hover:text-[#1F7A5C] hover:bg-[#1F7A5C]/10 rounded-xl transition-colors"
                              title="Edit FAQ"
                            >
                              <Pencil className="w-4 h-4" />
                            </Link>

                            {/* Toggle Publish */}
                            <button
                              type="button"
                              onClick={() => handleTogglePublish(item.id)}
                              disabled={isMutating === item.id}
                              className={`p-2 rounded-xl transition-colors ${
                                item.published
                                  ? 'text-[#1F7A5C] hover:bg-[#1F7A5C]/10'
                                  : 'text-[#66736D] hover:text-[#12372A] hover:bg-[#F7F4EC]'
                              }`}
                              title={item.published ? 'Unpublish to Draft' : 'Publish Live'}
                            >
                              <Globe className="w-4 h-4" />
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(item)}
                              disabled={isMutating === item.id}
                              className="p-2 text-[#66736D] hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                              title="Delete FAQ"
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

            {/* Mobile Card List View (320px - 768px) */}
            <div className="md:hidden divide-y divide-[#D9E1DC]/60">
              {items.map((item, index) => {
                const serialNumber = `#${String(index + 1).padStart(2, '0')}`

                return (
                  <div key={item.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-[#66736D]">
                          {serialNumber}
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.published
                              ? 'bg-[#1F7A5C]/10 text-[#1F7A5C]'
                              : 'bg-[#D6A84F]/15 text-[#9E731E]'
                          }`}
                        >
                          {item.published ? 'Published' : 'Draft'}
                        </span>
                      </div>
                      <span className="text-[10px] font-medium text-[#66736D]">
                        Order: {item.displayOrder}
                      </span>
                    </div>

                    <p className="font-bold text-sm text-[#12372A] leading-snug">{item.question}</p>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-[#F7F4EC] text-[#12372A] border border-[#D9E1DC]">
                        {FAQ_CATEGORY_LABELS[item.category] || item.category}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setPreviewTarget(item)}
                          className="p-1.5 text-[#66736D] hover:bg-[#F7F4EC] rounded-lg"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <Link
                          href={`/admin/faqs/${item.id}/edit`}
                          className="p-1.5 text-[#66736D] hover:bg-[#1F7A5C]/10 rounded-lg"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(item)}
                          className="p-1.5 text-[#66736D] hover:bg-rose-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* Admin Preview Modal */}
      {previewTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-[#D9E1DC] animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#D9E1DC]">
              <div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F7F4EC] text-[#12372A] border border-[#D9E1DC]">
                  {FAQ_CATEGORY_LABELS[previewTarget.category]}
                </span>
                <h3 className="text-lg font-bold text-[#12372A] mt-2 leading-snug">
                  {previewTarget.question}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewTarget(null)}
                className="p-2 text-[#66736D] hover:text-[#12372A] hover:bg-[#F7F4EC] rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#66736D]">
                Answer
              </span>
              <div
                className="prose prose-sm prose-slate max-w-none p-4 rounded-2xl bg-[#F7F4EC]/40 border border-[#D9E1DC]"
                dangerouslySetInnerHTML={{ __html: previewTarget.answer }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-[#66736D] pt-2 border-t border-[#D9E1DC]">
              <span>Display Order: {previewTarget.displayOrder}</span>
              <span>Status: {previewTarget.published ? 'Published Live' : 'Draft'}</span>
            </div>

            <div className="flex justify-end gap-3">
              <Link
                href={`/admin/faqs/${previewTarget.id}/edit`}
                className="px-5 py-2.5 bg-[#1F7A5C] text-white font-bold text-xs rounded-xl hover:bg-[#165B44] transition-colors"
              >
                Edit in Studio
              </Link>
              <button
                type="button"
                onClick={() => setPreviewTarget(null)}
                className="px-5 py-2.5 bg-[#F7F4EC] text-[#12372A] font-bold text-xs rounded-xl hover:bg-[#EDE8DE] transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl border border-rose-100 animate-in fade-in zoom-in-95">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#12372A]">Delete this FAQ?</h3>
                <p className="text-xs text-[#66736D] leading-relaxed">
                  This will permanently delete "{deleteTarget.question.slice(0, 70)}...". This action
                  cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isMutating !== null}
                className="px-4 py-2 bg-[#F7F4EC] hover:bg-[#EDE8DE] text-[#12372A] font-bold text-xs rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isMutating !== null}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                {isMutating === deleteTarget.id ? 'Deleting...' : 'Delete FAQ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
