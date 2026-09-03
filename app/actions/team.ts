'use server'

import prisma from '@/lib/prisma'
import { verifySession } from '@/lib/session'
import { requirePermission } from '@/lib/rbac'
import { revalidatePath } from 'next/cache'
import { teamMemberSchema, TeamMemberInput } from '@/lib/validations/team'
import { safeFetchTeamMembers, normalizeTeamMember } from '@/lib/db/team'

/**
 * Checks if setting reportsToId for a member would introduce a circular hierarchy.
 */
async function wouldCreateHierarchyCycle(memberId: string, newReportsToId: string | null): Promise<boolean> {
  if (!newReportsToId) return false
  if (memberId === newReportsToId) return true // Self-reporting

  // Traverse ancestors from newReportsToId up to root
  let currentId: string | null = newReportsToId
  const visited = new Set<string>()

  const { members } = await safeFetchTeamMembers()
  const map = new Map(members.map((m) => [m.id, m]))

  while (currentId) {
    if (currentId === memberId) return true // Loop detected
    if (visited.has(currentId)) return true // Cycle detected in graph
    visited.add(currentId)

    const parent = map.get(currentId)
    currentId = parent?.reportsToId || null
  }

  return false
}

/**
 * Recursively gets all descendant IDs of a team member.
 */
async function getDescendantIds(memberId: string): Promise<string[]> {
  const { members } = await safeFetchTeamMembers()

  const childrenMap = new Map<string, string[]>()
  members.forEach((m) => {
    if (m.reportsToId) {
      const existing = childrenMap.get(m.reportsToId) || []
      existing.push(m.id)
      childrenMap.set(m.reportsToId, existing)
    }
  })

  const descendants: string[] = []
  const queue: string[] = [...(childrenMap.get(memberId) || [])]

  while (queue.length > 0) {
    const current = queue.shift()!
    descendants.push(current)
    const children = childrenMap.get(current) || []
    queue.push(...children)
  }

  return descendants
}

/**
 * Get available managers for a member (excluding self and any descendants).
 */
export async function getPotentialManagers(excludeMemberId?: string) {
  try {
    const session = await requirePermission('team:manage').catch(()=>null)
    if (!session) {
      return { success: false, error: 'Unauthorized', managers: [] }
    }

    let excludedIds: string[] = []
    if (excludeMemberId) {
      const descendants = await getDescendantIds(excludeMemberId)
      excludedIds = [excludeMemberId, ...descendants]
    }

    const { members } = await safeFetchTeamMembers()
    const available = members
      .filter((m) => !excludedIds.includes(m.id))
      .map((m) => ({
        id: m.id,
        name: m.name,
        designation: m.designation,
        department: m.department,
      }))

    return { success: true, managers: available }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch managers', managers: [] }
  }
}

/**
 * Create a new team member
 */
