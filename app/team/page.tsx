import { resolveCmsText } from "@/lib/cms/utils";
import { getPublicPageByPath } from "@/lib/db/pages";
import { HeroSectionInput } from "@/lib/validations/page";
import Link from 'next/link'
import Image from 'next/image'
import { buttonVariants } from '@/components/ui/button'
import {
  ArrowRight,
  User,
  Briefcase,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Award,
  Building2,
  Scale,
  Users,
} from 'lucide-react'
import type { Metadata } from 'next'
import prisma from '@/lib/prisma'
import { TeamHierarchyView, HierarchyMember } from '@/components/team/TeamHierarchyView'
import { safeFetchTeamMembers } from '@/lib/db/team'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Our Team & Leadership Hierarchy | LabourAxis',
  description:
    'Meet the LabourAxis leadership team and practitioner hierarchy dedicated to helping factories and MSMEs across India achieve pristine labour compliance.',
  alternates: {
    canonical: '/team',
  },
}

const FUTURE_ROLES = [
  {
    role: 'Director - Operations',
    department: 'Executive Leadership',
    desc: 'Overseeing pan-India compliance delivery, client relationship management, and operational workflows.',
  },
  {
    role: 'Head - Labour Compliance',
    department: 'Regulatory Affairs',
    desc: 'Directing statutory audit frameworks, factory licensing, and regulatory inspection defense.',
  },
  {
    role: 'Head - HR Advisory',
    department: 'People & Organization',
    desc: 'Leading organizational structuring, policy frameworks, and workplace culture development.',
  },
  {
    role: 'Compliance Manager',
    department: 'Statutory Practice',
    desc: 'Managing monthly PF, ESIC, CLRA registers, and vendor compliance governance.',
  },
  {
    role: 'Industrial Relations Manager',
    department: 'IR & Employee Relations',
    desc: 'Advising on union negotiations, grievance handling, and standing order enforcement.',
  },
  {
    role: 'Payroll & Statutory Executive',
    department: 'HR Operations',
    desc: 'Executing zero-error payroll processing, deductions, and state tax filings.',
  },
]

const NETWORK_CATEGORIES = [
  { title: 'Legal Professionals', desc: 'Labour advocates & high court practitioners', icon: Scale },
  { title: 'Chartered Accountants', desc: 'Taxation & statutory audit specialists', icon: Building2 },
  { title: 'Company Secretaries', desc: 'Corporate governance & secretarial filings', icon: Award },
  { title: 'Safety Professionals', desc: 'Certified industrial safety & DISH experts', icon: ShieldCheck },
  { title: 'Payroll Specialists', desc: 'Compensation structure & tax computation', icon: Briefcase },
  { title: 'Industrial Relations Experts', desc: 'Union mediation & collective bargaining', icon: Users },
]

/**
 * Builds a hierarchical tree from a flat array of team members based on reportsToId
 */
function buildHierarchyTree(members: any[]): HierarchyMember[] {
  const map = new Map<string, HierarchyMember>()
  const rootMembers: HierarchyMember[] = []

  // Initialize nodes
  members.forEach((m) => {
    map.set(m.id, {
      id: m.id,
      name: m.name,
      designation: m.designation || m.role || '',
      role: m.role,
      department: m.department,
      bio: m.bio,
      imageUrl: m.imageUrl,
      imageAlt: m.imageAlt,
      linkedinUrl: m.linkedinUrl,
      displayOrder: m.displayOrder ?? m.order ?? 0,
      reportsToId: m.reportsToId,
      children: [],
    })
  })

  // Link children to parents
  members.forEach((m) => {
    const node = map.get(m.id)
    if (!node) return

    if (m.reportsToId && map.has(m.reportsToId)) {
      const parent = map.get(m.reportsToId)!
      parent.children!.push(node)
    } else {
      rootMembers.push(node)
    }
  })

  // Sort children recursively by displayOrder
  function sortNodes(nodes: HierarchyMember[]) {
    nodes.sort((a, b) => a.displayOrder - b.displayOrder)
    nodes.forEach((n) => {
      if (n.children && n.children.length > 0) {
        sortNodes(n.children)
      }
    })
  }

  sortNodes(rootMembers)
  return rootMembers
}

