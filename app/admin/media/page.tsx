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
      <div className="bg-[#12372A] p-6 md:p-8 rounded-2xl shadow-sm text-white flex flex-col sm:flex-row sm:items-center sm:justify-between max-w-[1600px] mx-auto w-full gap-4 border border-[#0D281E]">
        <div>
          <span className="text-[10px] font-bold text-[#D6A84F] uppercase tracking-wider">Asset Management</span>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">Media & Photography Library</h1>
          <p className="text-[#A2B3AA] text-xs mt-1">Upload, copy public CDN URLs, and manage visual assets for the website.</p>
        </div>
        <div className="shrink-0">
          <MediaUploader />
        </div>
      </div>
      
      <div className="bg-white shadow-xs border border-[#D9E1DC] overflow-hidden rounded-2xl p-6">
        <MediaGallery initialItems={mediaItems} />
      </div>
    </div>
  )
}