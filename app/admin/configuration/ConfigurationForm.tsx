'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { updateConfiguration } from '@/app/actions/configuration'
import { MediaPickerModal } from '@/components/admin/media/MediaPickerModal'
import { Loader2, CheckCircle2, AlertCircle, Image as ImageIcon, Trash2 } from 'lucide-react'
import Image from 'next/image'

export default function ConfigurationForm({ initialData }: { initialData: any }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false)

  const [formData, setFormData] = useState({
    businessName: initialData.businessName || 'LabourAxis',
    tagline: initialData.tagline || '',
    shortDescription: initialData.shortDescription || '',
    email: initialData.email || '',
    phone: initialData.phone || '',
    whatsapp: initialData.whatsapp || '',
    addressCity: initialData.addressCity || '',
    addressState: initialData.addressState || '',
    addressCountry: initialData.addressCountry || '',
    addressDisplay: initialData.addressDisplay || '',
    addressFooterDisplay: initialData.addressFooterDisplay || '',
    linkedin: initialData.linkedin || '',
    seoTitle: initialData.seoTitle || '',
    metaDescription: initialData.metaDescription || '',
    ogImageId: initialData.ogImageId || '',
  })
  
  const [ogImagePreview, setOgImagePreview] = useState<{url: string, alt: string} | null>(
    initialData.ogImage ? { url: initialData.ogImage.url, alt: initialData.ogImage.altText || '' } : null
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleMediaSelect = (media: any) => {
    setFormData(prev => ({ ...prev, ogImageId: media.id }))
    setOgImagePreview({ url: media.url, alt: media.altText || '' })
    setIsMediaPickerOpen(false)
  }

  const handleRemoveMedia = () => {
    setFormData(prev => ({ ...prev, ogImageId: '' }))
    setOgImagePreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')
    setIsSubmitting(true)

    try {
      const res = await updateConfiguration(formData)
      if (res.success) {
        setSuccessMessage('Configuration updated successfully.')
        router.refresh()
      } else {
        setErrorMessage(res.error || 'Failed to update configuration.')
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-20">
      
      {/* Save Bar */}
      <div className="bg-white border border-[#D9E1DC] rounded-2xl p-4 shadow-sm flex items-center justify-between mb-8">
        <div>
          <h2 className="text-sm font-bold text-[#12372A]">Save Changes</h2>
          <p className="text-xs text-[#66736D]">Update global website settings</p>
        </div>
        <div className="flex items-center gap-4">
          {successMessage && (
            <div className="text-emerald-600 text-xs font-semibold flex items-center gap-1.5 animate-in fade-in zoom-in duration-300">
              <CheckCircle2 className="w-4 h-4" />
              {successMessage}
            </div>
          )}
          {errorMessage && (
            <div className="text-rose-600 text-xs font-semibold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              {errorMessage}
            </div>
          )}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#1F7A5C] hover:bg-[#165B44] text-white rounded-xl text-xs font-bold px-6"
          >
            {isSubmitting ? <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> Saving...</> : 'Save Configuration'}
          </Button>
        </div>
      </div>

      {/* Business Information */}
      <div className="bg-white border border-[#D9E1DC] rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-[#D9E1DC] bg-[#F7F4EC]">
          <h3 className="text-sm font-bold text-[#12372A]">Business Information</h3>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-[#12372A]">Business Name *</Label>
              <Input name="businessName" value={formData.businessName} onChange={handleChange} required className="rounded-xl border-[#D9E1DC] focus-visible:ring-[#1F7A5C]" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-[#12372A]">Tagline</Label>
              <Input name="tagline" value={formData.tagline} onChange={handleChange} className="rounded-xl border-[#D9E1DC] focus-visible:ring-[#1F7A5C]" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold text-[#12372A]">Short Description</Label>
            <Textarea name="shortDescription" value={formData.shortDescription} onChange={handleChange} className="rounded-xl border-[#D9E1DC] focus-visible:ring-[#1F7A5C] min-h-[100px]" />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white border border-[#D9E1DC] rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-[#D9E1DC] bg-[#F7F4EC]">
          <h3 className="text-sm font-bold text-[#12372A]">Contact Information</h3>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-[#12372A]">Email</Label>
              <Input type="email" name="email" value={formData.email} onChange={handleChange} className="rounded-xl border-[#D9E1DC] focus-visible:ring-[#1F7A5C]" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-[#12372A]">Phone</Label>
              <Input name="phone" value={formData.phone} onChange={handleChange} className="rounded-xl border-[#D9E1DC] focus-visible:ring-[#1F7A5C]" placeholder="+91 94250 55703" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-[#12372A]">WhatsApp</Label>
              <Input name="whatsapp" value={formData.whatsapp} onChange={handleChange} className="rounded-xl border-[#D9E1DC] focus-visible:ring-[#1F7A5C]" placeholder="+919425055703" />
            </div>
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="bg-white border border-[#D9E1DC] rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-[#D9E1DC] bg-[#F7F4EC]">
          <h3 className="text-sm font-bold text-[#12372A]">Address</h3>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-[#12372A]">City</Label>
              <Input name="addressCity" value={formData.addressCity} onChange={handleChange} className="rounded-xl border-[#D9E1DC] focus-visible:ring-[#1F7A5C]" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-[#12372A]">State / Province</Label>
              <Input name="addressState" value={formData.addressState} onChange={handleChange} className="rounded-xl border-[#D9E1DC] focus-visible:ring-[#1F7A5C]" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-[#12372A]">Country</Label>
              <Input name="addressCountry" value={formData.addressCountry} onChange={handleChange} className="rounded-xl border-[#D9E1DC] focus-visible:ring-[#1F7A5C]" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-[#12372A]">Full Display Address</Label>
              <Textarea name="addressDisplay" value={formData.addressDisplay} onChange={handleChange} className="rounded-xl border-[#D9E1DC] focus-visible:ring-[#1F7A5C]" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-[#12372A]">Footer Display Address</Label>
              <Textarea name="addressFooterDisplay" value={formData.addressFooterDisplay} onChange={handleChange} className="rounded-xl border-[#D9E1DC] focus-visible:ring-[#1F7A5C]" />
            </div>
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div className="bg-white border border-[#D9E1DC] rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-[#D9E1DC] bg-[#F7F4EC]">
          <h3 className="text-sm font-bold text-[#12372A]">Social Links</h3>
        </div>
        <div className="p-6 space-y-5">
          <div className="space-y-2 max-w-lg">
            <Label className="text-xs font-bold text-[#12372A]">LinkedIn URL</Label>
            <Input type="url" name="linkedin" value={formData.linkedin} onChange={handleChange} className="rounded-xl border-[#D9E1DC] focus-visible:ring-[#1F7A5C]" placeholder="https://www.linkedin.com/..." />
          </div>
        </div>
      </div>

      {/* Global SEO Defaults */}
      <div className="bg-white border border-[#D9E1DC] rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-[#D9E1DC] bg-[#F7F4EC]">
          <h3 className="text-sm font-bold text-[#12372A]">Global SEO Defaults</h3>
        </div>
        <div className="p-6 space-y-5">
          <div className="space-y-2">
            <Label className="text-xs font-bold text-[#12372A]">Default SEO Title</Label>
            <Input name="seoTitle" value={formData.seoTitle} onChange={handleChange} className="rounded-xl border-[#D9E1DC] focus-visible:ring-[#1F7A5C]" placeholder="LabourAxis | Industrial HR & Labour Compliance Consultancy" />
            <p className="text-[10px] text-slate-500">Recommended &lt; 60 characters</p>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold text-[#12372A]">Default Meta Description</Label>
            <Textarea name="metaDescription" value={formData.metaDescription} onChange={handleChange} className="rounded-xl border-[#D9E1DC] focus-visible:ring-[#1F7A5C]" placeholder="Practical HR, labour compliance..." />
            <p className="text-[10px] text-slate-500">Recommended &lt; 160 characters</p>
          </div>
          
          <div className="space-y-3 pt-4 border-t border-[#D9E1DC]">
            <Label className="text-xs font-bold text-[#12372A]">Default Social Image (OG Image)</Label>
            {ogImagePreview ? (
              <div className="relative w-full max-w-sm aspect-video rounded-xl overflow-hidden border border-[#D9E1DC] group">
                <Image src={ogImagePreview.url} alt="OG Image" fill className="object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <Button type="button" variant="secondary" size="sm" onClick={() => setIsMediaPickerOpen(true)} className="rounded-lg text-xs font-bold">
                    Change
                  </Button>
                  <Button type="button" variant="destructive" size="sm" onClick={handleRemoveMedia} className="rounded-lg text-xs font-bold">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div 
                onClick={() => setIsMediaPickerOpen(true)}
                className="w-full max-w-sm aspect-video rounded-xl border-2 border-dashed border-[#D9E1DC] flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <ImageIcon className="w-8 h-8 text-slate-300" />
                <span className="text-xs font-bold text-slate-500">Select Image</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <MediaPickerModal 
        open={isMediaPickerOpen} 
        onOpenChange={(open) => { if (!open) setIsMediaPickerOpen(false) }} 
        onSelect={handleMediaSelect} 
      />

    </form>
  )
}
