'use client'

import { useState, useEffect, useTransition, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Save,
  Globe,
  Eye,
  Trash2,
  Plus,
  ArrowUp,
  ArrowDown,
  X,
  Copy,
  Check,
  Upload,
  AlertCircle,
  ExternalLink,
  BookOpen,
  Calendar,
  Clock,
  Sparkles,
  Layers,
  Search,
  Image as ImageIcon,
} from 'lucide-react'
import TiptapEditor from '@/components/editor/TiptapEditor'
import { calculateReadingTime } from '@/lib/content-parser'
import { createGuide, updateGuide, deleteGuide, searchResourcesForGuide } from '@/app/actions/guides'
import { MediaPickerModal } from '@/components/admin/media/MediaPickerModal'

interface UserOption {
  id: string
  name: string | null
  email?: string
}

interface GuideEditorProps {
  initialData?: any
  users: UserOption[]
}

const AVAILABLE_PRACTICE_AREAS = [
  { slug: 'factory-compliance', label: 'Factory & Industrial Compliance' },
  { slug: 'labour-compliance', label: 'Labour & Statutory Compliance' },
  { slug: 'pf-esic-compliance', label: 'PF & ESIC Compliance' },
  { slug: 'contract-labour', label: 'Contract Labour Regulation (CLRA)' },
  { slug: 'payroll-compliance', label: 'Payroll & Wage Compliance' },
  { slug: 'hr-consulting', label: 'HR Consulting & Advisory' },
  { slug: 'compliance-health-check', label: 'Compliance Health Checks & Audits' },
  { slug: 'industrial-relations', label: 'Industrial Relations & Disputes' },
]

