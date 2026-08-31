import { ReactNode } from 'react'
import { logout } from '@/app/actions/auth'
import { verifySession } from '@/lib/session'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { LogOut, Menu, ShieldCheck } from 'lucide-react'
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
    <div className="flex h-screen bg-[#F7F4EC] font-sans overflow-hidden">
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex w-64 flex-shrink-0 bg-[#12372A] border-r border-[#0D281E] flex-col z-20 h-full text-white">
        <div className="flex items-center h-16 border-b border-white/10 px-6 shrink-0 gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#1F7A5C] flex items-center justify-center text-white shadow-xs">
            <ShieldCheck className="w-5 h-5 text-[#D6A84F]" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight leading-none">LABOURAXIS</h1>
            <span className="text-[10px] font-semibold text-[#D6A84F] tracking-wider uppercase">Admin Portal</span>
          </div>
        </div>
        
        <AdminSidebar newEnquiriesCount={newEnquiriesCount} />
        
        {/* Profile / Account Area */}
        <div className="flex-shrink-0 border-t border-white/10 p-4 bg-[#0D281E]/60">
          <div className="flex items-center w-full mb-3 px-2">
            <div className="w-8 h-8 rounded-lg bg-[#1F7A5C] text-white flex items-center justify-center font-bold text-xs shrink-0 border border-white/15">
              {user?.name ? user.name.substring(0, 2).toUpperCase() : 'AD'}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">{user?.name || 'Administrator'}</p>
              <p className="text-xs text-[#A2B3AA] capitalize">{user?.role?.toLowerCase() || 'Admin'}</p>
            </div>
          </div>
          <form action={logout} className="w-full">
            <button type="submit" className="group flex w-full items-center justify-center px-3 py-2 text-xs font-bold rounded-lg text-[#A2B3AA] hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors">
              <LogOut className="mr-2 h-3.5 w-3.5 text-[#A2B3AA] group-hover:text-white" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#F7F4EC]">
        
        {/* Admin Top Bar */}
        <header className="flex-shrink-0 bg-white border-b border-[#D9E1DC] h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-10">
          <div className="flex items-center md:hidden">
            <button className="text-[#66736D] hover:text-[#12372A] focus:outline-none p-2 rounded-lg hover:bg-[#F7F4EC]">
              <span className="sr-only">Open sidebar</span>
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
            <h1 className="ml-3 text-base font-bold text-[#12372A] tracking-tight">LABOURAXIS</h1>
          </div>
          
          <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-[#66736D]">
            <span className="w-2 h-2 rounded-full bg-[#1F7A5C]"></span>
            <span>LabourAxis Operations & Statutory CRM</span>
          </div>

          <div className="flex items-center space-x-3">
            <a 
              href="/" 
              target="_blank" 
              className="text-xs font-bold text-[#1F7A5C] hover:text-[#165B44] bg-[#1F7A5C]/10 border border-[#1F7A5C]/20 px-3 py-1.5 rounded-lg transition-colors"
            >
              View Live Website →
            </a>
            <div className="md:hidden flex items-center">
              <div className="w-8 h-8 rounded-lg bg-[#1F7A5C] text-white flex items-center justify-center font-bold text-xs">
                {user?.name ? user.name.substring(0, 2).toUpperCase() : 'AD'}
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto bg-[#F7F4EC] p-4 sm:p-6 lg:p-8">
          <div className="max-w-[1600px] mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

