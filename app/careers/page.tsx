import { resolveCmsText } from "@/lib/cms/utils";
import { getPublicPageByPath, getDraftRevisionForPreview } from "@/lib/db/pages";
import { HeroSectionInput } from "@/lib/validations/page";
import Link from 'next/link'
import Image from 'next/image'
import prisma from '@/lib/prisma'
import { verifySession } from '@/lib/session'
import { buttonVariants } from '@/components/ui/button'
import {
  ArrowRight,
  BookOpen,
  TrendingUp,
  Hammer,
  HeartHandshake,
  ChevronRight,
  ShieldCheck,
  Briefcase,
  MapPin,
  Clock,
  Send,
  Building2,
  AlertTriangle,
} from 'lucide-react'
import type { Metadata } from 'next'
import { safeFetchJobs } from '@/lib/db/careers'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Careers at LabourAxis | Industrial HR & Labour Compliance Opportunities',
  description:
    'Explore current job openings and career opportunities at LabourAxis. Join our team of factory compliance consultants, industrial relations experts, and HR specialists across India.',
  alternates: {
    canonical: '/careers',
  },
}

const WHY_CARDS = [
  {
    icon: BookOpen,
    title: 'Practical Mastery',
    desc: 'Work directly on complex statutory challenges, inspections, and industrial compliance audits.',
  },
  {
    icon: TrendingUp,
    title: 'Domain Leadership',
    desc: 'Deepen expertise in Indian labour laws, factory regulations, and modern workforce governance.',
  },
  {
    icon: Hammer,
    title: 'Process & Tech',
    desc: 'Help engineer audit-proof HR workflows and structured digital compliance systems.',
  },
  {
    icon: HeartHandshake,
    title: 'Real Impact',
    desc: 'Protect factories, MSMEs, and enterprises from statutory risks and operational penalties.',
  },
]

const DEPARTMENTS = [
  'Labour Compliance',
  'HR Advisory',
  'Factory Compliance',
  'Industrial Relations',
  'Payroll & Statutory Operations',
  'Legal & Regulatory',
  'Business Development',
  'Technology',
]

const HIRING_PROCESS = [
  { step: '01', title: 'Application', desc: 'Submit your profile, resume, and statutory domain background.' },
  { step: '02', title: 'Initial Screening', desc: 'Brief conversation to align on domain experience and mutual fit.' },
  { step: '03', title: 'Technical Evaluation', desc: 'Practical compliance assessment and conversation with practice leadership.' },
  { step: '04', title: 'Offer & Onboarding', desc: 'Formal offer and integration into our consulting practice.' },
]

