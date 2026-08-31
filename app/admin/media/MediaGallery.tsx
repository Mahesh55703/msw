'use client'

import { format } from 'date-fns'
import { Copy, Check } from 'lucide-react'
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
      <div className="text-center py-16">
        <p className="text-xs text-[#66736D] font-medium">No media uploaded yet. Use the upload button above to upload public images.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
      {initialItems.map((item) => (
        <div key={item.id} className="relative group border border-[#D9E1DC] rounded-2xl overflow-hidden bg-white shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="aspect-[4/3] w-full overflow-hidden bg-[#F7F4EC] relative">
            <img
              src={item.url}
              alt={item.altText || item.filename}
              className="object-cover group-hover:scale-105 transition-transform duration-300 w-full h-full"
            />
          </div>
          <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
            <div>
              <p className="text-xs font-bold text-[#12372A] truncate" title={item.filename}>
                {item.filename}
              </p>
              <p className="text-[11px] text-[#66736D] mt-0.5">
                {format(new Date(item.createdAt), 'dd MMM yyyy')}
              </p>
            </div>
            
            <div>
              <button
                onClick={() => copyToClipboard(item.url, item.id)}
                className={`w-full inline-flex justify-center items-center px-3 py-2 text-xs font-bold rounded-xl transition-colors shadow-2xs ${
                  copiedId === item.id 
                    ? 'bg-[#1F7A5C] text-white' 
                    : 'bg-[#F7F4EC] hover:bg-[#1F7A5C]/10 text-[#12372A] border border-[#D9E1DC]'
                }`}
              >
                {copiedId === item.id ? (
                  <><Check className="h-3.5 w-3.5 mr-1.5 text-white stroke-[2.5]" /> Copied to Clipboard</>
                ) : (
                  <><Copy className="h-3.5 w-3.5 mr-1.5 text-[#1F7A5C]" /> Copy Asset URL</>
                )}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

