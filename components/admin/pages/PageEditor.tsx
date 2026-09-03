'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Save,
  Globe,
  RotateCcw,
  Eye,
  Plus,
  GripVertical,
  Trash2,
  Copy,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldAlert,
  LayoutTemplate,
  Pencil
} from 'lucide-react'
import { format } from 'date-fns'
import type { AdminPageDetail, PageRevisionDetail, PageSectionDetail, PageRevisionSummary } from '@/lib/db/pages'
import { SectionType } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { MediaPickerModal } from '@/components/admin/media/MediaPickerModal'
import { SectionEditor } from '@/components/admin/pages/SectionEditor'

import {
  createDraftRevision,
  updateRevisionSeo,
  addSection,
  updateSectionContent,
  toggleSectionVisibility,
  deleteSection,
  reorderSections,
  publishPageRevision,
  rollbackPageToRevision,
} from '@/app/actions/pages'

const PROTECTED_PAGES = new Set([
  'HOME', 'ABOUT', 'CONTACT', 'SERVICES', 'INDUSTRIES',
  'RESOURCES', 'TEAM', 'CAREERS', 'COMPLIANCE_HEALTH_CHECK'
])

interface PageEditorProps {
  page: AdminPageDetail
  draftRevision: PageRevisionDetail | null
  sessionRole: string
}

