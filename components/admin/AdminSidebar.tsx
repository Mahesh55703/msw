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
    group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200
    ${isActive(path) 
      ? 'bg-blue-600/20 text-blue-100 border-l-4 border-blue-400 pl-2' 
      : 'text-slate-300 hover:bg-slate-800 hover:text-white border-l-4 border-transparent pl-2'}
  `

  const iconClass = (path: string) => `
    mr-3 h-5 w-5 transition-colors
    ${isActive(path) 
      ? 'text-blue-400' 
      : 'text-slate-400 group-hover:text-slate-200'}
  `

  return (
    <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
      
      {/* Search Placeholder */}
      <div className="relative mb-6 px-3">
        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="Search..."
          className="block w-full pl-10 pr-3 py-2 border-0 rounded-md leading-5 bg-slate-800/50 text-slate-100 placeholder-slate-400 focus:outline-none focus:bg-slate-800 focus:ring-2 focus:ring-blue-500 sm:text-sm transition-colors"
        />
      </div>

      <div>
        <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Main</p>
        <nav className="space-y-1">
          <Link href="/admin/dashboard" className={navLinkClass('/admin/dashboard')}>
            <LayoutDashboard className={iconClass('/admin/dashboard')} />
            Dashboard
          </Link>
        </nav>
      </div>
      
      <div>
        <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Leads</p>
        <nav className="space-y-1">
          <Link href="/admin/enquiries" className={`justify-between ${navLinkClass('/admin/enquiries')}`}>
            <div className="flex items-center">
              <Inbox className={iconClass('/admin/enquiries')} />
              Enquiries
            </div>
            {newEnquiriesCount > 0 && (
              <span className={`py-0.5 px-2 rounded-full text-xs font-semibold ${isActive('/admin/enquiries') ? 'bg-blue-500 text-white shadow-sm' : 'bg-slate-700 text-blue-300'}`}>
                {newEnquiriesCount}
              </span>
            )}
          </Link>
        </nav>
      </div>

      <div>
        <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Content</p>
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
            Media
          </Link>
        </nav>
      </div>

      <div>
        <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Company</p>
        <nav className="space-y-1">
          <Link href="/admin/team" className={navLinkClass('/admin/team')}>
            <Users className={iconClass('/admin/team')} />
            Team
          </Link>
          <Link href="/admin/careers" className={navLinkClass('/admin/careers')}>
            <Briefcase className={iconClass('/admin/careers')} />
            Careers
          </Link>
        </nav>
      </div>
      
      <div>
        <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">System</p>
        <nav className="space-y-1">
          <Link href="/admin/settings" className={navLinkClass('/admin/settings')}>
            <Settings className={iconClass('/admin/settings')} />
            Settings
          </Link>
        </nav>
      </div>
    </div>
  )
}