export default async function CareersPage({
  searchParams,
}: {
  searchParams?: Promise<{ preview?: string }>
}) {
  const resolvedSearch = searchParams ? await searchParams : undefined;
  let isPreview = false;
  let pageData = await getPublicPageByPath("/careers");

  if (resolvedSearch?.preview) {
    const session = await verifySession();
    if (session.isAuth && (session.role === 'SUPER_ADMIN' || session.role === 'ADMIN' || session.role === 'EDITOR')) {
      const page = await prisma.page.findUnique({ where: { path: '/careers' } });
      if (page) {
        const draft = await getDraftRevisionForPreview(page.id, resolvedSearch.preview);
        if (draft) {
          pageData = { id: page.id, key: page.key, path: page.path, revision: draft as any };
          isPreview = true;
        }
      }
    }
  }

  const heroSectionObj = pageData?.revision?.sections.find(s => s.type === "HERO");
  const heroSection = heroSectionObj?.content as HeroSectionInput | undefined;
  const heroMedia = heroSectionObj?.media;

  const { jobs } = await safeFetchJobs({
    where: {
      status: 'published',
    },
  })

  // Filter only genuinely active published jobs (not expired, not scheduled in future)
  const activeJobs = jobs.filter((j) => j.isCurrentlyActive)

  return (
    <div className="flex flex-col pb-24 overflow-x-hidden bg-[#F7F4EC]">
      {isPreview && (
        <div className="bg-[#D6A84F] text-[#12372A] px-4 py-2 text-center text-xs font-bold sticky top-0 z-50 shadow-md flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          You are viewing a draft preview. This content is not public.
        </div>
      )}

      {/* Breadcrumbs */}
      <div className="bg-[#12372A] border-b border-white/10 pt-6 pb-4">
        <div className="container mx-auto px-4 md:px-8">
          <nav className="flex items-center text-xs md:text-sm text-[#A2B3AA] font-medium" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 mx-2 text-[#66736D]" />
            <span className="text-white">Careers</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-[#12372A] text-white pt-12 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-forest opacity-30 pointer-events-none"></div>
        <div className="container mx-auto px-4 md:px-8 relative z-10">
          {heroMedia?.url ? (
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7">
                <div className="inline-flex items-center gap-2 text-xs font-bold text-[#D6A84F] uppercase tracking-wider mb-4 bg-[#1B4E3C]/80 border border-[#D6A84F]/30 px-3.5 py-1.5 rounded-full shadow-xs">
                  <ShieldCheck className="w-4 h-4 text-[#D6A84F]" />
                  <span>{resolveCmsText(heroSection?.eyebrow, "Careers at LabourAxis")}</span>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-balance leading-tight">
                  {resolveCmsText(heroSection?.heading, "Build the Future of Industrial HR & Labour Compliance")}
                </h1>

                <p className="text-base sm:text-lg md:text-xl text-[#A2B3AA] text-balance leading-relaxed mb-10">
                  {resolveCmsText(heroSection?.description, "Join LabourAxis and advise industrial plants, MSMEs, and enterprise employers on statutory integrity, inspection defense, and workforce operations.")}
                </p>

                <a
                  href="#open-positions"
                  className={buttonVariants({
                    size: 'lg',
                    className:
                      'bg-[#1F7A5C] hover:bg-[#165B44] text-white font-bold text-base px-8 py-4 rounded-xl shadow-lg transition-all group',
                  })}
                >
                  <span>{heroSection?.primaryCta?.label ? `${heroSection.primaryCta.label} (${activeJobs.length})` : activeJobs.length > 0 ? `Explore Open Positions (${activeJobs.length})` : 'View Practice Areas'}</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>

              <div className="lg:col-span-5 relative">
                <div className="relative mx-auto rounded-3xl overflow-hidden border border-white/15 shadow-2xl bg-[#0D281E] group">
                  <div className="aspect-[4/3] relative">
                    <Image
                      src={heroMedia.url}
                      alt={heroMedia.altText || resolveCmsText(heroSection?.heading, "Careers at LabourAxis")}
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 40vw"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0D281E] via-[#0D281E]/20 to-transparent"></div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-[#D6A84F] uppercase tracking-wider mb-4 bg-[#1B4E3C]/80 border border-[#D6A84F]/30 px-3.5 py-1.5 rounded-full shadow-xs">
                <ShieldCheck className="w-4 h-4 text-[#D6A84F]" />
                <span>{resolveCmsText(heroSection?.eyebrow, "Careers at LabourAxis")}</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-balance leading-tight">
                {resolveCmsText(heroSection?.heading, "Build the Future of Industrial HR & Labour Compliance")}
              </h1>

              <p className="text-lg md:text-xl text-[#A2B3AA] max-w-2xl mx-auto text-balance leading-relaxed mb-10">
                {resolveCmsText(heroSection?.description, "Join LabourAxis and advise industrial plants, MSMEs, and enterprise employers on statutory integrity, inspection defense, and workforce operations.")}
              </p>

              <a
                href="#open-positions"
                className={buttonVariants({
                  size: 'lg',
                  className:
                    'bg-[#1F7A5C] hover:bg-[#165B44] text-white font-bold text-base px-8 py-4 rounded-xl shadow-lg transition-all group',
                })}
              >
                <span>{heroSection?.primaryCta?.label ? `${heroSection.primaryCta.label} (${activeJobs.length})` : activeJobs.length > 0 ? `Explore Open Positions (${activeJobs.length})` : 'View Practice Areas'}</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          )}
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* ACTIVE OPENINGS SECTION                              */}
      {/* ---------------------------------------------------- */}
      <section id="open-positions" className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#1F7A5C] bg-[#1F7A5C]/10 border border-[#1F7A5C]/20 px-3.5 py-1.5 rounded-full inline-block mb-2">
                Active Opportunities
              </span>
              <h2 className="text-3xl font-bold text-[#12372A] tracking-tight">Current Openings</h2>
            </div>
            <span className="bg-[#1F7A5C]/10 text-[#1F7A5C] text-xs font-bold px-3.5 py-1.5 rounded-full border border-[#1F7A5C]/20 shadow-2xs">
              {activeJobs.length} {activeJobs.length === 1 ? 'Position Available' : 'Positions Available'}
            </span>
          </div>

          {activeJobs.length === 0 ? (
            /* No Active Jobs State */
            <div className="bg-[#F7F4EC] border border-[#D9E1DC] rounded-3xl p-10 md:p-14 text-center space-y-4 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-white border border-[#D9E1DC] text-[#1F7A5C] flex items-center justify-center mx-auto shadow-2xs">
                <Briefcase className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-[#12372A]">No Active Openings at this Moment</h3>
              <p className="text-sm text-[#66736D] max-w-lg mx-auto leading-relaxed">
                We do not have open vacancies right now, but we are always eager to connect with exceptional labour compliance practitioners, statutory auditors, and industrial relations specialists.
              </p>
              <div className="pt-2">
                <Link
                  href="/contact"
                  className={buttonVariants({
                    size: 'sm',
                    className: 'bg-[#1F7A5C] hover:bg-[#165B44] text-white font-bold rounded-xl text-xs px-5 shadow-xs',
                  })}
                >
                  <span>Submit Profile for Future Openings</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Link>
              </div>
            </div>
          ) : (
            /* Active Job Cards Grid */
            <div className="space-y-4">
              {activeJobs.map((job) => (
                <div
                  key={job.id}
                  className="border border-[#D9E1DC] rounded-3xl p-6 md:p-8 hover:border-[#1F7A5C]/50 hover:shadow-md transition-all shadow-xs bg-[#F7F4EC]/30 hover:bg-white flex flex-col md:flex-row gap-6 justify-between items-start md:items-center group"
                >
                  <div className="space-y-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#1F7A5C] bg-[#1F7A5C]/10 px-2.5 py-1 rounded-md">
                        {job.department}
                      </span>
                      <span className="text-[10px] font-bold text-[#66736D] bg-white border border-[#D9E1DC] px-2.5 py-1 rounded-md">
                        {job.employmentType}
                      </span>
                      <span className="text-[10px] font-bold text-[#12372A] bg-white border border-[#D9E1DC] px-2.5 py-1 rounded-md">
                        {job.workMode}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-[#12372A] group-hover:text-[#1F7A5C] transition-colors">
                      <Link href={`/careers/${job.slug}`}>{job.title}</Link>
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#66736D]">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#1F7A5C]" />
                        {job.location}
                      </span>
                      {job.experience && (
                        <span>• Experience: {job.experience}</span>
                      )}
                      {job.closingDate && (
                        <span className="flex items-center gap-1 text-amber-800 font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          Apply by: {new Date(job.closingDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 w-full md:w-auto">
                    <Link
                      href={`/careers/${job.slug}`}
                      className="inline-flex w-full md:w-auto items-center justify-center gap-1.5 px-5 py-3 font-bold rounded-xl shadow-xs transition-colors text-xs text-white bg-[#1F7A5C] hover:bg-[#165B44]"
                    >
                      <span>View Position & Apply</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why LabourAxis */}
      <section className="py-20 bg-[#F7F4EC] border-t border-[#D9E1DC]">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1F7A5C] bg-[#1F7A5C]/10 border border-[#1F7A5C]/20 px-3.5 py-1.5 rounded-full inline-block mb-3">
              Culture & Growth
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#12372A] mb-4 tracking-tight">Why LabourAxis?</h2>
            <p className="text-sm md:text-base text-[#66736D] max-w-xl mx-auto">
              Our consulting culture is built on deep statutory grounding, practitioner ethics, and hands-on industrial problem solving.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {WHY_CARDS.map((card, idx) => (
              <div
                key={idx}
                className="bg-white border border-[#D9E1DC] rounded-3xl p-6 md:p-8 shadow-xs flex flex-col items-center text-center hover:shadow-md hover:border-[#1F7A5C]/40 transition-all duration-200 group"
              >
                <div className="w-12 h-12 bg-[#1F7A5C]/10 text-[#1F7A5C] rounded-2xl flex items-center justify-center mb-5 group-hover:bg-[#1F7A5C] group-hover:text-white transition-colors duration-200 shadow-2xs">
                  <card.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-[#12372A] text-lg mb-2">{card.title}</h3>
                <p className="text-xs sm:text-sm text-[#66736D] leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Departments & Practice Areas */}
      <section className="py-20 bg-white border-t border-[#D9E1DC]">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1F7A5C] bg-[#1F7A5C]/10 border border-[#1F7A5C]/20 px-3.5 py-1.5 rounded-full inline-block mb-3">
              Consulting Disciplines
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#12372A] mb-4 tracking-tight">Our Practice Areas</h2>
            <p className="text-sm md:text-base text-[#66736D] max-w-2xl mx-auto">
              We deploy dedicated specialist teams across key statutory domains.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {DEPARTMENTS.map((dept, idx) => (
              <div
                key={idx}
                className="bg-[#F7F4EC] border border-[#D9E1DC] px-5 py-3 rounded-2xl font-bold text-[#202522] shadow-2xs text-xs md:text-sm hover:border-[#1F7A5C]/40 transition-colors"
              >
                {dept}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hiring Roadmap */}
      <section className="py-20 bg-[#F7F4EC] border-t border-[#D9E1DC]">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1F7A5C] bg-[#1F7A5C]/10 border border-[#1F7A5C]/20 px-3.5 py-1.5 rounded-full inline-block mb-3">
              Roadmap
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#12372A] mb-4 tracking-tight">Our Hiring Process</h2>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {HIRING_PROCESS.map((step, idx) => (
              <div
                key={idx}
                className="bg-white p-6 md:p-8 rounded-3xl border border-[#D9E1DC] shadow-2xs flex flex-col relative"
              >
                <span className="text-4xl font-black text-[#D6A84F] mb-4 block">{step.step}</span>
                <h3 className="font-bold text-[#12372A] mb-2 text-base md:text-lg">{step.title}</h3>
                <p className="text-[#66736D] text-xs sm:text-sm leading-relaxed flex-1">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* General Application CTA */}
      <section className="container mx-auto px-4 md:px-8 pt-10">
        <div className="bg-[#12372A] text-white rounded-3xl p-10 md:p-16 text-center max-w-4xl mx-auto relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-grid-forest opacity-30 pointer-events-none"></div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-balance">
              Don&apos;t see a suitable opening right now?
            </h2>
            <p className="text-[#A2B3AA] text-base md:text-lg mb-8 max-w-xl mx-auto leading-relaxed text-balance">
              We are always interested in connecting with practitioners who share our commitment to statutory accuracy and practical industrial HR advisory.
            </p>
            <Link
              href="/contact"
              className={buttonVariants({
                size: 'lg',
                className:
                  'bg-[#1F7A5C] hover:bg-[#165B44] text-white font-bold text-base px-8 py-4 rounded-xl shadow-lg transition-all group',
              })}
            >
              <span>Submit General Profile</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
