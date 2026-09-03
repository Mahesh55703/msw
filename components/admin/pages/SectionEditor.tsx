'use client'

import { useState, useEffect } from 'react'
import { SectionType } from '@prisma/client'
import { Loader2, Save, X, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { MediaPickerModal } from '@/components/admin/media/MediaPickerModal'
import { ReferenceSelector } from './ReferenceSelector'

import type { PageSectionDetail } from '@/lib/db/pages'
import { updateSectionContent } from '@/app/actions/pages'

interface SectionEditorProps {
  section: PageSectionDetail
  onClose: () => void
  onSaved: () => void
}

export function SectionEditor({ section, onClose, onSaved }: SectionEditorProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Local state for all fields across all types
  const [content, setContent] = useState<any>(section.content || {})
  const [mediaId, setMediaId] = useState<string | null>(section.mediaId || null)
  const [mediaUrl, setMediaUrl] = useState<string | null>(section.media?.url || null)
  
  useEffect(() => {
    setContent(section.content || {})
    setMediaId(section.mediaId || null)
    setMediaUrl(section.media?.url || null)
  }, [section])

  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false)

  const handleUpdateField = (field: string, value: any) => {
    setContent((prev: any) => ({ ...prev, [field]: value }))
  }
  
  const handleUpdateCta = (ctaKey: 'primaryCta' | 'secondaryCta', field: 'label' | 'url', value: string) => {
    setContent((prev: any) => {
      const cta = prev[ctaKey] || { label: '', url: '' }
      return {
        ...prev,
        [ctaKey]: { ...cta, [field]: value }
      }
    })
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)
    
    // We clean up empty CTAs so Zod doesn't fail on them
    const cleanContent = { ...content }
    if (cleanContent.primaryCta && (!cleanContent.primaryCta.label || !cleanContent.primaryCta.url)) {
      cleanContent.primaryCta = null
    }
    if (cleanContent.secondaryCta && (!cleanContent.secondaryCta.label || !cleanContent.secondaryCta.url)) {
      cleanContent.secondaryCta = null
    }

    try {
      const result = await updateSectionContent(section.id, {
        content: cleanContent,
        mediaId: mediaId,
      })
      if (result.success) {
        onSaved()
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('An unexpected error occurred.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="bg-[#F7F4EC]/50 border-t border-[#D9E1DC] p-5 animate-in fade-in slide-in-from-top-2">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-bold text-[#12372A]">Edit {section.type.replace('_', ' ')}</h4>
        <button onClick={onClose} className="p-1 hover:bg-[#D9E1DC] rounded text-[#66736D]"><X className="w-4 h-4" /></button>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg font-medium">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* COMMON FIELDS: Heading, Description (mostly present in all) */}
        {(section.type === 'HERO' || section.type === 'TEXT_IMAGE' || section.type === 'FEATURE_LIST' || section.type === 'CTA_BANNER') && (
          <div>
            <Label className="text-[10px] uppercase font-bold text-[#66736D] mb-1.5 block">Heading</Label>
            <Input 
              value={content.heading || ''} 
              onChange={(e) => handleUpdateField('heading', e.target.value)} 
              className="text-xs bg-white border-[#D9E1DC]"
            />
          </div>
        )}

        {/* HERO ONLY */}
        {section.type === 'HERO' && (
          <>
            <div>
              <Label className="text-[10px] uppercase font-bold text-[#66736D] mb-1.5 block">Eyebrow</Label>
              <Input 
                value={content.eyebrow || ''} 
                onChange={(e) => handleUpdateField('eyebrow', e.target.value)} 
                className="text-xs bg-white border-[#D9E1DC]"
              />
            </div>
            <div>
              <Label className="text-[10px] uppercase font-bold text-[#66736D] mb-1.5 block">Description</Label>
              <Textarea 
                value={content.description || ''} 
                onChange={(e) => handleUpdateField('description', e.target.value)} 
                className="text-xs bg-white border-[#D9E1DC] min-h-[80px]"
              />
            </div>
          </>
        )}
        
        {/* TEXT_IMAGE ONLY */}
        {section.type === 'TEXT_IMAGE' && (
          <>
            <div>
              <Label className="text-[10px] uppercase font-bold text-[#66736D] mb-1.5 block">Body Content (Rich Text restricted)</Label>
              <Textarea 
                value={content.body || ''} 
                onChange={(e) => handleUpdateField('body', e.target.value)} 
                className="text-xs bg-white border-[#D9E1DC] min-h-[120px]"
              />
            </div>
            <div>
              <Label className="text-[10px] uppercase font-bold text-[#66736D] mb-1.5 block">Image Position</Label>
              <select 
                value={content.imagePosition || 'right'}
                onChange={(e) => handleUpdateField('imagePosition', e.target.value)}
                className="w-full text-xs p-2 rounded-md border border-[#D9E1DC] bg-white"
              >
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
            </div>
          </>
        )}
        
        {/* CTA_BANNER / HERO CTAs */}
        {(section.type === 'HERO' || section.type === 'CTA_BANNER') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-[#D9E1DC]">
            <div className="space-y-2 p-3 bg-white border border-[#D9E1DC] rounded-xl">
              <Label className="text-[10px] uppercase font-bold text-[#1F7A5C]">Primary CTA</Label>
              <Input placeholder="Label" value={content.primaryCta?.label || ''} onChange={(e) => handleUpdateCta('primaryCta', 'label', e.target.value)} className="text-xs h-8" />
              <Input placeholder="URL (e.g. /contact)" value={content.primaryCta?.url || ''} onChange={(e) => handleUpdateCta('primaryCta', 'url', e.target.value)} className="text-xs h-8" />
            </div>
            <div className="space-y-2 p-3 bg-white border border-[#D9E1DC] rounded-xl">
              <Label className="text-[10px] uppercase font-bold text-[#66736D]">Secondary CTA</Label>
              <Input placeholder="Label" value={content.secondaryCta?.label || ''} onChange={(e) => handleUpdateCta('secondaryCta', 'label', e.target.value)} className="text-xs h-8" />
              <Input placeholder="URL" value={content.secondaryCta?.url || ''} onChange={(e) => handleUpdateCta('secondaryCta', 'url', e.target.value)} className="text-xs h-8" />
            </div>
          </div>
        )}
        
        {/* FEATURE_LIST ONLY */}
        {section.type === 'FEATURE_LIST' && (
          <div className="pt-2 border-t border-[#D9E1DC]">
            <Label className="text-[10px] uppercase font-bold text-[#66736D] mb-2 block">Features</Label>
            <div className="space-y-3">
              {(content.features || []).map((feature: any, idx: number) => (
                <div key={idx} className="bg-white p-3 border border-[#D9E1DC] rounded-xl flex gap-3 relative">
                  <button 
                    onClick={() => {
                      const newFeatures = [...(content.features || [])];
                      newFeatures.splice(idx, 1);
                      handleUpdateField('features', newFeatures);
                    }}
                    className="absolute top-2 right-2 text-rose-500 hover:text-rose-700 p-1"
                    title="Remove Feature"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <div className="flex-1 space-y-2">
                    <Input placeholder="Feature Title" value={feature.title || ''} onChange={(e) => {
                      const nf = [...(content.features || [])];
                      nf[idx].title = e.target.value;
                      handleUpdateField('features', nf);
                    }} className="text-xs h-8" />
                    <Input placeholder="Description (optional)" value={feature.description || ''} onChange={(e) => {
                      const nf = [...(content.features || [])];
                      nf[idx].description = e.target.value;
                      handleUpdateField('features', nf);
                    }} className="text-xs h-8" />
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" className="text-xs h-8" onClick={() => {
                handleUpdateField('features', [...(content.features || []), { title: '', description: '' }])
              }}>
                + Add Feature
              </Button>
            </div>
          </div>
        )}
        
        {/* CONTENT_REFERENCE ONLY */}
        {section.type === 'CONTENT_REFERENCE' && (
          <ReferenceSelector section={section} onSaved={onSaved} />
        )}

        {/* IMAGE PICKER (Hero, TextImage) */}
        {(section.type === 'HERO' || section.type === 'TEXT_IMAGE') && (
          <div className="pt-2 border-t border-[#D9E1DC]">
            <Label className="text-[10px] uppercase font-bold text-[#66736D] mb-1.5 block">Section Image</Label>
            {mediaUrl ? (
              <div className="flex items-center gap-4 bg-white p-2 border border-[#D9E1DC] rounded-xl">
                <img src={mediaUrl} className="w-16 h-16 object-cover rounded-lg bg-gray-100" alt="Section Media" />
                <div className="flex-1">
                  <Button type="button" size="sm" variant="outline" className="text-xs h-7 mr-2" onClick={() => setIsMediaPickerOpen(true)}>Change</Button>
                  <Button type="button" size="sm" variant="destructive" className="text-xs h-7" onClick={() => { setMediaId(null); setMediaUrl(null) }}>Remove</Button>
                </div>
              </div>
            ) : (
              <Button type="button" variant="outline" className="w-full text-xs h-10 border-dashed" onClick={() => setIsMediaPickerOpen(true)}>
                <ImageIcon className="w-4 h-4 mr-2" /> Select Image
              </Button>
            )}
          </div>
        )}
        
        {/* SAVE ACTION */}
        <div className="pt-4 flex justify-end">
          <Button onClick={handleSave} disabled={isSaving} className="bg-[#12372A] hover:bg-[#0D281E] text-white text-xs h-8">
            {isSaving ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-2" />}
            Save Section Content
          </Button>
        </div>
      </div>
      
      <MediaPickerModal 
        open={isMediaPickerOpen}
        onOpenChange={setIsMediaPickerOpen}
        onSelect={(media) => {
          if (media.id) {
            setMediaId(media.id)
            setMediaUrl(media.url)
          }
        }}
      />
    </div>
  )
}
