import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import {
  ChevronRight,
  MapPin,
  Clock,
  Briefcase,
  Building2,
  Calendar,
  Send,
  Mail,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
} from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { verifySession } from '@/lib/session'
import { safeFetchJobBySlug, isJobActive, SafeJobPosting } from '@/lib/db/careers'

export const dynamic = 'force-dynamic'

interface JobDetailPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: JobDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const job = await safeFetchJobBySlug(slug)

  if (!job) {
    return {
      title: 'Job Opening Not Found | LabourAxis',
      description: 'The requested job opening could not be found.',
    }
  }

  // If draft or closed, prevent indexing
  const isDraft = job.status === 'DRAFT'
  const isClosed = job.status === 'CLOSED' || job.isExpired

  const title = job.seoTitle || `${job.title} | Careers at LabourAxis`
  const description =
    job.metaDescription ||
    job.description.slice(0, 160) ||
    `Apply for ${job.title} at LabourAxis in ${job.location}.`

  return {
    title,
    description,
    alternates: {
      canonical: `/careers/${job.slug}`,
    },
    robots: isDraft || isClosed ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: `https://www.labouraxis.com/careers/${job.slug}`,
      type: 'article',
    },
  }
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { slug } = await params
  const job = await safeFetchJobBySlug(slug)

  if (!job) notFound()

  const session = await verifySession()
  const isDraft = job.status === 'DRAFT'

  // Draft Security: Return 404 to unauthenticated visitors
  if (isDraft && !session.isAuth) {
    notFound()
  }

  const isEligibleForSchema = isJobActive(job)
  const isClosedOrExpired = job.status === 'CLOSED' || job.isExpired

  const responsibilitiesList = job.responsibilities
    ? job.responsibilities.split('\n').filter((s) => s.trim().length > 0)
    : []

  const requirementsList = job.requirements
    ? job.requirements.split('\n').filter((s) => s.trim().length > 0)
    : []

  // Schema.org JobPosting structured data
  let jobPostingSchemaJson: any = null
  if (isEligibleForSchema) {
    const employmentTypeMap: Record<string, string> = {
      'Full-time': 'FULL_TIME',
      'Part-time': 'PART_TIME',
      Contract: 'CONTRACTOR',
      Internship: 'INTERN',
    }

    jobPostingSchemaJson = {
      '@context': 'https://schema.org',
      '@type': 'JobPosting',
      title: job.title,
      description: job.description,
      datePosted: job.publishedAt ? new Date(job.publishedAt).toISOString() : new Date().toISOString(),
      ...(job.closingDate ? { validThrough: new Date(job.closingDate).toISOString() } : {}),
      employmentType: employmentTypeMap[job.employmentType] || 'FULL_TIME',
      hiringOrganization: {
        '@type': 'Organization',
        name: 'LabourAxis',
        sameAs: 'https://www.labouraxis.com',
        logo: 'https://www.labouraxis.com/logo.png',
      },
      identifier: {
        '@type': 'PropertyValue',
        name: 'LabourAxis',
        value: job.id,
      },
      jobLocation: {
        '@type': 'Place',
        address: {
          '@type': 'PostalAddress',
          addressLocality: job.location.includes('Indore') ? 'Indore' : job.location,
          addressRegion: job.location.includes('Indore') ? 'Madhya Pradesh' : undefined,
          addressCountry: 'IN',
        },
      },
      ...(job.workMode === 'Remote'
        ? {
            jobLocationType: 'TELECOMMUTE',
            applicantLocationRequirements: {
              '@type': 'Country',
              name: 'IN',
            },
          }
        : {}),
      directApply: true,
      url: `https://www.labouraxis.com/careers/${job.slug}`,
    }
  }

  return (
    <div className="flex flex-col pb-24 overflow-x-hidden bg-[#F7F4EC]">
      {/* Inject JobPosting JSON-LD ONLY when job is genuinely published and active */}
      {jobPostingSchemaJson && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingSchemaJson) }}
        />
      )}

      {/* Draft Preview Banner for Authenticated Staff */}
      {isDraft && session.isAuth && (
        <div className="bg-amber-500 text-amber-950 px-4 py-2.5 text-center text-xs font-bold flex items-center justify-center gap-2 border-b border-amber-600">
          <AlertTriangle className="w-4 h-4" />
          <span>DRAFT PREVIEW MODE — This position is in Draft status and hidden from public visitors and search engines.</span>
        </div>
      )}

      {/* Closed / Expired Notification Banner */}
      {isClosedOrExpired && (
        <div className="bg-rose-600 text-white px-4 py-2.5 text-center text-xs font-bold flex items-center justify-center gap-2">
          <Clock className="w-4 h-4" />
          <span>This position is currently closed or the application deadline has passed. We are no longer accepting active applications for this role.</span>
        </div>
      )}

      {/* Breadcrumbs */}
      <div className="bg-[#12372A] border-b border-white/10 pt-6 pb-4">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl">
          <nav className="flex items-center text-xs md:text-sm text-[#A2B3AA] font-medium" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 mx-2 text-[#66736D]" />
            <Link href="/careers" className="hover:text-white transition-colors">
              Careers
            </Link>
            <ChevronRight className="w-3.5 h-3.5 mx-2 text-[#66736D]" />
            <span className="text-white truncate max-w-[200px] sm:max-w-none">{job.title}</span>
          </nav>
        </div>
      </div>

      {/* Job Header */}
      <section className="bg-[#12372A] text-white pt-10 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-forest opacity-25 pointer-events-none"></div>
        <div className="container mx-auto px-4 md:px-8 max-w-5xl relative z-10 space-y-6">
          <Link
            href="/careers"
            className="inline-flex items-center text-xs text-[#A2B3AA] hover:text-[#D6A84F] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
            <span>Back to All Openings</span>
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#D6A84F] bg-[#1B4E3C] border border-[#D6A84F]/30 px-3.5 py-1 rounded-full shadow-2xs">
              {job.department}
            </span>
            <span className="text-xs font-bold text-white bg-white/10 px-3 py-1 rounded-full">
              {job.employmentType}
            </span>
            <span className="text-xs font-bold text-[#A2B3AA] bg-white/5 px-3 py-1 rounded-full border border-white/10">
              {job.workMode}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
            {job.title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm text-[#A2B3AA]">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#D6A84F]" />
              {job.location}
            </span>
            {job.experience && (
              <span className="flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-[#D6A84F]" />
                {job.experience}
              </span>
            )}
            {job.closingDate && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#D6A84F]" />
                Deadline: {new Date(job.closingDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="py-14">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Job Description & Details */}
            <div className="lg:col-span-8 space-y-8">
              {/* Role Overview */}
              <div className="bg-white border border-[#D9E1DC] rounded-3xl p-6 sm:p-10 shadow-xs space-y-4">
                <h2 className="text-xl font-bold text-[#12372A]">Role Overview</h2>
                <div className="text-sm text-[#202522] leading-relaxed whitespace-pre-line space-y-3">
                  {job.description}
                </div>
              </div>

              {/* Key Responsibilities */}
              {responsibilitiesList.length > 0 && (
                <div className="bg-white border border-[#D9E1DC] rounded-3xl p-6 sm:p-10 shadow-xs space-y-4">
                  <h2 className="text-xl font-bold text-[#12372A]">Key Responsibilities</h2>
                  <ul className="space-y-3 text-sm text-[#202522]">
                    {responsibilitiesList.map((resp, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="mt-2 w-2 h-2 rounded-full bg-[#1F7A5C] shrink-0"></span>
                        <span className="leading-relaxed">{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Requirements & Qualifications */}
              {requirementsList.length > 0 && (
                <div className="bg-white border border-[#D9E1DC] rounded-3xl p-6 sm:p-10 shadow-xs space-y-4">
                  <h2 className="text-xl font-bold text-[#12372A]">Requirements & Qualifications</h2>
                  <ul className="space-y-3 text-sm text-[#202522]">
                    {requirementsList.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="mt-2 w-2 h-2 rounded-full bg-[#D6A84F] shrink-0"></span>
                        <span className="leading-relaxed">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Right Column: Application Card */}
            <div className="lg:col-span-4 space-y-6 sticky top-8">
              <div className="bg-white border border-[#D9E1DC] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#1F7A5C] bg-[#1F7A5C]/10 px-2.5 py-1 rounded-md">
                    Application Process
                  </span>
                  <h3 className="text-lg font-bold text-[#12372A] mt-2">Apply for this Position</h3>
                  <p className="text-xs text-[#66736D] mt-1 leading-relaxed">
                    Submit your credentials to our talent acquisition team.
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-[#D9E1DC]/80 text-xs text-[#202522]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#66736D]">Department:</span>
                    <span className="font-semibold">{job.department}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#66736D]">Work Mode:</span>
                    <span className="font-semibold">{job.workMode}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#66736D]">Employment:</span>
                    <span className="font-semibold">{job.employmentType}</span>
                  </div>
                  {job.salary && (
                    <div className="flex items-center justify-between">
                      <span className="text-[#66736D]">Compensation:</span>
                      <span className="font-semibold">{job.salary}</span>
                    </div>
                  )}
                </div>

                {/* Application CTA Actions */}
                <div className="pt-2">
                  {isClosedOrExpired ? (
                    <button
                      disabled
                      className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed text-center"
                    >
                      Applications Closed
                    </button>
                  ) : job.applicationMethod === 'Email' ? (
                    <a
                      href={`mailto:${job.applicationEmail || 'careers@labouraxis.com'}?subject=Application for ${encodeURIComponent(job.title)}`}
                      className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold bg-[#1F7A5C] hover:bg-[#165B44] text-white shadow-xs transition-colors text-center"
                    >
                      <Mail className="w-4 h-4" />
                      <span>Email Resume ({job.applicationEmail || 'careers@labouraxis.com'})</span>
                    </a>
                  ) : job.applicationMethod === 'URL' && job.applicationUrl ? (
                    <a
                      href={job.applicationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold bg-[#1F7A5C] hover:bg-[#165B44] text-white shadow-xs transition-colors text-center"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Apply on External Portal</span>
                    </a>
                  ) : (
                    <Link
                      href="/contact"
                      className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold bg-[#1F7A5C] hover:bg-[#165B44] text-white shadow-xs transition-colors text-center"
                    >
                      <Send className="w-4 h-4" />
                      <span>Submit Application Online</span>
                    </Link>
                  )}
                </div>

                <div className="pt-3 border-t border-[#D9E1DC]/80 space-y-2">
                  <div className="flex items-center gap-2 text-[11px] text-[#66736D]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#1F7A5C] shrink-0" />
                    <span>Direct recruiter review with no automated keyword discarding.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
