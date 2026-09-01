import prisma from '@/lib/prisma'

export type JobStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED'

export interface SafeJobPosting {
  id: string
  title: string
  slug: string
  department: string
  location: string
  employmentType: string
  type: string
  workMode: string
  experience: string | null
  salary: string | null
  description: string
  responsibilities: string | null
  requirements: string
  applicationMethod: string
  applicationUrl: string | null
  applicationEmail: string | null
  status: JobStatus
  isActive: boolean
  publishedAt: Date | null
  closingDate: Date | null
  displayOrder: number
  seoTitle: string | null
  metaDescription: string | null
  createdAt: Date
  updatedAt: Date
  applicationCount?: number
  isExpired: boolean
  isCurrentlyActive: boolean
}

/**
 * Determines whether a job posting is active and eligible for public active-vacancy display & JobPosting schema
 */
export function isJobActive(job: {
  status: string
  closingDate: Date | string | null
  publishedAt: Date | string | null
}): boolean {
  if (job.status !== 'PUBLISHED') return false
  const now = new Date()
  if (job.publishedAt && new Date(job.publishedAt) > now) return false
  if (job.closingDate && new Date(job.closingDate) < now) return false
  return true
}

/**
 * Normalizes raw SQL row or Prisma model into typed SafeJobPosting
 */
export function normalizeJobPosting(row: any, appCount?: number): SafeJobPosting {
  const publishedAt = row.publishedAt ? new Date(row.publishedAt) : null
  const closingDate = row.closingDate ? new Date(row.closingDate) : null
  const status: JobStatus = (row.status as JobStatus) || (row.isActive ? 'PUBLISHED' : 'CLOSED')

  const now = new Date()
  const isExpired = Boolean(closingDate && closingDate < now)
  const isCurrentlyActive = status === 'PUBLISHED' && !isExpired && (!publishedAt || publishedAt <= now)

  return {
    id: String(row.id),
    title: String(row.title || ''),
    slug: String(row.slug || ''),
    department: String(row.department || ''),
    location: String(row.location || ''),
    employmentType: String(row.employmentType || row.type || 'Full-time'),
    type: String(row.type || row.employmentType || 'Full-time'),
    workMode: String(row.workMode || 'On-site'),
    experience: row.experience || null,
    salary: row.salary || null,
    description: String(row.description || ''),
    responsibilities: row.responsibilities || null,
    requirements: String(row.requirements || ''),
    applicationMethod: String(row.applicationMethod || 'Email'),
    applicationUrl: row.applicationUrl || null,
    applicationEmail: row.applicationEmail || null,
    status,
    isActive: row.isActive !== false,
    publishedAt,
    closingDate,
    displayOrder: typeof row.displayOrder === 'number' ? row.displayOrder : 0,
    seoTitle: row.seoTitle || null,
    metaDescription: row.metaDescription || null,
    createdAt: row.createdAt ? new Date(row.createdAt) : new Date(),
    updatedAt: row.updatedAt ? new Date(row.updatedAt) : new Date(),
    applicationCount: typeof appCount === 'number' ? appCount : (row._count?.applications || 0),
    isExpired,
    isCurrentlyActive,
  }
}

/**
 * Safely fetches job postings with full filtering, pagination, and derived status handling
 */
export async function safeFetchJobs(options?: {
  where?: {
    query?: string
    status?: string // 'all' | 'draft' | 'published' | 'closed' | 'expired' | 'active'
    department?: string
  }
  skip?: number
  take?: number
}): Promise<{
  jobs: SafeJobPosting[]
  totalCount: number
  draftCount: number
  publishedCount: number
  closedCount: number
  expiredCount: number
  departments: string[]
}> {
  try {
    const rawRows: any[] = await prisma.$queryRawUnsafe(
      'SELECT * FROM "JobPosting" ORDER BY "displayOrder" ASC, "createdAt" DESC'
    )

    let all = (rawRows || []).map((row) => normalizeJobPosting(row))

    const now = new Date()
    const draftCount = all.filter((j) => j.status === 'DRAFT').length
    const publishedCount = all.filter((j) => j.status === 'PUBLISHED' && (!j.closingDate || j.closingDate >= now)).length
    const closedCount = all.filter((j) => j.status === 'CLOSED').length
    const expiredCount = all.filter((j) => j.closingDate && j.closingDate < now).length
    const departments = Array.from(
      new Set(all.map((j) => j.department).filter((d): d is string => Boolean(d && d.trim() !== '')))
    )

    let filtered = [...all]

    // 1. Search Query
    const q = options?.where?.query?.toLowerCase()
    if (q) {
      filtered = filtered.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.department.toLowerCase().includes(q) ||
          j.location.toLowerCase().includes(q) ||
          j.description.toLowerCase().includes(q) ||
          j.requirements.toLowerCase().includes(q) ||
          (j.responsibilities && j.responsibilities.toLowerCase().includes(q))
      )
    }

    // 2. Status Filter
    const filterStatus = options?.where?.status?.toLowerCase()
    if (filterStatus && filterStatus !== 'all') {
      if (filterStatus === 'draft') {
        filtered = filtered.filter((j) => j.status === 'DRAFT')
      } else if (filterStatus === 'published' || filterStatus === 'active') {
        filtered = filtered.filter((j) => j.isCurrentlyActive)
      } else if (filterStatus === 'closed') {
        filtered = filtered.filter((j) => j.status === 'CLOSED')
      } else if (filterStatus === 'expired') {
        filtered = filtered.filter((j) => j.isExpired)
      }
    }

    // 3. Department Filter
    if (options?.where?.department && options.where.department !== 'all') {
      const targetDept = options.where.department.toLowerCase()
      filtered = filtered.filter((j) => j.department.toLowerCase() === targetDept)
    }

    const totalCount = filtered.length

    if (options?.skip !== undefined || options?.take !== undefined) {
      const skip = options.skip || 0
      const take = options.take || filtered.length
      filtered = filtered.slice(skip, skip + take)
    }

    return {
      jobs: filtered,
      totalCount,
      draftCount,
      publishedCount,
      closedCount,
      expiredCount,
      departments,
    }
  } catch (err) {
    console.error('Error in safeFetchJobs:', err)
    return {
      jobs: [],
      totalCount: 0,
      draftCount: 0,
      publishedCount: 0,
      closedCount: 0,
      expiredCount: 0,
      departments: [],
    }
  }
}

/**
 * Safely fetches a single job posting by slug
 */
export async function safeFetchJobBySlug(slug: string): Promise<SafeJobPosting | null> {
  try {
    const rawRows: any[] = await prisma.$queryRawUnsafe(
      'SELECT * FROM "JobPosting" WHERE "slug" = $1 LIMIT 1',
      slug
    )
    if (!rawRows || rawRows.length === 0) return null
    return normalizeJobPosting(rawRows[0])
  } catch (err) {
    console.error(`Error fetching job with slug "${slug}":`, err)
    return null
  }
}

/**
 * Safely fetches a single job posting by ID
 */
export async function safeFetchJobById(id: string): Promise<SafeJobPosting | null> {
  try {
    const rawRows: any[] = await prisma.$queryRawUnsafe(
      'SELECT * FROM "JobPosting" WHERE "id" = $1 LIMIT 1',
      id
    )
    if (!rawRows || rawRows.length === 0) return null
    return normalizeJobPosting(rawRows[0])
  } catch (err) {
    console.error(`Error fetching job with id "${id}":`, err)
    return null
  }
}
