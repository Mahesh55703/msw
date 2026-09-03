'use client'

import { useState, useEffect, useRef, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import TiptapEditor from '@/components/editor/TiptapEditor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createArticle, updateArticle, deleteArticle, searchArticlesForRelation } from '@/app/actions/articles'
import { calculateReadingTime, parseAndFormatArticleContent } from '@/lib/content-parser'
import { MediaPickerModal } from '@/components/admin/media/MediaPickerModal'
import {
  ArrowLeft,
  Eye,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Upload,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileText,
  Search,
  ExternalLink,
  Copy,
  Check,
  Globe,
  Sparkles,
  HelpCircle,
  Image as ImageIcon,
} from 'lucide-react'

export interface ArticleEditorProps {
  initialData?: any
  users: { id: string; name: string | null; email?: string }[]
  initialRelatedArticles?: { id: string; title: string; slug: string; category: string; published: boolean }[]
  availableServices: { slug: string; title: string }[]
}

export default function ArticleEditor({ initialData, users, initialRelatedArticles = [], availableServices }: ArticleEditorProps) {
  const router = useRouter()
  const isEdit = !!initialData
  const [, startTransition] = useTransition()

  // Form States
  const [title, setTitle] = useState(initialData?.title || '')
  const [slug, setSlug] = useState(initialData?.slug || '')
  const [slugEditedManually, setSlugEditedManually] = useState(isEdit)
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || '')
  const [content, setContent] = useState(initialData?.content || '')
  const [authorId, setAuthorId] = useState(initialData?.authorId || (users[0]?.id || ''))
  const [published, setPublished] = useState(initialData?.published || false)

  // Media
  const [featuredImage, setFeaturedImage] = useState(initialData?.featuredImage || '')
  const [featuredImageAlt, setFeaturedImageAlt] = useState(initialData?.featuredImageAlt || '')
  const [ogImage, setOgImage] = useState(initialData?.ogImage || '')

  // SEO
  const [seoTitle, setSeoTitle] = useState(initialData?.seoTitle || '')
  const [metaDescription, setMetaDescription] = useState(initialData?.metaDescription || '')
  const [canonicalUrl, setCanonicalUrl] = useState(initialData?.canonicalUrl || '')

  // In-Article CTA
  const [ctaHeading, setCtaHeading] = useState(initialData?.ctaHeading || '')
  const [ctaDescription, setCtaDescription] = useState(initialData?.ctaDescription || '')
  const [ctaPrimaryLabel, setCtaPrimaryLabel] = useState(initialData?.ctaPrimaryLabel || '')
  const [ctaPrimaryUrl, setCtaPrimaryUrl] = useState(initialData?.ctaPrimaryUrl || '')
  const [ctaSecondaryLabel, setCtaSecondaryLabel] = useState(initialData?.ctaSecondaryLabel || '')
  const [ctaSecondaryUrl, setCtaSecondaryUrl] = useState(initialData?.ctaSecondaryUrl || '')

  // Relations
  const [keyTakeaways, setKeyTakeaways] = useState<string[]>(
    initialData?.keyTakeaways?.map((t: any) => t.text) || []
  )
  const [relatedServices, setRelatedServices] = useState<string[]>(
    initialData?.relatedServices?.map((s: any) => s.serviceSlug) || []
  )
  const [selectedRelatedArticles, setSelectedRelatedArticles] = useState<
    { id: string; title: string; slug: string; category: string }[]
  >(
    (initialData?.relatedFrom || initialData?.relatedTo)?.map((r: any) => ({
      id: r.toArticle.id,
      title: r.toArticle.title,
      slug: r.toArticle.slug,
      category: r.toArticle.category,
    })) || []
  )

  // Related Articles search
  const [articleSearchQuery, setArticleSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<{ id: string; title: string; slug: string; category: string }[]>([])
  const [isSearchingArticles, setIsSearchingArticles] = useState(false)
  const [serviceSearchQuery, setServiceSearchQuery] = useState('')

  // UI & Lifecycle States
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isDirty, setIsDirty] = useState(false)
  const [copiedSlug, setCopiedSlug] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Warn on unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty && !isSubmitting) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty, isSubmitting])

  const markDirty = () => setIsDirty(true)

  // Auto-slug generation from title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    markDirty()
    const newTitle = e.target.value
    setTitle(newTitle)
    if (!slugEditedManually && !isEdit) {
      const generated = newTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
      setSlug(generated)
    }
  }

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    markDirty()
    setSlugEditedManually(true)
    const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
    setSlug(val)
  }

  // Live Metrics
  const metrics = calculateReadingTime(content)
  const headingsCount = (content.match(/<h[234][^>]*>/gi) || []).length

  // Takeaway handlers
  const addTakeaway = () => {
    markDirty()
    setKeyTakeaways([...keyTakeaways, ''])
  }

  const updateTakeaway = (index: number, val: string) => {
    markDirty()
    const updated = [...keyTakeaways]
    updated[index] = val
    setKeyTakeaways(updated)
  }

  const removeTakeaway = (index: number) => {
    markDirty()
    setKeyTakeaways(keyTakeaways.filter((_, i) => i !== index))
  }

  const moveTakeaway = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === keyTakeaways.length - 1) return
    markDirty()
    const updated = [...keyTakeaways]
    const target = direction === 'up' ? index - 1 : index + 1
    const temp = updated[index]
    updated[index] = updated[target]
    updated[target] = temp
    setKeyTakeaways(updated)
  }

  // Related Services handlers
  const toggleService = (serviceSlug: string) => {
    markDirty()
    if (relatedServices.includes(serviceSlug)) {
      setRelatedServices(relatedServices.filter((s) => s !== serviceSlug))
    } else {
      setRelatedServices([...relatedServices, serviceSlug])
    }
  }

  // Related Articles search
  const handleSearchArticles = async (query: string) => {
    setArticleSearchQuery(query)
    if (!query.trim()) {
      setSearchResults([])
      return
    }
    setIsSearchingArticles(true)
    try {
      const results = await searchArticlesForRelation(query, initialData?.id)
      setSearchResults(results)
    } catch (err) {
      console.error(err)
    } finally {
      setIsSearchingArticles(false)
    }
  }

  const addRelatedArticle = (art: { id: string; title: string; slug: string; category: string }) => {
    markDirty()
    if (!selectedRelatedArticles.some((a) => a.id === art.id)) {
      setSelectedRelatedArticles([...selectedRelatedArticles, art])
    }
    setArticleSearchQuery('')
    setSearchResults([])
  }

  const removeRelatedArticle = (id: string) => {
    markDirty()
    setSelectedRelatedArticles(selectedRelatedArticles.filter((a) => a.id !== id))
  }

  // Featured Image Upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingImage(true)
    setErrorMessage('')

    try {
      const response = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
        method: 'POST',
        body: file,
      })

      if (response.ok) {
        const data = await response.json()
        markDirty()
        setFeaturedImage(data.url)
        if (!featuredImageAlt) {
          setFeaturedImageAlt(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '))
        }
      } else {
        const err = await response.json()
        setErrorMessage(err.error || 'Failed to upload image')
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error occurred while uploading image')
    } finally {
      setIsUploadingImage(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // Copy Public URL
  const copyPublicUrl = () => {
    const publicUrl = `${window.location.origin}/resources/articles/${slug}`
    navigator.clipboard.writeText(publicUrl)
    setCopiedSlug(true)
    setTimeout(() => setCopiedSlug(false), 2000)
  }

  // Save / Publish Action
  const handleSave = async (publishTarget: boolean) => {
    setErrorMessage('')
    setSuccessMessage('')

    if (!title.trim()) {
      setErrorMessage('Article Title is required.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    if (!slug.trim()) {
      setErrorMessage('Article URL Slug is required.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    if (!content.trim() || content === '<p></p>') {
      setErrorMessage('Article content cannot be empty.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setIsSubmitting(true)

    try {
      const payload = {
        title: title.trim(),
        slug: slug.trim(),
        excerpt: excerpt.trim() || null,
        content: content.trim(),
        category: 'articles',
        authorId,
        published: publishTarget,
        publishedAt: publishTarget ? (initialData?.publishedAt ? new Date(initialData.publishedAt) : new Date()) : null,

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

        keyTakeaways: keyTakeaways.filter((t) => t.trim()),
        relatedServices,
        relatedArticleIds: selectedRelatedArticles.map((a) => a.id),
      }

      let res
      if (isEdit) {
        res = await updateArticle(initialData.id, payload)
      } else {
        res = await createArticle(payload)
      }

      if (res.success) {
        setIsDirty(false)
        setPublished(publishTarget)
        setSuccessMessage(
          publishTarget
            ? isEdit
              ? 'Article updated and published successfully!'
              : 'Article created and published live!'
            : 'Article draft saved successfully.'
        )

        // If newly created, redirect to edit page or list
        if (!isEdit && res.articleId) {
          router.push(`/admin/articles/${res.articleId}/edit`)
        } else {
          router.refresh()
        }
      } else {
        setErrorMessage(res.error || 'Failed to save article.')
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete Action
  const handleDeleteArticle = async () => {
    if (!initialData?.id) return
    setIsDeleting(true)
    try {
      const res = await deleteArticle(initialData.id)
      if (res.success) {
        setIsDirty(false)
        router.push('/admin/articles')
        router.refresh()
      } else {
        setErrorMessage(res.error || 'Failed to delete article.')
        setShowDeleteModal(false)
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to delete article.')
      setShowDeleteModal(false)
    } finally {
      setIsDeleting(false)
    }
  }

  const filteredServices = availableServices.filter(s =>
    s.title.toLowerCase().includes(serviceSearchQuery.toLowerCase())
  )

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-28 text-[#202522]">
      {/* ---------------------------------------------------- */}
      {/* TOP ACTION BAR (STICKY)                              */}
      {/* ---------------------------------------------------- */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border border-[#D9E1DC] p-4 rounded-2xl shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Left: Navigation & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/admin/articles"
            onClick={(e) => {
              if (isDirty && !confirm('You have unsaved changes. Are you sure you want to leave this page?')) {
                e.preventDefault()
              }
            }}
            className="p-2 rounded-xl text-[#66736D] hover:text-[#12372A] hover:bg-[#F7F4EC] transition-colors border border-transparent hover:border-[#D9E1DC]"
            title="Back to Articles"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#D6A84F]">
                {isEdit ? 'Article Editor' : 'New Publication'}
              </span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  published
                    ? 'bg-[#1F7A5C]/10 text-[#1F7A5C] border border-[#1F7A5C]/20'
                    : 'bg-[#D6A84F]/15 text-[#9E731E] border border-[#D6A84F]/30'
                }`}
              >
                {published ? '● Live' : '○ Draft'}
              </span>
            </div>
            <h1 className="text-sm md:text-base font-bold text-[#12372A] truncate max-w-xs sm:max-w-md md:max-w-lg">
              {title || 'Untitled Article'}
            </h1>
          </div>
        </div>

        {/* Right: Metrics & Actions */}
        <div className="flex items-center flex-wrap gap-2.5 ml-auto">
          {/* Live Reading Metrics Badge */}
          <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 bg-[#F7F4EC] border border-[#D9E1DC] rounded-xl text-xs text-[#66736D]">
            <span className="flex items-center gap-1 font-medium">
              <FileText className="w-3.5 h-3.5 text-[#1F7A5C]" />
              <strong className="text-[#12372A] font-mono">{metrics.wordCount}</strong> words
            </span>
            <span className="text-[#D9E1DC]">|</span>
            <span className="flex items-center gap-1 font-medium">
              <Clock className="w-3.5 h-3.5 text-[#D6A84F]" />
              <strong className="text-[#12372A]">{metrics.text}</strong>
            </span>
          </div>

          {/* Preview Public Article (Draft or Published) */}
          {slug && (
            <Link
              href={`/resources/articles/${slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border border-[#D9E1DC] text-[#12372A] hover:bg-[#F7F4EC] transition-colors shadow-2xs"
            >
              <Eye className="w-3.5 h-3.5 text-[#1F7A5C]" />
              <span className="hidden sm:inline">Preview</span>
            </Link>
          )}

          {/* Save Draft */}
          <Button
            type="button"
            variant="secondary"
            onClick={() => handleSave(false)}
            disabled={isSubmitting}
            className="bg-[#F7F4EC] hover:bg-[#EDE8DE] text-[#12372A] border border-[#D9E1DC] rounded-xl text-xs font-bold px-4 py-2"
          >
            {isSubmitting && !published ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Saving...
              </>
            ) : (
              'Save Draft'
            )}
          </Button>

          {/* Publish Live */}
          <Button
            type="button"
            onClick={() => handleSave(true)}
            disabled={isSubmitting}
            className="bg-[#1F7A5C] hover:bg-[#165B44] text-white rounded-xl text-xs font-bold px-4 py-2 shadow-xs"
          >
            {isSubmitting && published ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Processing...
              </>
            ) : published ? (
              'Save & Update'
            ) : (
              'Publish Live'
            )}
          </Button>
        </div>
      </div>

      {/* Status Messages */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in-50">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center justify-between gap-2 animate-in fade-in-50">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
          {slug && (
            <Link
              href={`/resources/articles/${slug}`}
              target="_blank"
              className="underline font-bold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1"
            >
              View live article <ExternalLink className="w-3 h-3" />
            </Link>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TWO-COLUMN EDITORIAL WORKSPACE                       */}
      {/* ---------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ================================================== */}
        {/* LEFT COLUMN: MAIN CONTENT (65-70% / 8 cols)        */}
        {/* ================================================== */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Section 1: Title & Slug & Excerpt */}
          <div className="bg-white rounded-3xl shadow-xs border border-[#D9E1DC] p-6 md:p-8 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="article-title" className="text-xs font-bold text-[#D6A84F] uppercase tracking-wider">
                Article Title <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="article-title"
                value={title}
                onChange={handleTitleChange}
                placeholder="Enter compelling article headline..."
                className="text-lg md:text-xl font-bold rounded-xl border-[#D9E1DC] focus:ring-[#1F7A5C] text-[#12372A] placeholder:text-[#66736D]/50"
              />
            </div>

            {/* Public Slug URL Bar */}
            <div className="bg-[#F7F4EC]/60 border border-[#D9E1DC] rounded-2xl p-3.5 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <Label htmlFor="article-slug" className="text-[11px] font-bold text-[#12372A] uppercase tracking-wider flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#1F7A5C]" />
                  Public Resource Path:
                </Label>
                <button
                  type="button"
                  onClick={copyPublicUrl}
                  className="text-[11px] font-bold text-[#1F7A5C] hover:text-[#165B44] flex items-center gap-1 self-start sm:self-auto"
                >
                  {copiedSlug ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" /> Copied Path
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" /> Copy Link
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-[#66736D] font-mono select-none hidden sm:inline">
                  /resources/articles/
                </span>
                <Input
                  id="article-slug"
                  value={slug}
                  onChange={handleSlugChange}
                  placeholder="custom-article-slug"
                  className="font-mono text-xs rounded-xl border-[#D9E1DC] bg-white text-[#12372A]"
                />
              </div>
              <p className="text-[10px] text-[#66736D]">
                URL-safe identifier. Lowercase letters, numbers, and hyphens only.
              </p>
            </div>

            {/* Excerpt */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="article-excerpt" className="text-xs font-bold text-[#12372A]">
                  Summary / Excerpt
                </Label>
                <span
                  className={`text-[10px] font-mono ${
                    excerpt.length > 300 ? 'text-amber-600 font-bold' : 'text-[#66736D]'
                  }`}
                >
                  {excerpt.length} / 300 recommended chars
                </span>
              </div>
              <Textarea
                id="article-excerpt"
                value={excerpt}
                onChange={(e) => {
                  markDirty()
                  setExcerpt(e.target.value)
                }}
                placeholder="Short executive summary used on article cards, search listings, and social metadata..."
                rows={3}
                className="rounded-xl border-[#D9E1DC] text-xs text-[#202522] leading-relaxed placeholder:text-[#66736D]/60"
              />
              <p className="text-[10px] text-[#66736D]">
                Summarizes the core advisory takeaway for executive readers and search snippets.
              </p>
            </div>
          </div>

          {/* Section 2: Rich Text Content Editor */}
          <div className="bg-white rounded-3xl shadow-xs border border-[#D9E1DC] p-6 md:p-8 space-y-4">
            <div className="flex items-center justify-between border-b border-[#D9E1DC]/80 pb-3">
              <div>
                <h2 className="text-xs font-bold text-[#D6A84F] uppercase tracking-wider">
                  Article Body & Content
                </h2>
                <p className="text-[11px] text-[#66736D] mt-0.5">
                  Structure your article with H2 for main sections and H3 for subsections. (Article title serves as the only H1).
                </p>
              </div>
              <div className="text-xs text-[#66736D] font-medium hidden sm:block">
                {headingsCount} Headings detected
              </div>
            </div>

            <TiptapEditor
              content={content}
              onChange={(html) => {
                markDirty()
                setContent(html)
              }}
            />
          </div>

          {/* Section 3: Key Takeaways (Repeatable) */}
          <div className="bg-white rounded-3xl shadow-xs border border-[#D9E1DC] p-6 md:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-[#D9E1DC]/80 pb-3">
              <div>
                <h2 className="text-xs font-bold text-[#D6A84F] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#D6A84F]" />
                  Key Takeaways
                </h2>
                <p className="text-[11px] text-[#66736D] mt-0.5">
                  Actionable points highlighted in the statutory overview box at the top of the article.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addTakeaway}
                className="gap-1.5 rounded-xl border-[#D9E1DC] text-[#12372A] hover:bg-[#F7F4EC] text-xs font-bold"
              >
                <Plus className="w-3.5 h-3.5 text-[#1F7A5C]" /> Add Point
              </Button>
            </div>

            {keyTakeaways.length === 0 ? (
              <div className="p-6 text-center border-2 border-dashed border-[#D9E1DC] rounded-2xl bg-[#F7F4EC]/30">
                <p className="text-xs text-[#66736D] font-medium mb-3">
                  No key takeaways added yet. Adding 3–5 bullet points helps readers digest key compliance rules.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addTakeaway}
                  className="rounded-xl border-[#D9E1DC] text-xs font-bold"
                >
                  + Add First Takeaway
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {keyTakeaways.map((takeaway, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2 bg-[#F7F4EC]/40 border border-[#D9E1DC] rounded-2xl group hover:border-[#1F7A5C]/40 transition-colors"
                  >
                    <span className="w-6 text-center font-mono text-xs font-bold text-[#66736D] shrink-0">
                      {idx + 1}.
                    </span>
                    <Input
                      value={takeaway}
                      onChange={(e) => updateTakeaway(idx, e.target.value)}
                      placeholder={`Enter takeaway point #${idx + 1}...`}
                      className="text-xs rounded-xl border-[#D9E1DC] bg-white flex-1"
                    />
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => moveTakeaway(idx, 'up')}
                        disabled={idx === 0}
                        title="Move Up"
                        aria-label="Move takeaway up"
                        className="h-7 w-7 rounded-lg text-[#66736D] hover:bg-[#EDE8DE] disabled:opacity-30"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => moveTakeaway(idx, 'down')}
                        disabled={idx === keyTakeaways.length - 1}
                        title="Move Down"
                        aria-label="Move takeaway down"
                        className="h-7 w-7 rounded-lg text-[#66736D] hover:bg-[#EDE8DE] disabled:opacity-30"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeTakeaway(idx)}
                        title="Delete Takeaway"
                        aria-label="Delete takeaway"
                        className="h-7 w-7 rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 4: Related Services */}
          <div className="bg-white rounded-3xl shadow-xs border border-[#D9E1DC] p-6 md:p-8 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D9E1DC]/80 pb-3">
              <div>
                <h2 className="text-xs font-bold text-[#D6A84F] uppercase tracking-wider">
                  Related Practice Areas & Services
                </h2>
                <p className="text-[11px] text-[#66736D] mt-0.5">
                  Links this publication to relevant service offerings in the sidebar and footer.
                </p>
              </div>
              <div className="relative max-w-xs w-full">
                <Search className="w-3.5 h-3.5 text-[#66736D] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter practice areas..."
                  value={serviceSearchQuery}
                  onChange={(e) => setServiceSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-[#D9E1DC] bg-[#F7F4EC]/40 focus:outline-none focus:ring-2 focus:ring-[#1F7A5C]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredServices.map((service) => {
                const isSelected = relatedServices.includes(service.slug)
                return (
                  <label
                    key={service.slug}
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#1F7A5C]/10 border-[#1F7A5C]/40 shadow-xs'
                        : 'border-[#D9E1DC] hover:bg-[#F7F4EC]/60'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleService(service.slug)}
                      className="mt-0.5 rounded text-[#1F7A5C] focus:ring-[#1F7A5C]"
                    />
                    <div className="text-xs">
                      <p className={`font-bold ${isSelected ? 'text-[#12372A]' : 'text-[#202522]'}`}>
                        {service.title}
                      </p>
                      <p className="text-[10px] text-[#66736D] font-mono">/services/{service.slug}</p>
                    </div>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Section 5: Related Articles Selector */}
          <div className="bg-white rounded-3xl shadow-xs border border-[#D9E1DC] p-6 md:p-8 space-y-5">
            <div className="border-b border-[#D9E1DC]/80 pb-3">
              <h2 className="text-xs font-bold text-[#D6A84F] uppercase tracking-wider">
                Related Articles & Recommended Reading
              </h2>
              <p className="text-[11px] text-[#66736D] mt-0.5">
                Curate specific articles to showcase at the bottom of the reading page.
              </p>
            </div>

            {/* Selected Articles List */}
            {selectedRelatedArticles.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-[#12372A]">Selected Articles ({selectedRelatedArticles.length}):</p>
                <div className="space-y-2">
                  {selectedRelatedArticles.map((art, idx) => (
                    <div
                      key={art.id}
                      className="flex items-center justify-between p-3 rounded-2xl bg-[#F7F4EC]/60 border border-[#D9E1DC] text-xs"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="font-bold text-[#12372A] truncate">{art.title}</p>
                        <p className="text-[10px] text-[#66736D] font-mono">/resources/articles/{art.slug}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeRelatedArticle(art.id)}
                        className="p-1.5 text-[#66736D] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Remove Article"
                        aria-label="Remove related article"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Search & Add New Related Article */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-[#12372A]">Search & Add Articles</Label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#66736D] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Type to search published publications..."
                  value={articleSearchQuery}
                  onChange={(e) => handleSearchArticles(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-[#D9E1DC] bg-[#F7F4EC]/30 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#1F7A5C]"
                />
                {isSearchingArticles && (
                  <Loader2 className="w-3.5 h-3.5 text-[#1F7A5C] animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
                )}
              </div>

              {/* Search dropdown results */}
              {searchResults.length > 0 && (
                <div className="border border-[#D9E1DC] rounded-2xl bg-white shadow-lg overflow-hidden max-h-52 overflow-y-auto divide-y divide-[#D9E1DC]/60">
                  {searchResults.map((result) => {
                    const isAlreadySelected = selectedRelatedArticles.some((a) => a.id === result.id)
                    return (
                      <div
                        key={result.id}
                        className="p-3 flex items-center justify-between hover:bg-[#F7F4EC] transition-colors text-xs"
                      >
                        <div className="min-w-0 pr-3">
                          <p className="font-bold text-[#12372A] truncate">{result.title}</p>
                          <p className="text-[10px] text-[#66736D] font-mono">/resources/articles/{result.slug}</p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={isAlreadySelected}
                          onClick={() => addRelatedArticle(result)}
                          className="h-7 text-xs font-bold rounded-lg shrink-0"
                        >
                          {isAlreadySelected ? 'Selected' : '+ Add'}
                        </Button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Section 6: In-Article Call to Action (CTA) */}
          <div className="bg-white rounded-3xl shadow-xs border border-[#D9E1DC] p-6 md:p-8 space-y-6">
            <div className="border-b border-[#D9E1DC]/80 pb-3">
              <h2 className="text-xs font-bold text-[#D6A84F] uppercase tracking-wider">
                In-Article Call to Action (CTA Banner)
              </h2>
              <p className="text-[11px] text-[#66736D] mt-0.5">
                Displays a prominent conversion banner near the conclusion of the article.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="ctaHeading" className="text-xs font-bold text-[#12372A]">
                  CTA Heading
                </Label>
                <Input
                  id="ctaHeading"
                  value={ctaHeading}
                  onChange={(e) => {
                    markDirty()
                    setCtaHeading(e.target.value)
                  }}
                  placeholder="e.g. Need Help Navigating Labour Law Compliance for Your Factory?"
                  className="rounded-xl border-[#D9E1DC] text-xs"
                />
              </div>

              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="ctaDescription" className="text-xs font-bold text-[#12372A]">
                  CTA Description
                </Label>
                <Textarea
                  id="ctaDescription"
                  value={ctaDescription}
                  onChange={(e) => {
                    markDirty()
                    setCtaDescription(e.target.value)
                  }}
                  placeholder="Our senior labour consultants conduct comprehensive statutory reviews and risk audits for MSMEs..."
                  rows={2}
                  className="rounded-xl border-[#D9E1DC] text-xs"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ctaPrimaryLabel" className="text-xs font-bold text-[#12372A]">
                  Primary Button Label
                </Label>
                <Input
                  id="ctaPrimaryLabel"
                  value={ctaPrimaryLabel}
                  onChange={(e) => {
                    markDirty()
                    setCtaPrimaryLabel(e.target.value)
                  }}
                  placeholder="e.g. Request Compliance Health Check"
                  className="rounded-xl border-[#D9E1DC] text-xs"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ctaPrimaryUrl" className="text-xs font-bold text-[#12372A]">
                  Primary Button URL
                </Label>
                <Input
                  id="ctaPrimaryUrl"
                  value={ctaPrimaryUrl}
                  onChange={(e) => {
                    markDirty()
                    setCtaPrimaryUrl(e.target.value)
                  }}
                  placeholder="/compliance-health-check"
                  className="rounded-xl border-[#D9E1DC] text-xs font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ctaSecondaryLabel" className="text-xs font-bold text-[#12372A]">
                  Secondary Button Label
                </Label>
                <Input
                  id="ctaSecondaryLabel"
                  value={ctaSecondaryLabel}
                  onChange={(e) => {
                    markDirty()
                    setCtaSecondaryLabel(e.target.value)
                  }}
                  placeholder="e.g. Speak to an Expert"
                  className="rounded-xl border-[#D9E1DC] text-xs"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ctaSecondaryUrl" className="text-xs font-bold text-[#12372A]">
                  Secondary Button URL
                </Label>
                <Input
                  id="ctaSecondaryUrl"
                  value={ctaSecondaryUrl}
                  onChange={(e) => {
                    markDirty()
                    setCtaSecondaryUrl(e.target.value)
                  }}
                  placeholder="/contact"
                  className="rounded-xl border-[#D9E1DC] text-xs font-mono"
                />
              </div>
            </div>

            {/* Visual CTA Card Preview */}
            {(ctaHeading || ctaPrimaryLabel) && (
              <div className="p-6 rounded-2xl bg-[#F7F4EC] border-l-4 border-[#1F7A5C] border-y border-r border-[#D9E1DC] space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#66736D]">
                  Live CTA Banner Preview
                </span>
                <h4 className="text-base font-bold text-[#12372A]">
                  {ctaHeading || 'Ready to review your statutory compliance?'}
                </h4>
                {ctaDescription && <p className="text-xs text-[#66736D] leading-relaxed">{ctaDescription}</p>}
                <div className="flex flex-wrap gap-2.5 pt-2">
                  {ctaPrimaryLabel && (
                    <span className="inline-flex px-4 py-2 text-xs font-bold rounded-xl text-white bg-[#1F7A5C] shadow-2xs">
                      {ctaPrimaryLabel}
                    </span>
                  )}
                  {ctaSecondaryLabel && (
                    <span className="inline-flex px-4 py-2 text-xs font-bold rounded-xl text-[#12372A] bg-white border border-[#D9E1DC] shadow-2xs">
                      {ctaSecondaryLabel}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ================================================== */}
        {/* RIGHT COLUMN: STICKY SIDEBAR (30-35% / 4 cols)     */}
        {/* ================================================== */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          
          {/* Card 1: Publishing & Workflow */}
          <div className="bg-white rounded-3xl shadow-xs border border-[#D9E1DC] p-6 space-y-5">
            <h3 className="text-xs font-bold text-[#D6A84F] uppercase tracking-wider border-b border-[#D9E1DC]/80 pb-2">
              Publishing Workflow
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#12372A]">Current Status</span>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    published
                      ? 'bg-[#1F7A5C]/10 text-[#1F7A5C] border border-[#1F7A5C]/20'
                      : 'bg-[#D6A84F]/15 text-[#9E731E] border border-[#D6A84F]/30'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${published ? 'bg-[#1F7A5C]' : 'bg-[#D6A84F]'}`} />
                  {published ? 'Published Live' : 'Draft Mode'}
                </span>
              </div>

              {/* Author Selection */}
              <div className="space-y-2 pt-2 border-t border-[#D9E1DC]/60">
                <Label htmlFor="author-select" className="text-xs font-bold text-[#12372A]">
                  Assigned Author
                </Label>
                <select
                  id="author-select"
                  value={authorId}
                  onChange={(e) => {
                    markDirty()
                    setAuthorId(e.target.value)
                  }}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-[#D9E1DC] bg-[#F7F4EC]/30 text-[#12372A] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#1F7A5C]"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name || u.email || 'Author'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Timestamp Audit */}
              {isEdit && (
                <div className="text-[11px] text-[#66736D] space-y-1.5 pt-3 border-t border-[#D9E1DC]/60 font-mono">
                  <div className="flex justify-between">
                    <span>Created:</span>
                    <strong className="text-[#12372A]">
                      {new Date(initialData.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Updated:</span>
                    <strong className="text-[#12372A]">
                      {new Date(initialData.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </strong>
                  </div>
                  {initialData.publishedAt && (
                    <div className="flex justify-between">
                      <span>Published:</span>
                      <strong className="text-[#1F7A5C]">
                        {new Date(initialData.publishedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </strong>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Featured Image & Media */}
          <div className="bg-white rounded-3xl shadow-xs border border-[#D9E1DC] p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#D9E1DC]/80 pb-2">
              <h3 className="text-xs font-bold text-[#D6A84F] uppercase tracking-wider">
                Featured Photography
              </h3>
              <span className="text-[10px] text-[#66736D]">16:9 / 1200x630</span>
            </div>

            {/* Preview Box */}
            <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden bg-[#F7F4EC] border border-[#D9E1DC] relative flex items-center justify-center shadow-2xs group">
              {featuredImage ? (
                <>
                  <img
                    src={featuredImage}
                    alt={featuredImageAlt || 'Featured preview'}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setFeaturedImage('')}
                      className="bg-white/90 hover:bg-white text-rose-700 text-xs font-bold rounded-xl"
                    >
                      Remove
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center p-4 text-[#66736D]">
                  <Upload className="w-8 h-8 mx-auto text-[#A2B3AA] mb-1.5" />
                  <p className="text-xs font-medium">No cover image selected</p>
                </div>
              )}
            </div>

            {/* Direct Upload & URL input */}
            <div className="space-y-3">
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageUpload}
                disabled={isUploadingImage}
                className="hidden"
              />

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsMediaPickerOpen(true)}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-[#1F7A5C] hover:bg-[#165B44] text-white rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-white" />
                  <span>Media Library</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingImage}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-[#F7F4EC] hover:bg-[#EDE8DE] text-[#12372A] border border-[#D9E1DC] rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  {isUploadingImage ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin text-[#1F7A5C]" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5 text-[#1F7A5C]" />
                      <span>Upload New</span>
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="featuredImage" className="text-[11px] font-bold text-[#12372A]">
                  Or Paste Image URL
                </Label>
                <Input
                  id="featuredImage"
                  value={featuredImage}
                  onChange={(e) => {
                    markDirty()
                    setFeaturedImage(e.target.value)
                  }}
                  placeholder="https://images.unsplash.com/... or CDN link"
                  className="text-xs rounded-xl border-[#D9E1DC]"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="featuredImageAlt" className="text-[11px] font-bold text-[#12372A]">
                  Image Alt Text (Accessibility & SEO)
                </Label>
                <Input
                  id="featuredImageAlt"
                  value={featuredImageAlt}
                  onChange={(e) => {
                    markDirty()
                    setFeaturedImageAlt(e.target.value)
                  }}
                  placeholder="Describe what is happening in the picture..."
                  className="text-xs rounded-xl border-[#D9E1DC]"
                />
              </div>
            </div>
          </div>

          {/* Card 3: SEO & Social Metadata */}
          <div className="bg-white rounded-3xl shadow-xs border border-[#D9E1DC] p-6 space-y-5">
            <h3 className="text-xs font-bold text-[#D6A84F] uppercase tracking-wider border-b border-[#D9E1DC]/80 pb-2">
              SEO & Social Search Snippet
            </h3>

            {/* Google Search Live Preview */}
            <div className="p-4 bg-[#F7F4EC]/60 border border-[#D9E1DC] rounded-2xl space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#66736D]">
                Google SERP Snippet Preview
              </span>
              <p className="text-xs text-[#1F7A5C] truncate font-mono mt-1">
                https://labouraxis.com/resources/articles/{slug || 'url-slug'}
              </p>
              <p className="text-sm font-bold text-[#12372A] truncate leading-snug">
                {seoTitle || title || 'Article Title | LabourAxis'}
              </p>
              <p className="text-[11px] text-[#66736D] line-clamp-2 leading-relaxed">
                {metaDescription || excerpt || 'Informative summary of statutory requirements and compliance guidelines...'}
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <Label htmlFor="seoTitle" className="font-bold text-[#12372A]">
                    SEO Title Tag
                  </Label>
                  <span className={`text-[10px] font-mono ${seoTitle.length > 60 ? 'text-amber-600 font-bold' : 'text-[#66736D]'}`}>
                    {seoTitle.length} / 60
                  </span>
                </div>
                <Input
                  id="seoTitle"
                  value={seoTitle}
                  onChange={(e) => {
                    markDirty()
                    setSeoTitle(e.target.value)
                  }}
                  placeholder="Defaults to article title..."
                  className="text-xs rounded-xl border-[#D9E1DC]"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <Label htmlFor="metaDescription" className="font-bold text-[#12372A]">
                    Meta Description
                  </Label>
                  <span className={`text-[10px] font-mono ${metaDescription.length > 160 ? 'text-amber-600 font-bold' : 'text-[#66736D]'}`}>
                    {metaDescription.length} / 160
                  </span>
                </div>
                <Textarea
                  id="metaDescription"
                  value={metaDescription}
                  onChange={(e) => {
                    markDirty()
                    setMetaDescription(e.target.value)
                  }}
                  placeholder="Concise summary for search engines..."
                  rows={3}
                  className="text-xs rounded-xl border-[#D9E1DC] leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="canonicalUrl" className="text-xs font-bold text-[#12372A]">
                  Canonical URL (Optional)
                </Label>
                <Input
                  id="canonicalUrl"
                  value={canonicalUrl}
                  onChange={(e) => {
                    markDirty()
                    setCanonicalUrl(e.target.value)
                  }}
                  placeholder="Leave blank for automatic canonical"
                  className="text-xs font-mono rounded-xl border-[#D9E1DC]"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ogImage" className="text-xs font-bold text-[#12372A]">
                  Social (OG) Image Override (Optional)
                </Label>
                <Input
                  id="ogImage"
                  value={ogImage}
                  onChange={(e) => {
                    markDirty()
                    setOgImage(e.target.value)
                  }}
                  placeholder="Overrides featured image on Twitter/LinkedIn"
                  className="text-xs rounded-xl border-[#D9E1DC]"
                />
              </div>
            </div>
          </div>

          {/* Card 4: Danger Zone (Edit Mode Only) */}
          {isEdit && (
            <div className="bg-white rounded-3xl shadow-xs border border-rose-200 p-6 space-y-3">
              <h3 className="text-xs font-bold text-rose-700 uppercase tracking-wider">
                Danger Zone
              </h3>
              <p className="text-xs text-[#66736D] leading-relaxed">
                Permanently deletes this article and removes all its relational links. This action cannot be undone.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeleteModal(true)}
                className="w-full border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-bold py-2"
              >
                <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete Article
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* DELETE CONFIRMATION MODAL                            */}
      {/* ---------------------------------------------------- */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 border border-[#D9E1DC] shadow-2xl animate-in fade-in-50 zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#12372A]">Delete &quot;{title}&quot;?</h3>
              <p className="text-xs text-[#66736D] mt-2 leading-relaxed">
                This action will permanently delete the article record, associated key takeaways, service links, and related references from the database.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="rounded-xl border-[#D9E1DC] text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleDeleteArticle}
                disabled={isDeleting}
                className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Deleting...
                  </>
                ) : (
                  'Yes, Delete Article'
                )}
              </Button>
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
          markDirty()
          setFeaturedImage(media.url)
          if (media.altText && !featuredImageAlt) {
            setFeaturedImageAlt(media.altText)
          }
        }}
      />
    </div>
  )
}
