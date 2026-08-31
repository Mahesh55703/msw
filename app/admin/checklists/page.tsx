import Link from 'next/link'
import CmsListWrapper from '@/components/admin/cms/CmsListWrapper'

export default async function ChecklistsPage({ searchParams }: { searchParams: Promise<any> }) {
  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'status', label: 'Status' },
    { key: 'category', label: 'Category' },
    { key: 'updated', label: 'Updated' }
  ]

  return (
    <div className="space-y-6">
      <div className="bg-[#12372A] p-6 md:p-8 rounded-2xl shadow-sm text-white flex flex-col sm:flex-row sm:items-center sm:justify-between max-w-[1600px] mx-auto w-full gap-4 border border-[#0D281E]">
        <div>
          <span className="text-[10px] font-bold text-[#D6A84F] uppercase tracking-wider">CMS Knowledge Base</span>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">Audit Checklists</h1>
          <p className="text-[#A2B3AA] text-xs mt-1">Create, edit and manage audit inspection & compliance checklists.</p>
        </div>
        <div className="shrink-0">
          <Link href="/admin/checklists/new" className="inline-flex items-center justify-center px-4 py-2.5 font-bold rounded-xl shadow-xs transition-colors text-xs text-white bg-[#1F7A5C] hover:bg-[#165B44]">
            + Create Checklist
          </Link>
        </div>
      </div>
      
      <div className="max-w-[1600px] mx-auto w-full">
        <CmsListWrapper category="checklists" columns={columns} searchParams={searchParams} />
      </div>
    </div>
  )
}

