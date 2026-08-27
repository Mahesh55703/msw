'use client'

import { format } from 'date-fns'
import { Copy, Trash2, Check } from 'lucide-react'
import { useState } from 'react'

export default function MediaGallery({ initialItems }: { initialItems: any[] }) {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const copyToClipboard = async (url: string, id: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error('Failed to copy', err)
    }
  }

  if (initialItems.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No media uploaded yet. Upload your first image to get started.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {initialItems.map((item) => (
        <div key={item.id} className="relative group border border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex flex-col">
          <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200 xl:aspect-w-7 xl:aspect-h-8">
            <img
              src={item.url}
              alt={item.altText || item.filename}
              className="object-cover group-hover:opacity-75 transition-opacity duration-200 w-full h-48"
            />
          </div>
          <div className="p-3 flex-1 flex flex-col justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 truncate" title={item.filename}>
                {item.filename}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {format(new Date(item.createdAt), 'dd MMM yyyy')}
              </p>
            </div>
            
            <div className="mt-4 flex space-x-2">
              <button
                onClick={() => copyToClipboard(item.url, item.id)}
                className="flex-1 inline-flex justify-center items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
              >
                {copiedId === item.id ? (
                  <><Check className="h-3 w-3 mr-1 text-green-500" /> Copied</>
                ) : (
                  <><Copy className="h-3 w-3 mr-1" /> Copy URL</>
                )}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
