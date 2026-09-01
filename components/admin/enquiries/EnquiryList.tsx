'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  Calendar,
  Building,
  User,
  ChevronLeft,
  ChevronRight,
  X,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import { format } from 'date-fns'
import { createManualLead } from '@/app/actions/enquiries'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface EnquiryItem {
  id: string
  referenceNumber: string
  name: string
  company: string | null
  designation: string | null
  email: string
  phone: string | null
  service: string | null
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL' | 'WON' | 'LOST'
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  assignedTo: { id: string; name: string | null; email: string } | null
  createdAt: Date | string
}

interface TeamMember {
  id: string
  name: string | null
  email: string
}

interface EnquiryListProps {
  enquiries: EnquiryItem[]
  totalCount: number
  page: number
  pageSize: number
  teamMembers: TeamMember[]
  currentFilters: {
    q: string
    status: string
    priority: string
    assignedTo: string
    dateRange: string
  }
}

export default function EnquiryList({
  enquiries,
  totalCount,
  page,
  pageSize,
  teamMembers,
  currentFilters,
}: EnquiryListProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState(currentFilters.q)
  const [showAddLeadModal, setShowAddLeadModal] = useState(false)
  const [isSubmittingLead, setIsSubmittingLead] = useState(false)
  const [leadError, setLeadError] = useState('')

  // New Lead Form State
  const [newLead, setNewLead] = useState({
    name: '',
    company: '',
    designation: '',
    email: '',
    phone: '',
    service: 'Labour Compliance',
    priority: 'MEDIUM',
    status: 'NEW',
    assignedToId: '',
    message: '',
  })

  const totalPages = Math.ceil(totalCount / pageSize) || 1
  const startItem = totalCount === 0 ? 0 : (page - 1) * pageSize + 1
  const endItem = Math.min(page * pageSize, totalCount)

  const updateUrlParams = (newParams: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams()
    const merged = { ...currentFilters, page: 1, ...newParams }

    if (merged.q) params.set('q', String(merged.q))
    if (merged.status && merged.status !== 'all') params.set('status', String(merged.status))
    if (merged.priority && merged.priority !== 'all') params.set('priority', String(merged.priority))
    if (merged.assignedTo && merged.assignedTo !== 'all') params.set('assignedTo', String(merged.assignedTo))
    if (merged.dateRange && merged.dateRange !== 'all') params.set('dateRange', String(merged.dateRange))
    if (Number(merged.page) > 1) params.set('page', String(merged.page))

    router.push(`/admin/enquiries?${params.toString()}`)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateUrlParams({ q: searchTerm, page: 1 })
  }

  const handleExportCsv = () => {
    const params = new URLSearchParams()
    if (currentFilters.q) params.set('q', currentFilters.q)
    if (currentFilters.status) params.set('status', currentFilters.status)
    if (currentFilters.priority) params.set('priority', currentFilters.priority)
    if (currentFilters.assignedTo) params.set('assignedTo', currentFilters.assignedTo)
    if (currentFilters.dateRange) params.set('dateRange', currentFilters.dateRange)

    window.open(`/api/admin/enquiries/export?${params.toString()}`, '_blank')
  }

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmittingLead(true)
    setLeadError('')

    const result = await createManualLead(newLead)
    if (result.success) {
      setShowAddLeadModal(false)
      setNewLead({
        name: '',
        company: '',
        designation: '',
        email: '',
        phone: '',
        service: 'Labour Compliance',
        priority: 'MEDIUM',
        status: 'NEW',
        assignedToId: '',
        message: '',
      })
      router.refresh()
    } else {
      setLeadError(result.error || 'Failed to create lead.')
    }
    setIsSubmittingLead(false)
  }

  // Generate page numbers array (max 5 visible buttons)
  const getPageNumbers = () => {
    const pages: number[] = []
    let start = Math.max(1, page - 2)
    let end = Math.min(totalPages, start + 4)

    if (end - start < 4) {
      start = Math.max(1, end - 4)
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    return pages
  }

  return (
    <div className="space-y-6">
      {/* Top Controls Toolbar */}
      <div className="flex flex-col lg:flex-row gap-3 bg-white p-4 rounded-3xl shadow-xs border border-[#D9E1DC]">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#66736D]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search reference, contact, company, email, phone..."
            className="w-full h-11 pl-11 pr-4 border border-[#D9E1DC] rounded-2xl text-xs bg-[#F7F4EC]/30 text-[#202522] placeholder-[#66736D] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#1F7A5C]"
          />
        </form>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={currentFilters.status || 'all'}
            onChange={(e) => updateUrlParams({ status: e.target.value, page: 1 })}
            className="h-11 px-3 border border-[#D9E1DC] rounded-2xl text-xs font-semibold text-[#202522] bg-[#F7F4EC]/30 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#1F7A5C]"
          >
            <option value="all">All Statuses</option>
            <option value="NEW">New</option>
            <option value="CONTACTED">Contacted</option>
            <option value="QUALIFIED">Qualified</option>
            <option value="PROPOSAL">Proposal</option>
            <option value="WON">Won</option>
            <option value="LOST">Lost</option>
          </select>

          {/* Priority Filter */}
          <select
            value={currentFilters.priority || 'all'}
            onChange={(e) => updateUrlParams({ priority: e.target.value, page: 1 })}
            className="h-11 px-3 border border-[#D9E1DC] rounded-2xl text-xs font-semibold text-[#202522] bg-[#F7F4EC]/30 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#1F7A5C]"
          >
            <option value="all">All Priorities</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="LOW">Low Priority</option>
          </select>

          {/* Assignment Filter */}
          <select
            value={currentFilters.assignedTo || 'all'}
            onChange={(e) => updateUrlParams({ assignedTo: e.target.value, page: 1 })}
            className="h-11 px-3 border border-[#D9E1DC] rounded-2xl text-xs font-semibold text-[#202522] bg-[#F7F4EC]/30 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#1F7A5C]"
          >
            <option value="all">All Assignees</option>
            <option value="unassigned">Unassigned</option>
            {teamMembers.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name || member.email}
              </option>
            ))}
          </select>

          {/* Date Filter */}
          <select
            value={currentFilters.dateRange || 'all'}
            onChange={(e) => updateUrlParams({ dateRange: e.target.value, page: 1 })}
            className="h-11 px-3 border border-[#D9E1DC] rounded-2xl text-xs font-semibold text-[#202522] bg-[#F7F4EC]/30 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#1F7A5C]"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>

          {/* Export CSV */}
          <button
            type="button"
            onClick={handleExportCsv}
            className="h-11 px-3.5 border border-[#D9E1DC] rounded-2xl text-xs font-bold text-[#12372A] bg-white hover:bg-[#F7F4EC] transition-colors inline-flex items-center gap-1.5 shadow-2xs"
            title="Export filtered enquiries to CSV"
          >
            <Download className="w-4 h-4 text-[#66736D]" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {/* Add Manual Lead */}
          <button
            type="button"
            onClick={() => setShowAddLeadModal(true)}
            className="h-11 px-4 rounded-2xl text-xs font-bold text-white bg-[#1F7A5C] hover:bg-[#165B44] transition-colors inline-flex items-center gap-1.5 shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* Main Enquiry Data Table / Cards */}
      <div className="bg-white rounded-3xl border border-[#D9E1DC] shadow-xs overflow-hidden">
        {enquiries.length === 0 ? (
          <div className="p-16 text-center text-xs font-medium text-[#66736D] space-y-2">
            <p className="text-base font-bold text-[#12372A]">No enquiries found</p>
            <p>No client records match your current search filters or date range.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[10px] text-[#66736D] uppercase font-bold tracking-wider bg-[#F7F4EC] border-b border-[#D9E1DC]">
                  <tr>
                    <th className="px-4 py-3.5 font-bold w-12 text-center">#</th>
                    <th className="px-4 py-3.5 font-bold">Reference</th>
                    <th className="px-4 py-3.5 font-bold">Client / Name</th>
                    <th className="px-4 py-3.5 font-bold">Company</th>
                    <th className="px-4 py-3.5 font-bold">Service Required</th>
                    <th className="px-4 py-3.5 font-bold text-center">Status</th>
                    <th className="px-4 py-3.5 font-bold text-center">Priority</th>
                    <th className="px-4 py-3.5 font-bold">Assigned</th>
                    <th className="px-4 py-3.5 font-bold">Date</th>
                    <th className="px-4 py-3.5 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9E1DC]/60">
                  {enquiries.map((enquiry, index) => {
                    const globalIndex = (page - 1) * pageSize + index + 1
                    const serialNumber = `#${String(globalIndex).padStart(2, '0')}`

                    return (
                      <tr key={enquiry.id} className="hover:bg-[#F7F4EC]/60 transition-colors group">
                        {/* Serial Number */}
                        <td className="px-4 py-4 text-center font-mono font-bold text-[#66736D]">
                          {serialNumber}
                        </td>

                        {/* Reference Number */}
                        <td className="px-4 py-4 font-mono font-bold text-[#12372A] whitespace-nowrap">
                          <Link
                            href={`/admin/enquiries/${enquiry.id}`}
                            className="text-[#1F7A5C] hover:underline"
                          >
                            {enquiry.referenceNumber}
                          </Link>
                        </td>

                        {/* Contact Name & Designation */}
                        <td className="px-4 py-4">
                          <div className="font-bold text-[#12372A]">{enquiry.name}</div>
                          {enquiry.designation && (
                            <div className="text-[11px] text-[#66736D]">{enquiry.designation}</div>
                          )}
                        </td>

                        {/* Company */}
                        <td className="px-4 py-4 font-medium text-[#202522]">
                          {enquiry.company || '—'}
                        </td>

                        {/* Service */}
                        <td className="px-4 py-4 text-[#66736D] max-w-xs truncate">
                          {enquiry.service || 'General Enquiry'}
                        </td>

                        {/* Status Badge */}
                        <td className="px-4 py-4 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              enquiry.status === 'NEW'
                                ? 'bg-[#D6A84F]/15 text-[#9E731E] border border-[#D6A84F]/30'
                                : enquiry.status === 'CONTACTED'
                                ? 'bg-slate-100 text-slate-700 border border-slate-200'
                                : enquiry.status === 'QUALIFIED'
                                ? 'bg-[#1F7A5C]/10 text-[#1F7A5C] border border-[#1F7A5C]/20'
                                : enquiry.status === 'PROPOSAL'
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : enquiry.status === 'WON'
                                ? 'bg-[#12372A]/10 text-[#12372A] border border-[#12372A]/20'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {enquiry.status}
                          </span>
                        </td>

                        {/* Priority Badge */}
                        <td className="px-4 py-4 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              enquiry.priority === 'HIGH'
                                ? 'bg-rose-100 text-rose-700'
                                : enquiry.priority === 'MEDIUM'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {enquiry.priority}
                          </span>
                        </td>

                        {/* Assigned To */}
                        <td className="px-4 py-4 text-[#66736D]">
                          {enquiry.assignedTo?.name || (
                            <span className="text-slate-400 italic">Unassigned</span>
                          )}
                        </td>

                        {/* Date */}
                        <td className="px-4 py-4 text-[#66736D] whitespace-nowrap">
                          {format(new Date(enquiry.createdAt), 'dd MMM yyyy')}
                        </td>

                        {/* Action Link */}
                        <td className="px-4 py-4 text-right">
                          <Link
                            href={`/admin/enquiries/${enquiry.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-xs text-[#1F7A5C] bg-[#1F7A5C]/10 hover:bg-[#1F7A5C] hover:text-white transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View (< 768px) */}
            <div className="md:hidden divide-y divide-[#D9E1DC]/60">
              {enquiries.map((enquiry, index) => {
                const globalIndex = (page - 1) * pageSize + index + 1
                const serialNumber = `#${String(globalIndex).padStart(2, '0')}`

                return (
                  <div key={enquiry.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-[#66736D]">
                          {serialNumber}
                        </span>
                        <Link
                          href={`/admin/enquiries/${enquiry.id}`}
                          className="font-mono font-bold text-xs text-[#1F7A5C] hover:underline"
                        >
                          {enquiry.referenceNumber}
                        </Link>
                      </div>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          enquiry.status === 'NEW'
                            ? 'bg-[#D6A84F]/15 text-[#9E731E]'
                            : enquiry.status === 'QUALIFIED'
                            ? 'bg-[#1F7A5C]/10 text-[#1F7A5C]'
                            : enquiry.status === 'WON'
                            ? 'bg-[#12372A]/10 text-[#12372A]'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {enquiry.status}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-[#12372A]">{enquiry.name}</h4>
                      <p className="text-xs text-[#66736D]">{enquiry.company || 'Individual Client'}</p>
                    </div>

                    <div className="text-xs text-[#66736D] bg-[#F7F4EC]/50 p-2.5 rounded-xl border border-[#D9E1DC]">
                      <span className="font-semibold text-[#12372A]">Service: </span>
                      {enquiry.service || 'General Enquiry'}
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-[#66736D]">
                        {format(new Date(enquiry.createdAt), 'dd MMM yyyy')}
                      </span>
                      <Link
                        href={`/admin/enquiries/${enquiry.id}`}
                        className="px-3 py-1.5 rounded-xl font-bold text-xs text-[#1F7A5C] bg-[#1F7A5C]/10 hover:bg-[#1F7A5C] hover:text-white transition-colors"
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* Server-Side Pagination Footer */}
        {totalCount > 0 && (
          <div className="px-6 py-4 bg-[#F7F4EC] border-t border-[#D9E1DC] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-[#66736D]">
            <div>
              Showing <span className="text-[#12372A] font-bold">{startItem}</span>–
              <span className="text-[#12372A] font-bold">{endItem}</span> of{' '}
              <span className="text-[#12372A] font-bold">{totalCount}</span> enquiries
            </div>

            <div className="flex items-center gap-1.5">
              {/* Previous Page */}
              <button
                type="button"
                onClick={() => updateUrlParams({ page: page - 1 })}
                disabled={page <= 1}
                className="px-3 py-2 rounded-xl border border-[#D9E1DC] bg-white text-[#12372A] hover:bg-[#EDE8DE] disabled:opacity-40 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-1 font-bold"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              {/* Numbered Page Buttons */}
              <div className="flex items-center gap-1">
                {getPageNumbers().map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => updateUrlParams({ page: p })}
                    className={`w-8 h-8 rounded-xl font-bold text-xs transition-colors ${
                      p === page
                        ? 'bg-[#1F7A5C] text-white shadow-xs'
                        : 'bg-white text-[#12372A] border border-[#D9E1DC] hover:bg-[#EDE8DE]'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              {/* Next Page */}
              <button
                type="button"
                onClick={() => updateUrlParams({ page: page + 1 })}
                disabled={page >= totalPages}
                className="px-3 py-2 rounded-xl border border-[#D9E1DC] bg-white text-[#12372A] hover:bg-[#EDE8DE] disabled:opacity-40 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-1 font-bold"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Manual Lead Creation Modal */}
      {showAddLeadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-[#D9E1DC] animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between pb-3 border-b border-[#D9E1DC]">
              <div>
                <h3 className="text-lg font-bold text-[#12372A]">Add New CRM Lead</h3>
                <p className="text-xs text-[#66736D]">
                  Manually record a phone, referral, or offline consultation lead.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddLeadModal(false)}
                className="p-1.5 text-[#66736D] hover:text-[#12372A] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {leadError && (
              <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs font-semibold border border-rose-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{leadError}</span>
              </div>
            )}

            <form onSubmit={handleCreateLead} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-[#12372A]">Contact Name *</Label>
                  <Input
                    required
                    value={newLead.name}
                    onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                    placeholder="e.g. Vikram Verma"
                    className="h-10 text-xs rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-[#12372A]">Company Name</Label>
                  <Input
                    value={newLead.company}
                    onChange={(e) => setNewLead({ ...newLead, company: e.target.value })}
                    placeholder="e.g. Apex Manufacturing"
                    className="h-10 text-xs rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-[#12372A]">Corporate Email *</Label>
                  <Input
                    type="email"
                    required
                    value={newLead.email}
                    onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                    placeholder="vikram@apex.com"
                    className="h-10 text-xs rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-[#12372A]">Phone Number</Label>
                  <Input
                    value={newLead.phone}
                    onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                    placeholder="+91 98260 00000"
                    className="h-10 text-xs rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-[#12372A]">Primary Service *</Label>
                  <select
                    value={newLead.service}
                    onChange={(e) => setNewLead({ ...newLead, service: e.target.value })}
                    className="h-10 w-full px-3 border border-[#D9E1DC] rounded-xl text-xs font-medium"
                  >
                    <option value="Labour Compliance">Labour Compliance</option>
                    <option value="PF / ESIC">PF / ESIC</option>
                    <option value="Factory Compliance">Factory Compliance</option>
                    <option value="Payroll">Payroll Compliance</option>
                    <option value="Contractor Compliance">Contractor Compliance</option>
                    <option value="HR Consulting">HR Consulting</option>
                    <option value="Industrial Relations">Industrial Relations</option>
                    <option value="Compliance Audit">Compliance Audit</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-[#12372A]">Priority</Label>
                  <select
                    value={newLead.priority}
                    onChange={(e) => setNewLead({ ...newLead, priority: e.target.value })}
                    className="h-10 w-full px-3 border border-[#D9E1DC] rounded-xl text-xs font-medium"
                  >
                    <option value="HIGH">High Priority</option>
                    <option value="MEDIUM">Medium Priority</option>
                    <option value="LOW">Low Priority</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-[#12372A]">Assign Lead To</Label>
                <select
                  value={newLead.assignedToId}
                  onChange={(e) => setNewLead({ ...newLead, assignedToId: e.target.value })}
                  className="h-10 w-full px-3 border border-[#D9E1DC] rounded-xl text-xs font-medium"
                >
                  <option value="">Unassigned</option>
                  {teamMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name || m.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-[#12372A]">Discussion / Requirement Notes</Label>
                <textarea
                  rows={3}
                  value={newLead.message}
                  onChange={(e) => setNewLead({ ...newLead, message: e.target.value })}
                  placeholder="Record initial phone discussion or enquiry notes..."
                  className="w-full p-2.5 border border-[#D9E1DC] rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddLeadModal(false)}
                  className="px-4 py-2 bg-[#F7F4EC] text-[#12372A] font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingLead}
                  className="px-5 py-2 bg-[#1F7A5C] hover:bg-[#165B44] text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  {isSubmittingLead ? 'Creating Lead...' : 'Create Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
