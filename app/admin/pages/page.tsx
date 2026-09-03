import { verifySession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { getAdminPages } from '@/lib/db/pages'
import PageList from '@/components/admin/pages/PageList'

export default async function AdminPagesRoute({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; tab?: string }>
}) {
  const session = await verifySession()
  if (!session.isAuth) redirect('/admin/login')

  const resolvedParams = await searchParams
  const query = resolvedParams.q?.trim() || ''
  const status = resolvedParams.status?.trim() || ''
  const tab = resolvedParams.tab?.trim() || 'core'

  const allPages = await getAdminPages()

  const filteredPages = allPages.filter((page) => {
    // 0. Tab Filter
    if (tab === 'services') {
      if (!page.path.startsWith('/services/') || page.path === '/services') return false
    } else if (tab === 'industries') {
      if (!page.path.startsWith('/industries/') || page.path === '/industries') return false
    } else {
      // Core pages
      if (page.path.startsWith('/services/') && page.path !== '/services') return false
      if (page.path.startsWith('/industries/') && page.path !== '/industries') return false
    }

    // 1. Search Query
    if (query) {
      const q = query.toLowerCase()
      const matchesKey = page.key.toLowerCase().includes(q)
      const matchesPath = page.path.toLowerCase().includes(q)
      if (!matchesKey && !matchesPath) return false
    }

    // 2. Status Filter
    if (status) {
      if (status === 'PUBLISHED' && page.status !== 'PUBLISHED') return false
      if (status === 'DRAFT' && (!page.hasDraft || page.status === 'ARCHIVED')) return false
      if (status === 'ARCHIVED' && page.status !== 'ARCHIVED') return false
    }

    return true
  })

  // Calculate totals for each tab
  const coreTotal = allPages.filter(p => (!p.path.startsWith('/services/') || p.path === '/services') && (!p.path.startsWith('/industries/') || p.path === '/industries')).length
  const servicesTotal = allPages.filter(p => p.path.startsWith('/services/') && p.path !== '/services').length
  const industriesTotal = allPages.filter(p => p.path.startsWith('/industries/') && p.path !== '/industries').length

  const totalCount = tab === 'services' ? servicesTotal : tab === 'industries' ? industriesTotal : coreTotal

  return (
    <PageList 
      items={filteredPages}
      totalCount={totalCount}
      filteredCount={filteredPages.length}
      activeTab={tab}
    />
  )
}
