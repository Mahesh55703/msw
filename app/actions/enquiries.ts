'use server'

import prisma from '@/lib/prisma'
import { verifySession } from '@/lib/session'
import { requirePermission } from '@/lib/rbac'
import { revalidatePath } from 'next/cache'
import { EnquiryStatus, EnquiryPriority } from '@prisma/client'
import crypto from 'crypto'
import {
  updateStatusSchema,
  updatePrioritySchema,
  assignEnquirySchema,
  addNoteSchema,
  setFollowUpSchema,
  manualLeadSchema,
} from '@/lib/validations/enquiry'

function generateReferenceNumber(): string {
  const year = new Date().getFullYear()
  const randomStr = crypto.randomBytes(3).toString('hex').toUpperCase()
  return `LA-${year}-${randomStr}`
}

export async function updateEnquiryStatus(rawData: {
  enquiryId: string
  status: EnquiryStatus
  lostReason?: string
  note?: string
}) {
  try {
    const session = await requirePermission('enquiries:manage').catch(()=>null)
    if (!session) {
      return { success: false, error: 'Unauthorized. Please login.' }
    }

    const user = await prisma.user.findUnique({ where: { id: session.userId as string } })
    const authorName = user?.name || 'Admin'

    const validated = updateStatusSchema.parse(rawData)
    const { enquiryId, status, lostReason, note } = validated

    const enquiry = await prisma.enquiry.findUnique({ where: { id: enquiryId } })
    if (!enquiry) {
      return { success: false, error: 'Enquiry not found.' }
    }

    const oldStatus = enquiry.status
    const now = new Date()

    // Determine timestamp updates
    const updateData: any = {
      status,
    }

    if (status === 'CONTACTED' && !enquiry.firstContactedAt) {
      updateData.firstContactedAt = now
    } else if (status === 'QUALIFIED' && !enquiry.qualifiedAt) {
      updateData.qualifiedAt = now
    } else if (status === 'PROPOSAL' && !enquiry.proposalAt) {
      updateData.proposalAt = now
    } else if (status === 'WON' || status === 'LOST') {
      updateData.closedAt = now
    }

    // Merge lostReason and timestamps into sourceDetails JSON
    let details: any = {}
    try {
      if (enquiry.sourceDetails) {
        details = JSON.parse(enquiry.sourceDetails)
      }
    } catch {
      details = {}
    }

    if (status === 'WON') {
      details.wonAt = now.toISOString()
      delete details.lostReason
    } else if (status === 'LOST') {
      details.lostAt = now.toISOString()
      if (lostReason) details.lostReason = lostReason
    }

    updateData.sourceDetails = JSON.stringify(details)

    // Build human-readable activity description
    let activityNote = `Status changed from ${oldStatus} to ${status}`
    if (lostReason && status === 'LOST') {
      activityNote += ` (Reason: ${lostReason})`
    }
    if (note && note.trim()) {
      activityNote += ` — ${note.trim()}`
    }

    await prisma.$transaction([
      prisma.enquiry.update({
        where: { id: enquiryId },
        data: updateData,
      }),
      prisma.enquiryActivity.create({
        data: {
          enquiryId,
          type: 'STATUS_CHANGED',
          note: activityNote,
          createdBy: authorName,
        },
      }),
    ])

    revalidatePath(`/admin/enquiries/${enquiryId}`)
    revalidatePath(`/admin/enquiries`)
    revalidatePath(`/admin/dashboard`)

    return { success: true }
  } catch (err: any) {
    console.error('Error in updateEnquiryStatus:', err)
    return { success: false, error: err.message || 'Failed to update status.' }
  }
}

export async function updateEnquiryPriority(rawData: {
  enquiryId: string
  priority: EnquiryPriority
}) {
  try {
    const session = await requirePermission('enquiries:manage').catch(()=>null)
    if (!session) {
      return { success: false, error: 'Unauthorized. Please login.' }
    }

    const user = await prisma.user.findUnique({ where: { id: session.userId as string } })
    const authorName = user?.name || 'Admin'

    const validated = updatePrioritySchema.parse(rawData)
    const { enquiryId, priority } = validated

    const enquiry = await prisma.enquiry.findUnique({ where: { id: enquiryId } })
    if (!enquiry) {
      return { success: false, error: 'Enquiry not found.' }
    }

    const oldPriority = enquiry.priority
    if (oldPriority === priority) return { success: true }

    await prisma.$transaction([
      prisma.enquiry.update({
        where: { id: enquiryId },
        data: { priority },
      }),
      prisma.enquiryActivity.create({
        data: {
          enquiryId,
          type: 'PRIORITY_CHANGED',
          note: `Priority changed from ${oldPriority} to ${priority}`,
          createdBy: authorName,
        },
      }),
    ])

    revalidatePath(`/admin/enquiries/${enquiryId}`)
    revalidatePath(`/admin/enquiries`)
    revalidatePath(`/admin/dashboard`)

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update priority.' }
  }
}

