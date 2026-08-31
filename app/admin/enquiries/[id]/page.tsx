import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { updateEnquiryStatus, addEnquiryNote } from '@/app/actions/enquiries'
import { Button } from '@/components/ui/button'

export default async function EnquiryDetailPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const enquiry = await prisma.enquiry.findUnique({
    where: { id },
    include: {
      activities: {
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  if (!enquiry) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#12372A] p-6 md:p-8 rounded-2xl shadow-sm text-white flex flex-col sm:flex-row sm:items-center sm:justify-between border border-[#0D281E] gap-4">
        <div>
          <span className="text-[10px] font-bold text-[#D6A84F] uppercase tracking-wider">Enterprise Enquiry Record</span>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">Ref: {enquiry.referenceNumber}</h1>
          <p className="text-[#A2B3AA] text-xs mt-1">{enquiry.company || enquiry.name} • {enquiry.service || 'General'}</p>
        </div>
        <div className="shrink-0">
          <span className={`px-3 py-1 inline-flex text-xs font-bold rounded-full
            ${enquiry.status === 'NEW' ? 'bg-[#D6A84F]/20 text-[#D6A84F] border border-[#D6A84F]/40' : ''}
            ${enquiry.status === 'CONTACTED' ? 'bg-white/10 text-white border border-white/20' : ''}
            ${enquiry.status === 'QUALIFIED' ? 'bg-[#1F7A5C] text-white' : ''}
            ${enquiry.status === 'PROPOSAL' ? 'bg-[#D6A84F] text-[#12372A]' : ''}
            ${enquiry.status === 'WON' ? 'bg-emerald-400 text-[#12372A]' : ''}
            ${enquiry.status === 'LOST' ? 'bg-rose-500 text-white' : ''}
          `}>
            Status: {enquiry.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-xs border border-[#D9E1DC] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#D9E1DC]/80 bg-[#F7F4EC]/40">
              <h3 className="text-sm font-bold text-[#12372A]">Client Contact Details</h3>
            </div>
            <div className="p-6">
              <dl className="divide-y divide-[#D9E1DC]/60 text-xs">
                <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="font-bold text-[#66736D]">Full Name</dt>
                  <dd className="font-bold text-[#12372A] sm:col-span-2">{enquiry.name} {enquiry.designation && `(${enquiry.designation})`}</dd>
                </div>
                <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="font-bold text-[#66736D]">Organization</dt>
                  <dd className="font-bold text-[#12372A] sm:col-span-2">{enquiry.company || 'N/A'}</dd>
                </div>
                <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="font-bold text-[#66736D]">Email Address</dt>
                  <dd className="font-mono text-[#1F7A5C] sm:col-span-2">{enquiry.email}</dd>
                </div>
                <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="font-bold text-[#66736D]">Phone Number</dt>
                  <dd className="font-mono text-[#12372A] sm:col-span-2">{enquiry.phone || 'N/A'}</dd>
                </div>
                <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="font-bold text-[#66736D]">Preferred Channel</dt>
                  <dd className="text-[#202522] sm:col-span-2">{enquiry.preferredContactMethod || 'N/A'}</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xs border border-[#D9E1DC] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#D9E1DC]/80 bg-[#F7F4EC]/40">
              <h3 className="text-sm font-bold text-[#12372A]">Requirement Scope</h3>
            </div>
            <div className="p-6">
              <dl className="divide-y divide-[#D9E1DC]/60 text-xs">
                <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="font-bold text-[#66736D]">Services Needed</dt>
                  <dd className="font-bold text-[#12372A] sm:col-span-2">{enquiry.service || 'N/A'}</dd>
                </div>
                <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="font-bold text-[#66736D]">Industry & Location</dt>
                  <dd className="text-[#202522] sm:col-span-2">{enquiry.industry || 'N/A'} • {enquiry.location || 'N/A'}</dd>
                </div>
                <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="font-bold text-[#66736D]">Workforce Scale</dt>
                  <dd className="text-[#202522] sm:col-span-2">
                    Employees: <span className="font-bold text-[#12372A]">{enquiry.employeeCount || '0'}</span> | Contract Labour: <span className="font-bold text-[#12372A]">{enquiry.contractorCount || '0'}</span>
                  </dd>
                </div>
                <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="font-bold text-[#66736D]">Lead Source</dt>
                  <dd className="text-[#202522] sm:col-span-2">{enquiry.source || 'Direct Website'}</dd>
                </div>
                <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="font-bold text-[#66736D]">Message / Details</dt>
                  <dd className="text-[#202522] sm:col-span-2 whitespace-pre-wrap leading-relaxed bg-[#F7F4EC]/60 p-3.5 rounded-xl border border-[#D9E1DC]/60">{enquiry.message || 'No additional message provided.'}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Right Column: Status & Timeline */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-xs border border-[#D9E1DC] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#D9E1DC]/80 bg-[#F7F4EC]/40">
              <h3 className="text-sm font-bold text-[#12372A]">Update Lead Pipeline</h3>
            </div>
            <div className="p-6">
              <form action={updateEnquiryStatus} className="flex flex-col space-y-4">
                <input type="hidden" name="enquiryId" value={enquiry.id} />
                <select 
                  name="status" 
                  defaultValue={enquiry.status}
                  className="block w-full px-3.5 py-2.5 text-xs font-semibold text-[#202522] border-[#D9E1DC] focus:outline-none focus:ring-2 focus:ring-[#1F7A5C] rounded-xl border bg-white"
                >
                  <option value="NEW">New</option>
                  <option value="CONTACTED">Contacted</option>
                  <option value="QUALIFIED">Qualified</option>
                  <option value="PROPOSAL">Proposal Sent</option>
                  <option value="WON">Won (Client Signed)</option>
                  <option value="LOST">Lost / Inactive</option>
                </select>
                <Button type="submit" className="w-full bg-[#1F7A5C] hover:bg-[#165B44] text-white rounded-xl text-xs font-bold shadow-xs">
                  Save Pipeline Status
                </Button>
              </form>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xs border border-[#D9E1DC] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#D9E1DC]/80 bg-[#F7F4EC]/40">
              <h3 className="text-sm font-bold text-[#12372A]">Internal Notes & Log</h3>
            </div>
            <div className="p-6">
              <form action={addEnquiryNote} className="space-y-3">
                <input type="hidden" name="enquiryId" value={enquiry.id} />
                <textarea
                  name="note"
                  rows={3}
                  className="block w-full text-xs border-[#D9E1DC] rounded-xl border p-3 bg-[#F7F4EC]/30 text-[#202522] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#1F7A5C]"
                  placeholder="Record call notes, discussion points or next steps..."
                  required
                />
                <Button type="submit" variant="outline" className="w-full border-[#D9E1DC] text-[#12372A] hover:bg-[#F7F4EC] rounded-xl text-xs font-bold">
                  Add Activity Note
                </Button>
              </form>

              <div className="flow-root mt-6 pt-6 border-t border-[#D9E1DC]/80">
                <ul role="list" className="-mb-6">
                  {enquiry.activities.map((activity, activityIdx) => (
                    <li key={activity.id}>
                      <div className="relative pb-6">
                        {activityIdx !== enquiry.activities.length - 1 ? (
                          <span className="absolute top-4 left-3.5 -ml-px h-full w-0.5 bg-[#D9E1DC]" aria-hidden="true" />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className={`h-7 w-7 rounded-full flex items-center justify-center ring-4 ring-white ${activity.type === 'NOTE_ADDED' ? 'bg-[#1F7A5C]' : 'bg-[#D6A84F]'}`}>
                              <span className="text-white text-[10px] font-bold">{activity.type === 'NOTE_ADDED' ? 'N' : 'S'}</span>
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1 flex justify-between space-x-4">
                            <div>
                              <p className="text-xs text-[#202522] leading-relaxed">
                                {activity.note}
                              </p>
                            </div>
                            <div className="text-right text-[10px] whitespace-nowrap text-[#66736D]">
                              <time dateTime={activity.createdAt.toISOString()}>{format(new Date(activity.createdAt), 'MMM d, h:mm a')}</time>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
