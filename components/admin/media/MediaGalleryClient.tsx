'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { format } from 'date-fns'
import {
  Copy,
  Check,
  Eye,
  Edit2,
  Trash2,
  Search,
  SlidersHorizontal,
  ExternalLink,
  AlertTriangle,
  FileImage,
  ImageIcon,
  Loader2,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateMediaMetadata, deleteMediaItem, getMediaUsage } from '@/app/actions/media'

interface MediaItem {
  id: string
  url: string
  filename: string
  altText: string | null
  mimeType: string
  size: number
  createdAt: string | Date
  updatedAt: string | Date
}

interface MediaGalleryClientProps {
  initialItems: MediaItem[]
  totalCount: number
  currentPage: number
  pageSize: number
  currentFilters: {
    q: string
    type: string
    sort: string
  }
}

function formatBytes(bytes: number, decimals = 1) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

export default function MediaGalleryClient({
  initialItems,
  totalCount,
  currentPage,
  pageSize,
  currentFilters,
}: MediaGalleryClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null)
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null)
  const [editFilename, setEditFilename] = useState('')
  const [editAltText, setEditAltText] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Delete flow state
  const [deletingItem, setDeletingItem] = useState<MediaItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [usageInfo, setUsageInfo] = useState<{ type: string; title: string }[]>([])
  const [isCheckingUsage, setIsCheckingUsage] = useState(false)
  const [actionError, setActionError] = useState('')

  // Search & Filter state
  const [search, setSearch] = useState(currentFilters.q)
  const [selectedType, setSelectedType] = useState(currentFilters.type || 'all')
  const [selectedSort, setSelectedSort] = useState(currentFilters.sort || 'newest')

  const totalPages = Math.ceil(totalCount / pageSize)

  const applyFilters = (newQ?: string, newType?: string, newSort?: string, page = 1) => {
    const params = new URLSearchParams(searchParams.toString())
    const qVal = newQ !== undefined ? newQ : search
    const typeVal = newType !== undefined ? newType : selectedType
    const sortVal = newSort !== undefined ? newSort : selectedSort

    if (qVal) params.set('q', qVal)
    else params.delete('q')

    if (typeVal && typeVal !== 'all') params.set('type', typeVal)
    else params.delete('type')

    if (sortVal && sortVal !== 'newest') params.set('sort', sortVal)
    else params.delete('sort')

    params.set('page', page.toString())
    router.push(`/admin/media?${params.toString()}`)
  }

  const copyToClipboard = async (url: string, id: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error('Failed to copy', err)
    }
  }

  const handleOpenEdit = (item: MediaItem) => {
    setEditingItem(item)
    setEditFilename(item.filename)
    setEditAltText(item.altText || '')
    setActionError('')
  }

  const handleSaveMetadata = async () => {
    if (!editingItem) return
    setIsSaving(true)
    setActionError('')

    const res = await updateMediaMetadata({
      id: editingItem.id,
      filename: editFilename,
      altText: editAltText,
    })

    if (res.success) {
      setEditingItem(null)
      router.refresh()
    } else {
      setActionError(res.error || 'Failed to update metadata')
    }
    setIsSaving(false)
  }

  const handleOpenDelete = async (item: MediaItem) => {
    setDeletingItem(item)
    setIsCheckingUsage(true)
    setActionError('')
    setUsageInfo([])

    const usageRes = await getMediaUsage(item.url)
    if (usageRes.success && usageRes.usage) {
      setUsageInfo(usageRes.usage)
    }
    setIsCheckingUsage(false)
  }

  const handleConfirmDelete = async (force = false) => {
    if (!deletingItem) return
    setIsDeleting(true)
    setActionError('')

    const res = await deleteMediaItem(deletingItem.id, force)

    if (res.success) {
      setDeletingItem(null)
      if (previewItem?.id === deletingItem.id) setPreviewItem(null)
      router.refresh()
    } else {
      setActionError(res.error || 'Failed to delete media')
    }
    setIsDeleting(false)
  }

  return (
    <div className="space-y-6">
      {/* Search, Filter & Sort Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#F7F4EC]/60 p-4 rounded-2xl border border-[#D9E1DC]">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#66736D]" />
          <Input
            type="text"
            placeholder="Search media by filename or alt..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              applyFilters(e.target.value, undefined, undefined, 1)
            }}
            className="pl-10 h-10 text-xs rounded-xl bg-white border-[#D9E1DC]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Format Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-[#66736D] uppercase">Type:</span>
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value)
                applyFilters(undefined, e.target.value, undefined, 1)
              }}
              className="h-10 px-3 text-xs font-semibold rounded-xl bg-white border border-[#D9E1DC] text-[#12372A]"
            >
              <option value="all">All Types</option>
              <option value="webp">WebP</option>
              <option value="png">PNG</option>
              <option value="jpeg">JPEG / JPG</option>
              <option value="svg">SVG</option>
            </select>
          </div>

          {/* Sort Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-[#66736D] uppercase">Sort:</span>
            <select
              value={selectedSort}
              onChange={(e) => {
                setSelectedSort(e.target.value)
                applyFilters(undefined, undefined, e.target.value, 1)
              }}
              className="h-10 px-3 text-xs font-semibold rounded-xl bg-white border border-[#D9E1DC] text-[#12372A]"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name_asc">Name (A–Z)</option>
              <option value="name_desc">Name (Z–A)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Media Grid */}
      {initialItems.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-[#D9E1DC] p-8">
          <ImageIcon className="w-12 h-12 mx-auto text-[#A2B3AA] mb-3" />
          <h3 className="text-base font-bold text-[#12372A]">No media assets found</h3>
          <p className="text-xs text-[#66736D] mt-1 max-w-sm mx-auto">
            {search
              ? 'No media matches your search query. Try clearing filters.'
              : 'Your media library is empty. Click "+ Upload Media" above to add images.'}
          </p>
          {search && (
            <Button
              onClick={() => {
                setSearch('')
                applyFilters('', 'all', 'newest', 1)
              }}
              variant="outline"
              className="mt-4 text-xs rounded-xl border-[#D9E1DC]"
            >
              Clear Search Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {initialItems.map((item) => {
            const formatName = item.mimeType.replace('image/', '').toUpperCase()
            return (
              <div
                key={item.id}
                className="group relative border border-[#D9E1DC] rounded-2xl overflow-hidden bg-white shadow-2xs hover:shadow-md hover:border-[#1F7A5C]/40 transition-all flex flex-col justify-between"
              >
                {/* Thumbnail Preview Area */}
                <div
                  onClick={() => setPreviewItem(item)}
                  className="aspect-square w-full overflow-hidden bg-[#F7F4EC] relative cursor-pointer"
                >
                  <img
                    src={item.url}
                    alt={item.altText || item.filename}
                    className="object-cover group-hover:scale-105 transition-transform duration-300 w-full h-full"
                  />
                  {/* Hover Overlay with Preview Icon */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <Eye className="w-6 h-6" />
                  </div>
                  {/* Format Badge */}
                  <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-black/70 text-white font-mono text-[9px] font-bold">
                    {formatName}
                  </span>
                </div>

                {/* Card Content & Action Bar */}
                <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <p
                      className="text-xs font-bold text-[#12372A] truncate"
                      title={item.filename}
                    >
                      {item.filename}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-[#66736D] mt-0.5">
                      <span>{formatBytes(item.size)}</span>
                      <span>{format(new Date(item.createdAt), 'dd MMM yyyy')}</span>
                    </div>
                  </div>

                  {/* Actions Grid */}
                  <div className="flex items-center justify-between pt-1 border-t border-[#D9E1DC]/80">
                    <button
                      type="button"
                      onClick={() => copyToClipboard(item.url, item.id)}
                      title="Copy Image CDN URL"
                      className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
                        copiedId === item.id
                          ? 'bg-[#1F7A5C] text-white'
                          : 'text-[#66736D] hover:text-[#1F7A5C] hover:bg-[#F7F4EC]'
                      }`}
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEdit(item)}
                      title="Edit metadata"
                      className="p-1.5 rounded-lg text-[#66736D] hover:text-[#1F7A5C] hover:bg-[#F7F4EC] transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenDelete(item)}
                      title="Delete image"
                      className="p-1.5 rounded-lg text-[#66736D] hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#D9E1DC]">
          <p className="text-xs text-[#66736D]">
            Showing <span className="font-bold text-[#12372A]">{(currentPage - 1) * pageSize + 1}</span> to{' '}
            <span className="font-bold text-[#12372A]">
              {Math.min(currentPage * pageSize, totalCount)}
            </span>{' '}
            of <span className="font-bold text-[#12372A]">{totalCount}</span> assets
          </p>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => applyFilters(undefined, undefined, undefined, currentPage - 1)}
              className="text-xs rounded-xl border-[#D9E1DC]"
            >
              ← Previous
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => {
                if (totalPages <= 5) return true
                return Math.abs(p - currentPage) <= 2
              })
              .map((p) => (
                <Button
                  key={p}
                  size="sm"
                  variant={p === currentPage ? 'default' : 'outline'}
                  onClick={() => applyFilters(undefined, undefined, undefined, p)}
                  className={`text-xs rounded-xl ${
                    p === currentPage
                      ? 'bg-[#1F7A5C] text-white'
                      : 'border-[#D9E1DC] text-[#12372A]'
                  }`}
                >
                  {p}
                </Button>
              ))}

            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => applyFilters(undefined, undefined, undefined, currentPage + 1)}
              className="text-xs rounded-xl border-[#D9E1DC]"
            >
              Next →
            </Button>
          </div>
        </div>
      )}

      {/* 1. Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-[#D9E1DC] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#D9E1DC]">
              <h3 className="text-base font-bold text-[#12372A] truncate">
                {previewItem.filename}
              </h3>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="p-1.5 text-[#66736D] hover:text-[#12372A] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-4">
              <div className="md:col-span-7 bg-[#F7F4EC] rounded-2xl overflow-hidden border border-[#D9E1DC] flex items-center justify-center p-2 min-h-[260px] max-h-[360px]">
                <img
                  src={previewItem.url}
                  alt={previewItem.altText || previewItem.filename}
                  className="max-h-[340px] w-auto object-contain rounded-xl"
                />
              </div>

              <div className="md:col-span-5 space-y-4 text-xs">
                <dl className="divide-y divide-[#D9E1DC]/80 space-y-2">
                  <div className="pt-2">
                    <dt className="text-[#66736D] font-medium">File Name</dt>
                    <dd className="font-bold text-[#12372A] mt-0.5 break-all">
                      {previewItem.filename}
                    </dd>
                  </div>
                  <div className="pt-2">
                    <dt className="text-[#66736D] font-medium">Alt Text</dt>
                    <dd className="text-[#202522] mt-0.5 italic">
                      {previewItem.altText || 'No alt text set'}
                    </dd>
                  </div>
                  <div className="pt-2 flex justify-between">
                    <dt className="text-[#66736D]">MIME Type</dt>
                    <dd className="font-mono font-bold text-[#12372A]">{previewItem.mimeType}</dd>
                  </div>
                  <div className="pt-2 flex justify-between">
                    <dt className="text-[#66736D]">File Size</dt>
                    <dd className="font-bold text-[#12372A]">{formatBytes(previewItem.size)}</dd>
                  </div>
                  <div className="pt-2 flex justify-between">
                    <dt className="text-[#66736D]">Uploaded Date</dt>
                    <dd className="text-[#12372A]">
                      {format(new Date(previewItem.createdAt), 'dd MMM yyyy, h:mm a')}
                    </dd>
                  </div>
                </dl>

                <div className="pt-3 flex flex-col gap-2">
                  <Button
                    onClick={() => copyToClipboard(previewItem.url, previewItem.id)}
                    className="w-full bg-[#1F7A5C] hover:bg-[#165B44] text-white font-bold text-xs rounded-xl"
                  >
                    <Copy className="w-3.5 h-3.5 mr-1.5" />
                    <span>Copy CDN URL</span>
                  </Button>
                  <a
                    href={previewItem.url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-[#D9E1DC] rounded-xl text-xs font-bold text-[#12372A] hover:bg-[#F7F4EC] transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                    <span>Open in New Tab</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Edit Metadata Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#D9E1DC] animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#D9E1DC]">
              <h3 className="text-base font-bold text-[#12372A]">
                Edit Media Metadata
              </h3>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="p-1.5 text-[#66736D] hover:text-[#12372A] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 pt-1">
              {actionError && (
                <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs font-semibold border border-rose-200">
                  {actionError}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="editFilename" className="text-xs font-bold text-[#12372A]">
                  Display Filename *
                </Label>
                <Input
                  id="editFilename"
                  value={editFilename}
                  onChange={(e) => setEditFilename(e.target.value)}
                  className="text-xs rounded-xl border-[#D9E1DC]"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="editAltText" className="text-xs font-bold text-[#12372A]">
                  Default Alt Text
                </Label>
                <Input
                  id="editAltText"
                  value={editAltText}
                  onChange={(e) => setEditAltText(e.target.value)}
                  placeholder="Describe what is shown in this image..."
                  className="text-xs rounded-xl border-[#D9E1DC]"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[#D9E1DC] flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setEditingItem(null)}
                className="text-xs rounded-xl border-[#D9E1DC]"
              >
                Cancel
              </Button>
              <Button
                disabled={isSaving || !editFilename.trim()}
                onClick={handleSaveMetadata}
                className="bg-[#1F7A5C] hover:bg-[#165B44] text-white font-bold text-xs rounded-xl px-5"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Delete Confirmation Modal */}
      {deletingItem && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-100 animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#D9E1DC]">
              <h3 className="text-base font-bold text-[#12372A] flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <span>Delete Media Asset?</span>
              </h3>
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                className="p-1.5 text-[#66736D] hover:text-[#12372A] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 pt-1 text-xs">
              <p className="text-[#66736D]">
                Are you sure you want to permanently delete{' '}
                <strong className="text-[#12372A]">{deletingItem.filename}</strong>?
              </p>

              {isCheckingUsage ? (
                <div className="flex items-center gap-2 p-3 bg-[#F7F4EC] rounded-xl text-[#66736D]">
                  <Loader2 className="w-4 h-4 animate-spin text-[#1F7A5C]" />
                  <span>Checking content usage across Articles, Guides & Checklists...</span>
                </div>
              ) : usageInfo.length > 0 ? (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1.5 text-amber-900">
                  <div className="font-bold flex items-center gap-1.5 text-amber-800">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                    <span>Active Content Usage Detected:</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    This image is currently referenced by {usageInfo.length} content item(s):
                  </p>
                  <ul className="list-disc pl-5 text-[11px] space-y-0.5">
                    {usageInfo.map((u, idx) => (
                      <li key={idx}>
                        <strong>{u.type}:</strong> {u.title}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-[#1F7A5C] font-semibold text-[11px]">
                  ✓ This media item is not currently used by any content.
                </p>
              )}

              {actionError && (
                <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs font-semibold border border-rose-200">
                  {actionError}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#D9E1DC] flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setDeletingItem(null)}
                className="text-xs rounded-xl border-[#D9E1DC]"
              >
                Cancel
              </Button>
              <Button
                disabled={isDeleting || isCheckingUsage}
                onClick={() => handleConfirmDelete(usageInfo.length > 0)}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl px-4"
              >
                {isDeleting
                  ? 'Deleting...'
                  : usageInfo.length > 0
                  ? 'Delete Anyway'
                  : 'Confirm Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
