'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Loader2, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createServiceOrIndustryPage } from '@/app/actions/pages'

export default function CreatePageForm({ type }: { type: 'SERVICE' | 'INDUSTRY' }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')

  // Auto-generate slug from name if slug hasn't been manually heavily edited
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value
    setName(newName)
    
    // Simple auto-slugger for convenience
    setSlug(newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    const res = await createServiceOrIndustryPage({ type, name, slug })
    
    if (!res.success) {
      setError(res.error || 'Validation failed')
      setIsSubmitting(false)
    } else {
      // Redirect to the new page editor
      router.push(`/admin/pages/${res.data!.id}`)
    }
  }

  const prefix = type === 'SERVICE' ? '/services/' : '/industries/'
  const label = type === 'SERVICE' ? 'Service' : 'Industry'

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-8">
        <Link 
          href={`/admin/pages?tab=${type === 'SERVICE' ? 'services' : 'industries'}`}
          className="inline-flex items-center text-sm font-bold text-[#66736D] hover:text-[#12372A] transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Pages
        </Link>
        <h1 className="text-3xl font-bold text-[#12372A]">Create New {label}</h1>
        <p className="text-[#66736D] mt-2">Initialize a new {label.toLowerCase()} CMS page.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-[#D9E1DC] p-6 md:p-8 space-y-6">
        
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-start gap-3 border border-red-100">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-sm font-medium">{error}</div>
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-sm font-bold text-[#12372A]">
            {label} Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            maxLength={100}
            value={name}
            onChange={handleNameChange}
            placeholder={`e.g. Payroll Management`}
            className="w-full p-3 bg-[#F7F4EC]/50 border border-[#D9E1DC] rounded-xl focus:ring-2 focus:ring-[#1F7A5C] focus:outline-none transition-all text-[#202522]"
          />
          <p className="text-xs text-[#66736D]">
            This will be used as the initial heading and SEO title.
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-bold text-[#12372A]">
            URL Slug <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center">
            <span className="px-4 py-3 bg-[#F7F4EC] border border-r-0 border-[#D9E1DC] rounded-l-xl text-[#66736D] font-mono text-sm">
              {prefix}
            </span>
            <input
              type="text"
              required
              maxLength={100}
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              placeholder="payroll-management"
              className="w-full p-3 bg-white border border-[#D9E1DC] rounded-r-xl focus:ring-2 focus:ring-[#1F7A5C] focus:outline-none transition-all font-mono text-sm text-[#202522]"
            />
          </div>
          <p className="text-xs text-[#66736D]">
            Must be lowercase, URL-safe, and hyphen-separated.
          </p>
        </div>

        <div className="pt-6 border-t border-[#D9E1DC]/60 flex justify-end">
          <Button 
            type="submit" 
            disabled={isSubmitting || !name || !slug}
            className="bg-[#12372A] hover:bg-[#1F7A5C] text-white rounded-xl px-8 py-2.5 font-bold transition-colors"
          >
            {isSubmitting ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</>
            ) : (
              <><Save className="w-4 h-4 mr-2" /> Create {label}</>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
