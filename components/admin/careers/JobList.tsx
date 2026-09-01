'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Search,
  Eye,
  Pencil,
  Trash2,
  Globe,
  XCircle,
  Clock,
  Briefcase,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Plus,
  Building2,
  Calendar,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SafeJobPosting } from '@/lib/db/careers'
import {
  publishJob,
  unpublishJob,
  closeJob,
  deleteJob,
} from '@/app/actions/careers'

interface JobListProps {
  initialJobs: SafeJobPosting[]
  totalCount: number
  draftCount: number
  publishedCount: number
  closedCount: number
  expiredCount: number
  currentPage: number
  pageSize: number
  departments: string[]
  currentFilters: {
    q: string
    status: string
    dept: string
  }
}

export default function JobList({
  initialJobs,
  totalCount,
  draftCount,
  publishedCount,
  closedCount,
  expiredCount,
  currentPage,
  pageSize,
  departments,
  currentFilters,
}: JobListProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [searchQuery, setSearchQuery] = useState(currentFilters.q || '')
  const [selectedStatus, setSelectedStatus] = useState(currentFilters.status || 'all')
  const [selectedDept, setSelectedDept] = useState(currentFilters.dept || 'all')

  // Preview & Delete Modals
  const [previewJob, setPreviewJob] = useState<SafeJobPosting | null>(null)
  const [deleteJobTarget, setDeleteJobTarget] = useState<SafeJobPosting | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [actionMessage, setActionMessage] = useState('')

  const applyFilters = (newQ?: string, newStatus?: string, newDept?: string, page = 1) => {
    const params = new URLSearchParams(searchParams.toString())

    const q = newQ !== undefined ? newQ : searchQuery
    const status = newStatus !== undefined ? newStatus : selectedStatus
    const dept = newDept !== undefined ? newDept : selectedDept

    if (q.trim()) params.set('q', q.trim())
    else params.delete('q')

    if (status && status !== 'all') params.set('status', status)
    else params.delete('status')

    if (dept && dept !== 'all') params.set('dept', dept)
    else params.delete('dept')

    if (page > 1) params.set('page', String(page))
    else params.delete('page')

    router.push(`/admin/careers?${params.toString()}`)
  }

  // Live debounced search as user types without pressing Enter
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== (currentFilters.q || '')) {
        applyFilters(searchQuery, selectedStatus, selectedDept, 1)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    applyFilters(searchQuery, selectedStatus, selectedDept, 1)
  }

  const handleQuickPublish = async (job: SafeJobPosting) => {
    setIsProcessing(true)
    try {
      if (job.status === 'PUBLISHED') {
        await unpublishJob(job.id)
        setActionMessage(`Reverted "${job.title}" to Draft.`)
      } else {
        await publishJob(job.id)
        setActionMessage(`Published "${job.title}".`)
      }
      router.refresh()
      setTimeout(() => setActionMessage(''), 3000)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleQuickClose = async (job: SafeJobPosting) => {
    setIsProcessing(true)
    try {
      await closeJob(job.id)
      setActionMessage(`Position "${job.title}" is now closed.`)
      router.refresh()
      setTimeout(() => setActionMessage(''), 3000)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteJobTarget) return
    setIsProcessing(true)
    try {
      await deleteJob(deleteJobTarget.id)
      setDeleteJobTarget(null)
      setActionMessage(`Job removed successfully.`)
      router.refresh()
      setTimeout(() => setActionMessage(''), 3000)
    } finally {
      setIsProcessing(false)
    }
  }

  const totalPages = Math.ceil(totalCount / pageSize) || 1

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {actionMessage && (
        <div className="p-3.5 bg-[#1F7A5C]/10 border border-[#1F7A5C]/20 text-[#1F7A5C] rounded-2xl text-xs font-semibold animate-in fade-in">
          {actionMessage}
        </div>
      )}

      {/* Toolbar: Search, Status tabs, Department Filter */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#66736D]" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search positions, department, location..."
            className="pl-10 text-xs rounded-2xl border-[#D9E1DC] bg-white h-10 shadow-2xs"
          />
        </form>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Department Filter */}
          {departments.length > 0 && (
            <select
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value)
                applyFilters(searchQuery, selectedStatus, e.target.value, 1)
              }}
              className="h-10 px-3 text-xs font-semibold rounded-2xl bg-white border border-[#D9E1DC] text-[#12372A]"
            >
              <option value="all">All Departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          )}

          {/* Status Filter Tabs */}
          <div className="flex items-center bg-[#F7F4EC] p-1 rounded-2xl border border-[#D9E1DC]">
            {[
              { id: 'all', label: `All (${totalCount})` },
              { id: 'published', label: `Published (${publishedCount})` },
              { id: 'draft', label: `Draft (${draftCount})` },
              { id: 'closed', label: `Closed (${closedCount})` },
              { id: 'expired', label: `Expired (${expiredCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setSelectedStatus(tab.id)
                  applyFilters(searchQuery, tab.id, selectedDept, 1)
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedStatus === tab.id
                    ? 'bg-white text-[#12372A] shadow-xs'
                    : 'text-[#66736D] hover:text-[#12372A]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop Table (hidden on mobile) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-[#D9E1DC] text-xs">
          <thead className="bg-[#F7F4EC] text-[#66736D] uppercase font-bold tracking-wider text-[10px]">
            <tr>
              <th scope="col" className="px-4 py-3.5 text-left font-bold w-12">
                #
              </th>
              <th scope="col" className="px-4 py-3.5 text-left font-bold">
                Position Title & Slug
              </th>
              <th scope="col" className="px-4 py-3.5 text-left font-bold">
                Department
              </th>
              <th scope="col" className="px-4 py-3.5 text-left font-bold">
                Location & Mode
              </th>
              <th scope="col" className="px-4 py-3.5 text-left font-bold">
                Type
              </th>
              <th scope="col" className="px-4 py-3.5 text-left font-bold">
                Status
              </th>
              <th scope="col" className="px-4 py-3.5 text-left font-bold">
                Closing Date
              </th>
              <th scope="col" className="px-4 py-3.5 text-right font-bold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-[#D9E1DC]/60">
            {initialJobs.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-xs text-[#66736D]">
                  <Briefcase className="w-8 h-8 text-[#A2B3AA] mx-auto mb-2 opacity-50" />
                  <p className="font-semibold text-[#12372A]">No career openings found.</p>
                  <p className="text-[11px] text-[#66736D] mt-1">Try adjusting your filters or create a new job.</p>
                </td>
              </tr>
            ) : (
              initialJobs.map((job, idx) => {
                const serial = String((currentPage - 1) * pageSize + idx + 1).padStart(2, '0')
                return (
                  <tr key={job.id} className="hover:bg-[#F7F4EC]/60 transition-colors">
                    {/* Serial */}
                    <td className="px-4 py-4 whitespace-nowrap font-mono text-[11px] text-[#66736D]">
                      {serial}
                    </td>

                    {/* Title & Slug */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <Link
                          href={`/admin/careers/${job.id}`}
                          className="font-bold text-[#12372A] hover:text-[#1F7A5C] transition-colors"
                        >
                          {job.title}
                        </Link>
                        <span className="text-[10px] text-[#66736D] font-mono">/careers/{job.slug}</span>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#1F7A5C]/10 text-[#1F7A5C] border border-[#1F7A5C]/20">
                        {job.department}
                      </span>
                    </td>

                    {/* Location & Mode */}
                    <td className="px-4 py-4 whitespace-nowrap text-[#66736D]">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#1F7A5C] shrink-0" />
                        <span>{job.location}</span>
                        <span className="text-[10px] text-[#66736D]">({job.workMode})</span>
                      </div>
                    </td>

                    {/* Employment Type */}
                    <td className="px-4 py-4 whitespace-nowrap text-[#66736D] font-medium">
                      {job.employmentType}
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      {job.isExpired ? (
                        <span className="px-2.5 py-0.5 inline-flex text-[10px] leading-5 font-bold rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                          ● Expired
                        </span>
                      ) : job.status === 'PUBLISHED' ? (
                        <span className="px-2.5 py-0.5 inline-flex text-[10px] leading-5 font-bold rounded-full bg-[#1F7A5C]/10 text-[#1F7A5C] border border-[#1F7A5C]/20">
                          ● Published
                        </span>
                      ) : job.status === 'CLOSED' ? (
                        <span className="px-2.5 py-0.5 inline-flex text-[10px] leading-5 font-bold rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                          ✕ Closed
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 inline-flex text-[10px] leading-5 font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                          ○ Draft
                        </span>
                      )}
                    </td>

                    {/* Closing Date */}
                    <td className="px-4 py-4 whitespace-nowrap text-[#66736D]">
                      {job.closingDate ? (
                        <span className={`text-[11px] ${job.isExpired ? 'text-rose-600 font-semibold' : ''}`}>
                          {new Date(job.closingDate).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#A2B3AA]">Open Until Filled</span>
                      )}
                    </td>

                    {/* Action Icons */}
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setPreviewJob(job)}
                          className="p-1.5 text-[#66736D] hover:text-[#1F7A5C] hover:bg-[#F7F4EC] rounded-lg transition-colors"
                          title="Preview Job"
                          aria-label="Preview Job"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <Link
                          href={`/admin/careers/${job.id}`}
                          className="p-1.5 text-[#66736D] hover:text-[#1F7A5C] hover:bg-[#F7F4EC] rounded-lg transition-colors"
                          title="Edit Job"
                          aria-label="Edit Job"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>

                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleQuickPublish(job)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            job.status === 'PUBLISHED'
                              ? 'text-[#1F7A5C] bg-[#1F7A5C]/15 hover:bg-[#1F7A5C]/25'
                              : 'text-slate-400 hover:text-[#12372A] hover:bg-[#F7F4EC]'
                          }`}
                          title={job.status === 'PUBLISHED' ? 'Published (Click to Revert to Draft)' : 'Draft (Click to Publish)'}
                          aria-label={job.status === 'PUBLISHED' ? 'Published (Click to Revert to Draft)' : 'Draft (Click to Publish)'}
                        >
                          <Globe className={`w-4 h-4 ${job.status === 'PUBLISHED' ? 'text-[#1F7A5C]' : 'text-slate-400'}`} />
                        </button>

                        {job.status !== 'CLOSED' && (
                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => handleQuickClose(job)}
                            className="p-1.5 text-[#66736D] hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Close Position"
                            aria-label="Close Position"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setDeleteJobTarget(job)}
                          className="p-1.5 text-[#66736D] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Position"
                          aria-label="Delete Position"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View (visible on screens < 768px) */}
      <div className="block md:hidden space-y-4">
        {initialJobs.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#66736D] bg-[#F7F4EC] rounded-2xl">
            No career openings found.
          </div>
        ) : (
          initialJobs.map((job, idx) => {
            const serial = String((currentPage - 1) * pageSize + idx + 1).padStart(2, '0')
            return (
              <div
                key={job.id}
                className="bg-white p-5 rounded-2xl border border-[#D9E1DC] shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-[#66736D]">#{serial}</span>
                  {job.isExpired ? (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                      Expired
                    </span>
                  ) : job.status === 'PUBLISHED' ? (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#1F7A5C]/10 text-[#1F7A5C]">
                      Published
                    </span>
                  ) : job.status === 'CLOSED' ? (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-100 text-rose-700">
                      Closed
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800">
                      Draft
                    </span>
                  )}
                </div>

                <div>
                  <Link
                    href={`/admin/careers/${job.id}`}
                    className="font-bold text-[#12372A] text-sm hover:underline block"
                  >
                    {job.title}
                  </Link>
                  <span className="text-[10px] text-[#66736D] font-mono">/careers/{job.slug}</span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-[#66736D]">
                  <span className="bg-[#1F7A5C]/10 text-[#1F7A5C] px-2 py-0.5 rounded-md font-bold text-[10px]">
                    {job.department}
                  </span>
                  <span>•</span>
                  <span>{job.location} ({job.workMode})</span>
                  <span>•</span>
                  <span>{job.employmentType}</span>
                </div>

                {job.closingDate && (
                  <div className="text-[11px] text-[#66736D] flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Deadline: {new Date(job.closingDate).toLocaleDateString('en-GB')}</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D9E1DC]/80">
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleQuickPublish(job)}
                    className={`p-1.5 rounded-xl border transition-colors ${
                      job.status === 'PUBLISHED'
                        ? 'border-[#1F7A5C]/30 bg-[#1F7A5C]/15 text-[#1F7A5C]'
                        : 'border-[#D9E1DC] bg-white text-slate-400'
                    }`}
                    title={job.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                  >
                    <Globe className="w-4 h-4" />
                  </button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPreviewJob(job)}
                    className="text-xs rounded-xl border-[#D9E1DC] h-8 px-2.5"
                  >
                    <Eye className="w-3.5 h-3.5 mr-1" />
                    Preview
                  </Button>
                  <Link
                    href={`/admin/careers/${job.id}`}
                    className="inline-flex items-center justify-center px-3 py-1.5 font-bold rounded-xl text-xs bg-[#1F7A5C] text-white hover:bg-[#165B44]"
                  >
                    <Pencil className="w-3.5 h-3.5 mr-1" />
                    Edit
                  </Link>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDeleteJobTarget(job)}
                    className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50 rounded-xl h-8 px-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-[#D9E1DC]">
          <p className="text-xs text-[#66736D]">
            Showing <span className="font-semibold text-[#12372A]">{(currentPage - 1) * pageSize + 1}</span> to{' '}
            <span className="font-semibold text-[#12372A]">
              {Math.min(currentPage * pageSize, totalCount)}
            </span>{' '}
            of <span className="font-semibold text-[#12372A]">{totalCount}</span> positions
          </p>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => applyFilters(searchQuery, selectedStatus, selectedDept, currentPage - 1)}
              className="text-xs rounded-xl border-[#D9E1DC] h-8"
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-1" />
              Previous
            </Button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = i + 1
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => applyFilters(searchQuery, selectedStatus, selectedDept, p)}
                  className={`w-8 h-8 rounded-xl text-xs font-bold transition-colors ${
                    currentPage === p
                      ? 'bg-[#1F7A5C] text-white'
                      : 'text-[#66736D] hover:bg-[#F7F4EC] border border-[#D9E1DC]'
                  }`}
                >
                  {p}
                </button>
              )
            })}

            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => applyFilters(searchQuery, selectedStatus, selectedDept, currentPage + 1)}
              className="text-xs rounded-xl border-[#D9E1DC] h-8"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* PREVIEW MODAL                                        */}
      {/* ---------------------------------------------------- */}
      {previewJob && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-[#D9E1DC] max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#D9E1DC]">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[#1F7A5C]" />
                <h3 className="text-base font-bold text-[#12372A]">Preview Job</h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewJob(null)}
                className="text-xs rounded-xl border-[#D9E1DC]"
              >
                Close
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold text-[#1F7A5C] bg-[#1F7A5C]/10 px-2.5 py-0.5 rounded-md">
                  {previewJob.department}
                </span>
                <span className="text-[10px] font-bold text-[#12372A] bg-[#F7F4EC] border border-[#D9E1DC] px-2.5 py-0.5 rounded-md">
                  {previewJob.employmentType} • {previewJob.workMode}
                </span>
              </div>
              <h2 className="text-xl font-bold text-[#12372A]">{previewJob.title}</h2>
              <div className="flex items-center gap-2 text-xs text-[#66736D]">
                <MapPin className="w-3.5 h-3.5 text-[#1F7A5C]" />
                <span>{previewJob.location}</span>
              </div>
            </div>

            <div className="space-y-1.5 pt-3 border-t border-[#D9E1DC]/80">
              <h4 className="text-xs font-bold text-[#66736D] uppercase">Overview</h4>
              <p className="text-xs text-[#202522] leading-relaxed whitespace-pre-line">
                {previewJob.description}
              </p>
            </div>

            {previewJob.responsibilities && (
              <div className="space-y-1.5 pt-3 border-t border-[#D9E1DC]/80">
                <h4 className="text-xs font-bold text-[#66736D] uppercase">Responsibilities</h4>
                <ul className="space-y-1 text-xs text-[#202522]">
                  {previewJob.responsibilities.split('\n').filter(Boolean).map((r, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#1F7A5C] shrink-0"></span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {previewJob.requirements && (
              <div className="space-y-1.5 pt-3 border-t border-[#D9E1DC]/80">
                <h4 className="text-xs font-bold text-[#66736D] uppercase">Requirements</h4>
                <ul className="space-y-1 text-xs text-[#202522]">
                  {previewJob.requirements.split('\n').filter(Boolean).map((r, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#D6A84F] shrink-0"></span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* DELETE CONFIRMATION MODAL                            */}
      {/* ---------------------------------------------------- */}
      {deleteJobTarget && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-rose-100 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#12372A]">Delete &quot;{deleteJobTarget.title}&quot;?</h3>
              <p className="text-xs text-[#66736D] mt-1.5 leading-relaxed">
                This permanently removes this job opening from the database and public Careers pages.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D9E1DC]">
              <Button
                variant="outline"
                onClick={() => setDeleteJobTarget(null)}
                className="text-xs rounded-xl border-[#D9E1DC]"
              >
                Cancel
              </Button>
              <Button
                disabled={isProcessing}
                onClick={handleDeleteConfirm}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl px-4"
              >
                {isProcessing ? 'Deleting...' : 'Confirm Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
