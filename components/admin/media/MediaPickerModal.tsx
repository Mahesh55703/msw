'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Search,
  Upload,
  Check,
  Loader2,
  ImageIcon,
  X,
} from 'lucide-react'

interface MediaItem {
  id: string
  url: string
  filename: string
  altText: string | null
  mimeType: string
  size: number
  createdAt: string | Date
}

interface MediaPickerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (media: { id?: string; url: string; filename: string; altText?: string }) => void
  currentUrl?: string
}

export function MediaPickerModal({
  open,
  onOpenChange,
  onSelect,
  currentUrl,
}: MediaPickerModalProps) {
  const [items, setItems] = useState<MediaItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null)
  const [customAltText, setCustomAltText] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch media library items
  const fetchMedia = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/upload?list=true')
      if (res.ok) {
        const data = await res.json()
        setItems(data.items || [])
      }
    } catch (err) {
      console.error('Failed to load media items', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      fetchMedia()
    }
  }, [open])

  useEffect(() => {
    if (currentUrl && items.length > 0) {
      const found = items.find((i) => i.url === currentUrl)
      if (found) {
        setSelectedItem(found)
        setCustomAltText(found.altText || '')
      }
    }
  }, [currentUrl, items])

  if (!open) return null

  const filteredItems = items.filter((item) => {
    const q = searchQuery.toLowerCase()
    return (
      item.filename.toLowerCase().includes(q) ||
      (item.altText && item.altText.toLowerCase().includes(q))
    )
  })

  const handleUploadNew = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadError('')

    try {
      const response = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
        method: 'POST',
        body: file,
      })

      if (response.ok) {
        const data = await response.json()
        const newItem: MediaItem = {
          id: data.id,
          url: data.url,
          filename: data.filename,
          altText: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
          mimeType: file.type || 'image/jpeg',
          size: file.size,
          createdAt: new Date(),
        }
        setItems((prev) => [newItem, ...prev])
        setSelectedItem(newItem)
        setCustomAltText(newItem.altText || '')
      } else {
        const err = await response.json()
        setUploadError(err.error || 'Upload failed')
      }
    } catch (err: any) {
      setUploadError('Failed to upload file')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleConfirmSelection = () => {
    if (selectedItem) {
      onSelect({
        id: selectedItem.id,
        url: selectedItem.url,
        filename: selectedItem.filename,
        altText: customAltText.trim() || selectedItem.altText || '',
      })
    }
    onOpenChange(false)
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[88vh] flex flex-col p-6 shadow-2xl border border-[#D9E1DC] animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#D9E1DC]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#1F7A5C]/10 text-[#1F7A5C] flex items-center justify-center">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#12372A]">Select Media Asset</h2>
              <p className="text-xs text-[#66736D]">Choose an existing image or upload a new one.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="p-2 text-[#66736D] hover:text-[#12372A] hover:bg-[#F7F4EC] rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Search + Direct Upload Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#66736D]" />
            <Input
              type="text"
              placeholder="Search images by filename or alt text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 text-xs rounded-xl border-[#D9E1DC] bg-[#F7F4EC]/40"
            />
          </div>

          <div className="shrink-0 w-full sm:w-auto">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/svg+xml"
              ref={fileInputRef}
              onChange={handleUploadNew}
              disabled={isUploading}
              className="hidden"
            />
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full sm:w-auto bg-[#1F7A5C] hover:bg-[#165B44] text-white font-bold text-xs rounded-xl h-10 px-4 shadow-xs"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5 mr-1.5" /> Upload New
                </>
              )}
            </Button>
          </div>
        </div>

        {uploadError && (
          <div className="mb-3 p-3 bg-rose-50 text-rose-700 rounded-xl text-xs font-semibold border border-rose-200">
            {uploadError}
          </div>
        )}

        {/* Main Grid & Preview Container */}
        <div className="flex-1 min-h-[260px] max-h-[400px] overflow-y-auto pr-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 text-[#66736D]">
              <Loader2 className="w-8 h-8 animate-spin text-[#1F7A5C] mb-2" />
              <span className="text-xs font-medium">Loading media assets...</span>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-[#66736D] text-center p-6 bg-[#F7F4EC]/30 rounded-2xl border border-dashed border-[#D9E1DC]">
              <ImageIcon className="w-10 h-10 text-[#A2B3AA] mb-2" />
              <p className="text-xs font-bold text-[#12372A]">No media found</p>
              <p className="text-[11px] text-[#66736D] mt-1">
                {searchQuery
                  ? 'Try a different search term or upload a new image.'
                  : 'Your media library is empty. Click "Upload New" to add images.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 p-1">
              {filteredItems.map((item) => {
                const isSelected = selectedItem?.id === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSelectedItem(item)
                      setCustomAltText(item.altText || '')
                    }}
                    className={`group relative rounded-2xl overflow-hidden border-2 text-left transition-all aspect-square bg-[#F7F4EC] focus:outline-none ${
                      isSelected
                        ? 'border-[#1F7A5C] ring-2 ring-[#1F7A5C]/20 shadow-md'
                        : 'border-[#D9E1DC] hover:border-[#1F7A5C]/60 hover:shadow-xs'
                    }`}
                  >
                    <img
                      src={item.url}
                      alt={item.altText || item.filename}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#1F7A5C] text-white flex items-center justify-center shadow-md">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 text-white">
                      <p className="text-[10px] font-bold truncate leading-tight">
                        {item.filename}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Selected Asset Meta & Confirmation Footer */}
        <div className="pt-4 border-t border-[#D9E1DC] space-y-3">
          {selectedItem ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#F7F4EC]/60 p-3 rounded-2xl border border-[#D9E1DC]">
              <div className="flex items-center gap-3 overflow-hidden">
                <img
                  src={selectedItem.url}
                  alt=""
                  className="w-10 h-10 rounded-xl object-cover border border-[#D9E1DC] shrink-0"
                />
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-[#12372A] truncate">
                    {selectedItem.filename}
                  </p>
                  <p className="text-[10px] text-[#66736D] font-mono truncate">
                    {selectedItem.url}
                  </p>
                </div>
              </div>

              <div className="w-full sm:w-auto flex items-center gap-2">
                <div className="flex-1 sm:w-64">
                  <Input
                    placeholder="Image alt text..."
                    value={customAltText}
                    onChange={(e) => setCustomAltText(e.target.value)}
                    className="h-8 text-xs rounded-xl bg-white"
                  />
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-[#66736D] text-center">
              Click on an image above to select it.
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="text-xs rounded-xl border-[#D9E1DC]"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!selectedItem}
              onClick={handleConfirmSelection}
              className="bg-[#1F7A5C] hover:bg-[#165B44] text-white font-bold text-xs rounded-xl px-5"
            >
              Use Selected Image
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
