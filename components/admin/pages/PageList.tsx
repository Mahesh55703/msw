'use client'

import { useState } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Eye, Pencil, Search, LayoutTemplate, Shield, Archive, AlertCircle, Plus } from 'lucide-react'
import { format } from 'date-fns'
import type { AdminPageListItem } from '@/lib/db/pages'
import { Button } from '@/components/ui/button'

const PROTECTED_PAGES = new Set([
  'HOME', 'ABOUT', 'CONTACT', 'SERVICES', 'INDUSTRIES',
  'RESOURCES', 'TEAM', 'CAREERS', 'COMPLIANCE_HEALTH_CHECK'
])

interface PageListProps {
  items: AdminPageListItem[]
  totalCount: number
  filteredCount: number
  activeTab: string
}

export default function PageList({ items, totalCount, filteredCount, activeTab }: PageListProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const currentStatus = searchParams.get('status') || ''

  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(name, value)
    } else {
      params.delete(name)
    }
    return params.toString()
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(pathname + '?' + createQueryString('q', searchQuery.trim()))
  }

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.push(pathname + '?' + createQueryString('status', e.target.value))
  }

  const handleTabChange = (tab: string) => {
    setSearchQuery('')
    const params = new URLSearchParams()
    if (tab !== 'core') params.set('tab', tab)
    router.push(pathname + '?' + params.toString())
  }

  const clearFilters = () => {
    setSearchQuery('')
    const params = new URLSearchParams()
    if (activeTab !== 'core') params.set('tab', activeTab)
    router.push(pathname + '?' + params.toString())
  }

  return (
    <div className="space-y-6">
      {/* ---------------------------------------------------- */}
      {/* HEADER                                               */}
      {/* ---------------------------------------------------- */}
      <div className="bg-[#12372A] p-6 md:p-8 rounded-3xl shadow-sm text-white flex flex-col sm:flex-row sm:items-center sm:justify-between max-w-[1600px] mx-auto w-full gap-4 border border-[#0D281E]">
        <div>
          <span className="text-[10px] font-bold text-[#D6A84F] uppercase tracking-wider">
            Content Management
          </span>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mt-1">
            Site Pages
          </h1>
          <p className="text-[#A2B3AA] text-xs md:text-sm mt-1">
            Manage the content, layout, and SEO of your website pages.
          </p>
        </div>
        
        {activeTab === 'services' && (
          <Link href="/admin/pages/services/new" className="inline-flex items-center justify-center rounded-xl font-bold transition-all px-6 py-2.5 text-sm bg-[#D6A84F] text-[#12372A] hover:bg-[#c29643]">
            <Plus className="w-4 h-4 mr-2" />
            Create Service
          </Link>
        )}
        
        {activeTab === 'industries' && (
          <Link href="/admin/pages/industries/new" className="inline-flex items-center justify-center rounded-xl font-bold transition-all px-6 py-2.5 text-sm bg-[#D6A84F] text-[#12372A] hover:bg-[#c29643]">
            <Plus className="w-4 h-4 mr-2" />
            Create Industry
          </Link>
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* TABS                                                 */}
      {/* ---------------------------------------------------- */}
      <div className="flex items-center gap-2 border-b border-[#D9E1DC] pb-px">
        <button
          onClick={() => handleTabChange('core')}
          className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'core' 
              ? 'border-[#1F7A5C] text-[#1F7A5C]' 
              : 'border-transparent text-[#66736D] hover:text-[#12372A] hover:border-[#D9E1DC]'
          }`}
        >
          Core Pages
        </button>
        <button
          onClick={() => handleTabChange('services')}
          className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'services' 
              ? 'border-[#1F7A5C] text-[#1F7A5C]' 
              : 'border-transparent text-[#66736D] hover:text-[#12372A] hover:border-[#D9E1DC]'
          }`}
        >
          Services
        </button>
        <button
          onClick={() => handleTabChange('industries')}
          className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'industries' 
              ? 'border-[#1F7A5C] text-[#1F7A5C]' 
              : 'border-transparent text-[#66736D] hover:text-[#12372A] hover:border-[#D9E1DC]'
          }`}
        >
          Industries
        </button>
      </div>

      {/* ---------------------------------------------------- */}
      {/* TOOLBAR: SEARCH & STATUS FILTER                      */}
      {/* ---------------------------------------------------- */}
      <div className="bg-white p-4 rounded-2xl border border-[#D9E1DC] shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearch} className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#66736D]" />
          <input
            type="text"
            placeholder="Search pages by name or path..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[#D9E1DC] rounded-xl text-xs bg-[#F7F4EC]/30 text-[#202522] placeholder-[#66736D] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#1F7A5C] focus:border-[#1F7A5C] transition-all"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={currentStatus}
            onChange={handleStatusChange}
            className="border border-[#D9E1DC] rounded-xl px-3.5 py-2 text-xs font-semibold text-[#202522] bg-[#F7F4EC]/30 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#1F7A5C]"
          >
            <option value="">All Statuses</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Has Draft Changes</option>
            <option value="ARCHIVED">Archived</option>
          </select>

          {(searchQuery || currentStatus) && (
            <button
              onClick={clearFilters}
              className="text-xs font-bold text-[#1F7A5C] hover:text-[#165B44] transition-colors px-2 py-1"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* PAGES TABLE (DESKTOP & MOBILE)                       */}
      {/* ---------------------------------------------------- */}
      <div className="bg-white rounded-3xl border border-[#D9E1DC] shadow-xs overflow-hidden">
        {items.length === 0 ? (
          <div className="p-16 text-center text-xs font-medium text-[#66736D] space-y-3">
            <LayoutTemplate className="w-10 h-10 mx-auto text-[#A2B3AA]" />
            <p className="text-sm font-bold text-[#12372A]">No pages found</p>
            <p className="max-w-sm mx-auto">
              {searchQuery || currentStatus
                ? 'Try adjusting your search query or status filter.'
                : 'No pages have been set up in the CMS.'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F7F4EC] border-b border-[#D9E1DC] text-[#66736D] text-[10px] uppercase font-bold tracking-wider">
                    <th className="px-4 py-3.5 w-64">Page</th>
                    <th className="px-4 py-3.5 w-48">Status / Revision</th>
                    <th className="px-4 py-3.5 w-48">Last Updated</th>
                    <th className="px-4 py-3.5 text-right w-36">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9E1DC]/60 text-xs">
                  {items.map((item) => {
                    const isProtected = PROTECTED_PAGES.has(item.key)
                    const dateToShow = item.updatedAt
                    
                    return (
                      <tr key={item.id} className="hover:bg-[#F7F4EC]/60 transition-colors group">
                        <td className="px-4 py-4">
                          <Link
                            href={`/admin/pages/${item.id}`}
                            className="font-bold text-[#12372A] hover:text-[#1F7A5C] transition-colors line-clamp-1 flex items-center gap-2"
                            title={item.key}
                          >
                            {item.key}
                            {isProtected && (
                              <span title="System Page"><Shield className="w-3.5 h-3.5 text-[#1F7A5C]" /></span>
                            )}
                          </Link>
                          <span className="text-[10px] text-[#66736D] font-mono block mt-0.5">
                            {item.path}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2">
                              {item.status === 'PUBLISHED' ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1F7A5C]/10 text-[#1F7A5C] border border-[#1F7A5C]/20">
                                  Live: v{item.publishedVersion || '?'}
                                </span>
                              ) : item.status === 'ARCHIVED' ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200">
                                  Archived
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D6A84F]/15 text-[#9E731E] border border-[#D6A84F]/30">
                                  Draft Only
                                </span>
                              )}
                            </div>
                            
                            {item.hasDraft && (
                              <div className="flex items-center gap-1 text-[10px] text-[#9E731E] font-semibold bg-[#D6A84F]/10 px-2 py-0.5 rounded border border-[#D6A84F]/20 w-fit">
                                <AlertCircle className="w-3 h-3" />
                                Unsaved draft edits
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-[#66736D] whitespace-nowrap font-mono text-[11px]">
                          {format(new Date(dateToShow), 'dd MMM yyyy, HH:mm')}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              href={item.path}
                              target="_blank"
                              className="p-2 text-[#66736D] hover:text-[#12372A] hover:bg-[#F7F4EC] rounded-xl transition-colors"
                              title="View Live Page"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>

                            <Link
                              href={`/admin/pages/${item.id}`}
                              className="p-2 text-[#66736D] hover:text-[#1F7A5C] hover:bg-[#1F7A5C]/10 rounded-xl transition-colors"
                              title="Edit Page"
                            >
                              <Pencil className="w-4 h-4" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="md:hidden divide-y divide-[#D9E1DC]/60">
              {items.map((item) => {
                const isProtected = PROTECTED_PAGES.has(item.key)
                
                return (
                  <div key={item.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {item.status === 'PUBLISHED' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#1F7A5C]/10 text-[#1F7A5C] border border-[#1F7A5C]/20">
                            Live: v{item.publishedVersion}
                          </span>
                        ) : item.status === 'ARCHIVED' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-gray-100 text-gray-600 border border-gray-200">
                            Archived
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#D6A84F]/15 text-[#9E731E] border border-[#D6A84F]/30">
                            Draft Only
                          </span>
                        )}
                        {item.hasDraft && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#D6A84F]/10 text-[#9E731E] border border-[#D6A84F]/20">
                            Draft updates
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#66736D] font-mono">
                        {format(new Date(item.updatedAt), 'dd MMM yy')}
                      </span>
                    </div>

                    <Link
                      href={`/admin/pages/${item.id}`}
                      className="font-bold text-sm text-[#12372A] hover:text-[#1F7A5C] block leading-snug flex items-center gap-2"
                    >
                      {item.key}
                      {isProtected && <Shield className="w-3 h-3 text-[#1F7A5C]" />}
                    </Link>
                    
                    <span className="text-[10px] text-[#66736D] font-mono block">
                      {item.path}
                    </span>

                    <div className="pt-2 flex items-center justify-between border-t border-[#D9E1DC]/60 text-xs">
                      <Link
                        href={item.path}
                        target="_blank"
                        className="flex items-center gap-1 text-[#66736D] font-bold hover:text-[#12372A]"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </Link>
                      <Link
                        href={`/admin/pages/${item.id}`}
                        className="flex items-center gap-1 text-[#1F7A5C] font-bold hover:text-[#165B44]"
                      >
                        <Pencil className="w-3.5 h-3.5" /> Edit
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
      
      {/* Footer Meta */}
      {filteredCount > 0 && (
        <div className="py-2 text-xs text-[#66736D]">
          Showing <span className="font-bold text-[#12372A]">{filteredCount}</span> of <span className="font-bold text-[#12372A]">{totalCount}</span> pages.
        </div>
      )}
    </div>
  )
}
