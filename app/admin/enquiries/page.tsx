import prisma from '@/lib/prisma'
import Link from 'next/link'
import { format } from 'date-fns'

export default async function EnquiriesPage() {
  const enquiries = await prisma.enquiry.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-6">
      <div className="bg-[#12372A] p-6 md:p-8 rounded-2xl shadow-sm text-white border border-[#0D281E]">
        <span className="text-[10px] font-bold text-[#D6A84F] uppercase tracking-wider">CRM Operations</span>
        <h1 className="text-2xl font-bold tracking-tight text-white mt-1">Lead Enquiries & Submissions</h1>
        <p className="text-[#A2B3AA] text-xs mt-1">Manage, follow up, and track corporate enterprise consultation leads.</p>
      </div>
      
      <div className="bg-white shadow-xs border border-[#D9E1DC] overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#D9E1DC] text-xs">
            <thead className="bg-[#F7F4EC] text-[#66736D] uppercase font-bold tracking-wider text-[10px]">
              <tr>
                <th scope="col" className="px-5 py-3.5 text-left font-bold">Ref</th>
                <th scope="col" className="px-5 py-3.5 text-left font-bold">Client / Name</th>
                <th scope="col" className="px-5 py-3.5 text-left font-bold">Company</th>
                <th scope="col" className="px-5 py-3.5 text-left font-bold">Service Required</th>
                <th scope="col" className="px-5 py-3.5 text-left font-bold">Status</th>
                <th scope="col" className="px-5 py-3.5 text-left font-bold">Received Date</th>
                <th scope="col" className="px-5 py-3.5 text-right font-bold">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[#D9E1DC]/60">
              {enquiries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-xs text-[#66736D]">
                    No client enquiries found in the database.
                  </td>
                </tr>
              ) : (
                enquiries.map((enquiry) => (
                  <tr key={enquiry.id} className="hover:bg-[#F7F4EC]/60 transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap font-mono text-[#66736D]">{enquiry.referenceNumber}</td>
                    <td className="px-5 py-4 whitespace-nowrap font-bold text-[#12372A]">{enquiry.name}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-[#66736D]">{enquiry.company || '—'}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-[#66736D] truncate max-w-xs">{enquiry.service || 'General Enquiry'}</td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 inline-flex text-[10px] leading-5 font-bold rounded-full
                        ${enquiry.status === 'NEW' ? 'bg-[#D6A84F]/15 text-[#9E731E] border border-[#D6A84F]/30' : ''}
                        ${enquiry.status === 'CONTACTED' ? 'bg-[#F7F4EC] text-[#66736D] border border-[#D9E1DC]' : ''}
                        ${enquiry.status === 'QUALIFIED' ? 'bg-[#1F7A5C]/10 text-[#1F7A5C] border border-[#1F7A5C]/20' : ''}
                        ${enquiry.status === 'PROPOSAL' ? 'bg-[#D6A84F]/20 text-[#9E731E] border border-[#D6A84F]/40' : ''}
                        ${enquiry.status === 'WON' ? 'bg-[#12372A]/10 text-[#12372A] border border-[#12372A]/20' : ''}
                        ${enquiry.status === 'LOST' ? 'bg-rose-50 text-rose-700 border border-rose-200' : ''}
                      `}>
                        {enquiry.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-[#66736D]">
                      {format(new Date(enquiry.createdAt), 'dd MMM yyyy')}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-right font-bold">
                      <Link href={`/admin/enquiries/${enquiry.id}`} className="text-[#1F7A5C] hover:text-[#165B44]">
                        Details →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