export default async function TeamPage() {
  const pageData = await getPublicPageByPath("/team");
  const heroSection = pageData?.revision?.sections.find(s => s.type === "HERO")?.content as HeroSectionInput | undefined;
  const { members } = await safeFetchTeamMembers({ where: { isActive: true } })
  const activeMembers = members.filter((m) => m.isActive)
  const rootHierarchy = buildHierarchyTree(activeMembers)

  // Person schema structured data
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'LabourAxis',
    url: 'https://labouraxis.com',
    member: activeMembers.map((m) => ({
      '@type': 'Person',
      name: m.name,
      jobTitle: m.designation || m.role,
      ...(m.imageUrl ? { image: m.imageUrl } : {}),
      ...(m.linkedinUrl ? { sameAs: m.linkedinUrl } : {}),
    })),
  }

  return (
    <div className="flex flex-col pb-24 overflow-x-hidden bg-[#F7F4EC]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Breadcrumbs */}
      <div className="bg-[#12372A] border-b border-white/10 pt-6 pb-4">
        <div className="container mx-auto px-4 md:px-8">
          <nav className="flex items-center text-xs md:text-sm text-[#A2B3AA] font-medium">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 mx-2 text-[#66736D]" />
            <span className="text-white">Our Team</span>
          </nav>
        </div>
      </div>

      {/* 01. Hero */}
      <section className="bg-[#12372A] text-white pt-12 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-forest opacity-30 pointer-events-none"></div>
        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-[#D6A84F] uppercase tracking-wider mb-4 bg-[#1B4E3C]/80 border border-[#D6A84F]/30 px-3.5 py-1.5 rounded-full shadow-xs">
                <ShieldCheck className="w-4 h-4 text-[#D6A84F]" />
                <span>{resolveCmsText(heroSection?.eyebrow, "Leadership & Corporate Advisory")}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-balance leading-tight">
                {resolveCmsText(heroSection?.heading, "Meet the People Behind LabourAxis")}
              </h1>

              <p className="text-lg md:text-xl text-[#A2B3AA] mb-8 text-balance leading-relaxed">
                {resolveCmsText(heroSection?.description, "A multidisciplinary team focused on HR operations, labour compliance, workforce management and industrial relations.")}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link
                  href="/careers"
                  className={buttonVariants({
                    size: 'lg',
                    className:
                      'bg-[#1F7A5C] hover:bg-[#165B44] text-white font-bold text-base px-7 py-3.5 rounded-xl shadow-lg transition-all group',
                  })}
                >
                  <span>{resolveCmsText(heroSection?.primaryCta?.label, "Explore Open Positions")}</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/contact"
                  className={buttonVariants({
                    size: 'lg',
                    variant: 'outline',
                    className:
                      'bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30 text-base px-7 py-3.5 rounded-xl transition-all',
                  })}
                >
                  {resolveCmsText(heroSection?.secondaryCta?.label, "Connect with Advisory")}
                </Link>
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#A2B3AA] bg-[#0D281E]/60 px-3.5 py-1.5 rounded-lg border border-white/10">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#D6A84F]" />
                  <span>Multidisciplinary Experts</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#A2B3AA] bg-[#0D281E]/60 px-3.5 py-1.5 rounded-lg border border-white/10">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#1F7A5C]" />
                  <span>Pan-India Statutory Network</span>
                </div>
              </div>
            </div>

            {/* Right Hero Image Card */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl overflow-hidden border border-white/15 shadow-2xl bg-[#0D281E] group">
                <div className="relative h-72 sm:h-80 md:h-96 w-full">
                  <Image
                    src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1200&auto=format&fit=crop"
                    alt="LabourAxis Leadership & Team"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D281E] via-[#0D281E]/30 to-transparent"></div>

                  {/* Floating Top Badge */}
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-center gap-2">
                    <span className="bg-[#12372A]/90 backdrop-blur-md text-[#D6A84F] text-xs font-bold px-3.5 py-1.5 rounded-full border border-[#D6A84F]/30 shadow-md">
                      Executive Leadership
                    </span>
                    <span className="bg-[#1F7A5C]/90 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full border border-white/20 shadow-md">
                      Industry Veterans
                    </span>
                  </div>

                  {/* Bottom Caption Overlay */}
                  <div className="absolute bottom-4 left-4 right-4 p-4 bg-[#12372A]/90 backdrop-blur-md rounded-2xl border border-white/10">
                    <p className="text-xs font-bold text-white mb-1 flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#D6A84F]" />
                      <span>Corporate Advisory & Practice Heads</span>
                    </p>
                    <p className="text-[11px] text-[#A2B3AA] leading-snug">
                      Combining statutory mastery with industrial operational excellence
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 02. Organizational Hierarchy & Practitioner Structure */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-8 max-w-6xl">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1F7A5C] bg-[#1F7A5C]/10 border border-[#1F7A5C]/20 px-3.5 py-1.5 rounded-full inline-block mb-3">
              Organizational Structure
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#12372A] tracking-tight mb-4">
              Leadership & Practice Hierarchy
            </h2>
            <p className="text-[#66736D] text-base md:text-lg leading-relaxed">
              Our multidisciplinary team is structured to provide rigorous statutory governance, clear accountability, and hands-on operational support for employers across India.
            </p>
          </div>

          {/* Dynamic Hierarchy View */}
          <TeamHierarchyView rootMembers={rootHierarchy} />
        </div>
      </section>

      {/* 03. Corporate Practice Expansion (Planned Practice Areas) */}
      <section className="py-24 bg-[#F7F4EC] border-y border-[#D9E1DC]">
        <div className="container mx-auto px-4 md:px-8 max-w-6xl">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1F7A5C] bg-[#1F7A5C]/10 border border-[#1F7A5C]/20 px-3.5 py-1.5 rounded-full inline-block mb-3">
              Practice Expansion
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#12372A] mb-3 tracking-tight">
              Corporate Divisions & Strategic Roles
            </h2>
            <p className="text-[#66736D] text-base md:text-lg leading-relaxed">
              We are actively scaling our domain divisions to support growing multi-site factory and enterprise mandates across India.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FUTURE_ROLES.map((item, idx) => (
              <div
                key={idx}
                className="bg-white border border-[#D9E1DC] rounded-3xl p-7 shadow-xs flex flex-col justify-between hover:border-[#1F7A5C]/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="text-[11px] font-bold text-[#1F7A5C] bg-[#1F7A5C]/10 border border-[#1F7A5C]/20 px-3 py-1 rounded-md uppercase tracking-wider">
                      {item.department}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-[#D6A84F]"></span>
                  </div>

                  <h3 className="font-bold text-[#12372A] text-lg mb-2 group-hover:text-[#1F7A5C] transition-colors">
                    {item.role}
                  </h3>

                  <p className="text-xs md:text-sm text-[#66736D] leading-relaxed mb-6">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#D9E1DC]/60 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#12372A]">Hiring Active</span>
                  <Link
                    href="/careers"
                    className="inline-flex items-center text-xs font-bold text-[#1F7A5C] hover:text-[#165B44] group-hover:translate-x-0.5 transition-all"
                  >
                    <span>View Role</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 04. Professional Collaboration Ecosystem */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-8 max-w-6xl">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1F7A5C] bg-[#1F7A5C]/10 border border-[#1F7A5C]/20 px-3.5 py-1.5 rounded-full inline-block mb-3">
              Advisory Ecosystem
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#12372A] mb-3 tracking-tight">
              Specialist Professional Network
            </h2>
            <p className="text-base md:text-lg text-[#66736D] leading-relaxed">
              Where complex matters require certified representation, forensic audit, or legal court appearances, LabourAxis coordinates seamlessly with qualified specialists.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {NETWORK_CATEGORIES.map((cat, idx) => {
              const IconComp = cat.icon
              return (
                <div
                  key={idx}
                  className="bg-[#F7F4EC] border border-[#D9E1DC] p-6 rounded-3xl shadow-2xs hover:border-[#1F7A5C]/40 hover:shadow-md transition-all flex items-start gap-4"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white border border-[#D9E1DC] text-[#1F7A5C] flex items-center justify-center shrink-0 shadow-2xs">
                    <IconComp className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#12372A] text-base mb-1">{cat.title}</h3>
                    <p className="text-xs md:text-sm text-[#66736D] leading-relaxed">{cat.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 05. Final Careers CTA */}
      <section className="container mx-auto px-4 md:px-8">
        <div className="bg-[#12372A] text-white rounded-3xl p-10 md:p-16 text-center max-w-4xl mx-auto relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-grid-forest opacity-30 pointer-events-none"></div>
          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 text-xs font-bold text-[#D6A84F] uppercase tracking-wider mb-4 bg-[#1B4E3C]/80 border border-[#D6A84F]/30 px-3.5 py-1.5 rounded-full shadow-xs">
              Join Our Mission
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 tracking-tight text-balance">
              Want to build your career with LabourAxis?
            </h2>
            <p className="text-[#A2B3AA] text-base md:text-lg mb-8 max-w-xl mx-auto leading-relaxed text-balance">
              We&apos;re building India&apos;s premier multidisciplinary team in labour compliance, industrial relations, and HR operations.
            </p>
            <Link
              href="/careers"
              className={buttonVariants({
                size: 'lg',
                className:
                  'bg-[#1F7A5C] hover:bg-[#165B44] text-white font-bold text-base px-8 py-4 rounded-xl shadow-lg transition-all group',
              })}
            >
              <span>View Open Positions</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