export default function PageEditor({ page, draftRevision, sessionRole }: PageEditorProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
  // The active revision we are viewing/editing.
  // If there's a draft, we view that. Otherwise, we view the published revision.
  const initialRevision = draftRevision || page.publishedRevision
  
  const [activeRevision, setActiveRevision] = useState<PageRevisionDetail | null>(initialRevision)
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false)
  const [isRollbackModalOpen, setIsRollbackModalOpen] = useState(false)
  const [rollbackTargetId, setRollbackTargetId] = useState<string | null>(null)
  
  // SEO State (tracked separately for easy saving)
  const [seoTitle, setSeoTitle] = useState(initialRevision?.seoTitle || '')
  const [metaDescription, setMetaDescription] = useState(initialRevision?.metaDescription || '')
  const [canonicalUrl, setCanonicalUrl] = useState(initialRevision?.canonicalUrl || '')
  const [ogImageId, setOgImageId] = useState(initialRevision?.ogImageId || '')
  const [ogImageUrl, setOgImageUrl] = useState(initialRevision?.ogImage?.url || '')
  
  const [isSeoPickerOpen, setIsSeoPickerOpen] = useState(false)
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null)
  
  // Local saving states
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  
  const isProtected = PROTECTED_PAGES.has(page.key)
  const hasDraft = !!draftRevision
  
  useEffect(() => {
    const current = draftRevision || page.publishedRevision
    setActiveRevision(current)
    setSeoTitle(current?.seoTitle || '')
    setMetaDescription(current?.metaDescription || '')
    setCanonicalUrl(current?.canonicalUrl || '')
    setOgImageId(current?.ogImageId || '')
    setOgImageUrl(current?.ogImage?.url || '')
  }, [draftRevision, page.publishedRevision])

  // Helpers
  const canPublish = sessionRole === 'SUPER_ADMIN' || sessionRole === 'ADMIN'
  const isLive = activeRevision?.id === page.publishedRevisionId
  
  // We need to ensure we have a draft revision before making edits.
  // If we don't have one, we create one first.
  const ensureDraftRevision = async (): Promise<string | null> => {
    if (activeRevision && activeRevision.id !== page.publishedRevisionId) {
      return activeRevision.id
    }
    
    setIsSavingDraft(true)
    try {
      const result = await createDraftRevision(page.id)
      if (result.success) {
        // We must refresh the page to get the newly created draft injected via server components
        startTransition(() => {
          router.refresh()
        })
        return result.data.revisionId
      } else {
        alert(result.error)
        return null
      }
    } catch (e) {
      console.error(e)
      alert('Failed to create draft revision')
      return null
    } finally {
      setIsSavingDraft(false)
    }
  }

  const handleSaveSeo = async () => {
    const revId = await ensureDraftRevision()
    if (!revId) return
    
    setIsSavingDraft(true)
    try {
      const result = await updateRevisionSeo(revId, {
        seoTitle: seoTitle || null,
        metaDescription: metaDescription || null,
        canonicalUrl: canonicalUrl || null,
        ogImageId: ogImageId || null,
      })
      if (result.success) {
        startTransition(() => {
          router.refresh()
        })
      } else {
        alert(result.error)
      }
    } finally {
      setIsSavingDraft(false)
    }
  }

  const handlePublish = async () => {
    if (!activeRevision) return
    setIsPublishing(true)
    try {
      const result = await publishPageRevision(page.id, activeRevision.id)
      if (result.success) {
        setIsPublishModalOpen(false)
        startTransition(() => {
          router.refresh()
        })
      } else {
        alert(result.error)
      }
    } finally {
      setIsPublishing(false)
    }
  }
  
  const handleRollback = async () => {
    if (!rollbackTargetId) return
    setIsPublishing(true)
    try {
      const result = await rollbackPageToRevision(page.id, rollbackTargetId)
      if (result.success) {
        setIsRollbackModalOpen(false)
        startTransition(() => {
          router.refresh()
        })
      } else {
        alert(result.error)
      }
    } finally {
      setIsPublishing(false)
    }
  }

  const handleAddSection = async (type: SectionType) => {
    const revId = await ensureDraftRevision()
    if (!revId) return
    startTransition(async () => {
      const res = await addSection(revId, {
        type,
        sortOrder: activeRevision!.sections.length,
        isVisible: true,
        content: { heading: `New ${type.replace('_', ' ')}` }
      })
      if (res.success) {
        setEditingSectionId(res.data.sectionId)
        router.refresh()
      } else {
        alert(res.error)
      }
    })
  }

  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm('Are you sure you want to delete this section?')) return
    const revId = await ensureDraftRevision()
    if (!revId) return
    startTransition(async () => {
      await deleteSection(sectionId)
      router.refresh()
    })
  }

  const handleToggleVisibility = async (sectionId: string) => {
    const revId = await ensureDraftRevision()
    if (!revId) return
    startTransition(async () => {
      await toggleSectionVisibility(sectionId)
      router.refresh()
    })
  }

  const handleMoveSection = async (sectionId: string, direction: 'up' | 'down') => {
    const revId = await ensureDraftRevision()
    if (!revId) return
    const currentSections = [...activeRevision!.sections].sort((a, b) => a.sortOrder - b.sortOrder)
    const idx = currentSections.findIndex(s => s.id === sectionId)
    if (direction === 'up' && idx > 0) {
      // Swap sort orders
      const target = currentSections[idx - 1]
      startTransition(async () => {
        await reorderSections(revId, [
          { id: currentSections[idx].id, sortOrder: target.sortOrder },
          { id: target.id, sortOrder: currentSections[idx].sortOrder }
        ])
        router.refresh()
      })
    } else if (direction === 'down' && idx < currentSections.length - 1) {
      const target = currentSections[idx + 1]
      startTransition(async () => {
        await reorderSections(revId, [
          { id: currentSections[idx].id, sortOrder: target.sortOrder },
          { id: target.id, sortOrder: currentSections[idx].sortOrder }
        ])
        router.refresh()
      })
    }
  }

  if (!activeRevision) {
    return <div>No revision found to edit.</div>
  }

  return (
    <div className="space-y-6 pb-20">
      {/* HEADER */}
      <div className="bg-[#12372A] p-6 rounded-3xl shadow-sm text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-[#D6A84F] uppercase tracking-wider">
              Page Editor
            </span>
            {isProtected && (
              <span className="flex items-center gap-1 text-[9px] font-bold bg-[#1F7A5C]/30 text-[#A2B3AA] px-1.5 py-0.5 rounded uppercase">
                <ShieldAlert className="w-3 h-3" /> System Route
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            {page.key}
          </h1>
          <p className="text-[#A2B3AA] text-xs font-mono mt-1">{page.path}</p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Status Indicator */}
          {hasDraft ? (
            <div className="bg-[#D6A84F]/20 border border-[#D6A84F]/30 text-[#D6A84F] px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              Unpublished Draft (v{activeRevision.version})
            </div>
          ) : (
            <div className="bg-[#1F7A5C]/20 border border-[#1F7A5C]/30 text-[#1F7A5C] px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Published (v{activeRevision.version})
            </div>
          )}
        </div>
      </div>

      {/* TOP ACTIONS */}
      <div className="bg-white p-3 rounded-2xl border border-[#D9E1DC] shadow-xs flex items-center justify-between sticky top-4 z-40">
        <div className="text-xs font-semibold text-[#66736D] px-2 flex items-center gap-2">
          {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1F7A5C]" />}
          {isSavingDraft ? 'Saving draft...' : 'Editor Ready'}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={
              activeRevision && activeRevision.id !== page.publishedRevisionId
                ? `${page.path}?preview=${activeRevision.id}`
                : draftRevision
                ? `${page.path}?preview=${draftRevision.id}`
                : page.path
            }
            target="_blank"
            className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-bold rounded-lg text-[#12372A] bg-[#F7F4EC] hover:bg-[#D9E1DC] transition-colors"
          >
            <Eye className="w-3.5 h-3.5 mr-1.5" />
            Live Preview
          </Link>
          
          <Button
            onClick={handleSaveSeo}
            disabled={isSavingDraft || isPending}
            variant="outline"
            className="text-xs font-bold rounded-lg h-8"
          >
            <Save className="w-3.5 h-3.5 mr-1.5" />
            Save Draft
          </Button>

          {canPublish && hasDraft && (
            <Button
              onClick={() => setIsPublishModalOpen(true)}
              disabled={isPublishing || isPending}
              className="text-xs font-bold rounded-lg bg-[#1F7A5C] hover:bg-[#165B44] text-white h-8"
            >
              <Globe className="w-3.5 h-3.5 mr-1.5" />
              Publish Changes
            </Button>
          )}
        </div>
      </div>

      {/* TWO COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* MAIN CONTENT (SECTIONS) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-[#D9E1DC] shadow-xs p-5 md:p-8">
            <h2 className="text-lg font-bold text-[#12372A] mb-6 flex items-center gap-2">
              <LayoutTemplate className="w-5 h-5 text-[#1F7A5C]" />
              Page Sections
            </h2>
            
            <div className="space-y-4">
              {activeRevision.sections.map((section, idx) => {
                const isFirst = idx === 0
                const isLast = idx === activeRevision.sections.length - 1
                return (
                <div key={section.id} className={`border ${!section.isVisible ? 'border-rose-200' : 'border-[#D9E1DC]'} rounded-xl overflow-hidden bg-white group`}>
                  <div className="bg-[#F7F4EC] px-4 py-3 flex items-center justify-between border-b border-[#D9E1DC]">
                    <div className="flex items-center gap-3">
                      <GripVertical className="w-4 h-4 text-[#A2B3AA] cursor-grab" />
                      <span className="text-xs font-bold text-[#12372A] uppercase tracking-wider">
                        {section.type.replace('_', ' ')}
                      </span>
                      {!section.isVisible && (
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">Hidden</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 opacity-100 transition-opacity">
                      <button onClick={() => handleToggleVisibility(section.id)} className="p-1.5 text-[#66736D] hover:bg-[#D9E1DC] rounded-lg transition-colors" title="Toggle Visibility">
                        <Eye className={`w-4 h-4 ${!section.isVisible ? 'opacity-30' : ''}`} />
                      </button>
                      <button onClick={() => handleMoveSection(section.id, 'up')} disabled={isFirst} className="p-1.5 text-[#66736D] hover:bg-[#D9E1DC] rounded-lg transition-colors disabled:opacity-30" title="Move Up">
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleMoveSection(section.id, 'down')} disabled={isLast} className="p-1.5 text-[#66736D] hover:bg-[#D9E1DC] rounded-lg transition-colors disabled:opacity-30" title="Move Down">
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <button onClick={() => setEditingSectionId(editingSectionId === section.id ? null : section.id)} className="p-1.5 text-[#66736D] hover:text-[#1F7A5C] hover:bg-[#1F7A5C]/10 rounded-lg transition-colors" title="Edit">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteSection(section.id)} className="p-1.5 text-[#66736D] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {editingSectionId === section.id ? (
                    <SectionEditor 
                      section={section} 
                      onClose={() => setEditingSectionId(null)}
                      onSaved={() => {
                        setEditingSectionId(null)
                        startTransition(() => {
                          router.refresh()
                        })
                      }}
                    />
                  ) : (
                    <div className={`p-4 text-xs text-[#66736D] ${!section.isVisible ? 'opacity-50' : ''}`}>
                      {/* Basic summary of section content */}
                      {section.type === 'HERO' && (
                        <p><strong className="text-[#12372A]">Heading:</strong> {(section.content as any).heading}</p>
                      )}
                      {section.type === 'TEXT_IMAGE' && (
                        <p><strong className="text-[#12372A]">Heading:</strong> {(section.content as any).heading}</p>
                      )}
                      {section.type === 'FEATURE_LIST' && (
                        <p><strong className="text-[#12372A]">Features:</strong> {((section.content as any).features || []).length} items</p>
                      )}
                      {section.type === 'CTA_BANNER' && (
                        <p><strong className="text-[#12372A]">Heading:</strong> {(section.content as any).heading}</p>
                      )}
                      {section.type === 'CONTENT_REFERENCE' && (
                        <p><strong className="text-[#12372A]">References:</strong> {section.references.length} linked items</p>
                      )}
                    </div>
                  )}
                </div>
              )})}
              
              {activeRevision.sections.length === 0 && (
                <div className="text-center p-8 border-2 border-dashed border-[#D9E1DC] rounded-xl text-[#66736D] text-xs">
                  No sections have been added to this page yet.
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[#D9E1DC]">
                <select
                  id="add-section-select"
                  className="flex-1 text-xs p-2 rounded-md border border-[#D9E1DC] bg-white text-[#12372A] font-medium"
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddSection(e.target.value as SectionType)
                      e.target.value = ''
                    }
                  }}
                  disabled={isPending || isSavingDraft}
                >
                  <option value="">+ Add Section...</option>
                  <option value="HERO">Hero Header</option>
                  <option value="TEXT_IMAGE">Text + Image</option>
                  <option value="FEATURE_LIST">Feature List</option>
                  <option value="CTA_BANNER">CTA Banner</option>
                  <option value="CONTENT_REFERENCE">Content Reference</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* SIDEBAR (SEO & INFO) */}
        <div className="space-y-6">
          {/* SEO PANEL */}
          <div className="bg-white rounded-3xl border border-[#D9E1DC] shadow-xs p-5 md:p-6">
            <h2 className="text-sm font-bold text-[#12372A] mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#1F7A5C]" />
              SEO Settings
            </h2>
            
            <div className="space-y-4">
              <div>
                <Label className="text-[10px] uppercase font-bold text-[#66736D] mb-1.5 block">
                  SEO Title <span className="font-normal float-right">{seoTitle.length} / 70</span>
                </Label>
                <Input
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="Optimal title for search engines"
                  className="text-xs bg-[#F7F4EC]/50 border-[#D9E1DC]"
                  maxLength={70}
                />
              </div>
              
              <div>
                <Label className="text-[10px] uppercase font-bold text-[#66736D] mb-1.5 block">
                  Meta Description <span className="font-normal float-right">{metaDescription.length} / 160</span>
                </Label>
                <Textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Brief summary for search results"
                  className="text-xs bg-[#F7F4EC]/50 border-[#D9E1DC] min-h-[80px]"
                  maxLength={160}
                />
              </div>
              
              <div>
                <Label className="text-[10px] uppercase font-bold text-[#66736D] mb-1.5 block">
                  Canonical URL
                </Label>
                <Input
                  value={canonicalUrl}
                  onChange={(e) => setCanonicalUrl(e.target.value)}
                  placeholder={page.path}
                  className="text-xs bg-[#F7F4EC]/50 border-[#D9E1DC]"
                />
              </div>
              
              <div>
                <Label className="text-[10px] uppercase font-bold text-[#66736D] mb-1.5 block">
                  OG Image
                </Label>
                {ogImageUrl ? (
                  <div className="relative border border-[#D9E1DC] rounded-xl overflow-hidden aspect-video bg-[#F7F4EC] flex items-center justify-center">
                    <img src={ogImageUrl} alt="OG Image" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button type="button" size="sm" variant="secondary" onClick={() => setIsSeoPickerOpen(true)}>Change</Button>
                      <Button type="button" size="sm" variant="destructive" onClick={() => { setOgImageId(''); setOgImageUrl('') }}>Remove</Button>
                    </div>
                  </div>
                ) : (
                  <Button 
                    type="button"
                    variant="outline"
                    className="w-full text-xs border-dashed text-[#66736D] h-24"
                    onClick={() => setIsSeoPickerOpen(true)}
                  >
                    <ImageIcon className="w-4 h-4 mr-2" /> Select OG Image
                  </Button>
                )}
              </div>
              
              <Button 
                onClick={handleSaveSeo}
                disabled={isSavingDraft || isPending}
                className="w-full text-xs font-bold bg-[#12372A] text-white hover:bg-[#0D281E]"
              >
                Apply SEO to Draft
              </Button>
            </div>
          </div>
          
          {/* REVISION HISTORY */}
          <div className="bg-white rounded-3xl border border-[#D9E1DC] shadow-xs p-5 md:p-6">
            <h2 className="text-sm font-bold text-[#12372A] mb-4 flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-[#1F7A5C]" />
              Revision History
            </h2>
            
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {page.revisions.map((rev) => {
                const isPub = rev.id === page.publishedRevisionId
                const publishedVersion = page.publishedRevision?.version ?? 0
                const isDraft = !isPub && rev.version > publishedVersion
                const isHistory = !isPub && !isDraft
                
                return (
                  <div key={rev.id} className={`p-3 rounded-xl border text-xs ${isPub ? 'border-[#1F7A5C] bg-[#1F7A5C]/5' : isDraft ? 'border-[#D6A84F] bg-[#D6A84F]/5' : 'border-[#D9E1DC] bg-[#F7F4EC]/30'}`}>
                    <div className="flex items-center justify-between font-bold mb-1">
                      <span className="text-[#12372A]">Version {rev.version}</span>
                      {isPub && <span className="text-[9px] uppercase tracking-wider text-[#1F7A5C]">Live</span>}
                      {isDraft && <span className="text-[9px] uppercase tracking-wider text-[#9E731E]">Draft</span>}
                      {isHistory && <span className="text-[9px] uppercase tracking-wider text-[#66736D]">History</span>}
                    </div>
                    <div className="text-[10px] text-[#66736D] space-y-0.5 font-mono">
                      <p>{format(new Date(rev.createdAt), 'dd MMM yyyy, HH:mm')}</p>
                    </div>
                    {isHistory && canPublish && (
                      <button 
                        onClick={() => {
                          setRollbackTargetId(rev.id)
                          setIsRollbackModalOpen(true)
                        }}
                        className="text-[10px] font-bold text-[#1F7A5C] hover:underline mt-2 inline-block"
                      >
                        Rollback to v{rev.version}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
          
        </div>
      </div>

      {/* MODALS */}
      <MediaPickerModal 
        open={isSeoPickerOpen}
        onOpenChange={setIsSeoPickerOpen}
        onSelect={(media) => {
          if (media.id) {
            setOgImageId(media.id)
            setOgImageUrl(media.url)
          }
        }}
      />
      
      {isPublishModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 border border-[#D9E1DC] shadow-2xl animate-in fade-in-50 zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-[#1F7A5C]/10 text-[#1F7A5C] flex items-center justify-center">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#12372A]">Publish Page</h3>
              <p className="text-xs text-[#66736D] mt-2 leading-relaxed">
                You are about to publish <strong className="text-[#12372A]">Version {activeRevision.version}</strong>.
                This will replace the currently live version on the public website.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsPublishModalOpen(false)} disabled={isPublishing}>
                Cancel
              </Button>
              <Button type="button" onClick={handlePublish} disabled={isPublishing} className="bg-[#1F7A5C] hover:bg-[#165B44] text-white">
                {isPublishing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Yes, Publish
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {isRollbackModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 border border-[#D9E1DC] shadow-2xl animate-in fade-in-50 zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#12372A]">Confirm Rollback</h3>
              <p className="text-xs text-[#66736D] mt-2 leading-relaxed">
                Roll back the live page to this previous version? Current historical revisions will remain available.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsRollbackModalOpen(false)} disabled={isPublishing}>
                Cancel
              </Button>
              <Button type="button" onClick={handleRollback} disabled={isPublishing} className="bg-amber-600 hover:bg-amber-700 text-white">
                {isPublishing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Yes, Rollback
              </Button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  )
}
