import { ReactNode } from 'react'
import { logout } from '@/app/actions/auth'
import { verifySession } from '@/lib/session'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { LogOut, Menu } from 'lucide-react'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export default async function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  const session = await verifySession()

  if (!session.isAuth) {
    return <>{children}</>
  }

  // Fetch new enquiries count for the badge
  const newEnquiriesCount = await prisma.enquiry.count({
    where: { status: 'NEW' }
  })

  // Fetch current user
  const user = await prisma.user.findUnique({
    where: { id: session.userId as string }
  })

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex w-64 flex-shrink-0 bg-slate-900 border-r border-slate-800 flex-col z-20 h-full">
        <div className="flex items-center h-16 border-b border-slate-800 px-6 shrink-0">
          <h1 className="text-lg font-bold text-white tracking-tight">LABOURAXIS</h1>
        </div>
        
        <AdminSidebar newEnquiriesCount={newEnquiriesCount} />
        
        {/* Profile / Account Area */}
        <div className="flex-shrink-0 border-t border-slate-800 p-4 bg-slate-900/50">
          <div className="flex items-center w-full mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
              {user?.name ? user.name.substring(0, 2).toUpperCase() : 'AD'}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium text-slate-100 truncate">{user?.name || 'Administrator'}</p>
              <p className="text-xs text-slate-400 capitalize">{user?.role?.toLowerCase()}</p>
            </div>
          </div>
          <form action={logout} className="w-full">
            <button type="submit" className="group flex w-full items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-slate-300 bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200 transition-colors">
              <LogOut className="mr-2 h-4 w-4 text-slate-400" />
              Logout
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Admin Top Bar (Mobile + Desktop Context) */}
        <header className="flex-shrink-0 bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-10">
          <div className="flex items-center md:hidden">
            <button className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 p-2 rounded-md">
              <span className="sr-only">Open sidebar</span>
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
            <h1 className="ml-3 text-lg font-bold text-gray-900 tracking-tight">LABOURAXIS</h1>
          </div>
          <div className="hidden md:flex items-center text-sm text-gray-500 font-medium">
            LabourAxis CRM & Admin Portal
          </div>
          <div className="flex items-center space-x-4">
            <div className="md:hidden flex items-center">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                {user?.name ? user.name.substring(0, 2).toUpperCase() : 'AD'}
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
          <div className="max-w-[1600px] mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
