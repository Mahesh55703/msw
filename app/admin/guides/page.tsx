import Link from 'next/link'
import CmsListWrapper from '@/components/admin/cms/CmsListWrapper'

export default async function GuidesPage({ searchParams }: { searchParams: Promise<any> }) {
  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'status', label: 'Status' },
    { key: 'category', label: 'Category' },
    { key: 'author', label: 'Author' },
    { key: 'updated', label: 'Updated' }
  ]

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 rounded-xl shadow-md text-white flex flex-col sm:flex-row sm:items-center sm:justify-between max-w-[1600px] mx-auto w-full gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Guides</h1>
          <p className="text-emerald-50 mt-1">Create, edit and manage LabourAxis guides.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link href="/admin/guides/new" className="inline-flex items-center justify-center px-4 py-2 border border-transparent font-medium rounded-lg shadow-sm transition-colors text-teal-700 bg-white hover:bg-emerald-50">
            + Create Guide
          </Link>
        </div>
      </div>
      
      <div className="max-w-[1600px] mx-auto w-full">
        <CmsListWrapper category="guides" columns={columns} searchParams={searchParams} />
      </div>
    </div>
  )
}
