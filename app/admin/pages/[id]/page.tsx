import { verifySession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { getAdminPageById, getPageRevision } from '@/lib/db/pages'
import PageEditor from '@/components/admin/pages/PageEditor'
import { notFound } from 'next/navigation'

export default async function AdminPageEditorRoute({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await verifySession()
  if (!session.isAuth) redirect('/admin/login')

  const { id } = await params
  const page = await getAdminPageById(id)

  if (!page) {
    notFound()
  }

  // Find if there is a draft revision (a revision newer than published)
  const publishedRev = page.revisions.find((r) => r.id === page.publishedRevisionId)
  const draftRevisionInfo = publishedRev
    ? page.revisions.find((r) => r.version > publishedRev.version)
    : (page.revisions[0] ?? null)

  let draftRevision = null
  if (draftRevisionInfo) {
    draftRevision = await getPageRevision(draftRevisionInfo.id)
  }

  return (
    <PageEditor 
      page={page} 
      draftRevision={draftRevision} 
      sessionRole={session.role || 'EDITOR'} 
    />
  )
}