export async function assignEnquiry(rawData: {
  enquiryId: string
  assignedToId?: string | null
}) {
  try {
    const session = await requirePermission('enquiries:manage').catch(()=>null)
    if (!session) {
      return { success: false, error: 'Unauthorized. Please login.' }
    }

    const user = await prisma.user.findUnique({ where: { id: session.userId as string } })
    const authorName = user?.name || 'Admin'

    const validated = assignEnquirySchema.parse(rawData)
    const { enquiryId, assignedToId } = validated

    let targetUserName = 'Unassigned'
    if (assignedToId) {
      const targetUser = await prisma.user.findUnique({ where: { id: assignedToId } })
      if (targetUser) targetUserName = targetUser.name || targetUser.email
    }

    await prisma.$transaction([
      prisma.enquiry.update({
        where: { id: enquiryId },
        data: { assignedToId: assignedToId || null },
      }),
      prisma.enquiryActivity.create({
        data: {
          enquiryId,
          type: 'ASSIGNED',
          note: `Enquiry assigned to ${targetUserName}`,
          createdBy: authorName,
        },
      }),
    ])

    revalidatePath(`/admin/enquiries/${enquiryId}`)
    revalidatePath(`/admin/enquiries`)
    revalidatePath(`/admin/dashboard`)

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to assign enquiry.' }
  }
}

export async function addEnquiryNote(rawData: { enquiryId: string; note: string }) {
  try {
    const session = await requirePermission('enquiries:manage').catch(()=>null)
    if (!session) {
      return { success: false, error: 'Unauthorized. Please login.' }
    }

    const user = await prisma.user.findUnique({ where: { id: session.userId as string } })
    const authorName = user?.name || 'Admin'

    const validated = addNoteSchema.parse(rawData)
    const { enquiryId, note } = validated

    await prisma.enquiryActivity.create({
      data: {
        enquiryId,
        type: 'NOTE_ADDED',
        note: note.trim(),
        createdBy: authorName,
      },
    })

    revalidatePath(`/admin/enquiries/${enquiryId}`)
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to add note.' }
  }
}

export async function setEnquiryFollowUp(rawData: {
  enquiryId: string
  followUpDate?: string | null
}) {
  try {
    const session = await requirePermission('enquiries:manage').catch(()=>null)
    if (!session) {
      return { success: false, error: 'Unauthorized. Please login.' }
    }

    const user = await prisma.user.findUnique({ where: { id: session.userId as string } })
    const authorName = user?.name || 'Admin'

    const validated = setFollowUpSchema.parse(rawData)
    const { enquiryId, followUpDate } = validated

    const enquiry = await prisma.enquiry.findUnique({ where: { id: enquiryId } })
    if (!enquiry) {
      return { success: false, error: 'Enquiry not found.' }
    }

    let details: any = {}
    try {
      if (enquiry.sourceDetails) details = JSON.parse(enquiry.sourceDetails)
    } catch {
      details = {}
    }

    if (followUpDate) {
      details.nextFollowUpAt = new Date(followUpDate).toISOString()
    } else {
      delete details.nextFollowUpAt
    }

    const followUpNote = followUpDate
      ? `Follow-up scheduled for ${new Date(followUpDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
      : `Follow-up date cleared`

    await prisma.$transaction([
      prisma.enquiry.update({
        where: { id: enquiryId },
        data: { sourceDetails: JSON.stringify(details) },
      }),
      prisma.enquiryActivity.create({
        data: {
          enquiryId,
          type: 'NOTE_ADDED',
          note: followUpNote,
          createdBy: authorName,
        },
      }),
    ])

    revalidatePath(`/admin/enquiries/${enquiryId}`)
    revalidatePath(`/admin/dashboard`)

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update follow-up date.' }
  }
}

export async function createManualLead(rawData: unknown) {
  try {
    const session = await requirePermission('enquiries:manage').catch(()=>null)
    if (!session) {
      return { success: false, error: 'Unauthorized. Please login.' }
    }

    const user = await prisma.user.findUnique({ where: { id: session.userId as string } })
    const authorName = user?.name || 'Admin'

    const validated = manualLeadSchema.parse(rawData)

    let referenceNumber = generateReferenceNumber()
    let isUnique = false
    let attempts = 0
    while (!isUnique && attempts < 5) {
      const existing = await prisma.enquiry.findUnique({ where: { referenceNumber } })
      if (!existing) isUnique = true
      else {
        referenceNumber = generateReferenceNumber()
        attempts++
      }
    }

    const lead = await prisma.enquiry.create({
      data: {
        referenceNumber,
        name: validated.name,
        company: validated.company || null,
        designation: validated.designation || null,
        email: validated.email,
        phone: validated.phone || null,
        service: validated.service,
        message: validated.message || null,
        status: validated.status as EnquiryStatus,
        priority: validated.priority as EnquiryPriority,
        source: validated.source || 'Manual Entry',
        assignedToId: validated.assignedToId || null,
        activities: {
          create: {
            type: 'CREATED',
            note: `Lead created manually in CRM by ${authorName}. Service: ${validated.service}`,
            createdBy: authorName,
          },
        },
      },
    })

    revalidatePath('/admin/enquiries')
    revalidatePath('/admin/dashboard')

    return { success: true, lead }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to create manual lead.' }
  }
}

export async function deleteEnquiry(enquiryId: string) {
  try {
    const session = await requirePermission('enquiries:manage').catch(()=>null)
    if (!session) {
      return { success: false, error: 'Unauthorized. Please login.' }
    }

    await prisma.enquiry.delete({
      where: { id: enquiryId },
    })

    revalidatePath('/admin/enquiries')
    revalidatePath('/admin/dashboard')

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete enquiry.' }
  }
}
