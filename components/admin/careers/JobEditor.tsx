'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Save,
  Eye,
  Trash2,
  Check,
  AlertCircle,
  Loader2,
  Briefcase,
  Globe,
  Lock,
  Unlock,
  Plus,
  X,
  Calendar,
  Layers,
  Send,
  Mail,
  ExternalLink,
  ShieldCheck,
  MapPin,
  Clock,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  createJob,
  updateJob,
  deleteJob,
  publishJob,
  closeJob,
} from '@/app/actions/careers'
import { SafeJobPosting } from '@/lib/db/careers'

interface JobEditorProps {
  initialData?: SafeJobPosting
}

const COMMON_DEPARTMENTS = [
  'Labour Compliance',
  'HR Advisory',
  'Factory Compliance',
  'Industrial Relations',
  'Payroll & Statutory Operations',
  'Legal & Regulatory',
  'Business Development',
  'Technology',
]

const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship']
const WORK_MODES = ['On-site', 'Hybrid', 'Remote']

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function JobEditor({ initialData }: JobEditorProps) {
  const router = useRouter()
  const isEdit = !!initialData?.id

  // Basic Information
  const [title, setTitle] = useState(initialData?.title || '')
  const [slug, setSlug] = useState(initialData?.slug || '')
  const [isSlugLocked, setIsSlugLocked] = useState(isEdit)
  const [department, setDepartment] = useState(initialData?.department || '')
  const [location, setLocation] = useState(initialData?.location || 'Indore, Madhya Pradesh')
  const [employmentType, setEmploymentType] = useState(initialData?.employmentType || 'Full-time')
  const [workMode, setWorkMode] = useState(initialData?.workMode || 'Hybrid')
  const [experience, setExperience] = useState(initialData?.experience || '')
  const [salary, setSalary] = useState(initialData?.salary || '')

  // Description & Lists
  const [description, setDescription] = useState(initialData?.description || '')

  const initialResponsibilities = initialData?.responsibilities
    ? initialData.responsibilities.split('\n').filter((s) => s.trim().length > 0)
    : [
        'Lead statutory audit verifications and plant-level compliance reviews.',
        'Prepare monthly muster rolls, wages registers, and contractor governance filings.',
      ]
  const [responsibilities, setResponsibilities] = useState<string[]>(initialResponsibilities)

  const initialRequirements = initialData?.requirements
    ? initialData.requirements.split('\n').filter((s) => s.trim().length > 0)
    : [
        'Degree in Law, HR, Commerce, or related domain expertise.',
        'Deep practical understanding of Indian Labour Codes and statutory frameworks.',
      ]
  const [requirements, setRequirements] = useState<string[]>(initialRequirements)

  // Application Method
  const [applicationMethod, setApplicationMethod] = useState(initialData?.applicationMethod || 'Email')
  const [applicationEmail, setApplicationEmail] = useState(initialData?.applicationEmail || 'careers@labouraxis.com')
  const [applicationUrl, setApplicationUrl] = useState(initialData?.applicationUrl || '')

  // Status & Publishing Lifecycle
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED' | 'CLOSED'>(initialData?.status || 'PUBLISHED')
  const [publishedAt, setPublishedAt] = useState<string>(
    initialData?.publishedAt ? new Date(initialData.publishedAt).toISOString().split('T')[0] : ''
  )
  const [closingDate, setClosingDate] = useState<string>(
    initialData?.closingDate ? new Date(initialData.closingDate).toISOString().split('T')[0] : ''
  )
  const [displayOrder, setDisplayOrder] = useState<number>(initialData?.displayOrder || 0)

  // SEO
  const [seoTitle, setSeoTitle] = useState(initialData?.seoTitle || '')
  const [metaDescription, setMetaDescription] = useState(initialData?.metaDescription || '')

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isDirty, setIsDirty] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const markDirty = () => setIsDirty(true)

  // Auto-slugify when creating or when slug is unlocked
  const handleTitleChange = (val: string) => {
    markDirty()
    setTitle(val)
    if (!isEdit || !isSlugLocked) {
      setSlug(slugify(val))
    }
  }

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

  const handleAddResponsibility = () => {
    markDirty()
    setResponsibilities([...responsibilities, ''])
  }

  const handleUpdateResponsibility = (index: number, val: string) => {
    markDirty()
    const updated = [...responsibilities]
    updated[index] = val
    setResponsibilities(updated)
  }

  const handleRemoveResponsibility = (index: number) => {
    markDirty()
    setResponsibilities(responsibilities.filter((_, i) => i !== index))
  }

  const handleAddRequirement = () => {
    markDirty()
    setRequirements([...requirements, ''])
  }

  const handleUpdateRequirement = (index: number, val: string) => {
    markDirty()
    const updated = [...requirements]
    updated[index] = val
    setRequirements(updated)
  }

  const handleRemoveRequirement = (index: number) => {
    markDirty()
    setRequirements(requirements.filter((_, i) => i !== index))
  }

  const handleSave = async (overrideStatus?: 'DRAFT' | 'PUBLISHED' | 'CLOSED', redirectToList = false) => {
    if (!title.trim()) {
      setErrorMessage('Job Title is required.')
      return
    }

    const calculatedSlug = slug.trim() || slugify(title.trim())
    if (!calculatedSlug) {
      setErrorMessage('URL Slug is required.')
      return
    }
    if (!department.trim()) {
      setErrorMessage('Department is required.')
      return
    }
    if (!location.trim()) {
      setErrorMessage('Location is required.')
      return
    }
    if (!description.trim()) {
      setErrorMessage('Job Description is required.')
      return
    }

    const cleanRequirements = requirements.filter((r) => r.trim().length > 0).join('\n')
    if (!cleanRequirements) {
      setErrorMessage('At least one job requirement is required.')
      return
    }

    const targetStatus = overrideStatus || status

    if (applicationMethod === 'URL' && !applicationUrl.trim()) {
      setErrorMessage('Application URL is required for URL application method.')
      return
    }

    if (applicationMethod === 'Email' && !applicationEmail.trim()) {
      setErrorMessage('Application Email is required for Email application method.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')
    setSuccessMessage('')

    const payload = {
      title: title.trim(),
      slug: calculatedSlug,
      department: department.trim(),
      location: location.trim(),
      employmentType,
      workMode,
      experience: experience.trim() || null,
      salary: salary.trim() || null,
      description: description.trim(),
      responsibilities: responsibilities.filter((r) => r.trim().length > 0).join('\n') || null,
      requirements: cleanRequirements,
      applicationMethod,
      applicationUrl: applicationUrl.trim() || null,
      applicationEmail: applicationEmail.trim() || null,
      status: targetStatus,
      publishedAt: publishedAt ? new Date(publishedAt) : (targetStatus === 'PUBLISHED' ? new Date() : null),
      closingDate: closingDate ? new Date(closingDate) : null,
      displayOrder: Number(displayOrder) || 0,
      seoTitle: seoTitle.trim() || null,
      metaDescription: metaDescription.trim() || null,
    }

    try {
      const res = isEdit
        ? await updateJob(initialData.id, payload as any)
        : await createJob(payload as any)

      if (res.success) {
        setIsDirty(false)
        if (overrideStatus) setStatus(overrideStatus)
        setSuccessMessage(isEdit ? 'Position updated successfully!' : 'Position created successfully!')
        if (redirectToList) {
          router.push('/admin/careers')
          router.refresh()
        } else if (!isEdit && res.id) {
          router.push(`/admin/careers/${res.id}`)
        } else {
          router.refresh()
          setTimeout(() => setSuccessMessage(''), 3000)
        }
      } else {
        setErrorMessage(res.error || 'Failed to save job posting')
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
      const res = await deleteJob(initialData.id)
      if (res.success) {
        setIsDirty(false)
        router.push('/admin/careers')
        router.refresh()
      } else {
        setErrorMessage(res.error || 'Failed to delete job posting')
        setShowDeleteModal(false)
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to delete job posting')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 pb-24 text-[#202522]">
      {/* Top Action Bar */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border border-[#D9E1DC] p-4 rounded-2xl shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/careers"
            className="p-2 text-[#66736D] hover:text-[#12372A] hover:bg-[#F7F4EC] rounded-xl transition-colors"
            title="Back to Careers list"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#1F7A5C] bg-[#1F7A5C]/10 px-2 py-0.5 rounded-md">
                {isEdit ? 'Edit Career Opening' : 'New Career Opening'}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  status === 'PUBLISHED'
                    ? 'bg-[#1F7A5C]/10 text-[#1F7A5C]'
                    : status === 'CLOSED'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {status === 'PUBLISHED' ? '● Published' : status === 'CLOSED' ? '✕ Closed' : '○ Draft'}
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-[#12372A] mt-0.5">
              {title || (isEdit ? 'Untitled Job' : 'Create Job Opportunity')}
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
            <span>Preview Opening</span>
          </Button>

          {status !== 'DRAFT' && (
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => handleSave('DRAFT', false)}
              className="border-[#CBD5D0] text-[#12372A] bg-white hover:bg-[#12372A] hover:text-white hover:border-[#12372A] rounded-xl text-xs font-bold transition-all duration-150"
            >
              Revert to Draft
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => handleSave(undefined, false)}
            className="border-[#CBD5D0] text-[#12372A] bg-white hover:bg-[#12372A] hover:text-white hover:border-[#12372A] rounded-xl text-xs font-bold transition-all duration-150"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>

          {status !== 'PUBLISHED' ? (
            <Button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSave('PUBLISHED', true)}
              className="bg-[#1F7A5C] hover:bg-[#12372A] text-white rounded-xl text-xs font-bold px-5 shadow-xs transition-all duration-150"
            >
              <Globe className="w-3.5 h-3.5 mr-1.5" />
              Publish Position
            </Button>
          ) : (
            <Button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSave('PUBLISHED', true)}
              className="bg-[#1F7A5C] hover:bg-[#12372A] text-white rounded-xl text-xs font-bold px-5 shadow-xs transition-all duration-150"
            >
              <Save className="w-3.5 h-3.5 mr-1.5" />
              Save & Exit
            </Button>
          )}

          {isEdit && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDeleteModal(true)}
              className="border-rose-200 text-rose-600 bg-white hover:bg-rose-600 hover:text-white hover:border-rose-600 rounded-xl text-xs font-bold transition-all duration-150"
              title="Delete position"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Status Messages */}
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
        {/* LEFT COLUMN: Main Job Content */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. Position Overview */}
          <div className="bg-white border border-[#D9E1DC] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-[#D9E1DC]/80">
              <Briefcase className="w-5 h-5 text-[#1F7A5C]" />
              <h2 className="text-base font-bold text-[#12372A]">Job Information</h2>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-xs font-bold text-[#12372A]">
                Job Title <span className="text-rose-600">*</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Labour Compliance Consultant"
                className="text-sm rounded-xl border-[#D9E1DC] h-11"
                required
              />
            </div>

            {/* Slug with lock toggle */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="slug" className="text-xs font-bold text-[#12372A]">
                  URL Slug <span className="text-rose-600">*</span>
                </Label>
                {isEdit && (
                  <button
                    type="button"
                    onClick={() => setIsSlugLocked(!isSlugLocked)}
                    className="text-[11px] font-semibold text-[#1F7A5C] hover:underline inline-flex items-center gap-1"
                  >
                    {isSlugLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3 text-amber-600" />}
                    <span>{isSlugLocked ? 'Unlock to change slug' : 'Lock slug'}</span>
                  </button>
                )}
              </div>
              <div className="flex items-center">
                <span className="h-10 px-3 inline-flex items-center text-xs text-[#66736D] bg-[#F7F4EC] border border-r-0 border-[#D9E1DC] rounded-l-xl select-none">
                  /careers/
                </span>
                <Input
                  id="slug"
                  value={slug}
                  disabled={isEdit && isSlugLocked}
                  onChange={(e) => {
                    markDirty()
                    setSlug(slugify(e.target.value))
                  }}
                  placeholder="labour-compliance-consultant"
                  className="text-xs font-mono rounded-r-xl rounded-l-none border-[#D9E1DC] h-10 disabled:bg-slate-50"
                  required
                />
              </div>
              {isEdit && !isSlugLocked && (
                <p className="text-[11px] text-amber-700 font-medium">
                  ⚠️ Changing the slug of an active published job will change its public URL and SEO index.
                </p>
              )}
            </div>

            {/* Department & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department" className="text-xs font-bold text-[#12372A]">
                  Department <span className="text-rose-600">*</span>
                </Label>
                <Input
                  id="department"
                  list="departments-list"
                  value={department}
                  onChange={(e) => {
                    markDirty()
                    setDepartment(e.target.value)
                  }}
                  placeholder="e.g. Labour Compliance"
                  className="text-xs rounded-xl border-[#D9E1DC] h-10"
                  required
                />
                <datalist id="departments-list">
                  {COMMON_DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept} />
                  ))}
                </datalist>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-xs font-bold text-[#12372A]">
                  Location <span className="text-rose-600">*</span>
                </Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => {
                    markDirty()
                    setLocation(e.target.value)
                  }}
                  placeholder="e.g. Indore, Madhya Pradesh"
                  className="text-xs rounded-xl border-[#D9E1DC] h-10"
                  required
                />
              </div>
            </div>

            {/* Employment Type & Work Mode */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employmentType" className="text-xs font-bold text-[#12372A]">
                  Employment Type
                </Label>
                <select
                  id="employmentType"
                  value={employmentType}
                  onChange={(e) => {
                    markDirty()
                    setEmploymentType(e.target.value)
                  }}
                  className="w-full h-10 px-3 text-xs font-semibold rounded-xl bg-white border border-[#D9E1DC] text-[#12372A]"
                >
                  {EMPLOYMENT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="workMode" className="text-xs font-bold text-[#12372A]">
                  Work Mode
                </Label>
                <select
                  id="workMode"
                  value={workMode}
                  onChange={(e) => {
                    markDirty()
                    setWorkMode(e.target.value)
                  }}
                  className="w-full h-10 px-3 text-xs font-semibold rounded-xl bg-white border border-[#D9E1DC] text-[#12372A]"
                >
                  {WORK_MODES.map((mode) => (
                    <option key={mode} value={mode}>
                      {mode}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Experience & Salary (Optional) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="experience" className="text-xs font-bold text-[#12372A]">
                  Experience Range (Optional)
                </Label>
                <Input
                  id="experience"
                  value={experience}
                  onChange={(e) => {
                    markDirty()
                    setExperience(e.target.value)
                  }}
                  placeholder="e.g. 2–5 years in Factory / Labour Compliance"
                  className="text-xs rounded-xl border-[#D9E1DC] h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="salary" className="text-xs font-bold text-[#12372A]">
                  Compensation / Salary (Optional)
                </Label>
                <Input
                  id="salary"
                  value={salary}
                  onChange={(e) => {
                    markDirty()
                    setSalary(e.target.value)
                  }}
                  placeholder="e.g. Competitive / As per industry standards"
                  className="text-xs rounded-xl border-[#D9E1DC] h-10"
                />
              </div>
            </div>
          </div>

          {/* 2. Role Overview & Description */}
          <div className="bg-white border border-[#D9E1DC] rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#D9E1DC]/80">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#1F7A5C]" />
                <h2 className="text-base font-bold text-[#12372A]">Role Overview & Description</h2>
              </div>
              <span className="text-[11px] text-[#66736D]">Detailed summary of the role</span>
            </div>

            <Textarea
              id="description"
              value={description}
              onChange={(e) => {
                markDirty()
                setDescription(e.target.value)
              }}
              placeholder="We are looking for an experienced Labour Compliance Consultant to guide manufacturing plants and enterprise employers across pan-India statutory frameworks..."
              rows={6}
              className="text-xs rounded-xl border-[#D9E1DC] leading-relaxed"
              required
            />
          </div>

          {/* 3. Responsibilities (Repeatable List) */}
          <div className="bg-white border border-[#D9E1DC] rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#D9E1DC]/80">
              <div>
                <h2 className="text-base font-bold text-[#12372A]">Key Responsibilities</h2>
                <p className="text-[11px] text-[#66736D] mt-0.5">Structured bullet points for candidate clarity</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddResponsibility}
                className="border-[#D9E1DC] text-[#1F7A5C] hover:bg-[#1F7A5C]/10 rounded-xl text-xs font-bold"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Responsibility
              </Button>
            </div>

            <div className="space-y-2.5">
              {responsibilities.map((resp, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="mt-2.5 w-2 h-2 rounded-full bg-[#1F7A5C] shrink-0"></span>
                  <Input
                    value={resp}
                    onChange={(e) => handleUpdateResponsibility(idx, e.target.value)}
                    placeholder={`Responsibility #${idx + 1}`}
                    className="text-xs rounded-xl border-[#D9E1DC]"
                  />
                  {responsibilities.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveResponsibility(idx)}
                      className="p-2 text-[#66736D] hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 4. Requirements & Qualifications (Repeatable List) */}
          <div className="bg-white border border-[#D9E1DC] rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#D9E1DC]/80">
              <div>
                <h2 className="text-base font-bold text-[#12372A]">Requirements & Qualifications</h2>
                <p className="text-[11px] text-[#66736D] mt-0.5">Eligibility criteria, background and skills</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddRequirement}
                className="border-[#D9E1DC] text-[#1F7A5C] hover:bg-[#1F7A5C]/10 rounded-xl text-xs font-bold"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Requirement
              </Button>
            </div>

            <div className="space-y-2.5">
              {requirements.map((req, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="mt-2.5 w-2 h-2 rounded-full bg-[#D6A84F] shrink-0"></span>
                  <Input
                    value={req}
                    onChange={(e) => handleUpdateRequirement(idx, e.target.value)}
                    placeholder={`Requirement #${idx + 1}`}
                    className="text-xs rounded-xl border-[#D9E1DC]"
                  />
                  {requirements.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveRequirement(idx)}
                      className="p-2 text-[#66736D] hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 5. Application Method */}
          <div className="bg-white border border-[#D9E1DC] rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-[#D9E1DC]/80">
              <Send className="w-5 h-5 text-[#1F7A5C]" />
              <h2 className="text-base font-bold text-[#12372A]">Application Mechanism</h2>
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-bold text-[#12372A]">How Should Applicants Apply?</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { value: 'Email', label: 'Email Submission', icon: Mail },
                  { value: 'URL', label: 'External Application URL', icon: ExternalLink },
                  { value: 'Form', label: 'Website Contact / Form', icon: Send },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => {
                      markDirty()
                      setApplicationMethod(item.value)
                    }}
                    className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                      applicationMethod === item.value
                        ? 'border-[#1F7A5C] bg-[#1F7A5C]/10 text-[#12372A]'
                        : 'border-[#D9E1DC] bg-white text-[#66736D] hover:bg-[#F7F4EC]'
                    }`}
                  >
                    <item.icon className={`w-4 h-4 ${applicationMethod === item.value ? 'text-[#1F7A5C]' : 'text-[#66736D]'}`} />
                    <span className="text-xs font-bold">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {applicationMethod === 'Email' && (
              <div className="space-y-2 pt-2 animate-in fade-in">
                <Label htmlFor="applicationEmail" className="text-xs font-bold text-[#12372A]">
                  Receiving Email Address <span className="text-rose-600">*</span>
                </Label>
                <Input
                  id="applicationEmail"
                  type="email"
                  value={applicationEmail}
                  onChange={(e) => {
                    markDirty()
                    setApplicationEmail(e.target.value)
                  }}
                  placeholder="careers@labouraxis.com"
                  className="text-xs font-mono rounded-xl border-[#D9E1DC] h-10"
                  required
                />
              </div>
            )}

            {applicationMethod === 'URL' && (
              <div className="space-y-2 pt-2 animate-in fade-in">
                <Label htmlFor="applicationUrl" className="text-xs font-bold text-[#12372A]">
                  External Application Link (HTTPS) <span className="text-rose-600">*</span>
                </Label>
                <Input
                  id="applicationUrl"
                  type="url"
                  value={applicationUrl}
                  onChange={(e) => {
                    markDirty()
                    setApplicationUrl(e.target.value)
                  }}
                  placeholder="https://jobs.lever.co/... or https://boards.greenhouse.io/..."
                  className="text-xs font-mono rounded-xl border-[#D9E1DC] h-10"
                  required
                />
              </div>
            )}

            {applicationMethod === 'Form' && (
              <p className="text-xs text-[#66736D] bg-[#F7F4EC] p-3 rounded-xl border border-[#D9E1DC]">
                Applicants will be directed to the LabourAxis consultation and candidate contact gateway (`/contact`).
              </p>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Sidebar (Publishing, Lifecycle, SEO) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Status & Lifecycle Card */}
          <div className="bg-white border border-[#D9E1DC] rounded-3xl p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-[#D9E1DC]/80">
              <Layers className="w-4 h-4 text-[#1F7A5C]" />
              <h3 className="text-sm font-bold text-[#12372A]">Publishing & Lifecycle</h3>
            </div>

            {/* Status Radio / Buttons */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-[#12372A]">Current Position Status</Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'DRAFT', label: 'Draft', color: 'text-amber-800 bg-amber-50 border-amber-200' },
                  { value: 'PUBLISHED', label: 'Published', color: 'text-[#1F7A5C] bg-[#1F7A5C]/10 border-[#1F7A5C]' },
                  { value: 'CLOSED', label: 'Closed', color: 'text-rose-700 bg-rose-50 border-rose-200' },
                ].map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => {
                      markDirty()
                      setStatus(s.value as any)
                    }}
                    className={`py-2 px-2 text-center rounded-xl text-xs font-bold border transition-all ${
                      status === s.value
                        ? `${s.color} ring-2 ring-offset-1 ring-[#1F7A5C]/30`
                        : 'border-[#D9E1DC] bg-white text-[#66736D] hover:bg-[#F7F4EC]'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Published Date */}
            <div className="space-y-2">
              <Label htmlFor="publishedAt" className="text-xs font-bold text-[#12372A]">
                Published Date
              </Label>
              <Input
                id="publishedAt"
                type="date"
                value={publishedAt}
                onChange={(e) => {
                  markDirty()
                  setPublishedAt(e.target.value)
                }}
                className="text-xs rounded-xl border-[#D9E1DC] h-10"
              />
            </div>

            {/* Closing Date */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="closingDate" className="text-xs font-bold text-[#12372A]">
                  Application Deadline (Closing Date)
                </Label>
                {closingDate && (
                  <button
                    type="button"
                    onClick={() => {
                      markDirty()
                      setClosingDate('')
                    }}
                    className="text-[11px] text-rose-600 hover:underline"
                  >
                    Clear deadline
                  </button>
                )}
              </div>
              <Input
                id="closingDate"
                type="date"
                value={closingDate}
                onChange={(e) => {
                  markDirty()
                  setClosingDate(e.target.value)
                }}
                className="text-xs rounded-xl border-[#D9E1DC] h-10"
              />
              <p className="text-[11px] text-[#66736D]">
                Positions automatically expire after the deadline date and are excluded from active search schema.
              </p>
            </div>

            {/* Display Order */}
            <div className="space-y-2 pt-2 border-t border-[#D9E1DC]/80">
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
                Lower numbers appear higher on the Careers listings page (e.g. 1, 2, 3).
              </p>
            </div>
          </div>

          {/* SEO & Metadata Card */}
          <div className="bg-white border border-[#D9E1DC] rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#D9E1DC]/80">
              <Globe className="w-4 h-4 text-[#1F7A5C]" />
              <h3 className="text-sm font-bold text-[#12372A]">Search Engine Optimization</h3>
            </div>

            {/* Custom SEO Title */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="seoTitle" className="text-xs font-bold text-[#12372A]">
                  Custom SEO Title
                </Label>
                <span className="text-[10px] text-[#66736D]">{seoTitle.length}/60</span>
              </div>
              <Input
                id="seoTitle"
                value={seoTitle}
                onChange={(e) => {
                  markDirty()
                  setSeoTitle(e.target.value)
                }}
                placeholder={title ? `${title} | LabourAxis Careers` : 'Custom title tag'}
                className="text-xs rounded-xl border-[#D9E1DC] h-10"
              />
            </div>

            {/* Meta Description */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="metaDescription" className="text-xs font-bold text-[#12372A]">
                  Meta Description
                </Label>
                <span className="text-[10px] text-[#66736D]">{metaDescription.length}/160</span>
              </div>
              <Textarea
                id="metaDescription"
                value={metaDescription}
                onChange={(e) => {
                  markDirty()
                  setMetaDescription(e.target.value)
                }}
                placeholder="Brief summary for Google search result snippets..."
                rows={3}
                className="text-xs rounded-xl border-[#D9E1DC] leading-relaxed"
              />
            </div>

            {/* Google Snippet Simulation */}
            <div className="pt-3 border-t border-[#D9E1DC]/80 space-y-1">
              <span className="text-[10px] font-bold text-[#66736D] uppercase">Google Preview</span>
              <div className="p-3 bg-[#F7F4EC] rounded-xl border border-[#D9E1DC] space-y-1">
                <div className="text-xs text-[#1F7A5C] font-semibold truncate">
                  {seoTitle || (title ? `${title} | LabourAxis` : 'Job Opening | LabourAxis')}
                </div>
                <div className="text-[10px] text-[#66736D] truncate">
                  https://www.labouraxis.com/careers/{slug || 'job-slug'}
                </div>
                <div className="text-[11px] text-[#202522] line-clamp-2 leading-snug">
                  {metaDescription || description || 'Job opportunity overview at LabourAxis.'}
                </div>
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
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-[#D9E1DC] max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#D9E1DC]">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[#1F7A5C]" />
                <h3 className="text-base font-bold text-[#12372A]">Public Job Preview</h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreviewModal(false)}
                className="text-xs rounded-xl border-[#D9E1DC]"
              >
                Close Preview
              </Button>
            </div>

            {/* Job Header */}
            <div className="space-y-3 pb-6 border-b border-[#D9E1DC]">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold text-[#1F7A5C] bg-[#1F7A5C]/10 px-2.5 py-1 rounded-md uppercase tracking-wider">
                  {department || 'Department'}
                </span>
                <span className="text-[10px] font-bold text-[#12372A] bg-[#F7F4EC] border border-[#D9E1DC] px-2.5 py-1 rounded-md">
                  {employmentType} • {workMode}
                </span>
              </div>

              <h2 className="text-2xl font-bold text-[#12372A]">{title || 'Job Position Title'}</h2>

              <div className="flex flex-wrap items-center gap-4 text-xs text-[#66736D]">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#1F7A5C]" />
                  {location}
                </span>
                {closingDate && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    Deadline: {closingDate}
                  </span>
                )}
              </div>
            </div>

            {/* Overview */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#66736D]">Role Overview</h4>
              <p className="text-xs sm:text-sm text-[#202522] leading-relaxed whitespace-pre-line">
                {description || 'Job description text will appear here.'}
              </p>
            </div>

            {/* Responsibilities */}
            {responsibilities.length > 0 && (
              <div className="space-y-2 pt-3 border-t border-[#D9E1DC]/80">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#66736D]">Key Responsibilities</h4>
                <ul className="space-y-1.5 text-xs text-[#202522]">
                  {responsibilities.filter((r) => r.trim()).map((r, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#1F7A5C] shrink-0"></span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Requirements */}
            {requirements.length > 0 && (
              <div className="space-y-2 pt-3 border-t border-[#D9E1DC]/80">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#66736D]">Requirements</h4>
                <ul className="space-y-1.5 text-xs text-[#202522]">
                  {requirements.filter((r) => r.trim()).map((r, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#D6A84F] shrink-0"></span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Application CTA preview */}
            <div className="pt-4 border-t border-[#D9E1DC] flex items-center justify-between bg-[#F7F4EC] p-4 rounded-2xl">
              <div>
                <span className="text-[11px] font-bold text-[#12372A] block">Ready to Apply?</span>
                <span className="text-[10px] text-[#66736D]">
                  Method: {applicationMethod === 'Email' ? `Email to ${applicationEmail}` : applicationMethod === 'URL' ? 'External Application Link' : 'Website Form'}
                </span>
              </div>
              <Button size="sm" className="bg-[#1F7A5C] text-white text-xs font-bold rounded-xl pointer-events-none">
                Apply for Position
              </Button>
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
              <h3 className="text-base font-bold text-[#12372A]">Delete Position &quot;{title}&quot;?</h3>
              <p className="text-xs text-[#66736D] mt-1.5 leading-relaxed">
                This will permanently delete this job posting. If this position was previously indexed, search engines will receive a 404 response.
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
    </div>
  )
}
