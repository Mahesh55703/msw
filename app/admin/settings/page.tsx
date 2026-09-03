import { verifySession } from '@/lib/session'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import SettingsForm from './SettingsForm'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const session = await verifySession()
  if (!session.isAuth) redirect('/admin/login')

  const user = await prisma.user.findUnique({
    where: { id: session.userId as string },
    select: {
      id: true,
      name: true,
      email: true,
    }
  })

  if (!user) redirect('/admin/login')

  return (
    <div className="w-full max-w-[1000px] mx-auto space-y-6">
      <div className="mb-6 border-b border-[#D9E1DC]/80 pb-4">
        <h1 className="text-2xl font-bold text-[#12372A]">Account Settings</h1>
        <p className="text-sm text-[#66736D] mt-1">Manage your account preferences and update your password.</p>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-[#D9E1DC] shadow-xs">
        <SettingsForm user={user} />
      </div>
    </div>
  )
}
