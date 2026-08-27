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
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-xl shadow-md text-white flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Enquiry {enquiry.referenceNumber}</h1>
          <p className="text-blue-100 mt-1">{enquiry.company || enquiry.name} - {enquiry.service}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Contact Information</h3>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
              <dl className="sm:divide-y sm:divide-gray-200">
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Name</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{enquiry.name} {enquiry.designation && `(${enquiry.designation})`}</dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Company</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{enquiry.company || 'N/A'}</dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Email address</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{enquiry.email}</dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Phone</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{enquiry.phone || 'N/A'}</dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Preferred Contact</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{enquiry.preferredContactMethod || 'N/A'}</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Requirement Details</h3>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
              <dl className="sm:divide-y sm:divide-gray-200">
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Services Needed</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{enquiry.service || 'N/A'}</dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Industry & Location</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{enquiry.industry || 'N/A'} - {enquiry.location || 'N/A'}</dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Workforce Size</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    Employees: {enquiry.employeeCount || '0'} | Contractors: {enquiry.contractorCount || '0'}
                  </dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Source</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{enquiry.source || 'N/A'}</dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Message</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 whitespace-pre-wrap">{enquiry.message || 'N/A'}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Right Column: Status & Timeline */}
        <div className="space-y-6">
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Manage Status</h3>
              <form action={updateEnquiryStatus} className="mt-4 flex flex-col space-y-4">
                <input type="hidden" name="enquiryId" value={enquiry.id} />
                <select 
                  name="status" 
                  defaultValue={enquiry.status}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
                >
                  <option value="NEW">New</option>
                  <option value="CONTACTED">Contacted</option>
                  <option value="QUALIFIED">Qualified</option>
                  <option value="PROPOSAL">Proposal Sent</option>
                  <option value="WON">Won</option>
                  <option value="LOST">Lost</option>
                </select>
                <Button type="submit" className="w-full">Update Status</Button>
              </form>
            </div>
          </div>

          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Internal Notes</h3>
              <form action={addEnquiryNote} className="mb-6 space-y-3">
                <input type="hidden" name="enquiryId" value={enquiry.id} />
                <textarea
                  name="note"
                  rows={3}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md border p-2"
                  placeholder="Add a note (only visible to admins)..."
                  required
                />
                <Button type="submit" variant="outline" className="w-full">Add Note</Button>
              </form>

              <div className="flow-root mt-6">
                <ul role="list" className="-mb-8">
                  {enquiry.activities.map((activity, activityIdx) => (
                    <li key={activity.id}>
                      <div className="relative pb-8">
                        {activityIdx !== enquiry.activities.length - 1 ? (
                          <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${activity.type === 'NOTE_ADDED' ? 'bg-blue-500' : 'bg-gray-400'}`}>
                              <span className="text-white text-xs font-bold">{activity.type === 'NOTE_ADDED' ? 'N' : 'S'}</span>
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-gray-500">
                                {activity.note}
                              </p>
                            </div>
                            <div className="text-right text-xs whitespace-nowrap text-gray-500">
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
