'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Save,
  Eye,
  Trash2,
  Upload,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Loader2,
  User,
  Building,
  Briefcase,
  Layers,
  ExternalLink,
  ChevronRight,
  Sparkles,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { MediaPickerModal } from '@/components/admin/media/MediaPickerModal'
import {
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  getPotentialManagers,
} from '@/app/actions/team'

interface ManagerOption {
  id: string
  name: string
  designation: string
  department: string | null
}

interface TeamEditorProps {
  initialData?: any
  availableManagers: ManagerOption[]
}

const COMMON_DEPARTMENTS = [
  'Leadership',
  'HR Operations',
  'Labour Compliance',
  'Operations',
  'Industrial Relations',
  'Legal & Regulatory',
  'Payroll & Statutory',
  'Client Advisory',
]

export default function TeamEditor({ initialData, availableManagers }: TeamEditorProps) {
  const router = useRouter()
  const isEdit = !!initialData?.id

  // Profile Information
  const [name, setName] = useState(initialData?.name || '')
  const [designation, setDesignation] = useState(initialData?.designation || initialData?.role || '')
  const [department, setDepartment] = useState(initialData?.department || '')
  const [bio, setBio] = useState(initialData?.bio || '')

  // Media & Social
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || '')
  const [imageAlt, setImageAlt] = useState(initialData?.imageAlt || '')
  const [linkedinUrl, setLinkedinUrl] = useState(initialData?.linkedinUrl || '')

  // Hierarchy & Settings
  const [reportsToId, setReportsToId] = useState<string>(initialData?.reportsToId || '')
  const [displayOrder, setDisplayOrder] = useState<number>(
    initialData?.displayOrder ?? initialData?.order ?? 0
  )
  const [isActive, setIsActive] = useState<boolean>(initialData?.isActive ?? true)

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isDirty, setIsDirty] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Dirty state tracker
  const markDirty = () => setIsDirty(true)

  // Unsaved changes beforeunload warning
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
        setImageUrl(data.url)
        if (!imageAlt) {
          setImageAlt(name ? `${name} - ${designation || 'LabourAxis'}` : file.name.replace(/\.[^/.]+$/, ''))
        }
      } else {
        const err = await response.json()
        setErrorMessage(err.error || 'Failed to upload image')
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error uploading image')
    } finally {
      setIsUploadingImage(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSave = async (redirectToList = true) => {
    if (!name.trim()) {
      setErrorMessage('Full Name is required.')
      return
    }
    if (!designation.trim()) {
      setErrorMessage('Role / Designation is required.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')
    setSuccessMessage('')

    const payload = {
      name: name.trim(),
      designation: designation.trim(),
      department: department.trim() || null,
      bio: bio.trim() || null,
      imageUrl: imageUrl.trim() || null,
      imageAlt: imageAlt.trim() || null,
      linkedinUrl: linkedinUrl.trim() || null,
      reportsToId: reportsToId && reportsToId !== 'none' ? reportsToId : null,
      displayOrder: Number(displayOrder) || 0,
      isActive,
    }

    try {
      const res = isEdit
        ? await updateTeamMember(initialData.id, payload)
        : await createTeamMember(payload)

      if (res.success) {
        setIsDirty(false)
        setSuccessMessage(isEdit ? 'Profile updated successfully!' : 'Team member created successfully!')
        if (redirectToList) {
          router.push('/admin/team')
          router.refresh()
        } else {
          router.refresh()
          setTimeout(() => setSuccessMessage(''), 3000)
        }
      } else {
        setErrorMessage(res.error || 'Failed to save team member')
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!initialData?.id) return
    setIsDeleting(true)
    setErrorMessage('')

    try {
      const res = await deleteTeamMember(initialData.id, { force: true })
      if (res.success) {
        setIsDirty(false)
        router.push('/admin/team')
        router.refresh()
      } else {
        setErrorMessage(res.error || 'Failed to delete team member')
        setShowDeleteModal(false)
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to delete team member')
    } finally {
      setIsDeleting(false)
    }
  }

  const selectedManager = availableManagers.find((m) => m.id === reportsToId)

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 pb-24 text-[#202522]">
      {/* Top Header / Action Bar */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border border-[#D9E1DC] p-4 rounded-2xl shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/team"
            className="p-2 text-[#66736D] hover:text-[#12372A] hover:bg-[#F7F4EC] rounded-xl transition-colors"
            title="Back to Team list"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#1F7A5C] bg-[#1F7A5C]/10 px-2 py-0.5 rounded-md">
                {isEdit ? 'Edit Profile' : 'New Profile'}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  isActive
                    ? 'bg-[#1F7A5C]/10 text-[#1F7A5C]'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {isActive ? '● Active' : '○ Inactive'}
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-[#12372A] mt-0.5">
              {name || (isEdit ? 'Untitled Profile' : 'Add Team Member')}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowPreviewModal(true)}
            className="border-[#CBD5D0] text-[#12372A] bg-white hover:bg-[#12372A] hover:text-white hover:border-[#12372A] rounded-xl text-xs font-bold transition-all duration-150 group"
          >
            <Eye className="w-3.5 h-3.5 mr-1.5 text-[#1F7A5C] group-hover:text-white transition-colors" />
            <span>Preview Card</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => handleSave(false)}
            className="border-[#CBD5D0] text-[#12372A] bg-white hover:bg-[#12372A] hover:text-white hover:border-[#12372A] rounded-xl text-xs font-bold transition-all duration-150"
          >
            {isSubmitting ? 'Saving...' : 'Save & Continue'}
          </Button>

          <Button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSave(true)}
            className="bg-[#1F7A5C] hover:bg-[#12372A] text-white rounded-xl text-xs font-bold px-5 shadow-xs transition-all duration-150"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 mr-1.5" /> {isEdit ? 'Save Changes' : 'Create Profile'}
              </>
            )}
          </Button>

          {isEdit && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDeleteModal(true)}
              className="border-rose-200 text-rose-600 bg-white hover:bg-rose-600 hover:text-white hover:border-rose-600 rounded-xl text-xs font-bold transition-all duration-150"
              title="Delete team member"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 text-rose-700 rounded-2xl text-xs font-semibold border border-rose-200 flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-[#1F7A5C]/10 text-[#1F7A5C] rounded-2xl text-xs font-semibold border border-[#1F7A5C]/20 flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Two Column Layout (68% Main / 32% Sidebar on Desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Main Profile Information */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white border border-[#D9E1DC] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-[#D9E1DC]/80">
              <User className="w-5 h-5 text-[#1F7A5C]" />
              <h2 className="text-base font-bold text-[#12372A]">Profile Information</h2>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-bold text-[#12372A]">
                Full Name <span className="text-rose-600">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => {
                  markDirty()
                  setName(e.target.value)
                }}
                placeholder="e.g. Lavish Chouhan"
                className="text-sm rounded-xl border-[#D9E1DC] h-11"
                required
              />
            </div>

            {/* Designation & Department Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="designation" className="text-xs font-bold text-[#12372A]">
                  Role / Designation <span className="text-rose-600">*</span>
                </Label>
                <Input
                  id="designation"
                  value={designation}
                  onChange={(e) => {
                    markDirty()
                    setDesignation(e.target.value)
                  }}
                  placeholder="e.g. Founder & Lead Consultant"
                  className="text-xs rounded-xl border-[#D9E1DC] h-10"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department" className="text-xs font-bold text-[#12372A]">
                  Department / Division
                </Label>
                <div className="relative">
                  <Input
                    id="department"
                    list="departments-list"
                    value={department}
                    onChange={(e) => {
                      markDirty()
                      setDepartment(e.target.value)
                    }}
                    placeholder="e.g. Leadership, HR Operations..."
                    className="text-xs rounded-xl border-[#D9E1DC] h-10"
                  />
                  <datalist id="departments-list">
                    {COMMON_DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept} />
                    ))}
                  </datalist>
                </div>
              </div>
            </div>

            {/* Executive Bio */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="bio" className="text-xs font-bold text-[#12372A]">
                  Executive Profile Bio
                </Label>
                <span className="text-[11px] text-[#66736D]">2–5 concise sentences</span>
              </div>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => {
                  markDirty()
                  setBio(e.target.value)
                }}
                placeholder="Practitioner and consultant with deep expertise in Indian labour laws, industrial relations, and factory compliance..."
                rows={5}
                className="text-xs rounded-xl border-[#D9E1DC] leading-relaxed"
              />
            </div>
          </div>

          {/* Social / Professional Links */}
          <div className="bg-white border border-[#D9E1DC] rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-4 border-b border-[#D9E1DC]/80">
              <ExternalLink className="w-5 h-5 text-[#1F7A5C]" />
              <h2 className="text-base font-bold text-[#12372A]">Professional Social Profile</h2>
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedinUrl" className="text-xs font-bold text-[#12372A]">
                LinkedIn Profile URL
              </Label>
              <Input
                id="linkedinUrl"
                type="url"
                value={linkedinUrl}
                onChange={(e) => {
                  markDirty()
                  setLinkedinUrl(e.target.value)
                }}
                placeholder="https://www.linkedin.com/in/lavish-chouhan-8b29b4361/"
                className="text-xs font-mono rounded-xl border-[#D9E1DC] h-10"
              />
              <p className="text-[11px] text-[#66736D]">
                Displays a direct verified LinkedIn button on public cards.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Hierarchy, Photo & Settings */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Status & Hierarchy Box */}
          <div className="bg-white border border-[#D9E1DC] rounded-3xl p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-[#D9E1DC]/80">
              <Layers className="w-4 h-4 text-[#1F7A5C]" />
              <h3 className="text-sm font-bold text-[#12372A]">Organizational Hierarchy</h3>
            </div>

            {/* Status Toggle */}
            <div className="flex items-center justify-between p-3.5 bg-[#F7F4EC]/60 rounded-2xl border border-[#D9E1DC]">
              <div>
                <Label htmlFor="isActive" className="text-xs font-bold text-[#12372A] block cursor-pointer">
                  Public Status
                </Label>
                <p className="text-[10px] text-[#66736D]">
                  {isActive ? 'Visible on public /team page' : 'Hidden from public website'}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={isActive}
                onClick={() => {
                  markDirty()
                  setIsActive(!isActive)
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isActive ? 'bg-[#1F7A5C]' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    isActive ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Reports To Selector */}
            <div className="space-y-2">
              <Label htmlFor="reportsTo" className="text-xs font-bold text-[#12372A]">
                Reports To (Direct Manager)
              </Label>
              <select
                id="reportsTo"
                value={reportsToId}
                onChange={(e) => {
                  markDirty()
                  setReportsToId(e.target.value)
                }}
                className="w-full h-10 px-3 text-xs font-semibold rounded-xl bg-white border border-[#D9E1DC] text-[#12372A] focus:outline-none focus:ring-2 focus:ring-[#1F7A5C]"
              >
                <option value="">— No Direct Manager (Root / Top Leadership) —</option>
                {availableManagers.map((mgr) => (
                  <option key={mgr.id} value={mgr.id}>
                    {mgr.name} — {mgr.designation} {mgr.department ? `(${mgr.department})` : ''}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-[#66736D]">
                Root members with no manager form the top level of the organizational tree.
              </p>
            </div>

            {/* Display Order */}
            <div className="space-y-2">
              <Label htmlFor="displayOrder" className="text-xs font-bold text-[#12372A]">
                Display Order (Priority)
              </Label>
              <Input
                id="displayOrder"
                type="number"
                min={0}
                value={displayOrder}
                onChange={(e) => {
                  markDirty()
                  setDisplayOrder(parseInt(e.target.value) || 0)
                }}
                className="text-xs font-mono rounded-xl border-[#D9E1DC] h-10"
              />
              <p className="text-[11px] text-[#66736D]">
                Lower numbers appear first within the same organizational tier (e.g. 1, 2, 3).
              </p>
            </div>
          </div>

          {/* Profile Photo Box */}
          <div className="bg-white border border-[#D9E1DC] rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#D9E1DC]/80">
              <ImageIcon className="w-4 h-4 text-[#1F7A5C]" />
              <h3 className="text-sm font-bold text-[#12372A]">Profile Photography</h3>
            </div>

            {/* Thumbnail Preview Area */}
            <div className="aspect-square bg-[#F7F4EC] rounded-2xl overflow-hidden border border-[#D9E1DC] relative flex items-center justify-center group">
              {imageUrl ? (
                <>
                  <img
                    src={imageUrl}
                    alt={imageAlt || name || 'Profile preview'}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        markDirty()
                        setImageUrl('')
                      }}
                      className="bg-white/95 hover:bg-white text-rose-700 text-xs font-bold rounded-xl"
                    >
                      Remove Photo
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center p-4 text-[#66736D]">
                  <User className="w-10 h-10 mx-auto text-[#A2B3AA] mb-1.5" />
                  <p className="text-xs font-medium">No profile photo selected</p>
                </div>
              )}
            </div>

            {/* Photo Action Buttons */}
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

              {/* Image URL Manual Input */}
              <div className="space-y-1.5">
                <Label htmlFor="imageUrl" className="text-[11px] font-bold text-[#12372A]">
                  Or Paste Photo URL
                </Label>
                <Input
                  id="imageUrl"
                  value={imageUrl}
                  onChange={(e) => {
                    markDirty()
                    setImageUrl(e.target.value)
                  }}
                  placeholder="https://... CDN photo link"
                  className="text-xs font-mono rounded-xl border-[#D9E1DC]"
                />
              </div>

              {/* Alt Text */}
              <div className="space-y-1.5">
                <Label htmlFor="imageAlt" className="text-[11px] font-bold text-[#12372A]">
                  Image Alt Text (SEO & Accessibility)
                </Label>
                <Input
                  id="imageAlt"
                  value={imageAlt}
                  onChange={(e) => {
                    markDirty()
                    setImageAlt(e.target.value)
                  }}
                  placeholder="e.g. Lavish Chouhan - Founder & Lead Consultant"
                  className="text-xs rounded-xl border-[#D9E1DC]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* PREVIEW MODAL                                        */}
      {/* ---------------------------------------------------- */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl border border-[#D9E1DC] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#D9E1DC]">
              <h3 className="text-base font-bold text-[#12372A]">Public Card Preview</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreviewModal(false)}
                className="text-xs rounded-xl border-[#D9E1DC]"
              >
                Close Preview
              </Button>
            </div>

            {/* Card Render */}
            <div className="bg-[#F7F4EC] border border-[#D9E1DC] rounded-3xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-14 h-14 bg-[#EDE8DE] rounded-2xl shrink-0 flex items-center justify-center overflow-hidden border-2 border-white shadow-xs">
                      {imageUrl ? (
                        <img src={imageUrl} alt={imageAlt || name} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-7 h-7 text-[#12372A]" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-[#12372A]">
                        {name || 'Team Member Name'}
                      </h4>
                      <p className="text-[#1F7A5C] font-bold text-xs">
                        {designation || 'Designation'}
                      </p>
                      {department && (
                        <span className="inline-block mt-1 text-[10px] font-bold text-[#66736D] bg-white px-2 py-0.5 rounded-md border border-[#D9E1DC]">
                          {department}
                        </span>
                      )}
                    </div>
                  </div>

                  {linkedinUrl && (
                    <div className="w-8 h-8 rounded-xl bg-white border border-[#D9E1DC] flex items-center justify-center text-[#1F7A5C] shadow-2xs">
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.48 1.48 0 1 0 0-2.96 1.48 1.48 0 0 0 0 2.96m1.4 9.74v-8.37H5.06v8.37h2.8z" />
                      </svg>
                    </div>
                  )}
                </div>

                {bio && (
                  <p className="text-[#202522] text-xs leading-relaxed mt-2 border-t border-[#D9E1DC]/80 pt-3">
                    {bio}
                  </p>
                )}
              </div>

              {selectedManager && (
                <div className="mt-4 pt-3 border-t border-[#D9E1DC]/80 flex items-center gap-1.5 text-[11px] text-[#66736D]">
                  <ChevronRight className="w-3.5 h-3.5 text-[#1F7A5C]" />
                  <span>Reports to: <strong className="text-[#12372A]">{selectedManager.name}</strong></span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* DELETE CONFIRMATION MODAL                            */}
      {/* ---------------------------------------------------- */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-rose-100 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#12372A]">Delete Profile &quot;{name}&quot;?</h3>
              <p className="text-xs text-[#66736D] mt-1.5 leading-relaxed">
                This will permanently delete the team member from the database. Any direct reports will automatically be preserved and reassigned to the parent tier.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D9E1DC]">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                className="text-xs rounded-xl border-[#D9E1DC]"
              >
                Cancel
              </Button>
              <Button
                disabled={isDeleting}
                onClick={handleDelete}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl px-4"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
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
        currentUrl={imageUrl}
        onSelect={(media) => {
          markDirty()
          setImageUrl(media.url)
          if (media.altText && !imageAlt) {
            setImageAlt(media.altText)
          }
        }}
      />
    </div>
  )
}
