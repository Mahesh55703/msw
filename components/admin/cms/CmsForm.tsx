'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import TiptapEditor from '@/components/editor/TiptapEditor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createContent, updateContent } from '@/app/actions/cms'
import { ArrowLeft, Plus, Trash2, Eye, ArrowUp, ArrowDown } from 'lucide-react'
import Link from 'next/link'

type CmsFormProps = {
  category: string
  initialData?: any
  users?: { id: string, name: string | null }[]
}

const AVAILABLE_SERVICES = [
  { slug: 'hr-consulting', title: 'HR Consulting' },
  { slug: 'labour-compliance', title: 'Labour & Statutory Compliance' },
  { slug: 'pf-esic-compliance', title: 'PF / ESIC Compliance' },
  { slug: 'payroll-compliance', title: 'Payroll & HR Operations' },
  { slug: 'factory-compliance', title: 'Factory & Industrial Compliance' },
  { slug: 'contract-labour', title: 'Contract Labour Compliance' },
  { slug: 'industrial-relations', title: 'Industrial Relations' }
]

export default function CmsForm({ category, initialData, users = [] }: CmsFormProps) {
  const router = useRouter()
  const isEdit = !!initialData

  const [title, setTitle] = useState(initialData?.title || '')
  const [slug, setSlug] = useState(initialData?.slug || '')
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || '')
  const [content, setContent] = useState(initialData?.content || '')
  const [authorId, setAuthorId] = useState(initialData?.authorId || (users.length > 0 ? users[0].id : ''))
  const [published, setPublished] = useState(initialData?.published || false)
  
  const [featuredImage, setFeaturedImage] = useState(initialData?.featuredImage || '')
  const [featuredImageAlt, setFeaturedImageAlt] = useState(initialData?.featuredImageAlt || '')
  const [ogImage, setOgImage] = useState(initialData?.ogImage || '')
  
  const [seoTitle, setSeoTitle] = useState(initialData?.seoTitle || '')
  const [metaDescription, setMetaDescription] = useState(initialData?.metaDescription || '')
  const [canonicalUrl, setCanonicalUrl] = useState(initialData?.canonicalUrl || '')

  const [ctaHeading, setCtaHeading] = useState(initialData?.ctaHeading || '')
  const [ctaDescription, setCtaDescription] = useState(initialData?.ctaDescription || '')
  const [ctaPrimaryLabel, setCtaPrimaryLabel] = useState(initialData?.ctaPrimaryLabel || '')
  const [ctaPrimaryUrl, setCtaPrimaryUrl] = useState(initialData?.ctaPrimaryUrl || '')
  const [ctaSecondaryLabel, setCtaSecondaryLabel] = useState(initialData?.ctaSecondaryLabel || '')
  const [ctaSecondaryUrl, setCtaSecondaryUrl] = useState(initialData?.ctaSecondaryUrl || '')

  const [keyTakeaways, setKeyTakeaways] = useState<string[]>(
    initialData?.keyTakeaways?.map((t: any) => t.text) || []
  )
  const [relatedServices, setRelatedServices] = useState<string[]>(
    initialData?.relatedServices?.map((s: any) => s.serviceSlug) || []
  )

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [isDirty, setIsDirty] = useState(false)

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

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    markDirty()
    const newTitle = e.target.value
    setTitle(newTitle)
    if (!isEdit) {
      setSlug(newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''))
    }
  }

  const moveTakeaway = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === keyTakeaways.length - 1) return
    markDirty()
    const newArr = [...keyTakeaways]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    const temp = newArr[index]
    newArr[index] = newArr[targetIndex]
    newArr[targetIndex] = temp
    setKeyTakeaways(newArr)
  }

  const toggleService = (slug: string) => {
    markDirty()
    if (relatedServices.includes(slug)) {
      setRelatedServices(relatedServices.filter(s => s !== slug))
    } else {
      setRelatedServices([...relatedServices, slug])
    }
  }

  const handleSubmit = async (e: React.FormEvent, publishState: boolean) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    setPublished(publishState)

    try {
      const payload = {
        title, slug, excerpt, content, category, published: publishState, authorId,
        featuredImage, featuredImageAlt, ogImage,
        seoTitle, metaDescription, canonicalUrl,
        ctaHeading, ctaDescription, ctaPrimaryLabel, ctaPrimaryUrl, ctaSecondaryLabel, ctaSecondaryUrl,
        keyTakeaways: keyTakeaways.filter(t => t.trim()),
        relatedServices
      }

      let result;
      if (isEdit) {
        result = await updateContent(initialData.id, payload)
      } else {
        result = await createContent(payload)
      }
      
      if (result.success) {
        setIsDirty(false)
        router.push(`/admin/${category}`)
        router.refresh()
      } else {
        setError((result as any).error || 'Failed to save content')
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const singularCategory = category.slice(0, -1).replace(/^\w/, c => c.toUpperCase())

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 pb-24 text-slate-800">
      
      {/* Top Action Bar */}
      <div className="flex items-center justify-between gap-4 bg-white p-4 border border-slate-200 rounded-xl shadow-sm sticky top-4 z-50">
        <div className="flex items-center gap-4">
          <Link href={`/admin/${category}`} className="text-slate-500 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold text-slate-900">
            {isEdit ? 'Edit' : 'Create'} {singularCategory}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {isEdit && (
            <Link href={`/resources/${category}/${slug}`} target="_blank">
              <Button type="button" variant="outline" size="sm" className="gap-2">
                <Eye className="w-4 h-4" /> Preview
              </Button>
            </Link>
          )}
          <Button type="button" variant="secondary" onClick={(e) => handleSubmit(e, false)} disabled={isSubmitting}>
            Save Draft
          </Button>
          <Button type="button" onClick={(e) => handleSubmit(e, true)} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : (isEdit && published ? 'Save Changes' : 'Publish')}
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: MAIN CONTENT */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* Basic Info */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Basic Information</h2>
            
            <div className="space-y-2">
              <Label htmlFor="title" className="text-base font-semibold">Title</Label>
              <Input id="title" value={title} onChange={handleTitleChange} placeholder={`Enter ${singularCategory.toLowerCase()} title...`} className="text-lg font-medium" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="slug" className="font-semibold">URL Slug</Label>
                <div className="flex items-center gap-2">
                  <Input id="slug" value={slug} onChange={e => { markDirty(); setSlug(e.target.value) }} placeholder="url-slug" className="font-mono text-sm" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="author" className="font-semibold">Author</Label>
                <select 
                  id="author" 
                  value={authorId} 
                  onChange={e => { markDirty(); setAuthorId(e.target.value) }}
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="" disabled>Select author...</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name || 'Unknown User'}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt" className="font-semibold">Excerpt</Label>
              <Textarea id="excerpt" value={excerpt} onChange={e => { markDirty(); setExcerpt(e.target.value) }} placeholder="Brief summary for listings and SEO fallback..." rows={3} />
            </div>
          </div>

          {/* Content Editor */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Content</h2>
            <div className="min-h-[500px]">
              <TiptapEditor content={content} onChange={(html) => { markDirty(); setContent(html) }} />
            </div>
          </div>

          {/* Key Takeaways */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-4">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Key Takeaways</h2>
              <Button type="button" variant="outline" size="sm" onClick={() => { markDirty(); setKeyTakeaways([...keyTakeaways, '']) }} className="gap-1 h-8">
                <Plus className="w-4 h-4" /> Add
              </Button>
            </div>
            
            {keyTakeaways.length === 0 ? (
              <p className="text-sm text-slate-500 italic">No key takeaways added. (They will appear in a highlighted box at the top of the article)</p>
            ) : (
              <div className="space-y-3">
                {keyTakeaways.map((takeaway, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <span className="mt-2 text-slate-400 font-mono text-sm w-4">{index + 1}.</span>
                    <Input value={takeaway} onChange={e => { markDirty(); const arr = [...keyTakeaways]; arr[index] = e.target.value; setKeyTakeaways(arr) }} placeholder={`Takeaway ${index + 1}`} />
                    <div className="flex flex-col gap-1 shrink-0">
                      <div className="flex gap-1">
                        <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveTakeaway(index, 'up')} disabled={index === 0}><ArrowUp className="w-3 h-3" /></Button>
                        <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveTakeaway(index, 'down')} disabled={index === keyTakeaways.length - 1}><ArrowDown className="w-3 h-3" /></Button>
                        <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => { markDirty(); setKeyTakeaways(keyTakeaways.filter((_, i) => i !== index)) }}><Trash2 className="w-3 h-3" /></Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Related Services */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Related Services</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {AVAILABLE_SERVICES.map(service => {
                const isSelected = relatedServices.includes(service.slug)
                return (
                  <label key={service.slug} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${isSelected ? 'bg-blue-50 border-blue-200' : 'hover:bg-slate-50 border-slate-200'}`}>
                    <input type="checkbox" className="mt-1" checked={isSelected} onChange={() => toggleService(service.slug)} />
                    <span className={`text-sm font-medium ${isSelected ? 'text-blue-900' : 'text-slate-700'}`}>{service.title}</span>
                  </label>
                )
              })}
            </div>
          </div>

          {/* CTA Configuration */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Call to Action (CTA)</h2>
            <p className="text-sm text-slate-500 -mt-2 mb-4">Displays an inline promotional banner at the bottom of the article.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="ctaHeading" className="font-semibold">Heading</Label>
                <Input id="ctaHeading" value={ctaHeading} onChange={e => { markDirty(); setCtaHeading(e.target.value) }} placeholder="e.g. Need help with HR or labour compliance?" />
              </div>
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="ctaDescription" className="font-semibold">Description</Label>
                <Textarea id="ctaDescription" value={ctaDescription} onChange={e => { markDirty(); setCtaDescription(e.target.value) }} placeholder="Short descriptive text..." rows={2} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ctaPrimaryLabel" className="font-semibold">Primary Button Label</Label>
                <Input id="ctaPrimaryLabel" value={ctaPrimaryLabel} onChange={e => { markDirty(); setCtaPrimaryLabel(e.target.value) }} placeholder="e.g. Request a Health Check" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ctaPrimaryUrl" className="font-semibold">Primary Button URL</Label>
                <Input id="ctaPrimaryUrl" value={ctaPrimaryUrl} onChange={e => { markDirty(); setCtaPrimaryUrl(e.target.value) }} placeholder="/compliance-health-check" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ctaSecondaryLabel" className="font-semibold">Secondary Button Label</Label>
                <Input id="ctaSecondaryLabel" value={ctaSecondaryLabel} onChange={e => { markDirty(); setCtaSecondaryLabel(e.target.value) }} placeholder="e.g. Contact Us" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ctaSecondaryUrl" className="font-semibold">Secondary Button URL</Label>
                <Input id="ctaSecondaryUrl" value={ctaSecondaryUrl} onChange={e => { markDirty(); setCtaSecondaryUrl(e.target.value) }} placeholder="/contact" />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SIDEBAR */}
        <div className="space-y-8">
          
          {/* Publishing State */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">Publishing</h2>
            <div className="flex items-center gap-3 py-2">
              <div className={`w-3 h-3 rounded-full ${published ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
              <span className="font-medium">{published ? 'Published' : 'Draft'}</span>
            </div>
            {isEdit && (
              <div className="text-xs text-slate-500 space-y-1 mt-4 pt-4 border-t border-slate-100">
                <p>Created: {new Date(initialData.createdAt).toLocaleDateString('en-GB')}</p>
                <p>Updated: {new Date(initialData.updatedAt).toLocaleDateString('en-GB')}</p>
                {initialData.publishedAt && <p>Published: {new Date(initialData.publishedAt).toLocaleDateString('en-GB')}</p>}
              </div>
            )}
          </div>

          {/* Featured Image */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">Featured Image</h2>
            <div className="space-y-4">
              <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden border border-slate-200 relative flex items-center justify-center text-slate-400 text-sm font-medium">
                {featuredImage ? (
                  <img src={featuredImage} alt="Featured preview" className="object-cover w-full h-full" />
                ) : (
                  <span>No image selected</span>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="featuredImage" className="text-xs font-semibold text-slate-500">Image URL (Recommended 1200x630)</Label>
                <Input id="featuredImage" value={featuredImage} onChange={e => { markDirty(); setFeaturedImage(e.target.value) }} placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="featuredImageAlt" className="text-xs font-semibold text-slate-500">Alt Text</Label>
                <Input id="featuredImageAlt" value={featuredImageAlt} onChange={e => { markDirty(); setFeaturedImageAlt(e.target.value) }} placeholder="Describe the image..." />
              </div>
            </div>
          </div>

          {/* SEO Metadata */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">SEO Settings</h2>
            
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-1 shadow-sm">
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2">Google Preview</p>
              <p className="text-blue-800 font-medium text-lg truncate">{seoTitle || title || 'Your Article Title'}</p>
              <p className="text-emerald-700 text-sm truncate">labouraxis.com/resources/{category}/{slug || 'url-slug'}</p>
              <p className="text-slate-600 text-sm line-clamp-2 leading-snug">{metaDescription || excerpt || 'Your article description will appear here in search results...'}</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="seoTitle" className="font-semibold">SEO Title</Label>
                <span className="text-xs text-slate-400">{seoTitle.length} / 60</span>
              </div>
              <Input id="seoTitle" value={seoTitle} onChange={e => { markDirty(); setSeoTitle(e.target.value) }} placeholder="Overrides main title for SEO..." />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="metaDescription" className="font-semibold">Meta Description</Label>
                <span className="text-xs text-slate-400">{metaDescription.length} / 160</span>
              </div>
              <Textarea id="metaDescription" value={metaDescription} onChange={e => { markDirty(); setMetaDescription(e.target.value) }} placeholder="Optimal description for search..." rows={3} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="canonicalUrl" className="font-semibold">Canonical URL</Label>
              <Input id="canonicalUrl" value={canonicalUrl} onChange={e => { markDirty(); setCanonicalUrl(e.target.value) }} placeholder="Leave blank for default" className="font-mono text-sm" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ogImage" className="font-semibold">OpenGraph Image URL</Label>
              <Input id="ogImage" value={ogImage} onChange={e => { markDirty(); setOgImage(e.target.value) }} placeholder="Overrides featured image on social" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
