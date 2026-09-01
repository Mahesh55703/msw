'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Phone,
  Mail,
  MessageSquare,
  Building,
  User,
  Clock,
  Calendar,
  Shield,
  Tag,
  Share2,
  AlertTriangle,
  CheckCircle2,
  Send,
  Trash2,
  FileText,
  UserCheck,
  AlertCircle,
  ExternalLink,
} from 'lucide-react'
import { format } from 'date-fns'
import {
  updateEnquiryStatus,
  updateEnquiryPriority,
  assignEnquiry,
  addEnquiryNote,
  setEnquiryFollowUp,
  deleteEnquiry,
} from '@/app/actions/enquiries'
import { Button } from '@/components/ui/button'

interface EnquiryDetailProps {
  enquiry: any
  teamMembers: { id: string; name: string | null; email: string }[]
  duplicatesCount: number
}

const LOST_REASONS = [
  'Budget / Pricing Constraint',
  'Not Required / Changed Mind',
  'Chose Another Consultant',
  'No Response after Follow-ups',
  'Timing / Delayed Project',
  'Duplicate Lead',
  'Outside Service Scope',
  'Other',
]

export default function EnquiryDetailClient({
  enquiry,
  teamMembers,
  duplicatesCount,
}: EnquiryDetailProps) {
  const router = useRouter()
  const [isMutating, setIsMutating] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [newNote, setNewNote] = useState('')
  const [selectedStatus, setSelectedStatus] = useState(enquiry.status)
  const [selectedPriority, setSelectedPriority] = useState(enquiry.priority)
  const [selectedAssignee, setSelectedAssignee] = useState(enquiry.assignedToId || '')
  const [lostReason, setLostReason] = useState('')
  const [showLostModal, setShowLostModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Parse sourceDetails JSON for UTM and follow-up data
  let details: any = {}
  try {
    if (enquiry.sourceDetails) {
      details = JSON.parse(enquiry.sourceDetails)
    }
  } catch {
    details = {}
  }

  const [followUpDate, setFollowUpDate] = useState(
    details.nextFollowUpAt ? details.nextFollowUpAt.slice(0, 10) : ''
  )

  // Check follow-up status
  const todayStr = new Date().toISOString().slice(0, 10)
  const isFollowUpDueToday = followUpDate === todayStr
  const isFollowUpOverdue = followUpDate && followUpDate < todayStr

  // Format clean phone for WhatsApp and Tel
  const rawPhone = enquiry.phone || ''
  const cleanPhone = rawPhone.replace(/[^0-9+]/g, '')
  const whatsappNumber = cleanPhone.replace(/^0/, '91').replace(/^\+/, '')

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === 'LOST') {
      setSelectedStatus('LOST')
      setShowLostModal(true)
      return
    }

    setIsMutating(true)
    setErrorMessage('')
    setSelectedStatus(newStatus)

    const res = await updateEnquiryStatus({
      enquiryId: enquiry.id,
      status: newStatus as any,
    })

    if (!res.success) {
      setErrorMessage(res.error || 'Failed to update status.')
    }
    setIsMutating(false)
    router.refresh()
  }

  const handleConfirmLost = async () => {
    setIsMutating(true)
    setErrorMessage('')

    const res = await updateEnquiryStatus({
      enquiryId: enquiry.id,
      status: 'LOST',
      lostReason: lostReason || 'Other',
    })

    setShowLostModal(false)
    if (!res.success) {
      setErrorMessage(res.error || 'Failed to record lost reason.')
    }
    setIsMutating(false)
    router.refresh()
  }

  const handlePriorityChange = async (newPriority: string) => {
    setIsMutating(true)
    setErrorMessage('')
    setSelectedPriority(newPriority)

    const res = await updateEnquiryPriority({
      enquiryId: enquiry.id,
      priority: newPriority as any,
    })

    if (!res.success) {
      setErrorMessage(res.error || 'Failed to update priority.')
    }
    setIsMutating(false)
    router.refresh()
  }

  const handleAssigneeChange = async (newAssigneeId: string) => {
    setIsMutating(true)
    setErrorMessage('')
    setSelectedAssignee(newAssigneeId)

    const res = await assignEnquiry({
      enquiryId: enquiry.id,
      assignedToId: newAssigneeId || null,
    })

    if (!res.success) {
      setErrorMessage(res.error || 'Failed to assign enquiry.')
    }
    setIsMutating(false)
    router.refresh()
  }

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNote.trim()) return

    setIsMutating(true)
    setErrorMessage('')

    const res = await addEnquiryNote({
      enquiryId: enquiry.id,
      note: newNote.trim(),
    })

    if (res.success) {
      setNewNote('')
      router.refresh()
    } else {
      setErrorMessage(res.error || 'Failed to add note.')
    }
    setIsMutating(false)
  }

  const handleSaveFollowUp = async () => {
    setIsMutating(true)
    setErrorMessage('')

    const res = await setEnquiryFollowUp({
      enquiryId: enquiry.id,
      followUpDate: followUpDate || null,
    })

    if (!res.success) {
      setErrorMessage(res.error || 'Failed to update follow-up date.')
    }
    setIsMutating(false)
    router.refresh()
  }

  const handleDeleteEnquiry = async () => {
    setIsMutating(true)
    const res = await deleteEnquiry(enquiry.id)
    if (res.success) {
      router.push('/admin/enquiries')
      router.refresh()
    } else {
      setErrorMessage(res.error || 'Failed to delete enquiry.')
      setIsMutating(false)
    }
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto w-full pb-20">
      {/* Top Action & Navigation Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-3xl shadow-xs border border-[#D9E1DC]">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/enquiries"
            className="p-2 text-[#66736D] hover:text-[#12372A] hover:bg-[#F7F4EC] rounded-2xl transition-colors"
            title="Back to Enquiry inbox"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-sm text-[#12372A]">
                {enquiry.referenceNumber}
              </span>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  enquiry.status === 'NEW'
                    ? 'bg-[#D6A84F]/15 text-[#9E731E] border border-[#D6A84F]/30'
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
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${
                  enquiry.priority === 'HIGH'
                    ? 'bg-rose-100 text-rose-700'
                    : enquiry.priority === 'MEDIUM'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {enquiry.priority} Priority
              </span>
            </div>
            <h1 className="text-lg font-bold text-[#12372A] mt-0.5">
              {enquiry.company || enquiry.name}
            </h1>
          </div>
        </div>

        {/* Quick Contact Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {cleanPhone && (
            <>
              <a
                href={`tel:${cleanPhone}`}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#F7F4EC] hover:bg-[#EDE8DE] text-[#12372A] border border-[#D9E1DC] rounded-xl text-xs font-bold transition-colors"
                title="Call client phone"
              >
                <Phone className="w-3.5 h-3.5 text-[#1F7A5C]" />
                <span>Call</span>
              </a>
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-colors"
                title="Open WhatsApp chat"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp</span>
              </a>
            </>
          )}

          {enquiry.email && (
            <a
              href={`mailto:${enquiry.email}?subject=LabourAxis Consultation Enquiry: ${enquiry.referenceNumber}`}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#F7F4EC] hover:bg-[#EDE8DE] text-[#12372A] border border-[#D9E1DC] rounded-xl text-xs font-bold transition-colors"
              title="Send email"
            >
              <Mail className="w-3.5 h-3.5 text-[#1F7A5C]" />
              <span>Email</span>
            </a>
          )}

          {enquiry.status === 'NEW' && (
            <button
              type="button"
              onClick={() => handleStatusChange('CONTACTED')}
              disabled={isMutating}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#1F7A5C] hover:bg-[#165B44] text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mark Contacted</span>
            </button>
          )}

          {enquiry.status === 'CONTACTED' && (
            <button
              type="button"
              onClick={() => handleStatusChange('QUALIFIED')}
              disabled={isMutating}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#1F7A5C] hover:bg-[#165B44] text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mark Qualified</span>
            </button>
          )}
        </div>
      </div>

      {/* Duplicate Warning Banner if applicable */}
      {duplicatesCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-4 flex items-center justify-between text-xs font-medium">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Possible Duplicate Lead:</strong> {duplicatesCount} other enquiry record(s) exist with matching email or phone.
            </span>
          </div>
          <Link
            href={`/admin/enquiries?q=${encodeURIComponent(enquiry.email)}`}
            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold"
          >
            View Matches
          </Link>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 text-rose-700 rounded-2xl text-xs font-semibold border border-rose-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main CRM Grid (65% Content, 35% Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Details, Message, Notes, Activity (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Contact Details Card */}
          <div className="bg-white rounded-3xl shadow-xs border border-[#D9E1DC] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#D9E1DC]/80 bg-[#F7F4EC]/40 flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#12372A] flex items-center gap-2">
                <User className="w-4 h-4 text-[#1F7A5C]" />
                <span>Contact Details</span>
              </h3>
              <span className="text-[11px] text-[#66736D]">
                Preferred: <strong className="text-[#12372A]">{enquiry.preferredContactMethod || 'Phone'}</strong>
              </span>
            </div>
            <div className="p-6">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-xs">
                <div>
                  <dt className="text-[#66736D] font-medium">Full Name</dt>
                  <dd className="font-bold text-[#12372A] text-sm mt-0.5">{enquiry.name}</dd>
                </div>
                <div>
                  <dt className="text-[#66736D] font-medium">Designation / Role</dt>
                  <dd className="font-semibold text-[#202522] mt-0.5">{enquiry.designation || 'Not specified'}</dd>
                </div>
                <div>
                  <dt className="text-[#66736D] font-medium">Corporate Email</dt>
                  <dd className="font-mono font-medium text-[#1F7A5C] mt-0.5">
                    <a href={`mailto:${enquiry.email}`} className="hover:underline">
                      {enquiry.email}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-[#66736D] font-medium">Phone Number</dt>
                  <dd className="font-mono font-bold text-[#12372A] mt-0.5">
                    {enquiry.phone ? (
                      <a href={`tel:${enquiry.phone}`} className="hover:underline">
                        {enquiry.phone}
                      </a>
                    ) : (
                      '—'
                    )}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Company & Workforce Scale Card */}
          <div className="bg-white rounded-3xl shadow-xs border border-[#D9E1DC] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#D9E1DC]/80 bg-[#F7F4EC]/40">
              <h3 className="text-sm font-bold text-[#12372A] flex items-center gap-2">
                <Building className="w-4 h-4 text-[#1F7A5C]" />
                <span>Enterprise & Workforce Profile</span>
              </h3>
            </div>
            <div className="p-6">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-xs">
                <div>
                  <dt className="text-[#66736D] font-medium">Company Name</dt>
                  <dd className="font-bold text-[#12372A] text-sm mt-0.5">{enquiry.company || '—'}</dd>
                </div>
                <div>
                  <dt className="text-[#66736D] font-medium">Industry Sector</dt>
                  <dd className="font-semibold text-[#202522] mt-0.5">{enquiry.industry || '—'}</dd>
                </div>
                <div>
                  <dt className="text-[#66736D] font-medium">Operating Location</dt>
                  <dd className="font-semibold text-[#202522] mt-0.5">{enquiry.location || '—'}</dd>
                </div>
                <div>
                  <dt className="text-[#66736D] font-medium">Workforce Scale</dt>
                  <dd className="font-bold text-[#12372A] mt-0.5">
                    {enquiry.employeeCount || '0'} On-roll Employees | {enquiry.contractorCount || '0'} Contract Workers
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Requested Services Card */}
          <div className="bg-white rounded-3xl shadow-xs border border-[#D9E1DC] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#D9E1DC]/80 bg-[#F7F4EC]/40">
              <h3 className="text-sm font-bold text-[#12372A] flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#1F7A5C]" />
                <span>Statutory Scope Required</span>
              </h3>
            </div>
            <div className="p-6">
              <div className="flex flex-wrap gap-2">
                {enquiry.service ? (
                  enquiry.service.split(',').map((s: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-3.5 py-1.5 bg-[#F7F4EC] text-[#12372A] font-bold text-xs rounded-xl border border-[#D9E1DC]"
                    >
                      {s.trim()}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-[#66736D]">General Consultation</span>
                )}
              </div>
            </div>
          </div>

          {/* Message Card */}
          <div className="bg-white rounded-3xl shadow-xs border border-[#D9E1DC] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#D9E1DC]/80 bg-[#F7F4EC]/40">
              <h3 className="text-sm font-bold text-[#12372A] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#1F7A5C]" />
                <span>Client Enquiry Message</span>
              </h3>
            </div>
            <div className="p-6">
              <div className="p-4 rounded-2xl bg-[#F7F4EC]/50 border border-[#D9E1DC]/80 text-xs sm:text-sm text-[#202522] leading-relaxed whitespace-pre-wrap">
                {enquiry.message || 'No additional message submitted.'}
              </div>
            </div>
          </div>

          {/* Internal Notes Card */}
          <div className="bg-white rounded-3xl shadow-xs border border-[#D9E1DC] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#D9E1DC]/80 bg-[#F7F4EC]/40 flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#12372A] flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#1F7A5C]" />
                <span>Internal Team Notes</span>
              </h3>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                Private / Never visible to client
              </span>
            </div>
            <div className="p-6 space-y-4">
              <form onSubmit={handleAddNote} className="space-y-3">
                <textarea
                  rows={3}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Record call summary, pricing discussion, next steps or customer objections..."
                  className="w-full text-xs sm:text-sm border border-[#D9E1DC] rounded-2xl p-3.5 bg-[#F7F4EC]/30 text-[#202522] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#1F7A5C]"
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={isMutating || !newNote.trim()}
                    className="bg-[#1F7A5C] hover:bg-[#165B44] text-white rounded-xl text-xs font-bold px-4 py-2"
                  >
                    <Send className="w-3.5 h-3.5 mr-1.5" />
                    <span>Add Note</span>
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Activity Timeline Card */}
          <div className="bg-white rounded-3xl shadow-xs border border-[#D9E1DC] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#D9E1DC]/80 bg-[#F7F4EC]/40">
              <h3 className="text-sm font-bold text-[#12372A] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#1F7A5C]" />
                <span>Activity & Audit Timeline</span>
              </h3>
            </div>
            <div className="p-6">
              <div className="flow-root">
                <ul role="list" className="-mb-6">
                  {enquiry.activities && enquiry.activities.length > 0 ? (
                    enquiry.activities.map((activity: any, idx: number) => (
                      <li key={activity.id}>
                        <div className="relative pb-6">
                          {idx !== enquiry.activities.length - 1 && (
                            <span
                              className="absolute top-4 left-3.5 -ml-px h-full w-0.5 bg-[#D9E1DC]"
                              aria-hidden="true"
                            />
                          )}
                          <div className="relative flex space-x-3">
                            <div>
                              <span
                                className={`h-7 w-7 rounded-full flex items-center justify-center ring-4 ring-white ${
                                  activity.type === 'STATUS_CHANGED'
                                    ? 'bg-[#1F7A5C] text-white'
                                    : activity.type === 'NOTE_ADDED'
                                    ? 'bg-amber-500 text-white'
                                    : activity.type === 'ASSIGNED'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-[#12372A] text-white'
                                }`}
                              >
                                <span className="text-[10px] font-bold">
                                  {activity.type === 'STATUS_CHANGED'
                                    ? 'S'
                                    : activity.type === 'NOTE_ADDED'
                                    ? 'N'
                                    : activity.type === 'ASSIGNED'
                                    ? 'A'
                                    : 'E'}
                                </span>
                              </span>
                            </div>
                            <div className="min-w-0 flex-1 pt-0.5 flex justify-between space-x-4">
                              <div>
                                <p className="text-xs font-bold text-[#12372A]">
                                  {activity.createdBy || 'System'}
                                </p>
                                <p className="text-xs text-[#202522] mt-0.5 leading-relaxed whitespace-pre-wrap">
                                  {activity.note}
                                </p>
                              </div>
                              <div className="text-right text-[10px] whitespace-nowrap text-[#66736D]">
                                <time dateTime={new Date(activity.createdAt).toISOString()}>
                                  {format(new Date(activity.createdAt), 'dd MMM, h:mm a')}
                                </time>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))
                  ) : (
                    <p className="text-xs text-[#66736D]">No activity recorded yet.</p>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sticky Sidebar (~35%) */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-4">
          {/* Pipeline & Status Box */}
          <div className="bg-white rounded-3xl shadow-xs border border-[#D9E1DC] p-6 space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#66736D]">
              CRM Pipeline Management
            </h3>

            {/* Status Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#12372A]">Enquiry Stage</label>
              <select
                value={selectedStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={isMutating}
                className="w-full h-11 px-3.5 border border-[#D9E1DC] rounded-2xl text-xs font-bold text-[#12372A] bg-white focus:ring-2 focus:ring-[#1F7A5C]"
              >
                <option value="NEW">New Lead</option>
                <option value="CONTACTED">Contacted</option>
                <option value="QUALIFIED">Qualified</option>
                <option value="PROPOSAL">Proposal Sent</option>
                <option value="WON">Won (Client Retained)</option>
                <option value="LOST">Lost / Inactive</option>
              </select>
            </div>

            {/* Priority Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#12372A]">Priority</label>
              <select
                value={selectedPriority}
                onChange={(e) => handlePriorityChange(e.target.value)}
                disabled={isMutating}
                className="w-full h-11 px-3.5 border border-[#D9E1DC] rounded-2xl text-xs font-bold text-[#12372A] bg-white focus:ring-2 focus:ring-[#1F7A5C]"
              >
                <option value="HIGH">High Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="LOW">Low Priority</option>
              </select>
            </div>

            {/* Assignment Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#12372A]">Assigned Consultant</label>
              <select
                value={selectedAssignee}
                onChange={(e) => handleAssigneeChange(e.target.value)}
                disabled={isMutating}
                className="w-full h-11 px-3.5 border border-[#D9E1DC] rounded-2xl text-xs font-semibold text-[#12372A] bg-white focus:ring-2 focus:ring-[#1F7A5C]"
              >
                <option value="">Unassigned</option>
                {teamMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name || m.email}
                  </option>
                ))}
              </select>
            </div>

            {/* Next Follow-up Picker */}
            <div className="space-y-1.5 pt-2 border-t border-[#D9E1DC]/80">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#12372A] flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#1F7A5C]" />
                  <span>Next Follow-up</span>
                </label>
                {isFollowUpDueToday && (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                    Due Today
                  </span>
                )}
                {isFollowUpOverdue && (
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                    Overdue
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="flex-1 h-10 px-3 border border-[#D9E1DC] rounded-xl text-xs font-semibold text-[#12372A]"
                />
                <button
                  type="button"
                  onClick={handleSaveFollowUp}
                  disabled={isMutating}
                  className="px-3 h-10 bg-[#1F7A5C] text-white font-bold text-xs rounded-xl hover:bg-[#165B44]"
                >
                  Save
                </button>
              </div>
            </div>
          </div>

          {/* Lead Source & Marketing Attribution Box */}
          <div className="bg-white rounded-3xl shadow-xs border border-[#D9E1DC] p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#66736D] flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-[#1F7A5C]" />
              <span>Marketing Attribution</span>
            </h3>
            <dl className="divide-y divide-[#D9E1DC]/60 text-xs space-y-2">
              <div className="pt-2 flex justify-between">
                <dt className="text-[#66736D]">Lead Source</dt>
                <dd className="font-bold text-[#12372A]">{enquiry.source || 'Website Form'}</dd>
              </div>
              <div className="pt-2 flex justify-between">
                <dt className="text-[#66736D]">UTM Source</dt>
                <dd className="font-mono text-[#202522]">{details.utm_source || 'Not provided'}</dd>
              </div>
              <div className="pt-2 flex justify-between">
                <dt className="text-[#66736D]">UTM Medium</dt>
                <dd className="font-mono text-[#202522]">{details.utm_medium || 'Not provided'}</dd>
              </div>
              <div className="pt-2 flex justify-between">
                <dt className="text-[#66736D]">UTM Campaign</dt>
                <dd className="font-mono text-[#202522]">{details.utm_campaign || 'Not provided'}</dd>
              </div>
              <div className="pt-2 flex justify-between">
                <dt className="text-[#66736D]">Landing Page</dt>
                <dd className="font-mono text-[#202522] truncate max-w-[160px]">
                  {details.landingPage || '/contact'}
                </dd>
              </div>
            </dl>
          </div>

          {/* Milestone Timestamps Box */}
          <div className="bg-white rounded-3xl shadow-xs border border-[#D9E1DC] p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#66736D]">
              Key Lifecycle Timestamps
            </h3>
            <dl className="divide-y divide-[#D9E1DC]/60 text-xs space-y-2">
              <div className="pt-2 flex justify-between">
                <dt className="text-[#66736D]">Enquiry Created</dt>
                <dd className="font-semibold text-[#12372A]">
                  {format(new Date(enquiry.createdAt), 'dd MMM yyyy, h:mm a')}
                </dd>
              </div>
              <div className="pt-2 flex justify-between">
                <dt className="text-[#66736D]">First Contacted</dt>
                <dd className="font-semibold text-[#12372A]">
                  {enquiry.firstContactedAt
                    ? format(new Date(enquiry.firstContactedAt), 'dd MMM yyyy, h:mm a')
                    : '—'}
                </dd>
              </div>
              <div className="pt-2 flex justify-between">
                <dt className="text-[#66736D]">Qualified</dt>
                <dd className="font-semibold text-[#12372A]">
                  {enquiry.qualifiedAt
                    ? format(new Date(enquiry.qualifiedAt), 'dd MMM yyyy, h:mm a')
                    : '—'}
                </dd>
              </div>
              <div className="pt-2 flex justify-between">
                <dt className="text-[#66736D]">Proposal Sent</dt>
                <dd className="font-semibold text-[#12372A]">
                  {enquiry.proposalAt
                    ? format(new Date(enquiry.proposalAt), 'dd MMM yyyy, h:mm a')
                    : '—'}
                </dd>
              </div>
              <div className="pt-2 flex justify-between">
                <dt className="text-[#66736D]">Closed / Converted</dt>
                <dd className="font-semibold text-[#12372A]">
                  {enquiry.closedAt
                    ? format(new Date(enquiry.closedAt), 'dd MMM yyyy, h:mm a')
                    : '—'}
                </dd>
              </div>
              {details.lostReason && (
                <div className="pt-2 flex justify-between">
                  <dt className="text-rose-600 font-bold">Lost Reason</dt>
                  <dd className="font-bold text-rose-700">{details.lostReason}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Delete Danger Zone */}
          <div className="p-4 rounded-3xl bg-rose-50 border border-rose-100 flex items-center justify-between">
            <span className="text-xs text-rose-700 font-semibold">Delete Lead Record</span>
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="p-2 text-rose-600 hover:bg-rose-100 rounded-xl transition-colors"
              title="Delete enquiry"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Lost Reason Modal */}
      {showLostModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-[#D9E1DC] animate-in fade-in zoom-in-95">
            <div>
              <h3 className="text-base font-bold text-[#12372A]">Mark Lead as Lost</h3>
              <p className="text-xs text-[#66736D] mt-1">
                Please record why this consultation lead did not convert.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#12372A]">Reason for Loss *</label>
              <select
                value={lostReason}
                onChange={(e) => setLostReason(e.target.value)}
                className="w-full h-11 px-3.5 border border-[#D9E1DC] rounded-xl text-xs font-semibold text-[#12372A]"
              >
                <option value="">Select a reason...</option>
                {LOST_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowLostModal(false)}
                className="px-4 py-2 bg-[#F7F4EC] text-[#12372A] font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLost}
                disabled={isMutating || !lostReason}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs disabled:opacity-50"
              >
                Confirm Lost
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-rose-100 animate-in fade-in zoom-in-95">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#12372A]">Delete Enquiry?</h3>
                <p className="text-xs text-[#66736D] leading-relaxed">
                  Are you sure you want to permanently delete lead{' '}
                  <strong className="text-[#12372A]">{enquiry.referenceNumber}</strong>? All
                  internal notes and activity records will be deleted.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-[#F7F4EC] text-[#12372A] font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteEnquiry}
                disabled={isMutating}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                {isMutating ? 'Deleting...' : 'Delete Lead'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
