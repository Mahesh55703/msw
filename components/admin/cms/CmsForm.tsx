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
    <div className="max-w-[1400px] mx-auto space-y-6 pb-24 text-[#202522]">
      
      {/* Top Action Bar */}
      <div className="flex items-center justify-between gap-4 bg-white p-4 border border-[#D9E1DC] rounded-2xl shadow-xs sticky top-4 z-50">
        <div className="flex items-center gap-3">
          <Link href={`/admin/${category}`} className="text-[#66736D] hover:text-[#12372A] p-1.5 rounded-lg hover:bg-[#F7F4EC] transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-bold text-[#12372A]">
            {isEdit ? 'Edit' : 'Create'} {singularCategory}
          </h1>
        </div>
        <div className="flex items-center gap-2.5">
          {isEdit && (
            <Link href={`/resources/${category}/${slug}`} target="_blank">
              <Button type="button" variant="outline" size="sm" className="gap-2 border-[#D9E1DC] text-[#12372A] hover:bg-[#F7F4EC] rounded-xl text-xs font-bold">
                <Eye className="w-3.5 h-3.5" /> Preview Live
              </Button>
            </Link>
          )}
          <Button type="button" variant="secondary" onClick={(e) => handleSubmit(e, false)} disabled={isSubmitting} className="bg-[#F7F4EC] hover:bg-[#EDE8DE] text-[#12372A] border border-[#D9E1DC] rounded-xl text-xs font-bold">
            Save Draft
          </Button>
          <Button type="button" onClick={(e) => handleSubmit(e, true)} disabled={isSubmitting} className="bg-[#1F7A5C] hover:bg-[#165B44] text-white rounded-xl text-xs font-bold shadow-xs">
            {isSubmitting ? 'Saving...' : (isEdit && published ? 'Save Changes' : 'Publish Live')}
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 text-rose-700 rounded-xl text-xs font-semibold border border-rose-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: MAIN CONTENT */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* Basic Info */}
          <div className="bg-white rounded-2xl shadow-xs border border-[#D9E1DC] p-6 space-y-6">
            <h2 className="text-xs font-bold text-[#D6A84F] uppercase tracking-wider mb-4 border-b border-[#D9E1DC]/80 pb-2">Basic Information</h2>
            
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-bold text-[#12372A]">Title</Label>
              <Input id="title" value={title} onChange={handleTitleChange} placeholder={`Enter ${singularCategory.toLowerCase()} title...`} className="text-base font-medium rounded-xl border-[#D9E1DC] focus:ring-[#1F7A5C]" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="slug" className="text-xs font-bold text-[#12372A]">URL Slug</Label>
                <div className="flex items-center gap-2">
                  <Input id="slug" value={slug} onChange={e => { markDirty(); setSlug(e.target.value) }} placeholder="url-slug" className="font-mono text-xs rounded-xl border-[#D9E1DC]" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="author" className="text-xs font-bold text-[#12372A]">Author</Label>
                <select 
                  id="author" 
                  value={authorId} 
                  onChange={e => { markDirty(); setAuthorId(e.target.value) }}
                  className="flex h-10 w-full rounded-xl border border-[#D9E1DC] bg-white px-3 py-2 text-xs font-medium text-[#202522] focus:outline-none focus:ring-2 focus:ring-[#1F7A5C]"
                >
                  <option value="" disabled>Select author...</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name || 'Unknown User'}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt" className="text-xs font-bold text-[#12372A]">Excerpt</Label>
              <Textarea id="excerpt" value={excerpt} onChange={e => { markDirty(); setExcerpt(e.target.value) }} placeholder="Brief summary for listings and search engines..." rows={3} className="rounded-xl border-[#D9E1DC] text-xs" />
            </div>
          </div>

          {/* Content Editor */}
          <div className="bg-white rounded-2xl shadow-xs border border-[#D9E1DC] p-6 space-y-4">
            <h2 className="text-xs font-bold text-[#D6A84F] uppercase tracking-wider mb-4 border-b border-[#D9E1DC]/80 pb-2">Content Editor</h2>
            <div className="min-h-[500px]">
              <TiptapEditor content={content} onChange={(html) => { markDirty(); setContent(html) }} />
            </div>
          </div>

          {/* Key Takeaways */}
          <div className="bg-white rounded-2xl shadow-xs border border-[#D9E1DC] p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#D9E1DC]/80 pb-2 mb-4">
              <h2 className="text-xs font-bold text-[#D6A84F] uppercase tracking-wider">Key Takeaways</h2>
              <Button type="button" variant="outline" size="sm" onClick={() => { markDirty(); setKeyTakeaways([...keyTakeaways, '']) }} className="gap-1 h-8 rounded-xl border-[#D9E1DC] text-[#12372A] hover:bg-[#F7F4EC] text-xs font-bold">
                <Plus className="w-3.5 h-3.5 text-[#1F7A5C]" /> Add Point
              </Button>
            </div>
            
            {keyTakeaways.length === 0 ? (
              <p className="text-xs text-[#66736D] italic">No key takeaways added. (They will appear in a highlighted statutory overview box)</p>
            ) : (
              <div className="space-y-3">
                {keyTakeaways.map((takeaway, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <span className="mt-2 text-[#66736D] font-mono text-xs w-4">{index + 1}.</span>
                    <Input value={takeaway} onChange={e => { markDirty(); const arr = [...keyTakeaways]; arr[index] = e.target.value; setKeyTakeaways(arr) }} placeholder={`Takeaway ${index + 1}`} className="rounded-xl border-[#D9E1DC] text-xs" />
                    <div className="flex flex-col gap-1 shrink-0">
                      <div className="flex gap-1">
                        <Button type="button" variant="ghost" size="icon" className="h-6 w-6 rounded-lg text-[#66736D] hover:bg-[#F7F4EC]" onClick={() => moveTakeaway(index, 'up')} disabled={index === 0}><ArrowUp className="w-3 h-3" /></Button>
                        <Button type="button" variant="ghost" size="icon" className="h-6 w-6 rounded-lg text-[#66736D] hover:bg-[#F7F4EC]" onClick={() => moveTakeaway(index, 'down')} disabled={index === keyTakeaways.length - 1}><ArrowDown className="w-3 h-3" /></Button>
                        <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg" onClick={() => { markDirty(); setKeyTakeaways(keyTakeaways.filter((_, i) => i !== index)) }}><Trash2 className="w-3 h-3" /></Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Related Services */}
          <div className="bg-white rounded-2xl shadow-xs border border-[#D9E1DC] p-6 space-y-4">
            <h2 className="text-xs font-bold text-[#D6A84F] uppercase tracking-wider mb-4 border-b border-[#D9E1DC]/80 pb-2">Related Practice Areas</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {AVAILABLE_SERVICES.map(service => {
                const isSelected = relatedServices.includes(service.slug)
                return (
                  <label key={service.slug} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${isSelected ? 'bg-[#1F7A5C]/10 border-[#1F7A5C]/30' : 'hover:bg-[#F7F4EC] border-[#D9E1DC]'}`}>
                    <input type="checkbox" className="mt-1 rounded text-[#1F7A5C] focus:ring-[#1F7A5C]" checked={isSelected} onChange={() => toggleService(service.slug)} />
                    <span className={`text-xs font-bold ${isSelected ? 'text-[#12372A]' : 'text-[#66736D]'}`}>{service.title}</span>
                  </label>
                )
              })}
            </div>
          </div>

          {/* CTA Configuration */}
          <div className="bg-white rounded-2xl shadow-xs border border-[#D9E1DC] p-6 space-y-6">
            <h2 className="text-xs font-bold text-[#D6A84F] uppercase tracking-wider mb-2 border-b border-[#D9E1DC]/80 pb-2">Call to Action (CTA)</h2>
            <p className="text-xs text-[#66736D] -mt-4 mb-4">Displays an inline promotional banner at the bottom of the resource.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="ctaHeading" className="text-xs font-bold text-[#12372A]">Heading</Label>
                <Input id="ctaHeading" value={ctaHeading} onChange={e => { markDirty(); setCtaHeading(e.target.value) }} placeholder="e.g. Need help with HR or labour compliance?" className="rounded-xl border-[#D9E1DC] text-xs" />
              </div>
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="ctaDescription" className="text-xs font-bold text-[#12372A]">Description</Label>
                <Textarea id="ctaDescription" value={ctaDescription} onChange={e => { markDirty(); setCtaDescription(e.target.value) }} placeholder="Short descriptive text..." rows={2} className="rounded-xl border-[#D9E1DC] text-xs" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ctaPrimaryLabel" className="text-xs font-bold text-[#12372A]">Primary Button Label</Label>
                <Input id="ctaPrimaryLabel" value={ctaPrimaryLabel} onChange={e => { markDirty(); setCtaPrimaryLabel(e.target.value) }} placeholder="e.g. Request a Health Check" className="rounded-xl border-[#D9E1DC] text-xs" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ctaPrimaryUrl" className="text-xs font-bold text-[#12372A]">Primary Button URL</Label>
                <Input id="ctaPrimaryUrl" value={ctaPrimaryUrl} onChange={e => { markDirty(); setCtaPrimaryUrl(e.target.value) }} placeholder="/compliance-health-check" className="rounded-xl border-[#D9E1DC] text-xs" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ctaSecondaryLabel" className="text-xs font-bold text-[#12372A]">Secondary Button Label</Label>
                <Input id="ctaSecondaryLabel" value={ctaSecondaryLabel} onChange={e => { markDirty(); setCtaSecondaryLabel(e.target.value) }} placeholder="e.g. Contact Us" className="rounded-xl border-[#D9E1DC] text-xs" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ctaSecondaryUrl" className="text-xs font-bold text-[#12372A]">Secondary Button URL</Label>
                <Input id="ctaSecondaryUrl" value={ctaSecondaryUrl} onChange={e => { markDirty(); setCtaSecondaryUrl(e.target.value) }} placeholder="/contact" className="rounded-xl border-[#D9E1DC] text-xs" />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SIDEBAR */}
        <div className="space-y-8">
          
          {/* Publishing State */}
          <div className="bg-white rounded-2xl shadow-xs border border-[#D9E1DC] p-6 space-y-4">
            <h2 className="text-xs font-bold text-[#D6A84F] uppercase tracking-wider border-b border-[#D9E1DC]/80 pb-2">Publication Status</h2>
            <div className="flex items-center gap-3 py-1">
              <div className={`w-3 h-3 rounded-full ${published ? 'bg-[#1F7A5C]' : 'bg-[#D6A84F]'}`}></div>
              <span className="font-bold text-xs text-[#12372A]">{published ? 'Published Live' : 'Draft Mode'}</span>
            </div>
            {isEdit && (
              <div className="text-[11px] text-[#66736D] space-y-1 mt-4 pt-4 border-t border-[#D9E1DC]/80">
                <p>Created: {new Date(initialData.createdAt).toLocaleDateString('en-GB')}</p>
                <p>Updated: {new Date(initialData.updatedAt).toLocaleDateString('en-GB')}</p>
                {initialData.publishedAt && <p>Published: {new Date(initialData.publishedAt).toLocaleDateString('en-GB')}</p>}
              </div>
            )}
          </div>

          {/* Featured Image */}
          <div className="bg-white rounded-2xl shadow-xs border border-[#D9E1DC] p-6 space-y-6">
            <h2 className="text-xs font-bold text-[#D6A84F] uppercase tracking-wider border-b border-[#D9E1DC]/80 pb-2">Cover Photography</h2>
            <div className="space-y-4">
              <div className="aspect-video bg-[#F7F4EC] rounded-xl overflow-hidden border border-[#D9E1DC] relative flex items-center justify-center text-[#66736D] text-xs font-medium">
                {featuredImage ? (
                  <img src={featuredImage} alt="Featured preview" className="object-cover w-full h-full" />
                ) : (
                  <span>No image selected</span>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="featuredImage" className="text-xs font-bold text-[#12372A]">Image URL (1200x630)</Label>
                <Input id="featuredImage" value={featuredImage} onChange={e => { markDirty(); setFeaturedImage(e.target.value) }} placeholder="https://..." className="rounded-xl border-[#D9E1DC] text-xs" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="featuredImageAlt" className="text-xs font-bold text-[#12372A]">Alt Text</Label>
                <Input id="featuredImageAlt" value={featuredImageAlt} onChange={e => { markDirty(); setFeaturedImageAlt(e.target.value) }} placeholder="Describe the image..." className="rounded-xl border-[#D9E1DC] text-xs" />
              </div>
            </div>
          </div>

          {/* SEO Metadata */}
          <div className="bg-white rounded-2xl shadow-xs border border-[#D9E1DC] p-6 space-y-6">
            <h2 className="text-xs font-bold text-[#D6A84F] uppercase tracking-wider border-b border-[#D9E1DC]/80 pb-2">Search Preview & Meta</h2>
            
            <div className="bg-[#F7F4EC] border border-[#D9E1DC] rounded-xl p-4 space-y-1">
              <p className="text-[10px] text-[#66736D] uppercase font-bold tracking-wider mb-2">Search Snippet</p>
              <p className="text-[#12372A] font-bold text-sm truncate">{seoTitle || title || 'Resource Title'}</p>
              <p className="text-[#1F7A5C] text-xs truncate">labouraxis.com/resources/{category}/{slug || 'url-slug'}</p>
              <p className="text-[#66736D] text-xs line-clamp-2 leading-relaxed">{metaDescription || excerpt || 'Search snippet summary...'}</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="seoTitle" className="text-xs font-bold text-[#12372A]">SEO Title</Label>
                <span className="text-[10px] text-[#66736D]">{seoTitle.length} / 60</span>
              </div>
              <Input id="seoTitle" value={seoTitle} onChange={e => { markDirty(); setSeoTitle(e.target.value) }} placeholder="Overrides main title for SEO..." className="rounded-xl border-[#D9E1DC] text-xs" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="metaDescription" className="text-xs font-bold text-[#12372A]">Meta Description</Label>
                <span className="text-[10px] text-[#66736D]">{metaDescription.length} / 160</span>
              </div>
              <Textarea id="metaDescription" value={metaDescription} onChange={e => { markDirty(); setMetaDescription(e.target.value) }} placeholder="Optimal description for search..." rows={3} className="rounded-xl border-[#D9E1DC] text-xs" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="canonicalUrl" className="text-xs font-bold text-[#12372A]">Canonical URL</Label>
              <Input id="canonicalUrl" value={canonicalUrl} onChange={e => { markDirty(); setCanonicalUrl(e.target.value) }} placeholder="Leave blank for default" className="font-mono text-xs rounded-xl border-[#D9E1DC]" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ogImage" className="text-xs font-bold text-[#12372A]">Social Share Image</Label>
              <Input id="ogImage" value={ogImage} onChange={e => { markDirty(); setOgImage(e.target.value) }} placeholder="Overrides featured image on social" className="rounded-xl border-[#D9E1DC] text-xs" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
