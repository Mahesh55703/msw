'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  CheckSquare,
  HelpCircle,
  Image as ImageIcon,
  Users,
  Briefcase,
  Settings,
  Search,
  Inbox
} from 'lucide-react'

export function AdminSidebar({ newEnquiriesCount }: { newEnquiriesCount: number }) {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`)
  }

  const navLinkClass = (path: string) => `
    group flex items-center px-3.5 py-2.5 text-xs font-semibold rounded-xl transition-all duration-200
    ${isActive(path) 
      ? 'bg-[#1F7A5C] text-white shadow-sm font-bold' 
      : 'text-[#A2B3AA] hover:bg-white/10 hover:text-white'}
  `

  const iconClass = (path: string) => `
    mr-3 h-4 w-4 transition-colors shrink-0
    ${isActive(path) 
      ? 'text-[#D6A84F]' 
      : 'text-[#A2B3AA] group-hover:text-white'}
  `

  return (
    <div className="flex-1 overflow-y-auto py-4 px-3.5 space-y-6">
      
      {/* Search Input */}
      <div className="relative mb-4 px-1">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-3.5 w-3.5 text-[#A2B3AA]" />
        </div>
        <input
          type="text"
          placeholder="Quick search..."
          className="block w-full pl-9 pr-3 py-2 border border-white/10 rounded-xl leading-5 bg-[#0D281E]/60 text-white placeholder-[#A2B3AA] text-xs focus:outline-none focus:bg-[#0D281E] focus:ring-2 focus:ring-[#1F7A5C] transition-all"
        />
      </div>

      <div>
        <p className="px-3 text-[10px] font-bold text-[#D6A84F] uppercase tracking-wider mb-2">Overview</p>
        <nav className="space-y-1">
          <Link href="/admin/dashboard" className={navLinkClass('/admin/dashboard')}>
            <LayoutDashboard className={iconClass('/admin/dashboard')} />
            Dashboard
          </Link>
        </nav>
      </div>
      
      <div>
        <p className="px-3 text-[10px] font-bold text-[#D6A84F] uppercase tracking-wider mb-2">CRM & Inquiries</p>
        <nav className="space-y-1">
          <Link href="/admin/enquiries" className={`justify-between ${navLinkClass('/admin/enquiries')}`}>
            <div className="flex items-center">
              <Inbox className={iconClass('/admin/enquiries')} />
              Lead Enquiries
            </div>
            {newEnquiriesCount > 0 && (
              <span className="py-0.5 px-2 rounded-full text-[10px] font-bold bg-[#D6A84F] text-[#12372A] shadow-xs">
                {newEnquiriesCount} New
              </span>
            )}
          </Link>
        </nav>
      </div>

      <div>
        <p className="px-3 text-[10px] font-bold text-[#D6A84F] uppercase tracking-wider mb-2">Content & Knowledge</p>
        <nav className="space-y-1">
          <Link href="/admin/articles" className={navLinkClass('/admin/articles')}>
            <FileText className={iconClass('/admin/articles')} />
            Articles
          </Link>
          <Link href="/admin/guides" className={navLinkClass('/admin/guides')}>
            <BookOpen className={iconClass('/admin/guides')} />
            Guides
          </Link>
          <Link href="/admin/checklists" className={navLinkClass('/admin/checklists')}>
            <CheckSquare className={iconClass('/admin/checklists')} />
            Checklists
          </Link>
          <Link href="/admin/faqs" className={navLinkClass('/admin/faqs')}>
            <HelpCircle className={iconClass('/admin/faqs')} />
            FAQs
          </Link>
          <Link href="/admin/media" className={navLinkClass('/admin/media')}>
            <ImageIcon className={iconClass('/admin/media')} />
            Media Library
          </Link>
        </nav>
      </div>

      <div>
        <p className="px-3 text-[10px] font-bold text-[#D6A84F] uppercase tracking-wider mb-2">Organization</p>
        <nav className="space-y-1">
          <Link href="/admin/team" className={navLinkClass('/admin/team')}>
            <Users className={iconClass('/admin/team')} />
            Team Members
          </Link>
          <Link href="/admin/careers" className={navLinkClass('/admin/careers')}>
            <Briefcase className={iconClass('/admin/careers')} />
            Careers & Jobs
          </Link>
        </nav>
      </div>
      
      <div>
        <p className="px-3 text-[10px] font-bold text-[#D6A84F] uppercase tracking-wider mb-2">Settings</p>
        <nav className="space-y-1">
          <Link href="/admin/settings" className={navLinkClass('/admin/settings')}>
            <Settings className={iconClass('/admin/settings')} />
            Configuration
          </Link>
        </nav>
      </div>
    </div>
  )
}

