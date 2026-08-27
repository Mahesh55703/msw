'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, Pencil, Trash2, ArrowUp, ArrowDown } from 'lucide-react'
import { updateFaq, deleteFaq } from '@/app/actions/faq'
import { useRouter } from 'next/navigation'

const FAQ_CATEGORIES: Record<string, string> = {
  HR_OPERATIONS: 'HR & HR Operations',
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
      <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <input type="text" placeholder="Search FAQs..." className="flex-1 min-w-[200px] h-10 px-3 border border-slate-200 rounded-md text-sm" onChange={e => { const u = new URL(window.location.href); if (e.target.value) u.searchParams.set('q', e.target.value); else u.searchParams.delete('q'); router.push(u.pathname + u.search) }} />
        <select className="h-10 px-3 border border-slate-200 rounded-md text-sm" onChange={e => { const u = new URL(window.location.href); if (e.target.value) u.searchParams.set('category', e.target.value); else u.searchParams.delete('category'); router.push(u.pathname + u.search) }}>
          <option value="">All Categories</option>
          {Object.entries(FAQ_CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select className="h-10 px-3 border border-slate-200 rounded-md text-sm" onChange={e => { const u = new URL(window.location.href); if (e.target.value) u.searchParams.set('status', e.target.value); else u.searchParams.delete('status'); router.push(u.pathname + u.search) }}>
          <option value="">All Statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {items.length === 0 ? (
        <div className="p-8 text-center text-slate-500">No FAQs found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-semibold">#</th>
                <th className="px-4 py-3 font-semibold">Question</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Updated</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item, index) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-4 py-3 text-slate-500 font-medium">
                    <div className="flex items-center gap-1">
                      <div className="flex flex-col">
                        <button type="button" onClick={() => changeOrder(item.id, item.displayOrder, -1)} className="text-slate-300 hover:text-slate-600"><ArrowUp className="w-3 h-3"/></button>
                        <button type="button" onClick={() => changeOrder(item.id, item.displayOrder, 1)} className="text-slate-300 hover:text-slate-600"><ArrowDown className="w-3 h-3"/></button>
                      </div>
                      <span className="w-6 text-center">{item.displayOrder || index + 1}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900 max-w-sm truncate" title={item.question}>{item.question}</td>
                  <td className="px-4 py-3 text-slate-600">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                      {FAQ_CATEGORIES[item.category] || item.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${item.published ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {item.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(item.updatedAt).toLocaleDateString('en-GB')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/resources/faqs`} target="_blank" className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="View on Site">
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link href={`/admin/faqs/${item.id}/edit`} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Edit">
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button onClick={() => handleDelete(item.id)} disabled={isDeleting === item.id} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Delete">
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
