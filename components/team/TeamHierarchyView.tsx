'use client'

import { useState } from 'react'
import {
  User,
  ShieldCheck,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Info,
  X,
} from 'lucide-react'

export interface HierarchyMember {
  id: string
  name: string
  designation: string
  role?: string | null
  department?: string | null
  bio?: string | null
  imageUrl?: string | null
  imageAlt?: string | null
  linkedinUrl?: string | null
  displayOrder: number
  reportsToId?: string | null
  children?: HierarchyMember[]
}

interface TeamHierarchyViewProps {
  rootMembers: HierarchyMember[]
}

export function TeamHierarchyView({ rootMembers }: TeamHierarchyViewProps) {
  const [selectedBioMember, setSelectedBioMember] = useState<HierarchyMember | null>(null)

  if (!rootMembers || rootMembers.length === 0) {
    return (
      <div className="text-center py-16 bg-[#F7F4EC] rounded-3xl border border-dashed border-[#D9E1DC] p-8 max-w-2xl mx-auto">
        <User className="w-12 h-12 mx-auto text-[#A2B3AA] mb-3" />
        <h3 className="text-lg font-bold text-[#12372A]">Leadership & Practice Directory</h3>
        <p className="text-xs text-[#66736D] mt-1 leading-relaxed">
          Our organizational team directory is currently being synchronized. Please connect with our advisory desk for direct practitioner mandates.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-12">
      {/* Root Leadership Tier */}
      <div className="flex flex-col items-center gap-12">
        {rootMembers.map((rootNode) => (
          <HierarchyNode
            key={rootNode.id}
            node={rootNode}
            level={1}
            onOpenBio={setSelectedBioMember}
          />
        ))}
      </div>

      {/* Bio Modal / Drawer for full executive profile */}
      {selectedBioMember && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-[#D9E1DC] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#D9E1DC]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#1F7A5C]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#1F7A5C]">
                  Executive Profile
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBioMember(null)}
                className="p-1.5 text-[#66736D] hover:text-[#12372A] rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-20 h-20 bg-[#EDE8DE] rounded-2xl shrink-0 overflow-hidden border-2 border-white shadow-xs flex items-center justify-center">
                {selectedBioMember.imageUrl ? (
                  <img
                    src={selectedBioMember.imageUrl}
                    alt={selectedBioMember.imageAlt || selectedBioMember.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-[#12372A]" />
                )}
              </div>

              <div>
                <h3 className="text-xl font-bold text-[#12372A]">{selectedBioMember.name}</h3>
                <p className="text-[#1F7A5C] font-bold text-xs sm:text-sm mt-0.5">
                  {selectedBioMember.designation || selectedBioMember.role}
                </p>
                {selectedBioMember.department && (
                  <span className="inline-block mt-1.5 text-[10px] font-bold text-[#66736D] bg-[#F7F4EC] px-2.5 py-0.5 rounded-md border border-[#D9E1DC]">
                    {selectedBioMember.department}
                  </span>
                )}
              </div>
            </div>

            {selectedBioMember.bio && (
              <div className="space-y-2 pt-2 border-t border-[#D9E1DC]/80">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#66736D]">
                  Biography & Advisory Scope
                </h4>
                <p className="text-xs sm:text-sm text-[#202522] leading-relaxed">
                  {selectedBioMember.bio}
                </p>
              </div>
            )}

            {selectedBioMember.linkedinUrl && (
              <div className="pt-3 border-t border-[#D9E1DC] flex justify-end">
                <a
                  href={selectedBioMember.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#0A66C2] hover:bg-[#084e96] text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.48 1.48 0 1 0 0-2.96 1.48 1.48 0 0 0 0 2.96m1.4 9.74v-8.37H5.06v8.37h2.8z" />
                  </svg>
                  <span>Connect on LinkedIn</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function HierarchyNode({
  node,
  level,
  onOpenBio,
}: {
  node: HierarchyMember
  level: number
  onOpenBio: (m: HierarchyMember) => void
}) {
  const hasChildren = node.children && node.children.length > 0
  const isRoot = level === 1

  return (
    <div className="flex flex-col items-center w-full">
      {/* Current Member Card */}
      <div className="w-full flex justify-center px-2">
        <MemberCard member={node} isRoot={isRoot} level={level} onOpenBio={onOpenBio} />
      </div>

      {/* Children Tier with Connectors */}
      {hasChildren && (
        <div className="w-full flex flex-col items-center mt-6">
          {/* Vertical Stem from Parent */}
          <div className="w-0.5 h-8 bg-[#1F7A5C]/40"></div>

          {/* Desktop Branching Connector Bar */}
          {node.children!.length > 1 && (
            <div className="hidden md:block w-full max-w-4xl relative">
              <div className="h-0.5 bg-[#1F7A5C]/40 w-[calc(100%-16rem)] mx-auto"></div>
            </div>
          )}

          {/* Children Grid */}
          <div
            className={`w-full grid gap-6 sm:gap-8 pt-4 sm:pt-0 ${
              node.children!.length === 1
                ? 'grid-cols-1 max-w-md justify-center'
                : node.children!.length === 2
                ? 'grid-cols-1 md:grid-cols-2 max-w-3xl justify-center'
                : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-5xl justify-center'
            }`}
          >
            {node.children!.map((child) => (
              <div key={child.id} className="flex flex-col items-center relative">
                {/* Desktop top connector tick */}
                <div className="hidden md:block w-0.5 h-6 bg-[#1F7A5C]/40 mb-2"></div>
                <HierarchyNode node={child} level={level + 1} onOpenBio={onOpenBio} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function MemberCard({
  member,
  isRoot,
  level,
  onOpenBio,
}: {
  member: HierarchyMember
  isRoot: boolean
  level: number
  onOpenBio: (m: HierarchyMember) => void
}) {
  return (
    <div
      className={`relative rounded-3xl border transition-all duration-300 group flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-lg ${
        isRoot
          ? 'bg-white border-[#1F7A5C]/40 ring-1 ring-[#1F7A5C]/20 max-w-md w-full p-6 sm:p-7'
          : level === 2
          ? 'bg-white border-[#D9E1DC] hover:border-[#1F7A5C]/50 max-w-sm w-full p-5 sm:p-6'
          : 'bg-[#F7F4EC] border-[#D9E1DC] hover:border-[#1F7A5C]/40 max-w-xs w-full p-4 sm:p-5'
      }`}
    >
      <div>
        {/* Top Header Row: Photo + Identity + LinkedIn */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5">
            {/* Photo Avatar */}
            <div
              className={`rounded-2xl shrink-0 overflow-hidden border-2 border-white shadow-xs flex items-center justify-center bg-[#EDE8DE] ${
                isRoot ? 'w-16 h-16 sm:w-18 sm:h-18' : 'w-12 h-12 sm:w-14 sm:h-14'
              }`}
            >
              {member.imageUrl ? (
                <img
                  src={member.imageUrl}
                  alt={member.imageAlt || member.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <User className="w-6 h-6 text-[#12372A]" />
              )}
            </div>

            {/* Name & Title */}
            <div>
              {isRoot && (
                <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-[#D6A84F] bg-[#12372A] px-2 py-0.5 rounded-full mb-1">
                  ★ Core Leadership
                </span>
              )}
              <h3
                className={`font-bold text-[#12372A] group-hover:text-[#1F7A5C] transition-colors leading-tight ${
                  isRoot ? 'text-lg sm:text-xl' : 'text-sm sm:text-base'
                }`}
              >
                {member.name}
              </h3>
              <p className="text-[#1F7A5C] font-bold text-xs mt-0.5 leading-snug">
                {member.designation || member.role}
              </p>
              {member.department && (
                <span className="inline-block mt-1 text-[9px] font-bold text-[#66736D] bg-[#F7F4EC] px-2 py-0.5 rounded-md border border-[#D9E1DC]">
                  {member.department}
                </span>
              )}
            </div>
          </div>

          {/* LinkedIn Icon Link */}
          {member.linkedinUrl && (
            <a
              href={member.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-xl bg-white border border-[#D9E1DC] flex items-center justify-center text-[#0A66C2] hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2] transition-colors shadow-2xs shrink-0"
              title={`View ${member.name}'s LinkedIn Profile`}
              aria-label={`View ${member.name}'s LinkedIn Profile`}
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.48 1.48 0 1 0 0-2.96 1.48 1.48 0 0 0 0 2.96m1.4 9.74v-8.37H5.06v8.37h2.8z" />
              </svg>
            </a>
          )}
        </div>

        {/* Bio Excerpt */}
        {member.bio && (
          <p className="text-[#202522] text-xs leading-relaxed mt-3.5 line-clamp-3 text-balance">
            {member.bio}
          </p>
        )}
      </div>

      {/* Footer trigger */}
      {member.bio && (
        <div className="mt-3.5 pt-2.5 border-t border-[#D9E1DC]/70 flex justify-end">
          <button
            type="button"
            onClick={() => onOpenBio(member)}
            className="text-[11px] font-bold text-[#1F7A5C] hover:text-[#165B44] inline-flex items-center gap-1 transition-colors"
          >
            <span>View Full Profile</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  )
}
