'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Save,
  Globe,
  Eye,
  Trash2,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Plus,
  ArrowUp,
  ArrowDown,
  X,
  Copy,
  Check,
  Search,
  ExternalLink,
  Calendar,
  Layers,
  HelpCircle,
  FileDown,
  DownloadCloud,
} from 'lucide-react'
import { createChecklist, updateChecklist, deleteChecklist, searchResourcesForChecklist } from '@/app/actions/checklists'
import { ChecklistInput, ChecklistSection, ChecklistItem, ChecklistDownloadableFile } from '@/lib/validations/checklist'
import TiptapEditor from '@/components/editor/TiptapEditor'
import { MediaPickerModal } from '@/components/admin/media/MediaPickerModal'

interface UserOption {
  id: string
  name: string | null
}

interface ChecklistEditorProps {
  initialData?: any
  users: UserOption[]
}

const AVAILABLE_PRACTICE_AREAS: Record<string, string> = {
  'factory-compliance': 'Factory & Industrial Compliance',
  'labour-compliance': 'Labour & Statutory Compliance',
  'contract-labour-compliance': 'Contract Labour & CLRA Management',
  'pf-esic-compliance': 'PF, ESIC & Statutory Funds Management',
  'hr-consulting': 'HR Advisory & Operational Support',
  'posh-compliance': 'POSH & Workplace Compliance',
  'payroll-management': 'Payroll Structuring & Wage Audit',
  'statutory-audits': 'Comprehensive Statutory Audits',
}

