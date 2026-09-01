import prisma from '@/lib/prisma'

export interface SafeTeamMember {
  id: string
  name: string
  designation: string
  role: string | null
  department: string | null
  bio: string | null
  imageUrl: string | null
  imageAlt: string | null
  linkedinUrl: string | null
  displayOrder: number
  order: number
  isActive: boolean
  reportsToId: string | null
  createdAt: Date
  updatedAt: Date
  reportsTo?: {
    id: string
    name: string
    designation: string
  } | null
  directReports?: {
    id: string
    name: string
    designation: string
  }[]
}

/**
 * Normalizes raw SQL row or Prisma model into typed SafeTeamMember
 */
export function normalizeTeamMember(row: Record<string, unknown>): SafeTeamMember {
  return {
    id: String(row.id),
    name: String(row.name || ''),
    designation: String(row.designation || row.role || ''),
    role: (row.role as string) || (row.designation as string) || null,
    department: (row.department as string) || null,
    bio: (row.bio as string) || null,
    imageUrl: (row.imageUrl as string) || null,
    imageAlt: (row.imageAlt as string) || null,
    linkedinUrl: (row.linkedinUrl as string) || null,
    displayOrder: typeof row.displayOrder === 'number' ? row.displayOrder : (typeof row.order === 'number' ? row.order : 0),
    order: typeof row.order === 'number' ? row.order : (typeof row.displayOrder === 'number' ? row.displayOrder : 0),
    isActive: row.isActive !== false,
    reportsToId: (row.reportsToId as string) || null,
    createdAt: row.createdAt ? new Date(row.createdAt as string | number | Date) : new Date(),
    updatedAt: row.updatedAt ? new Date(row.updatedAt as string | number | Date) : new Date(),
    reportsTo: (row.reportsTo as SafeTeamMember['reportsTo']) || null,
    directReports: (row.directReports as SafeTeamMember['directReports']) || [],
  }
}

/**
 * Safely fetches all team members with resilience against in-memory Prisma client mismatches
 */
export async function safeFetchTeamMembers(options?: {
  where?: {
    query?: string
    status?: string
    dept?: string
    isActive?: boolean
  }
  orderBy?: 'displayOrder' | 'createdAt' | 'name'
  orderDir?: 'asc' | 'desc'
  skip?: number
  take?: number
}): Promise<{ members: SafeTeamMember[]; totalCount: number; activeCount: number; inactiveCount: number; departments: string[] }> {
  try {
    // 1. Try standard raw SQL query for total accuracy against PostgreSQL schema
    const rawRows: Record<string, unknown>[] = await prisma.$queryRawUnsafe(
      'SELECT * FROM "TeamMember" ORDER BY "displayOrder" ASC, "order" ASC, "createdAt" ASC'
    )

    const all = (rawRows || []).map(normalizeTeamMember)

    // Build reportsTo relationship
    const idMap = new Map<string, SafeTeamMember>()
    all.forEach((m) => idMap.set(m.id, m))

    all.forEach((m) => {
      if (m.reportsToId && idMap.has(m.reportsToId)) {
        const mgr = idMap.get(m.reportsToId)!
        m.reportsTo = {
          id: mgr.id,
          name: mgr.name,
          designation: mgr.designation,
        }
      }
    })

    const totalCount = all.length
    const activeCount = all.filter((m) => m.isActive).length
    const inactiveCount = all.filter((m) => !m.isActive).length
    const departments = Array.from(
      new Set(all.map((m) => m.department).filter((d): d is string => Boolean(d && d.trim() !== '')))
    )

    // Apply filtering in memory
    let filtered = [...all]
    const q = options?.where?.query?.toLowerCase()
    if (q) {
      filtered = filtered.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.designation.toLowerCase().includes(q) ||
          (m.department && m.department.toLowerCase().includes(q)) ||
          (m.bio && m.bio.toLowerCase().includes(q))
      )
    }

    if (options?.where?.status === 'active' || options?.where?.isActive === true) {
      filtered = filtered.filter((m) => m.isActive)
    } else if (options?.where?.status === 'inactive' || options?.where?.isActive === false) {
      filtered = filtered.filter((m) => !m.isActive)
    }

    if (options?.where?.dept && options.where.dept !== 'all') {
      const targetDept = options.where.dept.toLowerCase()
      filtered = filtered.filter((m) => m.department && m.department.toLowerCase() === targetDept)
    }

    const filteredTotal = filtered.length

    if (options?.skip !== undefined || options?.take !== undefined) {
      const skip = options.skip || 0
      const take = options.take || filtered.length
      filtered = filtered.slice(skip, skip + take)
    }

    return {
      members: filtered,
      totalCount: filteredTotal,
      activeCount,
      inactiveCount,
      departments,
    }
  } catch (err) {
    console.error('safeFetchTeamMembers fallback to standard findMany error:', err)
    return {
      members: [],
      totalCount: 0,
      activeCount: 0,
      inactiveCount: 0,
      departments: [],
    }
  }
}
