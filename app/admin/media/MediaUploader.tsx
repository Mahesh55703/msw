'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Upload, Loader2 } from 'lucide-react'

export default function MediaUploader() {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    try {
      const response = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
        method: 'POST',
        body: file,
      })

      if (response.ok) {
        // Refresh page to show new image
        router.refresh()
      } else {
        const error = await response.json()
        alert(error.error || 'Upload failed')
      }
    } catch (err) {
      alert('An error occurred during upload')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div>
      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleUpload} 
        disabled={isUploading}
      />
      <Button 
        onClick={() => fileInputRef.current?.click()} 
        disabled={isUploading}
        className="bg-[#1F7A5C] text-white hover:bg-[#165B44] font-bold text-xs rounded-xl shadow-xs"
      >
        {isUploading ? (
          <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> Uploading...</>
        ) : (
          <><Upload className="mr-2 h-3.5 w-3.5" /> Upload Image</>
        )}
      </Button>
    </div>
  )
}

