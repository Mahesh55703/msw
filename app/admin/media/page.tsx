import prisma from '@/lib/prisma'
import { verifySession } from '@/lib/session'
import { redirect } from 'next/navigation'
import MediaUploader from './MediaUploader'
import MediaGallery from './MediaGallery'

export default async function MediaPage() {
  const session = await verifySession()
  if (!session.isAuth) redirect('/admin/login')

  const mediaItems = await prisma.media.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 rounded-xl shadow-md text-white flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Media Library</h1>
          <p className="text-amber-50 mt-1">Upload and manage images for your website.</p>
        </div>
        <div className="mt-4 sm:mt-0 bg-white/20 p-1 rounded-lg backdrop-blur-sm">
          <MediaUploader />
        </div>
      </div>
      
      <div className="bg-white shadow-sm border border-gray-100 overflow-hidden rounded-xl p-6">
        <MediaGallery initialItems={mediaItems} />
      </div>
    </div>
  )
}