export async function createTeamMember(rawInput: TeamMemberInput) {
  try {
    const session = await requirePermission('team:manage').catch(()=>null)
    if (!session) {
      return { success: false, error: 'Unauthorized' }
    }

    const validation = teamMemberSchema.safeParse(rawInput)
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || 'Invalid input'
      return { success: false, error: firstError }
    }

    const data = validation.data

    // If displayOrder is 0, auto-assign next highest displayOrder
    let finalOrder = data.displayOrder
    if (finalOrder === 0) {
      const { members } = await safeFetchTeamMembers()
      const maxOrder = members.reduce((max, m) => Math.max(max, m.displayOrder), 0)
      finalOrder = maxOrder + 1
    }

    let memberId: string = ''
    try {
      const member = await prisma.teamMember.create({
        data: {
          name: data.name,
          designation: data.designation,
          role: data.designation,
          department: data.department,
          bio: data.bio,
          imageUrl: data.imageUrl,
          imageAlt: data.imageAlt || (data.name ? `${data.name} - ${data.designation}` : null),
          linkedinUrl: data.linkedinUrl,
          displayOrder: finalOrder,
          order: finalOrder,
          isActive: data.isActive,
          reportsToId: data.reportsToId,
        },
      })
      memberId = member.id
    } catch (createErr) {
      // Direct raw query execution if in-memory Prisma client has schema desync
      const cuid = `cmt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
      await prisma.$executeRawUnsafe(
        `INSERT INTO "TeamMember" ("id", "name", "designation", "role", "department", "bio", "imageUrl", "imageAlt", "linkedinUrl", "displayOrder", "order", "isActive", "reportsToId", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())`,
        cuid,
        data.name,
        data.designation,
        data.designation,
        data.department,
        data.bio,
        data.imageUrl,
        data.imageAlt || `${data.name} - ${data.designation}`,
        data.linkedinUrl,
        finalOrder,
        finalOrder,
        data.isActive,
        data.reportsToId
      )
      memberId = cuid
    }

    try {
      revalidatePath('/admin/team')
      revalidatePath('/team')
      revalidatePath('/about')
    } catch {}

    return { success: true, id: memberId }
  } catch (error: any) {
    console.error('Error creating team member:', error)
    return { success: false, error: error.message || 'Failed to create team member' }
  }
}

/**
 * Update an existing team member
 */
export async function updateTeamMember(id: string, rawInput: TeamMemberInput) {
  try {
    const session = await requirePermission('team:manage').catch(()=>null)
    if (!session) {
      return { success: false, error: 'Unauthorized' }
    }

    const validation = teamMemberSchema.safeParse(rawInput)
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || 'Invalid input'
      return { success: false, error: firstError }
    }

    const data = validation.data

    // Validate hierarchy cycles
    if (data.reportsToId) {
      const causesCycle = await wouldCreateHierarchyCycle(id, data.reportsToId)
      if (causesCycle) {
        return {
          success: false,
          error: 'Invalid hierarchy: a team member cannot report to themselves or to one of their direct/indirect subordinates.',
        }
      }
    }

    try {
      await prisma.teamMember.update({
        where: { id },
        data: {
          name: data.name,
          designation: data.designation,
          role: data.designation,
          department: data.department,
          bio: data.bio,
          imageUrl: data.imageUrl,
          imageAlt: data.imageAlt || (data.name ? `${data.name} - ${data.designation}` : null),
          linkedinUrl: data.linkedinUrl,
          displayOrder: data.displayOrder,
          order: data.displayOrder,
          isActive: data.isActive,
          reportsToId: data.reportsToId,
        },
      })
    } catch (updateErr) {
      // Raw fallback
      await prisma.$executeRawUnsafe(
        `UPDATE "TeamMember"
         SET "name" = $1, "designation" = $2, "role" = $3, "department" = $4, "bio" = $5,
             "imageUrl" = $6, "imageAlt" = $7, "linkedinUrl" = $8, "displayOrder" = $9,
             "order" = $10, "isActive" = $11, "reportsToId" = $12, "updatedAt" = NOW()
         WHERE "id" = $13`,
        data.name,
        data.designation,
        data.designation,
        data.department,
        data.bio,
        data.imageUrl,
        data.imageAlt || `${data.name} - ${data.designation}`,
        data.linkedinUrl,
        data.displayOrder,
        data.displayOrder,
        data.isActive,
        data.reportsToId,
        id
      )
    }

    try {
      revalidatePath('/admin/team')
      revalidatePath(`/admin/team/${id}`)
      revalidatePath('/team')
      revalidatePath('/about')
    } catch {}

    return { success: true, id }
  } catch (error: any) {
    console.error('Error updating team member:', error)
    return { success: false, error: error.message || 'Failed to update team member' }
  }
}

/**
 * Quick toggle active status
 */
export async function toggleTeamMemberStatus(id: string) {
  try {
    const session = await requirePermission('team:manage').catch(()=>null)
    if (!session) {
      return { success: false, error: 'Unauthorized' }
    }

    const { members } = await safeFetchTeamMembers()
    const member = members.find((m) => m.id === id)
    if (!member) return { success: false, error: 'Team member not found' }

    const newStatus = !member.isActive
    try {
      await prisma.teamMember.update({
        where: { id },
        data: { isActive: newStatus },
      })
    } catch {
      await prisma.$executeRawUnsafe(
        'UPDATE "TeamMember" SET "isActive" = $1, "updatedAt" = NOW() WHERE "id" = $2',
        newStatus,
        id
      )
    }

    try {
      revalidatePath('/admin/team')
      revalidatePath('/team')
    } catch {}

    return { success: true, isActive: newStatus }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to toggle status' }
  }
}

/**
 * Quick update display order
 */
export async function updateTeamMemberOrder(id: string, newOrder: number) {
  try {
    const session = await requirePermission('team:manage').catch(()=>null)
    if (!session) {
      return { success: false, error: 'Unauthorized' }
    }

    const orderVal = Math.max(0, newOrder)
    try {
      await prisma.teamMember.update({
        where: { id },
        data: {
          displayOrder: orderVal,
          order: orderVal,
        },
      })
    } catch {
      await prisma.$executeRawUnsafe(
        'UPDATE "TeamMember" SET "displayOrder" = $1, "order" = $2, "updatedAt" = NOW() WHERE "id" = $3',
        orderVal,
        orderVal,
        id
      )
    }

    try {
      revalidatePath('/admin/team')
      revalidatePath('/team')
    } catch {}

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update order' }
  }
}

/**
 * Delete team member safely, handling direct reports
 */
export async function deleteTeamMember(
  id: string,
  options?: { reassignReportsToId?: string | null; force?: boolean }
) {
  try {
    const session = await requirePermission('team:manage').catch(()=>null)
    if (!session) {
      return { success: false, error: 'Unauthorized' }
    }

    const { members } = await safeFetchTeamMembers()
    const member = members.find((m) => m.id === id)
    if (!member) {
      return { success: false, error: 'Team member not found' }
    }

    const directReports = members.filter((m) => m.reportsToId === id)

    // If member has direct reports and no explicit reassign or force flag is given
    if (directReports.length > 0 && !options?.force && options?.reassignReportsToId === undefined) {
      return {
        success: false,
        error: `${member.name} currently has ${directReports.length} direct report(s). Please reassign them or confirm orphan handling.`,
        directReports,
        requiresReassignment: true,
      }
    }

    // Reassign direct reports if specified or nullify
    const newReportsToId =
      options?.reassignReportsToId !== undefined ? options.reassignReportsToId : member.reportsToId

    if (directReports.length > 0) {
      try {
        await prisma.teamMember.updateMany({
          where: { reportsToId: id },
          data: { reportsToId: newReportsToId },
        })
      } catch {
        await prisma.$executeRawUnsafe(
          'UPDATE "TeamMember" SET "reportsToId" = $1, "updatedAt" = NOW() WHERE "reportsToId" = $2',
          newReportsToId,
          id
        )
      }
    }

    // Delete team member record (media files are preserved in Media Library)
    try {
      await prisma.teamMember.delete({
        where: { id },
      })
    } catch {
      await prisma.$executeRawUnsafe('DELETE FROM "TeamMember" WHERE "id" = $1', id)
    }

    try {
      revalidatePath('/admin/team')
      revalidatePath('/team')
      revalidatePath('/about')
    } catch {}

    return { success: true }
  } catch (error: any) {
    console.error('Error deleting team member:', error)
    return { success: false, error: error.message || 'Failed to delete team member' }
  }
}
