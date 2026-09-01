'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Search,
  Eye,
  Edit2,
  Trash2,
  User,
  ExternalLink,
  Layers,
  ChevronRight,
  AlertTriangle,
  Loader2,
  Plus,
  ToggleLeft,
  ToggleRight,
  X,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  toggleTeamMemberStatus,
  deleteTeamMember,
} from '@/app/actions/team'

interface TeamMemberListItem {
  id: string
  name: string
  designation: string
  role: string | null
  department: string | null
  bio: string | null
  imageUrl: string | null
  imageAlt: string | null
  linkedinUrl: string | null
  displayOrder: number
  isActive: boolean
  createdAt: string | Date
  reportsTo: {
    id: string
    name: string
    designation: string
  } | null
  directReports?: {
    id: string
    name: string
  }[]
}

interface TeamListProps {
  initialMembers: TeamMemberListItem[]
  totalCount: number
  currentPage: number
  pageSize: number
  departments: string[]
  currentFilters: {
    q: string
    status: string
    dept: string
  }
}

export default function TeamList({
  initialMembers,
  totalCount,
  currentPage,
  pageSize,
  departments,
  currentFilters,
}: TeamListProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(currentFilters.q)
  const [selectedStatus, setSelectedStatus] = useState(currentFilters.status || 'all')
  const [selectedDept, setSelectedDept] = useState(currentFilters.dept || 'all')

  const [previewMember, setPreviewMember] = useState<TeamMemberListItem | null>(null)
  const [deletingMember, setDeletingMember] = useState<TeamMemberListItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [actionError, setActionError] = useState('')

  const totalPages = Math.ceil(totalCount / pageSize)

  const applyFilters = (newQ?: string, newStatus?: string, newDept?: string, page = 1) => {
    const params = new URLSearchParams(searchParams.toString())
    const qVal = newQ !== undefined ? newQ : search
    const statusVal = newStatus !== undefined ? newStatus : selectedStatus
    const deptVal = newDept !== undefined ? newDept : selectedDept

    if (qVal) params.set('q', qVal)
    else params.delete('q')

    if (statusVal && statusVal !== 'all') params.set('status', statusVal)
    else params.delete('status')

    if (deptVal && deptVal !== 'all') params.set('dept', deptVal)
    else params.delete('dept')

    params.set('page', page.toString())
    router.push(`/admin/team?${params.toString()}`)
  }

  const handleToggleStatus = async (member: TeamMemberListItem) => {
    setTogglingId(member.id)
    try {
      const res = await toggleTeamMemberStatus(member.id)
      if (res.success) {
        router.refresh()
      } else {
        alert(res.error || 'Failed to update status')
      }
    } catch {
      alert('Error updating status')
    } finally {
      setTogglingId(null)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deletingMember) return
    setIsDeleting(true)
    setActionError('')

    try {
      const res = await deleteTeamMember(deletingMember.id, { force: true })
      if (res.success) {
        setDeletingMember(null)
        if (previewMember?.id === deletingMember.id) setPreviewMember(null)
        router.refresh()
      } else {
        setActionError(res.error || 'Failed to delete member')
      }
    } catch (err: any) {
      setActionError(err.message || 'Error deleting member')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Search, Status & Department Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#F7F4EC]/60 p-4 rounded-2xl border border-[#D9E1DC]">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#66736D]" />
          <Input
            type="text"
            placeholder="Search by name, role, department or bio..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              applyFilters(e.target.value, undefined, undefined, 1)
            }}
            className="pl-10 h-10 text-xs rounded-xl bg-white border-[#D9E1DC]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-[#66736D] uppercase">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value)
                applyFilters(undefined, e.target.value, undefined, 1)
              }}
              className="h-10 px-3 text-xs font-semibold rounded-xl bg-white border border-[#D9E1DC] text-[#12372A]"
            >
              <option value="all">All Members</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>

          {/* Department Filter */}
          {departments.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-[#66736D] uppercase">Dept:</span>
              <select
                value={selectedDept}
                onChange={(e) => {
                  setSelectedDept(e.target.value)
                  applyFilters(undefined, undefined, e.target.value, 1)
                }}
                className="h-10 px-3 text-xs font-semibold rounded-xl bg-white border border-[#D9E1DC] text-[#12372A]"
              >
                <option value="all">All Departments</option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Main Members Directory */}
      {initialMembers.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-[#D9E1DC] p-8">
          <Users className="w-12 h-12 mx-auto text-[#A2B3AA] mb-3" />
          <h3 className="text-base font-bold text-[#12372A]">No team members found</h3>
          <p className="text-xs text-[#66736D] mt-1 max-w-sm mx-auto">
            {search || selectedStatus !== 'all' || selectedDept !== 'all'
              ? 'No team profiles match your search criteria. Try adjusting filters.'
              : 'Your team directory is empty. Click "+ Add Team Member" to get started.'}
          </p>
          {(search || selectedStatus !== 'all' || selectedDept !== 'all') && (
            <Button
              onClick={() => {
                setSearch('')
                setSelectedStatus('all')
                setSelectedDept('all')
                applyFilters('', 'all', 'all', 1)
              }}
              variant="outline"
              className="mt-4 text-xs rounded-xl border-[#D9E1DC]"
            >
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-hidden rounded-2xl border border-[#D9E1DC] bg-white shadow-2xs">
            <table className="min-w-full divide-y divide-[#D9E1DC] text-xs">
              <thead className="bg-[#F7F4EC] text-[#66736D] uppercase font-bold tracking-wider text-[10px]">
                <tr>
                  <th scope="col" className="px-4 py-3.5 text-center font-bold w-12">#</th>
                  <th scope="col" className="px-4 py-3.5 text-left font-bold w-16">Photo</th>
                  <th scope="col" className="px-4 py-3.5 text-left font-bold">Name & Designation</th>
                  <th scope="col" className="px-4 py-3.5 text-left font-bold">Department</th>
                  <th scope="col" className="px-4 py-3.5 text-left font-bold">Reports To</th>
                  <th scope="col" className="px-4 py-3.5 text-center font-bold">Status</th>
                  <th scope="col" className="px-4 py-3.5 text-center font-bold w-16">Order</th>
                  <th scope="col" className="px-4 py-3.5 text-right font-bold w-28">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9E1DC]/70 bg-white">
                {initialMembers.map((member, idx) => {
                  const serialNo = (currentPage - 1) * pageSize + idx + 1
                  const isRoot = !member.reportsTo
                  return (
                    <tr
                      key={member.id}
                      className="hover:bg-[#F7F4EC]/50 transition-colors group"
                    >
                      {/* Global Serial */}
                      <td className="px-4 py-3.5 text-center font-mono text-[11px] text-[#66736D]">
                        {String(serialNo).padStart(2, '0')}
                      </td>

                      {/* Photo Thumbnail */}
                      <td className="px-4 py-3.5">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#F7F4EC] border border-[#D9E1DC] flex items-center justify-center shrink-0">
                          {member.imageUrl ? (
                            <img
                              src={member.imageUrl}
                              alt={member.imageAlt || member.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-5 h-5 text-[#12372A]" />
                          )}
                        </div>
                      </td>

                      {/* Name & Designation */}
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-[#12372A] text-xs flex items-center gap-1.5">
                          <span>{member.name}</span>
                          {member.linkedinUrl && (
                            <a
                              href={member.linkedinUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#1F7A5C] hover:text-[#165B44]"
                              title="LinkedIn Profile"
                            >
                              <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.48 1.48 0 1 0 0-2.96 1.48 1.48 0 0 0 0 2.96m1.4 9.74v-8.37H5.06v8.37h2.8z" />
                              </svg>
                            </a>
                          )}
                        </div>
                        <div className="text-[11px] text-[#66736D] mt-0.5 font-medium">
                          {member.designation || member.role}
                        </div>
                      </td>

                      {/* Department */}
                      <td className="px-4 py-3.5">
                        {member.department ? (
                          <span className="px-2.5 py-0.5 rounded-md bg-[#F7F4EC] text-[#12372A] border border-[#D9E1DC] text-[10px] font-bold">
                            {member.department}
                          </span>
                        ) : (
                          <span className="text-[#A2B3AA] text-[11px]">—</span>
                        )}
                      </td>

                      {/* Reports To */}
                      <td className="px-4 py-3.5">
                        {isRoot ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#D6A84F] bg-[#12372A] px-2 py-0.5 rounded-md">
                            ★ Top Leadership
                          </span>
                        ) : (
                          <div className="flex items-center gap-1 text-[11px] text-[#12372A] font-semibold">
                            <span className="text-[#66736D]">↳</span>
                            <span>{member.reportsTo?.name}</span>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(member)}
                          disabled={togglingId === member.id}
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 transition-all ${
                            member.isActive
                              ? 'bg-[#1F7A5C]/10 text-[#1F7A5C] border border-[#1F7A5C]/20 hover:bg-[#1F7A5C]/20'
                              : 'bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-200'
                          }`}
                          title={member.isActive ? 'Click to deactivate' : 'Click to activate'}
                        >
                          {togglingId === member.id ? (
                            <Loader2 className="w-2.5 h-2.5 animate-spin" />
                          ) : (
                            <span>{member.isActive ? '● Active' : '○ Inactive'}</span>
                          )}
                        </button>
                      </td>

                      {/* Order */}
                      <td className="px-4 py-3.5 text-center font-mono text-[11px] text-[#66736D]">
                        {member.displayOrder}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setPreviewMember(member)}
                            className="p-1.5 rounded-lg text-[#66736D] hover:text-[#1F7A5C] hover:bg-[#F7F4EC] transition-colors"
                            title="Preview profile card"
                            aria-label="Preview profile card"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <Link
                            href={`/admin/team/${member.id}`}
                            className="p-1.5 rounded-lg text-[#66736D] hover:text-[#1F7A5C] hover:bg-[#F7F4EC] transition-colors inline-block"
                            title="Edit profile"
                            aria-label="Edit profile"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => setDeletingMember(member)}
                            className="p-1.5 rounded-lg text-[#66736D] hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete profile"
                            aria-label="Delete profile"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {initialMembers.map((member, idx) => {
              const serialNo = (currentPage - 1) * pageSize + idx + 1
              return (
                <div
                  key={member.id}
                  className="bg-white border border-[#D9E1DC] rounded-2xl p-4 shadow-2xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#F7F4EC] border border-[#D9E1DC] flex items-center justify-center shrink-0">
                        {member.imageUrl ? (
                          <img
                            src={member.imageUrl}
                            alt={member.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-6 h-6 text-[#12372A]" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-[#12372A] text-sm">{member.name}</div>
                        <div className="text-xs text-[#1F7A5C] font-semibold">{member.designation || member.role}</div>
                        {member.department && (
                          <span className="inline-block mt-0.5 text-[9px] font-bold text-[#66736D] bg-[#F7F4EC] px-2 py-0.5 rounded-md border border-[#D9E1DC]">
                            {member.department}
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="font-mono text-xs font-bold text-[#66736D]">
                      #{String(serialNo).padStart(2, '0')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-[#D9E1DC]/60 text-[#66736D]">
                    <span>
                      {member.reportsTo ? `Reports to: ${member.reportsTo.name}` : '★ Top Leadership'}
                    </span>
                    <span className="font-mono font-semibold">Order: {member.displayOrder}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#D9E1DC]/60">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(member)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        member.isActive
                          ? 'bg-[#1F7A5C]/10 text-[#1F7A5C]'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {member.isActive ? '● Active' : '○ Inactive'}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPreviewMember(member)}
                        className="p-2 rounded-xl bg-[#F7F4EC] text-[#12372A]"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <Link
                        href={`/admin/team/${member.id}`}
                        className="p-2 rounded-xl bg-[#1F7A5C] text-white"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDeletingMember(member)}
                        className="p-2 rounded-xl bg-rose-50 text-rose-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#D9E1DC]">
          <p className="text-xs text-[#66736D]">
            Showing <span className="font-bold text-[#12372A]">{(currentPage - 1) * pageSize + 1}</span> to{' '}
            <span className="font-bold text-[#12372A]">
              {Math.min(currentPage * pageSize, totalCount)}
            </span>{' '}
            of <span className="font-bold text-[#12372A]">{totalCount}</span> profiles
          </p>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => applyFilters(undefined, undefined, undefined, currentPage - 1)}
              className="text-xs rounded-xl border-[#D9E1DC]"
            >
              ← Previous
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => {
                if (totalPages <= 5) return true
                return Math.abs(p - currentPage) <= 2
              })
              .map((p) => (
                <Button
                  key={p}
                  size="sm"
                  variant={p === currentPage ? 'default' : 'outline'}
                  onClick={() => applyFilters(undefined, undefined, undefined, p)}
                  className={`text-xs rounded-xl ${
                    p === currentPage
                      ? 'bg-[#1F7A5C] text-white'
                      : 'border-[#D9E1DC] text-[#12372A]'
                  }`}
                >
                  {p}
                </Button>
              ))}

            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => applyFilters(undefined, undefined, undefined, currentPage + 1)}
              className="text-xs rounded-xl border-[#D9E1DC]"
            >
              Next →
            </Button>
          </div>
        </div>
      )}

      {/* 1. Preview Modal */}
      {previewMember && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl border border-[#D9E1DC] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#D9E1DC]">
              <h3 className="text-base font-bold text-[#12372A]">Public Profile Preview</h3>
              <button
                type="button"
                onClick={() => setPreviewMember(null)}
                className="p-1.5 text-[#66736D] hover:text-[#12372A] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#F7F4EC] border border-[#D9E1DC] rounded-3xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-16 h-16 bg-[#EDE8DE] rounded-2xl shrink-0 flex items-center justify-center overflow-hidden border-2 border-white shadow-xs">
                      {previewMember.imageUrl ? (
                        <img
                          src={previewMember.imageUrl}
                          alt={previewMember.imageAlt || previewMember.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-8 h-8 text-[#12372A]" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-[#12372A]">{previewMember.name}</h4>
                      <p className="text-[#1F7A5C] font-bold text-xs">
                        {previewMember.designation || previewMember.role}
                      </p>
                      {previewMember.department && (
                        <span className="inline-block mt-1 text-[10px] font-bold text-[#66736D] bg-white px-2 py-0.5 rounded-md border border-[#D9E1DC]">
                          {previewMember.department}
                        </span>
                      )}
                    </div>
                  </div>

                  {previewMember.linkedinUrl && (
                    <a
                      href={previewMember.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-xl bg-white border border-[#D9E1DC] flex items-center justify-center text-[#1F7A5C] hover:bg-[#1F7A5C] hover:text-white transition-colors shadow-2xs shrink-0"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.48 1.48 0 1 0 0-2.96 1.48 1.48 0 0 0 0 2.96m1.4 9.74v-8.37H5.06v8.37h2.8z" />
                      </svg>
                    </a>
                  )}
                </div>

                {previewMember.bio && (
                  <p className="text-[#202522] text-xs leading-relaxed mt-2 border-t border-[#D9E1DC]/80 pt-3">
                    {previewMember.bio}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-[#D9E1DC]/80 flex items-center justify-between text-[11px] text-[#66736D]">
                <span>
                  {previewMember.reportsTo
                    ? `Reports to: ${previewMember.reportsTo.name}`
                    : '★ Top Leadership'}
                </span>
                <span className="font-mono font-semibold">Priority Order: {previewMember.displayOrder}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Delete Confirmation Modal */}
      {deletingMember && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-rose-100 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#D9E1DC]">
              <h3 className="text-base font-bold text-[#12372A] flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <span>Delete Profile?</span>
              </h3>
              <button
                type="button"
                onClick={() => setDeletingMember(null)}
                className="p-1.5 text-[#66736D] hover:text-[#12372A] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-[#66736D]">
              <p>
                Are you sure you want to permanently delete{' '}
                <strong className="text-[#12372A]">{deletingMember.name}</strong>?
              </p>
              <p className="text-[11px]">
                Any subordinates reporting to this member will safely be retained and reassigned to the parent manager.
              </p>

              {actionError && (
                <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs font-semibold border border-rose-200">
                  {actionError}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#D9E1DC] flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setDeletingMember(null)}
                className="text-xs rounded-xl border-[#D9E1DC]"
              >
                Cancel
              </Button>
              <Button
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl px-4"
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
