'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, Pencil, Trash2, ArrowUp, ArrowDown, Search } from 'lucide-react'
import { updateFaq, deleteFaq } from '@/app/actions/faq'
import { useRouter } from 'next/navigation'

const FAQ_CATEGORIES: Record<string, string> = {
  HR_OPERATIONS: 'HR & Operations',
  LABOUR_COMPLIANCE: 'Labour Compliance',
  PF_EPFO: 'PF & EPFO',
  ESIC: 'ESIC',
  PAYROLL: 'Payroll & Attendance',
  FACTORY_COMPLIANCE: 'Factory Compliance',
  CONTRACT_LABOUR: 'Contract Labour',
  INDUSTRIAL_RELATIONS: 'Industrial Relations',
  UNCATEGORIZED: 'Uncategorized'
}

export default function FaqList({ items }: { items: any[] }) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  
  const handleDelete = async (id: string) => {
    if (confirm('Delete this FAQ?\nThis FAQ will be permanently removed.')) {
      setIsDeleting(id)
      await deleteFaq(id)
      setIsDeleting(null)
      router.refresh()
    }
  }

  const changeOrder = async (id: string, currentOrder: number, change: number) => {
    await updateFaq(id, { displayOrder: currentOrder + change })
    router.refresh()
  }

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-2xl shadow-xs border border-[#D9E1DC]">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#66736D]" />
          <input 
            type="text" 
            placeholder="Search FAQs by question or answer..." 
            className="w-full h-10 pl-10 pr-3 border border-[#D9E1DC] rounded-xl text-xs bg-[#F7F4EC]/30 text-[#202522] placeholder-[#66736D] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#1F7A5C]" 
            onChange={e => { 
              const u = new URL(window.location.href); 
              if (e.target.value) u.searchParams.set('q', e.target.value); 
              else u.searchParams.delete('q'); 
              router.push(u.pathname + u.search) 
            }} 
          />
        </div>
        <select 
          className="h-10 px-3.5 border border-[#D9E1DC] rounded-xl text-xs font-semibold text-[#202522] bg-[#F7F4EC]/30 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#1F7A5C]" 
          onChange={e => { 
            const u = new URL(window.location.href); 
            if (e.target.value) u.searchParams.set('category', e.target.value); 
            else u.searchParams.delete('category'); 
            router.push(u.pathname + u.search) 
          }}
        >
          <option value="">All Categories</option>
          {Object.entries(FAQ_CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select 
          className="h-10 px-3.5 border border-[#D9E1DC] rounded-xl text-xs font-semibold text-[#202522] bg-[#F7F4EC]/30 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#1F7A5C]" 
          onChange={e => { 
            const u = new URL(window.location.href); 
            if (e.target.value) u.searchParams.set('status', e.target.value); 
            else u.searchParams.delete('status'); 
            router.push(u.pathname + u.search) 
          }}
        >
          <option value="">All Statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-[#D9E1DC] shadow-xs overflow-hidden">
        {items.length === 0 ? (
          <div className="p-12 text-center text-xs font-medium text-[#66736D]">No FAQs found matching your filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[10px] text-[#66736D] uppercase font-bold tracking-wider bg-[#F7F4EC] border-b border-[#D9E1DC]">
                <tr>
                  <th className="px-4 py-3.5 font-bold w-16">Order</th>
                  <th className="px-4 py-3.5 font-bold">Question</th>
                  <th className="px-4 py-3.5 font-bold">Category</th>
                  <th className="px-4 py-3.5 font-bold">Status</th>
                  <th className="px-4 py-3.5 font-bold">Updated</th>
                  <th className="px-4 py-3.5 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9E1DC]/60">
                {items.map((item, index) => (
                  <tr key={item.id} className="hover:bg-[#F7F4EC]/60 transition-colors group">
                    <td className="px-4 py-3.5 text-[#66736D] font-medium">
                      <div className="flex items-center gap-1.5">
                        <div className="flex flex-col">
                          <button type="button" onClick={() => changeOrder(item.id, item.displayOrder, -1)} className="text-[#A2B3AA] hover:text-[#12372A] p-0.5"><ArrowUp className="w-3 h-3"/></button>
                          <button type="button" onClick={() => changeOrder(item.id, item.displayOrder, 1)} className="text-[#A2B3AA] hover:text-[#12372A] p-0.5"><ArrowDown className="w-3 h-3"/></button>
                        </div>
                        <span className="w-6 text-center font-mono font-bold text-[#12372A]">{item.displayOrder || index + 1}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-[#12372A] max-w-sm truncate" title={item.question}>{item.question}</td>
                    <td className="px-4 py-3.5 text-[#66736D]">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F7F4EC] text-[#12372A] border border-[#D9E1DC]">
                        {FAQ_CATEGORIES[item.category] || item.category}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${item.published ? 'bg-[#1F7A5C]/10 text-[#1F7A5C] border border-[#1F7A5C]/20' : 'bg-[#D6A84F]/15 text-[#9E731E] border border-[#D6A84F]/30'}`}>
                        {item.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-[#66736D]">
                      {new Date(item.updatedAt).toLocaleDateString('en-GB')}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link href={`/resources/faqs`} target="_blank" className="p-1.5 text-[#66736D] hover:text-[#12372A] hover:bg-[#F7F4EC] rounded-lg transition-colors" title="View Public FAQ">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link href={`/admin/faqs/${item.id}/edit`} className="p-1.5 text-[#66736D] hover:text-[#1F7A5C] hover:bg-[#1F7A5C]/10 rounded-lg transition-colors" title="Edit">
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button onClick={() => handleDelete(item.id)} disabled={isDeleting === item.id} className="p-1.5 text-[#66736D] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

