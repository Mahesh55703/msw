'use server'

import prisma from '@/lib/prisma'
import { verifySession } from '@/lib/session'
import { revalidatePath } from 'next/cache'
import { jobPostingSchema, JobPostingInput } from '@/lib/validations/job'
import { safeFetchJobById, safeFetchJobBySlug, safeFetchJobs } from '@/lib/db/careers'

/**
 * Check if a slug is available
 */
export async function checkSlugAvailability(slug: string, excludeId?: string) {
  try {
    const existing = await safeFetchJobBySlug(slug)
    if (!existing) return { available: true }
    if (excludeId && existing.id === excludeId) return { available: true }
    return { available: false }
  } catch {
    return { available: true }
  }
}

/**
 * Create a new job posting
 */
export async function createJob(rawInput: JobPostingInput) {
  try {
    const session = await verifySession()
    if (!session.isAuth) {
      return { success: false, error: 'Unauthorized' }
    }

    const validation = jobPostingSchema.safeParse(rawInput)
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || 'Invalid input'
      return { success: false, error: firstError }
    }

    const data = validation.data

    // Check slug uniqueness
    const slugCheck = await checkSlugAvailability(data.slug)
    if (!slugCheck.available) {
      return { success: false, error: `Slug "${data.slug}" is already in use by another position.` }
    }

    // Auto calculate display order if 0
    let finalOrder = data.displayOrder
    if (finalOrder === 0) {
      const { jobs } = await safeFetchJobs()
      const maxOrder = jobs.reduce((max, j) => Math.max(max, j.displayOrder), 0)
      finalOrder = maxOrder + 1
    }

    const publishedAt = data.status === 'PUBLISHED' ? data.publishedAt || new Date() : data.publishedAt
    const isActive = data.status === 'PUBLISHED'

    let jobId: string = ''
    try {
      const created = await prisma.jobPosting.create({
        data: {
          title: data.title,
          slug: data.slug,
          department: data.department,
          location: data.location,
          employmentType: data.employmentType,
          type: data.employmentType,
          workMode: data.workMode,
          experience: data.experience,
          salary: data.salary,
          description: data.description,
          responsibilities: data.responsibilities,
          requirements: data.requirements,
          applicationMethod: data.applicationMethod,
          applicationUrl: data.applicationUrl,
          applicationEmail: data.applicationEmail,
          status: data.status,
          isActive,
          publishedAt,
          closingDate: data.closingDate,
          displayOrder: finalOrder,
          seoTitle: data.seoTitle,
          metaDescription: data.metaDescription,
        },
      })
      jobId = created.id
    } catch {
      // Raw fallback
      const cuid = `cmj_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
      await prisma.$executeRawUnsafe(
        `INSERT INTO "JobPosting" ("id", "title", "slug", "department", "location", "employmentType", "type", "workMode", "experience", "salary", "description", "responsibilities", "requirements", "applicationMethod", "applicationUrl", "applicationEmail", "status", "isActive", "publishedAt", "closingDate", "displayOrder", "seoTitle", "metaDescription", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, NOW(), NOW())`,
        cuid,
        data.title,
        data.slug,
        data.department,
        data.location,
        data.employmentType,
        data.employmentType,
        data.workMode,
        data.experience,
        data.salary,
        data.description,
        data.responsibilities,
        data.requirements,
        data.applicationMethod,
        data.applicationUrl,
        data.applicationEmail,
        data.status,
        isActive,
        publishedAt,
        data.closingDate,
        finalOrder,
        data.seoTitle,
        data.metaDescription
      )
      jobId = cuid
    }

    try {
      revalidatePath('/careers')
      revalidatePath(`/careers/${data.slug}`)
      revalidatePath('/admin/careers')
      revalidatePath('/sitemap.xml')
    } catch {}

    return { success: true, id: jobId, slug: data.slug }
  } catch (error: any) {
    console.error('Error creating job:', error)
    return { success: false, error: error.message || 'Failed to create job posting' }
  }
}

/**
 * Update an existing job posting
 */
export async function updateJob(id: string, rawInput: JobPostingInput) {
  try {
    const session = await verifySession()
    if (!session.isAuth) {
      return { success: false, error: 'Unauthorized' }
    }

    const validation = jobPostingSchema.safeParse(rawInput)
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || 'Invalid input'
      return { success: false, error: firstError }
    }

    const data = validation.data

    // Check slug uniqueness
    const slugCheck = await checkSlugAvailability(data.slug, id)
    if (!slugCheck.available) {
      return { success: false, error: `Slug "${data.slug}" is already used by another position.` }
    }

    const existing = await safeFetchJobById(id)
    if (!existing) return { success: false, error: 'Job posting not found' }

    const publishedAt =
      data.status === 'PUBLISHED' ? data.publishedAt || existing.publishedAt || new Date() : data.publishedAt
    const isActive = data.status === 'PUBLISHED'

    try {
      await prisma.jobPosting.update({
        where: { id },
        data: {
          title: data.title,
          slug: data.slug,
          department: data.department,
          location: data.location,
          employmentType: data.employmentType,
          type: data.employmentType,
          workMode: data.workMode,
          experience: data.experience,
          salary: data.salary,
          description: data.description,
          responsibilities: data.responsibilities,
          requirements: data.requirements,
          applicationMethod: data.applicationMethod,
          applicationUrl: data.applicationUrl,
          applicationEmail: data.applicationEmail,
          status: data.status,
          isActive,
          publishedAt,
          closingDate: data.closingDate,
          displayOrder: data.displayOrder,
          seoTitle: data.seoTitle,
          metaDescription: data.metaDescription,
        },
      })
    } catch {
      // Raw fallback
      await prisma.$executeRawUnsafe(
        `UPDATE "JobPosting"
         SET "title" = $1, "slug" = $2, "department" = $3, "location" = $4, "employmentType" = $5,
             "type" = $6, "workMode" = $7, "experience" = $8, "salary" = $9, "description" = $10,
             "responsibilities" = $11, "requirements" = $12, "applicationMethod" = $13,
             "applicationUrl" = $14, "applicationEmail" = $15, "status" = $16, "isActive" = $17,
             "publishedAt" = $18, "closingDate" = $19, "displayOrder" = $20, "seoTitle" = $21,
             "metaDescription" = $22, "updatedAt" = NOW()
         WHERE "id" = $23`,
        data.title,
        data.slug,
        data.department,
        data.location,
        data.employmentType,
        data.employmentType,
        data.workMode,
        data.experience,
        data.salary,
        data.description,
        data.responsibilities,
        data.requirements,
        data.applicationMethod,
        data.applicationUrl,
        data.applicationEmail,
        data.status,
        isActive,
        publishedAt,
        data.closingDate,
        data.displayOrder,
        data.seoTitle,
        data.metaDescription,
        id
      )
    }

    try {
      revalidatePath('/careers')
      revalidatePath(`/careers/${data.slug}`)
      if (existing.slug !== data.slug) {
        revalidatePath(`/careers/${existing.slug}`)
      }
      revalidatePath('/admin/careers')
      revalidatePath('/sitemap.xml')
    } catch {}

    return { success: true, id, slug: data.slug }
  } catch (error: any) {
    console.error('Error updating job:', error)
    return { success: false, error: error.message || 'Failed to update job posting' }
  }
}

/**
 * Publish a job posting
 */
export async function publishJob(id: string) {
  try {
    const session = await verifySession()
    if (!session.isAuth) {
      return { success: false, error: 'Unauthorized' }
    }

    const existing = await safeFetchJobById(id)
    if (!existing) return { success: false, error: 'Job not found' }

    const publishedAt = existing.publishedAt || new Date()

    try {
      await prisma.jobPosting.update({
        where: { id },
        data: {
          status: 'PUBLISHED',
          isActive: true,
          publishedAt,
        },
      })
    } catch {
      await prisma.$executeRawUnsafe(
        'UPDATE "JobPosting" SET "status" = $1, "isActive" = true, "publishedAt" = $2, "updatedAt" = NOW() WHERE "id" = $3',
        'PUBLISHED',
        publishedAt,
        id
      )
    }

    try {
      revalidatePath('/careers')
      revalidatePath(`/careers/${existing.slug}`)
      revalidatePath('/admin/careers')
      revalidatePath('/sitemap.xml')
    } catch {}

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to publish job' }
  }
}

/**
 * Unpublish / revert job posting to Draft
 */
export async function unpublishJob(id: string) {
  try {
    const session = await verifySession()
    if (!session.isAuth) {
      return { success: false, error: 'Unauthorized' }
    }

    const existing = await safeFetchJobById(id)
    if (!existing) return { success: false, error: 'Job not found' }

    try {
      await prisma.jobPosting.update({
        where: { id },
        data: {
          status: 'DRAFT',
          isActive: false,
        },
      })
    } catch {
      await prisma.$executeRawUnsafe(
        'UPDATE "JobPosting" SET "status" = $1, "isActive" = false, "updatedAt" = NOW() WHERE "id" = $2',
        'DRAFT',
        id
      )
    }

    try {
      revalidatePath('/careers')
      revalidatePath(`/careers/${existing.slug}`)
      revalidatePath('/admin/careers')
      revalidatePath('/sitemap.xml')
    } catch {}

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to unpublish job' }
  }
}

/**
 * Close a job posting
 */
export async function closeJob(id: string) {
  try {
    const session = await verifySession()
    if (!session.isAuth) {
      return { success: false, error: 'Unauthorized' }
    }

    const existing = await safeFetchJobById(id)
    if (!existing) return { success: false, error: 'Job not found' }

    try {
      await prisma.jobPosting.update({
        where: { id },
        data: {
          status: 'CLOSED',
          isActive: false,
        },
      })
    } catch {
      await prisma.$executeRawUnsafe(
        'UPDATE "JobPosting" SET "status" = $1, "isActive" = false, "updatedAt" = NOW() WHERE "id" = $2',
        'CLOSED',
        id
      )
    }

    try {
      revalidatePath('/careers')
      revalidatePath(`/careers/${existing.slug}`)
      revalidatePath('/admin/careers')
      revalidatePath('/sitemap.xml')
    } catch {}

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to close job' }
  }
}

/**
 * Delete a job posting
 */
export async function deleteJob(id: string) {
  try {
    const session = await verifySession()
    if (!session.isAuth) {
      return { success: false, error: 'Unauthorized' }
    }

    const existing = await safeFetchJobById(id)
    if (!existing) return { success: false, error: 'Job not found' }

    try {
      await prisma.jobPosting.delete({
        where: { id },
      })
    } catch {
      await prisma.$executeRawUnsafe('DELETE FROM "JobPosting" WHERE "id" = $1', id)
    }

    try {
      revalidatePath('/careers')
      revalidatePath(`/careers/${existing.slug}`)
      revalidatePath('/admin/careers')
      revalidatePath('/sitemap.xml')
    } catch {}

    return { success: true }
  } catch (error: any) {
    console.error('Error deleting job:', error)
    return { success: false, error: error.message || 'Failed to delete job posting' }
  }
}