export default function ChecklistEditor({ initialData, users }: ChecklistEditorProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isDirty, setIsDirty] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiedSlug, setCopiedSlug] = useState(false)
  const [isManualSlug, setIsManualSlug] = useState(Boolean(initialData?.slug))
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Parse structured initial data from content
  let initialPurpose = ''
  let initialAudience: string[] = ['Factory HR leadership', 'Compliance officers', 'Plant & factory managers']
  let initialSections: ChecklistSection[] = [
    {
      id: 'section-1',
      title: 'Applicability & Statutory Registrations',
      items: [
        { id: 'item-1-1', text: 'Factory licence registration and annual renewals verified', guidance: 'Check validity against state factory inspectorate records.' },
        { id: 'item-1-2', text: 'Standing orders certified and prominently displayed', guidance: 'Ensure regional language copy is posted at factory entrance.' },
      ],
    },
  ]
  let initialDownloadableFile: ChecklistDownloadableFile | null = null
  let initialNotes = ''

  if (initialData?.content) {
    try {
      const parsed = JSON.parse(initialData.content)
      if (parsed.purpose) initialPurpose = parsed.purpose
      if (Array.isArray(parsed.audience)) initialAudience = parsed.audience
      if (Array.isArray(parsed.sections)) initialSections = parsed.sections
      if (parsed.downloadableFile) initialDownloadableFile = parsed.downloadableFile
      if (parsed.notes) initialNotes = parsed.notes
    } catch (e) {
      // Legacy text fallback
      initialNotes = initialData.content
    }
  }

  // Core Form State
  const [title, setTitle] = useState(initialData?.title || '')
  const [slug, setSlug] = useState(initialData?.slug || '')
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || '')
  const [purpose, setPurpose] = useState(initialPurpose || initialData?.excerpt || '')
  const [audience, setAudience] = useState<string[]>(initialAudience)
  const [sections, setSections] = useState<ChecklistSection[]>(initialSections)
  const [downloadableFile, setDownloadableFile] = useState<ChecklistDownloadableFile | null>(initialDownloadableFile)
  const [notes, setNotes] = useState(initialNotes)
  const [published, setPublished] = useState(initialData?.published || false)
  const [authorId, setAuthorId] = useState(initialData?.authorId || users[0]?.id || '')
  const [lastReviewedAt, setLastReviewedAt] = useState<string>(
    initialData?.scheduledAt
      ? new Date(initialData.scheduledAt).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  )

  // Media
  const [featuredImage, setFeaturedImage] = useState(initialData?.featuredImage || '')
  const [featuredImageAlt, setFeaturedImageAlt] = useState(initialData?.featuredImageAlt || '')
  const [ogImage, setOgImage] = useState(initialData?.ogImage || '')
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false)
  const [isUploadingPdf, setIsUploadingPdf] = useState(false)

  // SEO
  const [seoTitle, setSeoTitle] = useState(initialData?.seoTitle || '')
  const [metaDescription, setMetaDescription] = useState(initialData?.metaDescription || '')
  const [canonicalUrl, setCanonicalUrl] = useState(initialData?.canonicalUrl || '')

  // CTA
  const [ctaHeading, setCtaHeading] = useState(initialData?.ctaHeading || 'Need a Complete Compliance Audit?')
  const [ctaDescription, setCtaDescription] = useState(
    initialData?.ctaDescription || 'Our certified labour consultants conduct comprehensive plant assessments and register verification.'
  )
  const [ctaPrimaryLabel, setCtaPrimaryLabel] = useState(initialData?.ctaPrimaryLabel || 'Request Health Check')
  const [ctaPrimaryUrl, setCtaPrimaryUrl] = useState(initialData?.ctaPrimaryUrl || '/compliance-health-check')
  const [ctaSecondaryLabel, setCtaSecondaryLabel] = useState(initialData?.ctaSecondaryLabel || 'Contact Advisory Team')
  const [ctaSecondaryUrl, setCtaSecondaryUrl] = useState(initialData?.ctaSecondaryUrl || '/contact')

  // Practice Areas & Related Resources
  const [relatedServices, setRelatedServices] = useState<string[]>(
    initialData?.relatedServices?.map((rs: any) => rs.serviceSlug) || ['factory-compliance', 'labour-compliance']
  )
  const [selectedResources, setSelectedResources] = useState<any[]>(
    initialData?.relatedFrom?.map((rf: any) => rf.toArticle).filter(Boolean) || []
  )
  const [resourceSearchQuery, setResourceSearchQuery] = useState('')
  const [resourceSearchResults, setResourceSearchResults] = useState<any[]>([])
  const [isSearchingResources, setIsSearchingResources] = useState(false)

  // Calculate total items
  const totalItemsCount = sections.reduce((acc, sec) => acc + (sec.items?.length || 0), 0)

  // Unsaved changes warning
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

  // Slug generator
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setTitle(val)
    setIsDirty(true)
    if (!isManualSlug) {
      setSlug(generateSlug(val))
    }
  }

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsManualSlug(true)
    setIsDirty(true)
    setSlug(generateSlug(e.target.value))
  }

  const copyPublicUrl = () => {
    const url = `${window.location.origin}/resources/checklists/${slug}`
    navigator.clipboard.writeText(url)
    setCopiedSlug(true)
    setTimeout(() => setCopiedSlug(false), 2000)
  }

  // Audience Handlers
  const addAudienceItem = () => {
    setAudience([...audience, ''])
    setIsDirty(true)
  }

  const updateAudienceItem = (index: number, val: string) => {
    const updated = [...audience]
    updated[index] = val
    setAudience(updated)
    setIsDirty(true)
  }

  const removeAudienceItem = (index: number) => {
    setAudience(audience.filter((_, i) => i !== index))
    setIsDirty(true)
  }

  const moveAudienceItem = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === audience.length - 1)) return
    const updated = [...audience]
    const targetIdx = direction === 'up' ? index - 1 : index + 1
    const temp = updated[index]
    updated[index] = updated[targetIdx]
    updated[targetIdx] = temp
    setAudience(updated)
    setIsDirty(true)
  }

  // Section & Item Handlers
  const addSection = () => {
    const newSectionId = `sec-${Date.now()}`
    setSections([
      ...sections,
      {
        id: newSectionId,
        title: 'New Checklist Section',
        items: [{ id: `item-${Date.now()}-1`, text: '', guidance: '' }],
      },
    ])
    setIsDirty(true)
  }

  const updateSectionTitle = (secIndex: number, titleVal: string) => {
    const updated = [...sections]
    updated[secIndex].title = titleVal
    setSections(updated)
    setIsDirty(true)
  }

  const removeSection = (secIndex: number) => {
    if (sections.length <= 1) {
      setError('A checklist must contain at least one section.')
      return
    }
    setSections(sections.filter((_, i) => i !== secIndex))
    setIsDirty(true)
  }

  const moveSection = (secIndex: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && secIndex === 0) || (direction === 'down' && secIndex === sections.length - 1)) return
    const updated = [...sections]
    const targetIdx = direction === 'up' ? secIndex - 1 : secIndex + 1
    const temp = updated[secIndex]
    updated[secIndex] = updated[targetIdx]
    updated[targetIdx] = temp
    setSections(updated)
    setIsDirty(true)
  }

  const addItemToSection = (secIndex: number) => {
    const updated = [...sections]
    updated[secIndex].items.push({
      id: `item-${Date.now()}-${updated[secIndex].items.length + 1}`,
      text: '',
      guidance: '',
    })
    setSections(updated)
    setIsDirty(true)
  }

  const updateItem = (secIndex: number, itemIndex: number, field: 'text' | 'guidance', val: string) => {
    const updated = [...sections]
    updated[secIndex].items[itemIndex][field] = val
    setSections(updated)
    setIsDirty(true)
  }

  const removeItem = (secIndex: number, itemIndex: number) => {
    const updated = [...sections]
    if (updated[secIndex].items.length <= 1) {
      setError('Each section must have at least one checklist item.')
      return
    }
    updated[secIndex].items = updated[secIndex].items.filter((_, i) => i !== itemIndex)
    setSections(updated)
    setIsDirty(true)
  }

  const moveItem = (secIndex: number, itemIndex: number, direction: 'up' | 'down') => {
    const items = sections[secIndex].items
    if ((direction === 'up' && itemIndex === 0) || (direction === 'down' && itemIndex === items.length - 1)) return
    const updated = [...sections]
    const targetIdx = direction === 'up' ? itemIndex - 1 : itemIndex + 1
    const temp = updated[secIndex].items[itemIndex]
    updated[secIndex].items[itemIndex] = updated[secIndex].items[targetIdx]
    updated[secIndex].items[targetIdx] = temp
    setSections(updated)
    setIsDirty(true)
  }

  // Cover Image Upload Handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingImage(true)
    setError(null)

    try {
      const res = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
        method: 'POST',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to upload image')
      }

      const data = await res.json()
      setFeaturedImage(data.url)
      if (!ogImage) setOgImage(data.url)
      setIsDirty(true)
    } catch (err: any) {
      setError(err.message || 'Image upload failed')
    } finally {
      setIsUploadingImage(false)
    }
  }

  // Downloadable PDF Upload Handler
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingPdf(true)
    setError(null)

    try {
      const res = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
        method: 'POST',
        headers: {
          'Content-Type': file.type || 'application/pdf',
        },
        body: file,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to upload downloadable file')
      }

      const data = await res.json()
      setDownloadableFile({
        url: data.url,
        filename: file.name,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      })
      setIsDirty(true)
    } catch (err: any) {
      setError(err.message || 'File upload failed')
    } finally {
      setIsUploadingPdf(false)
    }
  }

  // Practice Areas Toggle
  const togglePracticeArea = (slugKey: string) => {
    if (relatedServices.includes(slugKey)) {
      setRelatedServices(relatedServices.filter((s) => s !== slugKey))
    } else {
      setRelatedServices([...relatedServices, slugKey])
    }
    setIsDirty(true)
  }

  // Search Resources
  const handleSearchResources = async (q: string) => {
    setResourceSearchQuery(q)
    if (!q.trim()) {
      setResourceSearchResults([])
      return
    }

    setIsSearchingResources(true)
    try {
      const results = await searchResourcesForChecklist(q)
      setResourceSearchResults(results.filter((r) => r.id !== initialData?.id))
    } catch (e) {
      console.error(e)
    } finally {
      setIsSearchingResources(false)
    }
  }

  const addRelatedResource = (res: any) => {
    if (!selectedResources.some((r) => r.id === res.id)) {
      setSelectedResources([...selectedResources, res])
      setIsDirty(true)
    }
    setResourceSearchQuery('')
    setResourceSearchResults([])
  }

  const removeRelatedResource = (id: string) => {
    setSelectedResources(selectedResources.filter((r) => r.id !== id))
    setIsDirty(true)
  }

  // Format bytes helper
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'PDF Document'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  // Save / Publish
  const handleSave = (publishState: boolean) => {
    setError(null)

    // Basic client checks
    if (!title.trim()) {
      setError('Please enter a checklist title.')
      return
    }
    if (!slug.trim()) {
      setError('Please provide a valid URL slug.')
      return
    }
    if (!purpose.trim() || purpose.trim().length < 10) {
      setError('Purpose ("What is this checklist for?") must be at least 10 characters.')
      return
    }
    const cleanAudience = audience.filter((a) => a.trim().length > 0)
    if (cleanAudience.length === 0) {
      setError('Please provide at least one target audience item.')
      return
    }
    if (sections.length === 0) {
      setError('Please provide at least one checklist section.')
      return
    }
    for (const sec of sections) {
      if (!sec.title.trim()) {
        setError('All checklist sections must have a title.')
        return
      }
      const validItems = sec.items.filter((it) => it.text.trim().length > 0)
      if (validItems.length === 0) {
        setError(`Section "${sec.title}" must have at least one item.`)
        return
      }
    }

    const payload: ChecklistInput = {
      title: title.trim(),
      slug: slug.trim(),
      excerpt: excerpt.trim() || purpose.trim().slice(0, 300),
      category: 'checklists',
      authorId,
      published: publishState,
      publishedAt: publishState ? (initialData?.publishedAt || new Date()) : null,
      lastReviewedAt: lastReviewedAt ? new Date(lastReviewedAt) : new Date(),
      purpose: purpose.trim(),
      audience: cleanAudience,
      sections: sections.map((sec) => ({
        id: sec.id,
        title: sec.title.trim(),
        items: sec.items.filter((it) => it.text.trim().length > 0).map((it) => ({
          id: it.id,
          text: it.text.trim(),
          guidance: it.guidance?.trim() || undefined,
        })),
      })),
      downloadableFile: downloadableFile?.url ? downloadableFile : null,
      notes: notes.trim() || undefined,
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
      relatedServices,
      relatedResourceIds: selectedResources.map((r) => r.id),
    }

    startTransition(async () => {
      let res
      if (initialData?.id) {
        res = await updateChecklist(initialData.id, payload)
      } else {
        res = await createChecklist(payload)
      }

      if (!res.success) {
        setError(res.error || 'Failed to save checklist.')
      } else {
        setIsDirty(false)
        setPublished(publishState)
        if (!initialData?.id && res.checklistId) {
          router.push(`/admin/checklists/${res.checklistId}/edit`)
        } else {
          router.refresh()
        }
      }
    })
  }

  // Delete checklist
  const handleDelete = () => {
    if (!initialData?.id) return
    startTransition(async () => {
      const res = await deleteChecklist(initialData.id)
      if (res.success) {
        router.push('/admin/checklists')
      } else {
        setError(res.error || 'Failed to delete checklist.')
        setShowDeleteModal(false)
      }
    })
  }

  return (
    <div className="max-w-[1600px] mx-auto pb-24 text-[#202522]">
      {/* Top Sticky Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#D9E1DC] py-4 px-4 sm:px-8 mb-8 -mx-4 sm:-mx-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href="/admin/checklists"
            className="inline-flex items-center text-xs font-bold text-[#66736D] hover:text-[#12372A] transition-colors p-1.5 rounded-lg hover:bg-[#F7F4EC]"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            <span>Checklists</span>
          </Link>
          <span className="text-[#D9E1DC]">|</span>
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
              published
                ? 'bg-[#1F7A5C]/10 text-[#1F7A5C] border border-[#1F7A5C]/30'
                : 'bg-[#D6A84F]/15 text-[#9E731E] border border-[#D6A84F]/40'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${published ? 'bg-[#1F7A5C]' : 'bg-[#D6A84F]'}`} />
            {published ? 'Live Checklist' : 'Draft Checklist'}
          </span>
          <span className="bg-[#F7F4EC] border border-[#D9E1DC] text-[#66736D] text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-[#1F7A5C]" />
            {totalItemsCount} Total Items
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {slug && (
            <Link
              href={`/resources/checklists/${slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-[#D9E1DC] text-[#202522] rounded-xl text-xs font-bold hover:bg-[#F7F4EC] transition-colors shadow-2xs"
            >
              <Eye className="w-3.5 h-3.5 text-[#1F7A5C]" />
              <span>Preview</span>
            </Link>
          )}

          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-[#D9E1DC] text-[#202522] rounded-xl text-xs font-bold hover:bg-[#F7F4EC] hover:border-[#1F7A5C]/40 transition-all shadow-2xs disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5 text-[#66736D]" />
            <span>Save Draft</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave(true)}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1F7A5C] text-white rounded-xl text-xs font-bold hover:bg-[#165B44] transition-all shadow-sm hover:shadow-md disabled:opacity-50"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{published ? 'Save & Update' : 'Publish Live'}</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button type="button" onClick={() => setError(null)} className="text-red-500 hover:text-red-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: Main Content Canvas (65-70%) */}
        <div className="lg:col-span-8 space-y-8">
          {/* SECTION 1: Checklist Information */}
          <div className="bg-white border border-[#D9E1DC] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-[#D9E1DC]/60">
              <FileText className="w-4 h-4 text-[#1F7A5C]" />
              <h2 className="text-base font-bold text-[#12372A]">Checklist Information</h2>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-[#12372A] uppercase tracking-wider mb-2">
                Checklist Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={handleTitleChange}
                placeholder="e.g. Factory Labour Compliance Verification Checklist"
                className="w-full text-xl sm:text-2xl font-bold text-[#12372A] p-4 bg-[#F7F4EC]/60 border border-[#D9E1DC] rounded-2xl focus:bg-white focus:border-[#1F7A5C] focus:ring-2 focus:ring-[#1F7A5C]/20 outline-none transition-all"
              />
            </div>

            {/* URL Slug */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-[#66736D] uppercase tracking-wider">
                  Public URL Slug <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#66736D]">
                    {isManualSlug ? 'Manual edit mode' : 'Auto-generated'}
                  </span>
                  <button
                    type="button"
                    onClick={copyPublicUrl}
                    className="text-xs text-[#1F7A5C] hover:text-[#165B44] font-semibold flex items-center gap-1"
                  >
                    {copiedSlug ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedSlug ? 'Copied' : 'Copy URL'}</span>
                  </button>
                </div>
              </div>
              <div className="flex items-center bg-[#F7F4EC] border border-[#D9E1DC] rounded-xl px-3 py-2 text-xs text-[#66736D]">
                <span className="font-mono text-[#A2B3AA] shrink-0">/resources/checklists/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={handleSlugChange}
                  className="w-full bg-transparent font-mono font-bold text-[#12372A] outline-none ml-1"
                />
              </div>
            </div>

            {/* Executive Description */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-[#12372A] uppercase tracking-wider">
                  Executive Description <span className="text-red-500">*</span>
                </label>
                <span className={`text-[11px] font-semibold ${excerpt.length > 450 ? 'text-amber-600' : 'text-[#66736D]'}`}>
                  {excerpt.length} / 500 characters
                </span>
              </div>
              <textarea
                value={excerpt}
                onChange={(e) => {
                  setExcerpt(e.target.value)
                  setIsDirty(true)
                }}
                maxLength={500}
                rows={3}
                placeholder="High-level overview of this checklist for search engines and resource cards..."
                className="w-full text-sm p-4 bg-[#F7F4EC]/60 border border-[#D9E1DC] rounded-2xl focus:bg-white focus:border-[#1F7A5C] focus:ring-2 focus:ring-[#1F7A5C]/20 outline-none transition-all leading-relaxed"
              />
            </div>
          </div>

          {/* SECTION 2: What Is This Checklist For? (Purpose) */}
          <div className="bg-white border border-[#D9E1DC] rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#D9E1DC]/60">
              <HelpCircle className="w-4 h-4 text-[#1F7A5C]" />
              <h2 className="text-base font-bold text-[#12372A]">What Is This Checklist For? (Purpose)</h2>
            </div>
            <p className="text-xs text-[#66736D] leading-relaxed">
              Clearly communicate why this checklist was created and what statutory risk it helps mitigate.
            </p>
            <textarea
              value={purpose}
              onChange={(e) => {
                setPurpose(e.target.value)
                setIsDirty(true)
              }}
              rows={4}
              placeholder="e.g. This operational checklist enables HR leadership, factory managers, and compliance auditors to evaluate manufacturing plant records against statutory labour mandates..."
              className="w-full text-sm p-4 bg-[#F7F4EC]/60 border border-[#D9E1DC] rounded-2xl focus:bg-white focus:border-[#1F7A5C] focus:ring-2 focus:ring-[#1F7A5C]/20 outline-none transition-all leading-relaxed"
            />
          </div>

          {/* SECTION 3: Who Should Use This Checklist? (Target Audience) */}
          <div className="bg-white border border-[#D9E1DC] rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#D9E1DC]/60">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#1F7A5C]" />
                <h2 className="text-base font-bold text-[#12372A]">Who Should Use This Checklist?</h2>
              </div>
              <button
                type="button"
                onClick={addAudienceItem}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#1F7A5C] hover:text-[#165B44] bg-[#1F7A5C]/10 hover:bg-[#1F7A5C]/20 px-3 py-1.5 rounded-xl transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Role</span>
              </button>
            </div>
            <p className="text-xs text-[#66736D]">
              Specify the intended stakeholders, managers, or compliance officers who will execute this checklist.
            </p>

            <div className="space-y-2.5">
              {audience.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-[#F7F4EC]/60 border border-[#D9E1DC] p-2.5 rounded-2xl">
                  <span className="w-6 h-6 rounded-lg bg-white border border-[#D9E1DC] flex items-center justify-center text-xs font-bold text-[#66736D] shrink-0">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateAudienceItem(idx, e.target.value)}
                    placeholder="e.g. Factory HR Managers, Compliance Officers, Principal Employers..."
                    className="flex-1 text-xs font-semibold text-[#12372A] bg-transparent outline-none px-2"
                  />
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => moveAudienceItem(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 text-[#66736D] hover:text-[#12372A] disabled:opacity-30"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveAudienceItem(idx, 'down')}
                      disabled={idx === audience.length - 1}
                      className="p-1 text-[#66736D] hover:text-[#12372A] disabled:opacity-30"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeAudienceItem(idx)}
                      className="p-1 text-red-500 hover:text-red-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 4: What This Checklist Covers (Checklist Sections & Items) */}
          <div className="bg-white border border-[#D9E1DC] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#D9E1DC]/60">
              <div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#1F7A5C]" />
                  <h2 className="text-lg font-bold text-[#12372A]">What This Checklist Covers (Sections & Items)</h2>
                </div>
                <p className="text-xs text-[#66736D] mt-1">
                  Organize compliance checkpoints into logical sections with optional statutory guidance notes.
                </p>
              </div>
              <button
                type="button"
                onClick={addSection}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1F7A5C] text-white rounded-xl text-xs font-bold hover:bg-[#165B44] transition-all shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Section</span>
              </button>
            </div>

            {/* Sections List */}
            <div className="space-y-6">
              {sections.map((sec, secIdx) => (
                <div
                  key={sec.id || secIdx}
                  className="bg-[#F7F4EC]/70 border border-[#D9E1DC] rounded-2xl p-5 space-y-4 shadow-2xs"
                >
                  {/* Section Header */}
                  <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-[#D9E1DC]">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="px-2 py-0.5 rounded-md bg-[#12372A] text-white font-bold text-[11px]">
                        SECTION {secIdx + 1}
                      </span>
                      <input
                        type="text"
                        value={sec.title}
                        onChange={(e) => updateSectionTitle(secIdx, e.target.value)}
                        placeholder="Section Title (e.g. Employee Documentation, Safety Committees)..."
                        className="flex-1 font-bold text-sm text-[#12372A] bg-transparent outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveSection(secIdx, 'up')}
                        disabled={secIdx === 0}
                        className="p-1 text-[#66736D] hover:text-[#12372A] disabled:opacity-30"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveSection(secIdx, 'down')}
                        disabled={secIdx === sections.length - 1}
                        className="p-1 text-[#66736D] hover:text-[#12372A] disabled:opacity-30"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeSection(secIdx)}
                        className="p-1 text-red-500 hover:text-red-700 ml-1"
                        title="Delete Section"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Items inside this section */}
                  <div className="space-y-3 pl-2">
                    {sec.items.map((item, itIdx) => (
                      <div
                        key={item.id || itIdx}
                        className="bg-white border border-[#D9E1DC] rounded-xl p-3 shadow-2xs space-y-2"
                      >
                        <div className="flex items-start gap-2">
                          <div className="w-5 h-5 rounded-md border-2 border-[#1F7A5C]/40 mt-0.5 flex items-center justify-center shrink-0">
                            <span className="text-[10px] font-bold text-[#1F7A5C]">{itIdx + 1}</span>
                          </div>
                          <div className="flex-1 space-y-1.5">
                            <input
                              type="text"
                              value={item.text}
                              onChange={(e) => updateItem(secIdx, itIdx, 'text', e.target.value)}
                              placeholder="Checklist item requirement (e.g. Employee master register maintained with UAN/ESIC)..."
                              className="w-full text-xs font-semibold text-[#12372A] outline-none border-b border-transparent focus:border-[#1F7A5C] pb-0.5"
                            />
                            <input
                              type="text"
                              value={item.guidance || ''}
                              onChange={(e) => updateItem(secIdx, itIdx, 'guidance', e.target.value)}
                              placeholder="Optional guidance note (e.g. Verify Form 11 declarations and Aadhaar seeding)..."
                              className="w-full text-[11px] text-[#66736D] outline-none italic placeholder:not-italic"
                            />
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => moveItem(secIdx, itIdx, 'up')}
                              disabled={itIdx === 0}
                              className="p-1 text-[#66736D] hover:text-[#12372A] disabled:opacity-30"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveItem(secIdx, itIdx, 'down')}
                              disabled={itIdx === sec.items.length - 1}
                              className="p-1 text-[#66736D] hover:text-[#12372A] disabled:opacity-30"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeItem(secIdx, itIdx)}
                              className="p-1 text-red-500 hover:text-red-700"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => addItemToSection(secIdx)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1F7A5C] hover:text-[#165B44] bg-white border border-[#D9E1DC] hover:border-[#1F7A5C] px-3 py-1.5 rounded-xl transition-all shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Checklist Item</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 5: Optional Rich Text Explanatory Notes */}
          <div className="bg-white border border-[#D9E1DC] rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#D9E1DC]/60">
              <FileText className="w-4 h-4 text-[#1F7A5C]" />
              <h2 className="text-base font-bold text-[#12372A]">Additional Statutory Context & Notes (Optional)</h2>
            </div>
            <p className="text-xs text-[#66736D]">
              Add background legal commentary or operational instructions to accompany the structured checklist.
            </p>
            <TiptapEditor
              content={notes}
              onChange={(val) => {
                setNotes(val)
                setIsDirty(true)
              }}
            />
          </div>

          {/* SECTION 6: In-Checklist CTA Configuration */}
          <div className="bg-white border border-[#D9E1DC] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-[#D9E1DC]/60">
              <Layers className="w-4 h-4 text-[#1F7A5C]" />
              <h2 className="text-base font-bold text-[#12372A]">In-Checklist Call to Action (CTA)</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#12372A] uppercase tracking-wider mb-2">
                  CTA Heading
                </label>
                <input
                  type="text"
                  value={ctaHeading}
                  onChange={(e) => {
                    setCtaHeading(e.target.value)
                    setIsDirty(true)
                  }}
                  className="w-full text-xs font-semibold p-3 bg-[#F7F4EC]/60 border border-[#D9E1DC] rounded-xl focus:bg-white focus:border-[#1F7A5C] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#12372A] uppercase tracking-wider mb-2">
                  CTA Description
                </label>
                <input
                  type="text"
                  value={ctaDescription}
                  onChange={(e) => {
                    setCtaDescription(e.target.value)
                    setIsDirty(true)
                  }}
                  className="w-full text-xs font-semibold p-3 bg-[#F7F4EC]/60 border border-[#D9E1DC] rounded-xl focus:bg-white focus:border-[#1F7A5C] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#12372A] uppercase tracking-wider">
                  Primary Button
                </label>
                <input
                  type="text"
                  value={ctaPrimaryLabel}
                  onChange={(e) => {
                    setCtaPrimaryLabel(e.target.value)
                    setIsDirty(true)
                  }}
                  placeholder="Label (e.g. Schedule Audit)"
                  className="w-full text-xs font-semibold p-3 bg-[#F7F4EC]/60 border border-[#D9E1DC] rounded-xl focus:bg-white focus:border-[#1F7A5C] outline-none mb-2"
                />
                <input
                  type="text"
                  value={ctaPrimaryUrl}
                  onChange={(e) => {
                    setCtaPrimaryUrl(e.target.value)
                    setIsDirty(true)
                  }}
                  placeholder="URL (e.g. /compliance-health-check)"
                  className="w-full text-xs font-mono p-3 bg-[#F7F4EC]/60 border border-[#D9E1DC] rounded-xl focus:bg-white focus:border-[#1F7A5C] outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#12372A] uppercase tracking-wider">
                  Secondary Button
                </label>
                <input
                  type="text"
                  value={ctaSecondaryLabel}
                  onChange={(e) => {
                    setCtaSecondaryLabel(e.target.value)
                    setIsDirty(true)
                  }}
                  placeholder="Label (e.g. Contact Team)"
                  className="w-full text-xs font-semibold p-3 bg-[#F7F4EC]/60 border border-[#D9E1DC] rounded-xl focus:bg-white focus:border-[#1F7A5C] outline-none mb-2"
                />
                <input
                  type="text"
                  value={ctaSecondaryUrl}
                  onChange={(e) => {
                    setCtaSecondaryUrl(e.target.value)
                    setIsDirty(true)
                  }}
                  placeholder="URL (e.g. /contact)"
                  className="w-full text-xs font-mono p-3 bg-[#F7F4EC]/60 border border-[#D9E1DC] rounded-xl focus:bg-white focus:border-[#1F7A5C] outline-none"
                />
              </div>
            </div>

            {/* Live CTA Preview Card */}
            <div className="bg-[#F7F4EC] border-l-4 border-[#1F7A5C] p-6 rounded-r-2xl space-y-3">
              <span className="text-[10px] font-bold text-[#1F7A5C] uppercase tracking-wider">Live Preview</span>
              <h4 className="text-lg font-bold text-[#12372A]">{ctaHeading}</h4>
              <p className="text-xs text-[#66736D] leading-relaxed">{ctaDescription}</p>
              <div className="flex flex-wrap gap-2 pt-1">
                {ctaPrimaryLabel && (
                  <span className="px-4 py-2 bg-[#1F7A5C] text-white text-xs font-bold rounded-xl shadow-xs">
                    {ctaPrimaryLabel}
                  </span>
                )}
                {ctaSecondaryLabel && (
                  <span className="px-4 py-2 bg-white border border-[#D9E1DC] text-[#202522] text-xs font-bold rounded-xl shadow-2xs">
                    {ctaSecondaryLabel}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Sticky Sidebar (30-35%) */}
        <div className="lg:col-span-4 space-y-6">
          {/* SECTION: Downloadable File */}
          <div className="bg-white border border-[#D9E1DC] rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#D9E1DC]/60">
              <FileDown className="w-4 h-4 text-[#1F7A5C]" />
              <h3 className="text-sm font-bold text-[#12372A]">Downloadable File (PDF)</h3>
            </div>

            {downloadableFile ? (
              <div className="bg-[#F7F4EC] border border-[#D9E1DC] rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs shrink-0">
                    PDF
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#12372A] truncate">{downloadableFile.filename}</p>
                    <p className="text-[11px] text-[#66736D]">{formatFileSize(downloadableFile.size)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-[#D9E1DC]/60">
                  <label className="cursor-pointer text-xs font-bold text-[#1F7A5C] hover:text-[#165B44] flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Replace</span>
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handlePdfUpload}
                      disabled={isUploadingPdf}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[#D9E1DC]">|</span>
                  <button
                    type="button"
                    onClick={() => {
                      setDownloadableFile(null)
                      setIsDirty(true)
                    }}
                    className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ) : (
              <label className="border-2 border-dashed border-[#D9E1DC] hover:border-[#1F7A5C] rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-[#F7F4EC]/40">
                <DownloadCloud className="w-8 h-8 text-[#1F7A5C]" />
                <span className="text-xs font-bold text-[#12372A]">
                  {isUploadingPdf ? 'Uploading PDF...' : 'Upload Downloadable PDF'}
                </span>
                <span className="text-[11px] text-[#66736D]">PDF format up to 25MB</span>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handlePdfUpload}
                  disabled={isUploadingPdf}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* SECTION: Author & Review Date */}
          <div className="bg-white border border-[#D9E1DC] rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#D9E1DC]/60">
              <Calendar className="w-4 h-4 text-[#1F7A5C]" />
              <h3 className="text-sm font-bold text-[#12372A]">Author & Audit Details</h3>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#66736D] uppercase tracking-wider mb-2">
                Author / Team Member
              </label>
              <select
                value={authorId}
                onChange={(e) => {
                  setAuthorId(e.target.value)
                  setIsDirty(true)
                }}
                className="w-full text-xs font-semibold p-3 bg-[#F7F4EC]/60 border border-[#D9E1DC] rounded-xl outline-none"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name || 'LabourAxis Team'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#66736D] uppercase tracking-wider mb-2">
                Last Reviewed Date
              </label>
              <input
                type="date"
                value={lastReviewedAt}
                onChange={(e) => {
                  setLastReviewedAt(e.target.value)
                  setIsDirty(true)
                }}
                className="w-full text-xs font-semibold p-3 bg-[#F7F4EC]/60 border border-[#D9E1DC] rounded-xl outline-none"
              />
              <p className="text-[11px] text-[#66736D] mt-1">Displayed publicly as "Last reviewed: [Date]".</p>
            </div>
          </div>

          {/* SECTION: Featured Cover Image */}
          <div className="bg-white border border-[#D9E1DC] rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#D9E1DC]/60">
              <ImageIcon className="w-4 h-4 text-[#1F7A5C]" />
              <h3 className="text-sm font-bold text-[#12372A]">Cover Image (1200 × 630)</h3>
            </div>

            <div className="aspect-[16/9] bg-[#F7F4EC] rounded-2xl overflow-hidden border border-[#D9E1DC] flex items-center justify-center relative">
              {featuredImage ? (
                <img src={featuredImage} alt={featuredImageAlt || 'Cover'} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-bold text-[#66736D]">No Cover Image</span>
              )}
            </div>

            <div className="space-y-3">
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
                  <span>{isUploadingImage ? 'Uploading...' : 'Upload New'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploadingImage}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#66736D] uppercase tracking-wider mb-1">
                  Image Alt Text
                </label>
                <input
                  type="text"
                  value={featuredImageAlt}
                  onChange={(e) => {
                    setFeaturedImageAlt(e.target.value)
                    setIsDirty(true)
                  }}
                  placeholder="Describe image for SEO & accessibility..."
                  className="w-full text-xs font-semibold p-2.5 bg-[#F7F4EC]/60 border border-[#D9E1DC] rounded-xl outline-none"
                />
              </div>
            </div>
          </div>

          {/* SECTION: Related Practice Areas */}
          <div className="bg-white border border-[#D9E1DC] rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#D9E1DC]/60">
              <Layers className="w-4 h-4 text-[#1F7A5C]" />
              <h3 className="text-sm font-bold text-[#12372A]">Related Practice Areas</h3>
            </div>
            <div className="space-y-2">
              {Object.entries(AVAILABLE_PRACTICE_AREAS).map(([slugKey, label]) => (
                <label
                  key={slugKey}
                  className="flex items-center gap-2 text-xs font-semibold text-[#12372A] cursor-pointer hover:text-[#1F7A5C]"
                >
                  <input
                    type="checkbox"
                    checked={relatedServices.includes(slugKey)}
                    onChange={() => togglePracticeArea(slugKey)}
                    className="rounded text-[#1F7A5C] focus:ring-[#1F7A5C] h-4 w-4"
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* SECTION: Related Resources */}
          <div className="bg-white border border-[#D9E1DC] rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#D9E1DC]/60">
              <Search className="w-4 h-4 text-[#1F7A5C]" />
              <h3 className="text-sm font-bold text-[#12372A]">Related Resources</h3>
            </div>

            <div className="relative">
              <input
                type="text"
                value={resourceSearchQuery}
                onChange={(e) => handleSearchResources(e.target.value)}
                placeholder="Search guides, checklists, articles..."
                className="w-full text-xs font-semibold p-2.5 bg-[#F7F4EC]/60 border border-[#D9E1DC] rounded-xl outline-none"
              />
              {isSearchingResources && (
                <span className="absolute right-3 top-3 text-[11px] text-[#66736D]">Searching...</span>
              )}
            </div>

            {resourceSearchResults.length > 0 && (
              <div className="bg-white border border-[#D9E1DC] rounded-xl p-2 max-h-40 overflow-y-auto space-y-1 shadow-md">
                {resourceSearchResults.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => addRelatedResource(r)}
                    className="w-full text-left p-2 rounded-lg hover:bg-[#F7F4EC] text-xs font-semibold text-[#12372A] flex items-center justify-between"
                  >
                    <span className="truncate">{r.title}</span>
                    <span className="text-[10px] text-[#1F7A5C] uppercase ml-2">{r.category}</span>
                  </button>
                ))}
              </div>
            )}

            {selectedResources.length > 0 && (
              <div className="space-y-2 pt-2">
                {selectedResources.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between p-2.5 bg-[#F7F4EC] rounded-xl border border-[#D9E1DC] text-xs"
                  >
                    <span className="truncate font-semibold text-[#12372A]">{r.title}</span>
                    <button
                      type="button"
                      onClick={() => removeRelatedResource(r.id)}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION: SEO & SERP Preview */}
          <div className="bg-white border border-[#D9E1DC] rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#D9E1DC]/60">
              <Globe className="w-4 h-4 text-[#1F7A5C]" />
              <h3 className="text-sm font-bold text-[#12372A]">Search Engine Optimization</h3>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-[#66736D] uppercase tracking-wider">SEO Title</label>
                <span className={`text-[10px] ${seoTitle.length > 60 ? 'text-amber-600' : 'text-[#66736D]'}`}>
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
                placeholder={title || 'Checklist Title'}
                maxLength={100}
                className="w-full text-xs font-semibold p-2.5 bg-[#F7F4EC]/60 border border-[#D9E1DC] rounded-xl outline-none"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-[#66736D] uppercase tracking-wider">Meta Description</label>
                <span className={`text-[10px] ${metaDescription.length > 160 ? 'text-amber-600' : 'text-[#66736D]'}`}>
                  {metaDescription.length} / 160
                </span>
              </div>
              <textarea
                value={metaDescription}
                onChange={(e) => {
                  setMetaDescription(e.target.value)
                  setIsDirty(true)
                }}
                placeholder={excerpt || 'Meta summary for search engines...'}
                maxLength={300}
                rows={3}
                className="w-full text-xs font-semibold p-2.5 bg-[#F7F4EC]/60 border border-[#D9E1DC] rounded-xl outline-none leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#66736D] uppercase tracking-wider mb-1">
                Canonical URL
              </label>
              <input
                type="text"
                value={canonicalUrl}
                onChange={(e) => {
                  setCanonicalUrl(e.target.value)
                  setIsDirty(true)
                }}
                placeholder={`https://www.labouraxis.com/resources/checklists/${slug}`}
                className="w-full text-xs font-mono p-2.5 bg-[#F7F4EC]/60 border border-[#D9E1DC] rounded-xl outline-none"
              />
            </div>

            {/* Live Google SERP Card */}
            <div className="bg-[#F7F4EC] p-3.5 rounded-xl border border-[#D9E1DC] space-y-1">
              <span className="text-[10px] font-bold text-[#1F7A5C] uppercase tracking-wider">Google Snippet</span>
              <p className="text-xs text-[#1F7A5C] truncate">https://www.labouraxis.com › resources › checklists › {slug}</p>
              <p className="text-xs font-bold text-[#1a0dab] line-clamp-1">
                {seoTitle || title || 'Factory Compliance Checklist | LabourAxis'}
              </p>
              <p className="text-[11px] text-[#4d5156] line-clamp-2 leading-relaxed">
                {metaDescription || excerpt || purpose || 'Download and review compliance requirements...'}
              </p>
            </div>
          </div>

          {/* Danger Zone: Delete Checklist */}
          {initialData?.id && (
            <div className="bg-red-50/60 border border-red-200 rounded-3xl p-6 space-y-3">
              <h4 className="text-xs font-bold text-red-800 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                <span>Danger Zone</span>
              </h4>
              <p className="text-xs text-red-700 leading-relaxed">
                Permanently remove this checklist and its associated sections and relations from the database.
              </p>
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
              >
                Delete Checklist
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#D9E1DC] space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-3 bg-red-100 rounded-2xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#12372A]">Delete this checklist?</h3>
                <p className="text-xs text-[#66736D]">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-xs text-[#66736D] leading-relaxed">
              Are you sure you want to permanently delete <strong>{title || 'this checklist'}</strong>? It will immediately be removed from the public website, search indexes, and dynamic sitemap.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-white border border-[#D9E1DC] text-[#202522] rounded-xl text-xs font-bold hover:bg-[#F7F4EC]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 disabled:opacity-50"
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
