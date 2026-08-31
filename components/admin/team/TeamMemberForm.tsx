'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { createTeamMember, updateTeamMember } from '@/app/actions/team'

export default function TeamMemberForm({ initialData }: { initialData?: any }) {
  const router = useRouter()
  const isEdit = !!initialData

  const [name, setName] = useState(initialData?.name || '')
  const [role, setRole] = useState(initialData?.role || '')
  const [bio, setBio] = useState(initialData?.bio || '')
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || '')
  const [order, setOrder] = useState(initialData?.order || 0)
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true)
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setError('')

    try {
      const response = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
        method: 'POST',
        body: file,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const blob = await response.json()
      setImageUrl(blob.url)
    } catch (err: any) {
      setError('Failed to upload image. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return setError('Name is required.')
    if (!role.trim()) return setError('Role is required.')
    
    setIsSubmitting(true)
    setError('')

    try {
      const payload = { 
        name, 
        role, 
        bio, 
        imageUrl, 
        order: Number(order),
        isActive 
      }
      
      let result = isEdit 
        ? await updateTeamMember(initialData.id, payload) 
        : await createTeamMember(payload)
      
      if (result.success) {
        router.push('/admin/team')
        router.refresh()
      } else {
        setError(result.error || 'Failed to save team member')
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-24 text-[#202522]">
      <div className="flex items-center justify-between gap-4 bg-white p-4 border border-[#D9E1DC] rounded-2xl shadow-xs sticky top-4 z-50">
        <div className="flex items-center gap-3">
          <Link href="/admin/team" className="text-[#66736D] hover:text-[#12372A] p-1.5 rounded-lg hover:bg-[#F7F4EC] transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-bold text-[#12372A]">{isEdit ? 'Edit Team Member' : 'Add Team Member'}</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting} className="bg-[#1F7A5C] hover:bg-[#165B44] text-white rounded-xl text-xs font-bold shadow-xs">
            {isSubmitting ? 'Saving...' : 'Save Member'}
          </Button>
        </div>
      </div>

      {error && <div className="p-4 bg-rose-50 text-rose-700 rounded-xl text-xs font-semibold border border-rose-200">{error}</div>}

      <div className="bg-white rounded-2xl shadow-xs border border-[#D9E1DC] p-6 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-xs font-bold text-[#12372A]">Full Name *</Label>
          <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Rajesh Sharma" className="text-sm rounded-xl border-[#D9E1DC]" required />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="role" className="text-xs font-bold text-[#12372A]">Role / Designation *</Label>
          <Input id="role" value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Principal Consultant - Labour Laws" className="text-sm rounded-xl border-[#D9E1DC]" required />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="bio" className="text-xs font-bold text-[#12372A]">Executive Bio</Label>
          <Textarea id="bio" value={bio} onChange={e => setBio(e.target.value)} placeholder="Professional profile, statutory expertise, and advisory scope..." rows={4} className="text-xs rounded-xl border-[#D9E1DC]" />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="imageUrl" className="text-xs font-bold text-[#12372A]">Profile Image</Label>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex-1 w-full space-y-2">
              <Input id="imageUrl" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." type="url" className="text-xs rounded-xl border-[#D9E1DC]" />
              <Input 
                type="file" 
                accept="image/*" 
                onChange={handleFileUpload} 
                disabled={isUploading}
                className="cursor-pointer text-xs rounded-xl border-[#D9E1DC] file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#1F7A5C]/10 file:text-[#1F7A5C] hover:file:bg-[#1F7A5C]/20"
              />
              {isUploading && <p className="text-xs font-semibold text-[#1F7A5C]">Uploading image asset...</p>}
            </div>
            {imageUrl && (
              <div className="shrink-0">
                <img src={imageUrl} alt="Preview" className="h-20 w-20 object-cover rounded-2xl border-2 border-[#D9E1DC] shadow-xs" onError={(e) => (e.currentTarget.style.display = 'none')} />
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#D9E1DC]/80">
          <div className="space-y-2">
            <Label htmlFor="order" className="text-xs font-bold text-[#12372A]">Display Order</Label>
            <Input id="order" type="number" value={order} onChange={e => setOrder(parseInt(e.target.value) || 0)} className="text-xs font-mono rounded-xl border-[#D9E1DC]" />
            <p className="text-[11px] text-[#66736D]">Lower numbers appear first on the team directory.</p>
          </div>
          
          <div className="flex flex-col justify-center space-y-2 pt-2">
            <div className="flex items-center space-x-2">
              <Checkbox id="isActive" checked={isActive} onCheckedChange={(checked) => setIsActive(checked as boolean)} className="rounded text-[#1F7A5C] focus:ring-[#1F7A5C]" />
              <Label htmlFor="isActive" className="text-xs font-bold text-[#12372A] cursor-pointer">Active (Visible on public website)</Label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