export default function GuideEditor({ initialData, users }: GuideEditorProps) {
  const router = useRouter()
  const isEdit = Boolean(initialData?.id)

  // 1. Basic Information
  const [title, setTitle] = useState(initialData?.title || '')
  const [slug, setSlug] = useState(initialData?.slug || '')
  const [isSlugCustomized, setIsSlugCustomized] = useState(Boolean(initialData?.slug))
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || '')
  const [content, setContent] = useState(initialData?.content || '')

  // 2. Author & Publishing
  const [authorId, setAuthorId] = useState(initialData?.authorId || users[0]?.id || '')
  const [published, setPublished] = useState(initialData?.published || false)
  const [lastReviewedDate, setLastReviewedDate] = useState<string>(() => {
    if (initialData?.scheduledAt) {
      return new Date(initialData.scheduledAt).toISOString().split('T')[0]
    }
    if (initialData?.updatedAt) {
      return new Date(initialData.updatedAt).toISOString().split('T')[0]
    }
    return new Date().toISOString().split('T')[0]
  })

  // 3. What This Guide Covers (Guide-Specific)
  const [guideCovers, setGuideCovers] = useState<string[]>(() => {
    if (initialData?.guideCovers && Array.isArray(initialData.guideCovers)) {
      return initialData.guideCovers.map((item: any) => (typeof item === 'string' ? item : item.text))
    }
    // Extract from content if markdown checklist exists
    if (initialData?.content && initialData.content.includes('## What This Guide Covers')) {
      const match = initialData.content.match(/## What This Guide Covers\n([\s\S]*?)(?=\n##|$)/)
      if (match && match[1]) {
        return match[1]
          .split('\n')
          .map((l: string) => l.replace(/^[✓\-\*\s]+/, '').trim())
          .filter((l: string) => l.length > 0)
      }
    }
    return [
      'Applicability thresholds & registration',
      'Statutory working hours and overtime',
      'Mandatory registers and muster rolls',
      'Contract labour management & compliance',
    ]
  })

  // 4. Key Takeaways
  const [keyTakeaways, setKeyTakeaways] = useState<string[]>(() => {
    if (initialData?.keyTakeaways && Array.isArray(initialData.keyTakeaways)) {
      return initialData.keyTakeaways.map((item: any) => (typeof item === 'string' ? item : item.text))
    }
    return [
      'Verify state-specific rule amendments and establishment applicability triggers.',
      'Maintain synchronized muster rolls and wage registers to avoid audit discrepancies.',
    ]
  })

  // 5. Media & Cover Image
  const [featuredImage, setFeaturedImage] = useState(initialData?.featuredImage || '')
  const [featuredImageAlt, setFeaturedImageAlt] = useState(initialData?.featuredImageAlt || '')
  const [ogImage, setOgImage] = useState(initialData?.ogImage || '')

  // 6. Practice Areas & Related Resources
  const [selectedServices, setSelectedServices] = useState<string[]>(
    initialData?.relatedServices?.map((s: any) => s.serviceSlug) || ['factory-compliance', 'labour-compliance']
  )
  const [selectedRelatedResources, setSelectedRelatedResources] = useState<
    { id: string; title: string; slug: string; category: string }[]
  >(
    (initialData?.relatedFrom || initialData?.relatedTo)?.map((r: any) => ({
      id: r.toArticle.id,
      title: r.toArticle.title,
      slug: r.toArticle.slug,
      category: r.toArticle.category,
    })) || []
  )

  // 7. In-Guide CTA
  const [ctaHeading, setCtaHeading] = useState(
    initialData?.ctaHeading || 'Need help navigating factory and statutory labour compliance?'
  )
  const [ctaDescription, setCtaDescription] = useState(
    initialData?.ctaDescription ||
      'Our senior compliance consultants perform comprehensive establishment reviews and audit support.'
  )
  const [ctaPrimaryLabel, setCtaPrimaryLabel] = useState(initialData?.ctaPrimaryLabel || 'Request Compliance Audit')
  const [ctaPrimaryUrl, setCtaPrimaryUrl] = useState(initialData?.ctaPrimaryUrl || '/compliance-health-check')
  const [ctaSecondaryLabel, setCtaSecondaryLabel] = useState(initialData?.ctaSecondaryLabel || 'Talk to an Expert')
  const [ctaSecondaryUrl, setCtaSecondaryUrl] = useState(initialData?.ctaSecondaryUrl || '/contact')

  // 8. SEO Meta
  const [seoTitle, setSeoTitle] = useState(initialData?.seoTitle || '')
  const [metaDescription, setMetaDescription] = useState(initialData?.metaDescription || '')
  const [canonicalUrl, setCanonicalUrl] = useState(initialData?.canonicalUrl || '')

  // 9. UI State & Search
  const [isPending, startTransition] = useTransition()
  const [isUploading, setIsUploading] = useState(false)
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [copiedSlug, setCopiedSlug] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  // Related Resources search
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<{ id: string; title: string; slug: string; category: string }[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Auto-slug generator
  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleTitleChange = (val: string) => {
    setTitle(val)
    setIsDirty(true)
    if (!isSlugCustomized && !isEdit) {
      setSlug(slugify(val))
    }
  }

  // Dirty state warning on browser unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  // Live Metrics
  const metrics = useMemo(() => {
    return calculateReadingTime(content)
  }, [content])

  // Image Upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setErrorMessage(null)

    try {
      const response = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
        method: 'POST',
        body: file,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to upload image')
      }

      const data = await response.json()
      setFeaturedImage(data.url)
      if (!featuredImageAlt) {
        setFeaturedImageAlt(title || file.name)
      }
      setIsDirty(true)
    } catch (err: any) {
      setErrorMessage(err.message || 'Image upload failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  // Search resources for relation
  const handleSearchResources = async (query: string) => {
    setSearchQuery(query)
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const results = await searchResourcesForGuide(query, initialData?.id)
      setSearchResults(results as any[])
    } catch (e) {
      console.error(e)
    } finally {
      setIsSearching(false)
    }
  }

  const addRelatedResource = (resource: { id: string; title: string; slug: string; category: string }) => {
    if (!selectedRelatedResources.some((r) => r.id === resource.id)) {
      setSelectedRelatedResources([...selectedRelatedResources, resource])
      setIsDirty(true)
    }
    setSearchQuery('')
    setSearchResults([])
  }

  const removeRelatedResource = (id: string) => {
    setSelectedRelatedResources(selectedRelatedResources.filter((r) => r.id !== id))
    setIsDirty(true)
  }

  // "What This Guide Covers" handlers
  const addGuideCover = () => {
    setGuideCovers([...guideCovers, ''])
    setIsDirty(true)
  }

  const updateGuideCover = (index: number, val: string) => {
    const updated = [...guideCovers]
    updated[index] = val
    setGuideCovers(updated)
    setIsDirty(true)
  }

  const removeGuideCover = (index: number) => {
    setGuideCovers(guideCovers.filter((_, i) => i !== index))
    setIsDirty(true)
  }

  const moveGuideCover = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= guideCovers.length) return
    const updated = [...guideCovers]
    const temp = updated[index]
    updated[index] = updated[targetIndex]
    updated[targetIndex] = temp
    setGuideCovers(updated)
    setIsDirty(true)
  }

  // Key Takeaways handlers
  const addTakeaway = () => {
    setKeyTakeaways([...keyTakeaways, ''])
    setIsDirty(true)
  }

  const updateTakeaway = (index: number, val: string) => {
    const updated = [...keyTakeaways]
    updated[index] = val
    setKeyTakeaways(updated)
    setIsDirty(true)
  }

  const removeTakeaway = (index: number) => {
    setKeyTakeaways(keyTakeaways.filter((_, i) => i !== index))
    setIsDirty(true)
  }

  const moveTakeaway = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= keyTakeaways.length) return
    const updated = [...keyTakeaways]
    const temp = updated[index]
    updated[index] = updated[targetIndex]
    updated[targetIndex] = temp
    setKeyTakeaways(updated)
    setIsDirty(true)
  }

  // Form Submission
  const handleSave = async (shouldPublish?: boolean) => {
    setErrorMessage(null)
    setSuccessMessage(null)

    const isLive = shouldPublish !== undefined ? shouldPublish : published

    const cleanedGuideCovers = guideCovers.map((c) => c.trim()).filter(Boolean)
    const cleanedTakeaways = keyTakeaways.map((t) => t.trim()).filter(Boolean)

    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      excerpt: excerpt.trim(),
      content: content.trim(),
      category: 'guides',
      authorId,
      published: isLive,
      publishedAt: isLive ? (initialData?.publishedAt || new Date().toISOString()) : null,
      lastReviewedAt: lastReviewedDate ? new Date(lastReviewedDate).toISOString() : new Date().toISOString(),
      featuredImage: featuredImage.trim() || null,
      featuredImageAlt: featuredImageAlt.trim() || null,
      ogImage: ogImage.trim() || null,
      seoTitle: seoTitle.trim() || null,
      metaDescription: metaDescription.trim() || null,
      canonicalUrl: canonicalUrl.trim() || null,
      ctaHeading: ctaHeading.trim() || null,
      ctaDescription: ctaDescription.trim() || null,
      ctaPrimaryLabel: ctaPrimaryLabel.trim() || null,
      ctaPrimaryUrl: ctaPrimaryUrl.trim() || null,
      ctaSecondaryLabel: ctaSecondaryLabel.trim() || null,
      ctaSecondaryUrl: ctaSecondaryUrl.trim() || null,
      keyTakeaways: cleanedTakeaways,
      guideCovers: cleanedGuideCovers,
      relatedServices: selectedServices,
      relatedResourceIds: selectedRelatedResources.map((r) => r.id),
    }

    startTransition(async () => {
      let res
      if (isEdit) {
        res = await updateGuide(initialData.id, payload)
      } else {
        res = await createGuide(payload)
      }

      if (res.success) {
        setIsDirty(false)
        setSuccessMessage(isLive ? 'Guide published successfully!' : 'Draft saved successfully!')
        setPublished(isLive)
        if (!isEdit && res.guideId) {
          router.push(`/admin/guides/${res.guideId}/edit`)
        } else {
          router.refresh()
        }
      } else {
        setErrorMessage(res.error || 'Failed to save guide.')
      }
    })
  }

  // Delete Action
  const handleDelete = async () => {
    if (!initialData?.id) return
    startTransition(async () => {
      const res = await deleteGuide(initialData.id)
      if (res.success) {
        setIsDirty(false)
        router.push('/admin/guides')
      } else {
        setErrorMessage(res.error || 'Failed to delete guide.')
        setShowDeleteModal(false)
      }
    })
  }

  const copyPublicUrl = () => {
    const fullUrl = `${window.location.origin}/resources/guides/${slug}`
    navigator.clipboard.writeText(fullUrl)
    setCopiedSlug(true)
    setTimeout(() => setCopiedSlug(false), 2000)
  }

  return (
    <div className="min-h-screen bg-[#F7F4EC] pb-24">
      {/* Sticky Top Action Bar */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#D9E1DC] px-4 md:px-8 py-3.5 shadow-2xs">
        <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-4">
          
          {/* Left: Navigation & Status */}
          <div className="flex items-center gap-4">
            <Link
              href="/admin/guides"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#66736D] hover:text-[#12372A] transition-colors bg-[#F7F4EC] px-3 py-1.5 rounded-lg border border-[#D9E1DC]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Guides</span>
            </Link>
            
            <div className="h-4 w-px bg-[#D9E1DC]" />

            {/* Publication Status Pill */}
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                published
                  ? 'bg-[#1F7A5C]/15 text-[#1F7A5C] border border-[#1F7A5C]/30'
                  : 'bg-[#D6A84F]/15 text-[#916B16] border border-[#D6A84F]/30'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${published ? 'bg-[#1F7A5C]' : 'bg-[#D6A84F]'}`} />
              <span>{published ? 'Live Guide' : 'Draft Guide'}</span>
            </div>

            {/* Live Metrics Badge */}
            <div className="hidden sm:flex items-center gap-3 text-xs text-[#66736D] font-medium bg-[#F7F4EC] px-3 py-1 rounded-lg border border-[#D9E1DC]">
              <span className="flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-[#1F7A5C]" />
                {metrics.wordCount} words
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#1F7A5C]" />
                {metrics.text}
              </span>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {/* Preview Button */}
            {slug && (
              <a
                href={`/resources/guides/${slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[#12372A] bg-white border border-[#D9E1DC] hover:bg-[#EDE8DE] transition-colors shadow-2xs"
              >
                <Eye className="w-3.5 h-3.5 text-[#1F7A5C]" />
                <span>Preview</span>
                <ExternalLink className="w-3 h-3 text-[#66736D]" />
              </a>
            )}

            {/* Save as Draft */}
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleSave(false)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-[#12372A] bg-white border border-[#D9E1DC] hover:bg-[#EDE8DE] transition-colors shadow-2xs disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5 text-[#66736D]" />
              <span>{isPending ? 'Saving...' : 'Save Draft'}</span>
            </button>

            {/* Publish / Update Button */}
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleSave(true)}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#1F7A5C] hover:bg-[#165B44] transition-colors shadow-sm disabled:opacity-50"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>
                {isPending
                  ? 'Saving...'
                  : published
                  ? 'Save & Update Guide'
                  : 'Publish Live'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Form Canvas */}
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 pt-8">
        {/* Banner Messages */}
        {errorMessage && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl flex items-center justify-between text-red-800 text-xs font-semibold shadow-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage(null)}>
              <X className="w-4 h-4 text-red-500 hover:text-red-700" />
            </button>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 bg-emerald-50 border-l-4 border-[#1F7A5C] p-4 rounded-r-xl flex items-center justify-between text-emerald-900 text-xs font-semibold shadow-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#1F7A5C] shrink-0" />
              <span>{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage(null)}>
              <X className="w-4 h-4 text-[#1F7A5C] hover:text-emerald-900" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ============================================================== */}
          {/* LEFT COLUMN: MAIN CONTENT (~65-70%) */}
          {/* ============================================================== */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Guide Basic Info Section */}
            <div className="bg-white border border-[#D9E1DC] rounded-3xl p-6 md:p-8 shadow-2xs space-y-6">
              <div className="border-b border-[#D9E1DC] pb-4">
                <span className="text-[11px] font-bold text-[#1F7A5C] uppercase tracking-wider">
                  Guide Information
                </span>
                <h2 className="text-xl font-bold text-[#12372A] mt-1">Core Guide Specifications</h2>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-[#12372A] uppercase tracking-wider mb-2">
                  Guide Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. Factory Labour Compliance Guide"
                  className="w-full text-xl md:text-2xl font-bold text-[#12372A] px-4 py-3.5 rounded-2xl border border-[#D9E1DC] focus:outline-none focus:ring-2 focus:ring-[#1F7A5C] focus:border-transparent placeholder-[#A2B3AA]"
                />
              </div>

              {/* URL Slug */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-[#12372A] uppercase tracking-wider">
                    Public URL Slug <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] text-[#66736D]">
                    Public Path: <span className="font-mono text-[#1F7A5C]">/resources/guides/{slug || '[slug]'}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-[#A2B3AA] font-mono">
                      /resources/guides/
                    </span>
                    <input
                      type="text"
                      required
                      value={slug}
                      onChange={(e) => {
                        setSlug(slugify(e.target.value))
                        setIsSlugCustomized(true)
                        setIsDirty(true)
                      }}
                      placeholder="factory-labour-compliance-guide"
                      className="w-full pl-44 pr-4 py-2.5 rounded-xl border border-[#D9E1DC] text-xs font-mono text-[#12372A] focus:outline-none focus:ring-2 focus:ring-[#1F7A5C] focus:border-transparent"
                    />
                  </div>
                  {slug && (
                    <button
                      type="button"
                      onClick={copyPublicUrl}
                      className="px-3 py-2.5 bg-[#F7F4EC] border border-[#D9E1DC] rounded-xl text-xs font-bold text-[#12372A] hover:bg-[#EDE8DE] transition-colors flex items-center gap-1.5"
                    >
                      {copiedSlug ? <Check className="w-3.5 h-3.5 text-[#1F7A5C]" /> : <Copy className="w-3.5 h-3.5 text-[#66736D]" />}
                      <span>{copiedSlug ? 'Copied' : 'Copy'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Description / Excerpt */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-[#12372A] uppercase tracking-wider">
                    Executive Description / Introduction <span className="text-red-500">*</span>
                  </label>
                  <span className={`text-[11px] font-mono ${excerpt.length > 500 ? 'text-red-500 font-bold' : 'text-[#66736D]'}`}>
                    {excerpt.length} / 500 characters
                  </span>
                </div>
                <textarea
                  rows={3}
                  required
                  value={excerpt}
                  onChange={(e) => {
                    setExcerpt(e.target.value)
                    setIsDirty(true)
                  }}
                  placeholder="A concise, high-level summary of the statutory requirements, scope, and applicability covered in this practical guide..."
                  className="w-full px-4 py-3 rounded-2xl border border-[#D9E1DC] text-sm text-[#202522] focus:outline-none focus:ring-2 focus:ring-[#1F7A5C] focus:border-transparent leading-relaxed"
                />
              </div>
            </div>

            {/* Guide Content Editor */}
            <div className="bg-white border border-[#D9E1DC] rounded-3xl p-6 md:p-8 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#D9E1DC] pb-4">
                <div>
                  <span className="text-[11px] font-bold text-[#1F7A5C] uppercase tracking-wider">
                    Main Guide Body
                  </span>
                  <h2 className="text-xl font-bold text-[#12372A] mt-1">Structured Editorial Content</h2>
                </div>
                <div className="text-right">
                  <span className="text-xs text-[#66736D] block">Semantic Heading Rule</span>
                  <span className="text-[11px] font-bold text-[#1F7A5C] bg-[#1F7A5C]/10 px-2.5 py-0.5 rounded-md">
                    H2, H3, H4 ONLY
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <TiptapEditor
                  content={content}
                  onChange={(newHtml) => {
                    setContent(newHtml)
                    setIsDirty(true)
                  }}
                />
              </div>
            </div>

            {/* Guide-Specific: What This Guide Covers */}
            <div className="bg-white border border-[#D9E1DC] rounded-3xl p-6 md:p-8 shadow-2xs space-y-6">
              <div className="flex items-center justify-between border-b border-[#D9E1DC] pb-4">
                <div>
                  <span className="text-[11px] font-bold text-[#1F7A5C] uppercase tracking-wider">
                    Structured Coverage
                  </span>
                  <h2 className="text-xl font-bold text-[#12372A] mt-1">What This Guide Covers</h2>
                  <p className="text-xs text-[#66736D] mt-1">
                    Concise, scannable list of compliance topics and regulatory areas addressed in this guide.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addGuideCover}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#1F7A5C]/10 text-[#1F7A5C] hover:bg-[#1F7A5C]/20 rounded-xl text-xs font-bold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Coverage Item</span>
                </button>
              </div>

              <div className="space-y-3">
                {guideCovers.length === 0 && (
                  <p className="text-xs text-[#A2B3AA] italic py-2">
                    No coverage points added yet. Click &quot;Add Coverage Item&quot; to highlight what this guide covers.
                  </p>
                )}
                {guideCovers.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-[#F7F4EC] p-2.5 rounded-2xl border border-[#D9E1DC]">
                    <span className="w-6 h-6 rounded-lg bg-[#1F7A5C] text-white text-xs font-bold flex items-center justify-center shrink-0">
                      ✓
                    </span>
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => updateGuideCover(idx, e.target.value)}
                      placeholder="e.g. Factory registration and applicability thresholds"
                      className="flex-1 bg-white px-3 py-2 rounded-xl border border-[#D9E1DC] text-xs font-medium text-[#12372A] focus:outline-none focus:ring-2 focus:ring-[#1F7A5C]"
                    />
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveGuideCover(idx, 'up')}
                        className="p-1.5 rounded-lg bg-white border border-[#D9E1DC] text-[#66736D] hover:text-[#12372A] disabled:opacity-30"
                        title="Move Up"
                        aria-label="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === guideCovers.length - 1}
                        onClick={() => moveGuideCover(idx, 'down')}
                        className="p-1.5 rounded-lg bg-white border border-[#D9E1DC] text-[#66736D] hover:text-[#12372A] disabled:opacity-30"
                        title="Move Down"
                        aria-label="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeGuideCover(idx)}
                        className="p-1.5 rounded-lg bg-white border border-[#D9E1DC] text-red-500 hover:bg-red-50"
                        title="Delete Item"
                        aria-label="Delete Item"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Takeaways Section */}
            <div className="bg-white border border-[#D9E1DC] rounded-3xl p-6 md:p-8 shadow-2xs space-y-6">
              <div className="flex items-center justify-between border-b border-[#D9E1DC] pb-4">
                <div>
                  <span className="text-[11px] font-bold text-[#1F7A5C] uppercase tracking-wider">
                    Executive Summary
                  </span>
                  <h2 className="text-xl font-bold text-[#12372A] mt-1">Key Takeaways</h2>
                  <p className="text-xs text-[#66736D] mt-1">
                    Highlighted takeaway cards rendered prominently at the beginning of the public guide.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addTakeaway}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#1F7A5C]/10 text-[#1F7A5C] hover:bg-[#1F7A5C]/20 rounded-xl text-xs font-bold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Takeaway</span>
                </button>
              </div>

              <div className="space-y-3">
                {keyTakeaways.length === 0 && (
                  <p className="text-xs text-[#A2B3AA] italic py-2">
                    No takeaways added. Click &quot;Add Takeaway&quot; to add key highlights.
                  </p>
                )}
                {keyTakeaways.map((takeaway, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-[#F7F4EC] p-2.5 rounded-2xl border border-[#D9E1DC]">
                    <span className="w-6 h-6 rounded-lg bg-[#D6A84F] text-[#12372A] text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={takeaway}
                      onChange={(e) => updateTakeaway(idx, e.target.value)}
                      placeholder="e.g. Always verify state amendments before finalizing shift schedules."
                      className="flex-1 bg-white px-3 py-2 rounded-xl border border-[#D9E1DC] text-xs font-medium text-[#12372A] focus:outline-none focus:ring-2 focus:ring-[#1F7A5C]"
                    />
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveTakeaway(idx, 'up')}
                        className="p-1.5 rounded-lg bg-white border border-[#D9E1DC] text-[#66736D] hover:text-[#12372A] disabled:opacity-30"
                        title="Move Up"
                        aria-label="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === keyTakeaways.length - 1}
                        onClick={() => moveTakeaway(idx, 'down')}
                        className="p-1.5 rounded-lg bg-white border border-[#D9E1DC] text-[#66736D] hover:text-[#12372A] disabled:opacity-30"
                        title="Move Down"
                        aria-label="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeTakeaway(idx)}
                        className="p-1.5 rounded-lg bg-white border border-[#D9E1DC] text-red-500 hover:bg-red-50"
                        title="Delete Takeaway"
                        aria-label="Delete Takeaway"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Related Practice Areas */}
            <div className="bg-white border border-[#D9E1DC] rounded-3xl p-6 md:p-8 shadow-2xs space-y-6">
              <div className="border-b border-[#D9E1DC] pb-4">
                <span className="text-[11px] font-bold text-[#1F7A5C] uppercase tracking-wider">
                  Service Alignment
                </span>
                <h2 className="text-xl font-bold text-[#12372A] mt-1">Related Practice Areas</h2>
                <p className="text-xs text-[#66736D] mt-1">
                  Select relevant LabourAxis statutory compliance service areas connected to this guide.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {AVAILABLE_PRACTICE_AREAS.map((area) => {
                  const isSelected = selectedServices.includes(area.slug)
                  return (
                    <label
                      key={area.slug}
                      className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#1F7A5C]/5 border-[#1F7A5C] text-[#12372A]'
                          : 'bg-white border-[#D9E1DC] text-[#66736D] hover:bg-[#F7F4EC]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedServices([...selectedServices, area.slug])
                          } else {
                            setSelectedServices(selectedServices.filter((s) => s !== area.slug))
                          }
                          setIsDirty(true)
                        }}
                        className="w-4 h-4 text-[#1F7A5C] rounded-md border-[#D9E1DC] focus:ring-[#1F7A5C]"
                      />
                      <span className="text-xs font-bold">{area.label}</span>
                    </label>
                  )
                })}
              </div>
            </div>

            {/* Related Resources Selector */}
            <div className="bg-white border border-[#D9E1DC] rounded-3xl p-6 md:p-8 shadow-2xs space-y-6">
              <div className="border-b border-[#D9E1DC] pb-4">
                <span className="text-[11px] font-bold text-[#1F7A5C] uppercase tracking-wider">
                  Knowledge Network
                </span>
                <h2 className="text-xl font-bold text-[#12372A] mt-1">Related Resources</h2>
                <p className="text-xs text-[#66736D] mt-1">
                  Search and connect related Checklists, FAQs, Articles, and Guides displayed at the bottom of the page.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <div className="relative">
                  <Search className="w-4 h-4 text-[#A2B3AA] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchResources(e.target.value)}
                    placeholder="Search resources by title or slug..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D9E1DC] text-xs text-[#12372A] focus:outline-none focus:ring-2 focus:ring-[#1F7A5C]"
                  />
                </div>

                {/* Dropdown Results */}
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#D9E1DC] rounded-2xl shadow-lg z-20 max-h-60 overflow-y-auto p-2 space-y-1">
                    {searchResults.map((res) => (
                      <button
                        key={res.id}
                        type="button"
                        onClick={() => addRelatedResource(res)}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#F7F4EC] transition-colors flex items-center justify-between text-xs"
                      >
                        <span className="font-bold text-[#12372A] truncate pr-4">{res.title}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-[#EDE8DE] text-[#66736D] px-2 py-0.5 rounded-md shrink-0">
                          {res.category}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Badges */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#12372A] block">Selected Resources:</span>
                {selectedRelatedResources.length === 0 ? (
                  <p className="text-xs text-[#A2B3AA] italic">No specific related resources linked yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {selectedRelatedResources.map((res) => (
                      <span
                        key={res.id}
                        className="inline-flex items-center gap-2 bg-[#F7F4EC] border border-[#D9E1DC] px-3 py-1.5 rounded-xl text-xs font-semibold text-[#12372A]"
                      >
                        <span className="text-[10px] font-bold text-[#1F7A5C] uppercase tracking-wider">
                          [{res.category}]
                        </span>
                        <span className="truncate max-w-[240px]">{res.title}</span>
                        <button
                          type="button"
                          onClick={() => removeRelatedResource(res.id)}
                          className="text-[#66736D] hover:text-red-500"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* In-Guide Call to Action (CTA) */}
            <div className="bg-white border border-[#D9E1DC] rounded-3xl p-6 md:p-8 shadow-2xs space-y-6">
              <div className="border-b border-[#D9E1DC] pb-4">
                <span className="text-[11px] font-bold text-[#1F7A5C] uppercase tracking-wider">
                  Conversion & Advisory
                </span>
                <h2 className="text-xl font-bold text-[#12372A] mt-1">In-Guide Call to Action (CTA)</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-[#12372A] uppercase tracking-wider mb-1.5">
                    CTA Heading
                  </label>
                  <input
                    type="text"
                    value={ctaHeading}
                    onChange={(e) => {
                      setCtaHeading(e.target.value)
                      setIsDirty(true)
                    }}
                    placeholder="Need help reviewing your factory compliance?"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9E1DC] text-xs font-semibold text-[#12372A] focus:outline-none focus:ring-2 focus:ring-[#1F7A5C]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-[#12372A] uppercase tracking-wider mb-1.5">
                    CTA Description
                  </label>
                  <textarea
                    rows={2}
                    value={ctaDescription}
                    onChange={(e) => {
                      setCtaDescription(e.target.value)
                      setIsDirty(true)
                    }}
                    placeholder="Our senior labour consultants conduct comprehensive statutory reviews and audit support."
                    className="w-full px-3.5 py-2 rounded-xl border border-[#D9E1DC] text-xs text-[#202522] focus:outline-none focus:ring-2 focus:ring-[#1F7A5C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#12372A] uppercase tracking-wider mb-1.5">
                    Primary Button Label
                  </label>
                  <input
                    type="text"
                    value={ctaPrimaryLabel}
                    onChange={(e) => {
                      setCtaPrimaryLabel(e.target.value)
                      setIsDirty(true)
                    }}
                    placeholder="Request a Compliance Health Check"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#D9E1DC] text-xs text-[#12372A] focus:outline-none focus:ring-2 focus:ring-[#1F7A5C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#12372A] uppercase tracking-wider mb-1.5">
                    Primary Button URL
                  </label>
                  <input
                    type="text"
                    value={ctaPrimaryUrl}
                    onChange={(e) => {
                      setCtaPrimaryUrl(e.target.value)
                      setIsDirty(true)
                    }}
                    placeholder="/compliance-health-check"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#D9E1DC] text-xs font-mono text-[#12372A] focus:outline-none focus:ring-2 focus:ring-[#1F7A5C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#12372A] uppercase tracking-wider mb-1.5">
                    Secondary Button Label
                  </label>
                  <input
                    type="text"
                    value={ctaSecondaryLabel}
                    onChange={(e) => {
                      setCtaSecondaryLabel(e.target.value)
                      setIsDirty(true)
                    }}
                    placeholder="Speak to an Expert"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#D9E1DC] text-xs text-[#12372A] focus:outline-none focus:ring-2 focus:ring-[#1F7A5C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#12372A] uppercase tracking-wider mb-1.5">
                    Secondary Button URL
                  </label>
                  <input
                    type="text"
                    value={ctaSecondaryUrl}
                    onChange={(e) => {
                      setCtaSecondaryUrl(e.target.value)
                      setIsDirty(true)
                    }}
                    placeholder="/contact"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#D9E1DC] text-xs font-mono text-[#12372A] focus:outline-none focus:ring-2 focus:ring-[#1F7A5C]"
                  />
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="bg-[#F7F4EC] border-l-4 border-[#1F7A5C] p-6 rounded-r-2xl space-y-3 mt-4">
                <span className="text-[10px] font-bold text-[#1F7A5C] uppercase tracking-wider">
                  Live CTA Banner Preview
                </span>
                <h4 className="text-lg font-bold text-[#12372A]">{ctaHeading || 'Need help?'}</h4>
                {ctaDescription && <p className="text-xs text-[#66736D] leading-relaxed">{ctaDescription}</p>}
                <div className="flex flex-wrap gap-2 pt-2">
                  {ctaPrimaryLabel && (
                    <span className="px-4 py-2 bg-[#1F7A5C] text-white rounded-xl text-xs font-bold">
                      {ctaPrimaryLabel}
                    </span>
                  )}
                  {ctaSecondaryLabel && (
                    <span className="px-4 py-2 bg-white border border-[#D9E1DC] text-[#12372A] rounded-xl text-xs font-bold">
                      {ctaSecondaryLabel}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* RIGHT COLUMN: STICKY SIDEBAR (~30-35%) */}
          {/* ============================================================== */}
          <div className="lg:col-span-4 space-y-6">
            <div className="sticky top-20 space-y-6">
              
              {/* Publishing & Date Controls */}
              <div className="bg-white border border-[#D9E1DC] rounded-3xl p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#D9E1DC] pb-3">
                  <span className="text-xs font-bold text-[#12372A] uppercase tracking-wider">Publishing</span>
                  <span className="text-xs text-[#66736D]">Audit Dates</span>
                </div>

                {/* Status Toggle */}
                <div className="flex items-center justify-between bg-[#F7F4EC] p-3 rounded-2xl border border-[#D9E1DC]">
                  <div>
                    <span className="text-xs font-bold text-[#12372A] block">Visibility</span>
                    <span className="text-[11px] text-[#66736D]">
                      {published ? 'Visible on /resources/guides' : 'Draft only (Private preview)'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPublished(!published)
                      setIsDirty(true)
                    }}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      published ? 'bg-[#1F7A5C]' : 'bg-[#A2B3AA]'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        published ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Last Reviewed Date */}
                <div>
                  <label className="block text-xs font-bold text-[#12372A] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#1F7A5C]" />
                    <span>Last Reviewed Date</span>
                  </label>
                  <input
                    type="date"
                    value={lastReviewedDate}
                    onChange={(e) => {
                      setLastReviewedDate(e.target.value)
                      setIsDirty(true)
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9E1DC] text-xs font-medium text-[#12372A] focus:outline-none focus:ring-2 focus:ring-[#1F7A5C]"
                  />
                  <p className="text-[10px] text-[#66736D] mt-1">
                    Displayed on the public guide to signify professional compliance currency.
                  </p>
                </div>

                {/* Author Select */}
                <div>
                  <label className="block text-xs font-bold text-[#12372A] uppercase tracking-wider mb-1.5">
                    Assigned Author
                  </label>
                  <select
                    value={authorId}
                    onChange={(e) => {
                      setAuthorId(e.target.value)
                      setIsDirty(true)
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9E1DC] text-xs font-semibold text-[#12372A] bg-white focus:outline-none focus:ring-2 focus:ring-[#1F7A5C]"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name || u.email || 'Author'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Cover Image & Asset Management */}
              <div className="bg-white border border-[#D9E1DC] rounded-3xl p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#D9E1DC] pb-3">
                  <span className="text-xs font-bold text-[#12372A] uppercase tracking-wider">Cover Image</span>
                  <span className="text-[11px] text-[#66736D]">1200 × 630 px</span>
                </div>

                {/* Preview Box */}
                <div className="aspect-[16/9] bg-[#F7F4EC] rounded-2xl overflow-hidden border border-[#D9E1DC] relative flex items-center justify-center">
                  {featuredImage ? (
                    <img src={featuredImage} alt="Cover preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-4 text-[#A2B3AA]">
                      <Upload className="w-6 h-6 mx-auto mb-1 text-[#66736D]" />
                      <span className="text-xs">No cover image uploaded</span>
                    </div>
                  )}
                </div>

                {/* File Upload Button */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIsMediaPickerOpen(true)}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-[#1F7A5C] hover:bg-[#165B44] text-white rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-white" />
                    <span>Media Library</span>
                  </button>

                  <label className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-[#F7F4EC] hover:bg-[#EDE8DE] text-[#12372A] border border-[#D9E1DC] rounded-xl text-xs font-bold transition-all cursor-pointer">
                    <Upload className="w-3.5 h-3.5 text-[#1F7A5C]" />
                    <span>{isUploading ? 'Uploading...' : 'Upload New'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Direct Image URL input */}
                <div>
                  <label className="block text-[11px] font-bold text-[#66736D] uppercase mb-1">
                    Or Paste Image URL
                  </label>
                  <input
                    type="url"
                    value={featuredImage}
                    onChange={(e) => {
                      setFeaturedImage(e.target.value)
                      setIsDirty(true)
                    }}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 rounded-xl border border-[#D9E1DC] text-xs font-mono text-[#12372A] focus:outline-none focus:ring-2 focus:ring-[#1F7A5C]"
                  />
                </div>

                {/* Alt text */}
                <div>
                  <label className="block text-xs font-bold text-[#12372A] uppercase tracking-wider mb-1">
                    Image Alt Text <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={featuredImageAlt}
                    onChange={(e) => {
                      setFeaturedImageAlt(e.target.value)
                      setIsDirty(true)
                    }}
                    placeholder="Descriptive text for accessibility & SEO"
                    className="w-full px-3 py-2 rounded-xl border border-[#D9E1DC] text-xs text-[#12372A] focus:outline-none focus:ring-2 focus:ring-[#1F7A5C]"
                  />
                </div>
              </div>

              {/* SEO & Meta Panel */}
              <div className="bg-white border border-[#D9E1DC] rounded-3xl p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#D9E1DC] pb-3">
                  <span className="text-xs font-bold text-[#12372A] uppercase tracking-wider">SEO & SERP Preview</span>
                  <span className="text-[11px] text-[#1F7A5C] font-bold">Google Card</span>
                </div>

                {/* SEO Title */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-[#12372A] uppercase">SEO Title</label>
                    <span className={`text-[10px] font-mono ${seoTitle.length > 60 ? 'text-amber-600 font-bold' : 'text-[#66736D]'}`}>
                      {seoTitle.length} / 60
                    </span>
                  </div>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => {
                      setSeoTitle(e.target.value)
                      setIsDirty(true)
                    }}
                    placeholder={title || 'Factory Labour Compliance Guide | LabourAxis'}
                    className="w-full px-3 py-2 rounded-xl border border-[#D9E1DC] text-xs text-[#12372A] focus:outline-none focus:ring-2 focus:ring-[#1F7A5C]"
                  />
                </div>

                {/* Meta Description */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-[#12372A] uppercase">Meta Description</label>
                    <span className={`text-[10px] font-mono ${metaDescription.length > 160 ? 'text-amber-600 font-bold' : 'text-[#66736D]'}`}>
                      {metaDescription.length} / 160
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={metaDescription}
                    onChange={(e) => {
                      setMetaDescription(e.target.value)
                      setIsDirty(true)
                    }}
                    placeholder={excerpt || 'Comprehensive guide to statutory requirements for factories...'}
                    className="w-full px-3 py-2 rounded-xl border border-[#D9E1DC] text-xs text-[#202522] focus:outline-none focus:ring-2 focus:ring-[#1F7A5C]"
                  />
                </div>

                {/* Canonical URL */}
                <div>
                  <label className="block text-[11px] font-bold text-[#12372A] uppercase mb-1">Canonical URL</label>
                  <input
                    type="url"
                    value={canonicalUrl}
                    onChange={(e) => {
                      setCanonicalUrl(e.target.value)
                      setIsDirty(true)
                    }}
                    placeholder={`https://www.labouraxis.com/resources/guides/${slug}`}
                    className="w-full px-3 py-2 rounded-xl border border-[#D9E1DC] text-xs font-mono text-[#12372A] focus:outline-none focus:ring-2 focus:ring-[#1F7A5C]"
                  />
                </div>

                {/* Google Search SERP Snippet Preview */}
                <div className="bg-[#F7F4EC] p-3.5 rounded-2xl border border-[#D9E1DC] space-y-1 font-sans text-left">
                  <div className="flex items-center gap-1.5 text-[10px] text-[#66736D]">
                    <span className="font-bold text-[#12372A]">LabourAxis</span>
                    <span>› resources › guides › {slug || 'guide'}</span>
                  </div>
                  <div className="text-xs font-bold text-[#1a0dab] line-clamp-1">
                    {seoTitle || title || 'Factory Labour Compliance Guide | LabourAxis'}
                  </div>
                  <div className="text-[11px] text-[#4d5156] line-clamp-2 leading-relaxed">
                    {metaDescription || excerpt || 'Comprehensive guide covering statutory requirements, registration thresholds, working hours, and audits.'}
                  </div>
                </div>
              </div>

              {/* Danger Zone: Delete Guide */}
              {isEdit && (
                <div className="bg-white border border-red-100 rounded-3xl p-6 shadow-2xs space-y-3">
                  <span className="text-xs font-bold text-red-600 uppercase tracking-wider block">
                    Danger Zone
                  </span>
                  <p className="text-xs text-[#66736D]">
                    Permanently delete this compliance guide and clean up associated takeaway and relation records.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(true)}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl text-xs border border-red-200 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Guide</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#D9E1DC]">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#12372A]">Delete this guide?</h3>
              <p className="text-xs text-[#66736D] mt-1 leading-relaxed">
                This action will permanently remove <span className="font-bold text-[#12372A]">&quot;{title}&quot;</span> and clean up its associated takeaways and related links. This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-[#F7F4EC] text-[#12372A] font-bold rounded-xl text-xs border border-[#D9E1DC] hover:bg-[#EDE8DE]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white font-bold rounded-xl text-xs hover:bg-red-700 disabled:opacity-50"
              >
                {isPending ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MEDIA PICKER MODAL                                   */}
      {/* ---------------------------------------------------- */}
      <MediaPickerModal
        open={isMediaPickerOpen}
        onOpenChange={setIsMediaPickerOpen}
        currentUrl={featuredImage}
        onSelect={(media) => {
          setFeaturedImage(media.url)
          if (media.altText && !featuredImageAlt) {
            setFeaturedImageAlt(media.altText)
          }
          setIsDirty(true)
        }}
      />
    </div>
  )
}
