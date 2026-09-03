'use server'

import prisma from '@/lib/prisma'
import { verifySession } from '@/lib/session'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import {
  SeoSchema,
  parseSectionContent,
  sectionTypeSchema,
  CreateSectionInputSchema,
  ContentReferenceInputSchema,
  ReorderSectionsInputSchema,
  UpdateSectionContentInputSchema,
} from '@/lib/validations/page'
import {
  getPageRevision,
  getDraftRevisionForPreview,
  type PageRevisionDetail,
} from '@/lib/db/pages'
import type { PageRevisionSummary } from '@/lib/db/pages'

// ─── PROTECTED PAGES ─────────────────────────────────────────────────────────
// These keys and paths must never be deleted, archived, or have their paths changed.
const PROTECTED_PAGE_KEYS = new Set([
  'HOME',
  'ABOUT',
  'CONTACT',
  'SERVICES',
  'INDUSTRIES',
  'RESOURCES',
  'TEAM',
  'CAREERS',
  'COMPLIANCE_HEALTH_CHECK',
])

// ─── RESULT HELPERS ──────────────────────────────────────────────────────────

type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string }

function ok<T>(data: T): { success: true; data: T } {
  return { success: true, data }
}

function fail(error: string): { success: false; error: string } {
  return { success: false, error }
}

import { requirePermission } from '@/lib/rbac'

// ─── AUTH HELPERS ─────────────────────────────────────────────────────────────

async function requireAuth() {
  try {
    return await requirePermission('pages:edit')
  } catch {
    return null
  }
}

async function requireAdmin() {
  try {
    return await requirePermission('pages:publish')
  } catch {
    return null
  }
}

// ─── DRAFT REVISION MANAGEMENT ────────────────────────────────────────────────

/**
 * Create a new draft revision by cloning the current published revision.
 * If an existing draft already exists, return it rather than creating a duplicate.
 *
 * Business rules:
 * - Any authenticated user (ADMIN or EDITOR) can create a draft.
 * - Never mutates the published revision.
 * - Copies sections, section content, visibility, sortOrder, media references.
 * - Copies SEO metadata.
 * - Does NOT copy PageSectionReferences (they reference live DB entities and are recreated fresh).
 */
export async function createDraftRevision(
  pageId: string
): Promise<ActionResult<{ revisionId: string; version: number; isNew: boolean }>> {
  try {
    const session = await requireAuth()
    if (!session) return fail('Unauthorized. Please log in.')

    const page = await prisma.page.findUnique({
      where: { id: pageId },
      include: {
        publishedRevision: {
          include: {
            sections: {
              orderBy: { sortOrder: 'asc' },
              include: {
                references: { orderBy: { sortOrder: 'asc' } },
              },
            },
          },
        },
        revisions: {
          orderBy: { version: 'desc' },
          select: { id: true, version: true },
        },
      },
    })

    if (!page) return fail('Page not found.')

    // Check if there's already an unpublished draft (newer than the published revision)
    const publishedVersion = page.publishedRevision?.version ?? 0
    const existingDraft = page.revisions.find((r) => r.version > publishedVersion)
    if (existingDraft) {
      return ok({ revisionId: existingDraft.id, version: existingDraft.version, isNew: false })
    }

    // Determine next version number
    const latestVersion = page.revisions[0]?.version ?? 0
    const nextVersion = latestVersion + 1

    const sourceRevision = page.publishedRevision

    // Create new revision in a transaction
    const newRevision = await prisma.$transaction(async (tx) => {
      const created = await tx.pageRevision.create({
        data: {
          pageId,
          version: nextVersion,
          seoTitle: sourceRevision?.seoTitle ?? null,
          metaDescription: sourceRevision?.metaDescription ?? null,
          canonicalUrl: sourceRevision?.canonicalUrl ?? null,
          ogImageId: sourceRevision?.ogImageId ?? null,
          createdById: session.userId!,
        },
      })

      // Clone sections from source revision if it exists
      if (sourceRevision?.sections && sourceRevision.sections.length > 0) {
        for (const section of sourceRevision.sections) {
          const newSection = await tx.pageSection.create({
            data: {
              revisionId: created.id,
              type: section.type,
              sortOrder: section.sortOrder,
              isVisible: section.isVisible,
              schemaVersion: section.schemaVersion,
              content: section.content as any,
              mediaId: section.mediaId,
            },
          })

          // Clone references
          if (section.references.length > 0) {
            await tx.pageSectionReference.createMany({
              data: section.references.map((ref) => ({
                sectionId: newSection.id,
                sortOrder: ref.sortOrder,
                articleId: ref.articleId,
                faqId: ref.faqId,
                teamMemberId: ref.teamMemberId,
                jobPostingId: ref.jobPostingId,
              })),
            })
          }
        }
      }

      return created
    })

    return ok({ revisionId: newRevision.id, version: newRevision.version, isNew: true })
  } catch (error) {
    console.error('[createDraftRevision]', error)
    return fail('Failed to create draft revision.')
  }
}

// ─── SEO ACTIONS ─────────────────────────────────────────────────────────────

/**
 * Update SEO metadata on a draft revision.
 * Verifies the revision is NOT the published revision (to protect live content).
 */
export async function updateRevisionSeo(
  revisionId: string,
  rawData: unknown
): Promise<ActionResult<PageRevisionSummary>> {
  try {
    const session = await requireAuth()
    if (!session) return fail('Unauthorized. Please log in.')

    const validated = SeoSchema.safeParse(rawData)
    if (!validated.success) {
      return fail(validated.error.errors.map((e) => e.message).join(', '))
    }

    // Verify revision exists and is not published
    const revision = await prisma.pageRevision.findUnique({
      where: { id: revisionId },
      select: { id: true, pageId: true, version: true, createdAt: true, createdById: true },
    })
    if (!revision) return fail('Revision not found.')

    const page = await prisma.page.findUnique({
      where: { id: revision.pageId },
      select: { publishedRevisionId: true },
    })
    if (!page) return fail('Page not found.')
    if (page.publishedRevisionId === revisionId) {
      return fail('Cannot modify the published revision directly. Create a new draft first.')
    }

    // Validate ogImageId references an existing Media record
    if (validated.data.ogImageId) {
      const media = await prisma.media.findUnique({ where: { id: validated.data.ogImageId } })
      if (!media) return fail('OG image not found. Please select a valid media item.')
    }

    const updated = await prisma.pageRevision.update({
      where: { id: revisionId },
      data: {
        seoTitle: validated.data.seoTitle ?? null,
        metaDescription: validated.data.metaDescription ?? null,
        canonicalUrl: validated.data.canonicalUrl ?? null,
        ogImageId: validated.data.ogImageId ?? null,
      },
      include: { _count: { select: { sections: true } } },
    })

    return ok({
      id: updated.id,
      pageId: updated.pageId,
      version: updated.version,
      seoTitle: updated.seoTitle,
      metaDescription: updated.metaDescription,
      canonicalUrl: updated.canonicalUrl,
      ogImageId: updated.ogImageId,
      createdById: updated.createdById,
      createdAt: updated.createdAt,
      sectionCount: updated._count.sections,
      isPublished: false,
    })
  } catch (error) {
    console.error('[updateRevisionSeo]', error)
    return fail('Failed to update SEO metadata.')
  }
}

// ─── SECTION ACTIONS ──────────────────────────────────────────────────────────

/**
 * Add a new section to a draft revision.
 * - Validates section type against the Prisma enum.
 * - Validates content using the per-type schema.
 * - Verifies mediaId references an existing Media record if provided.
 */
export async function addSection(
  revisionId: string,
  rawInput: unknown
): Promise<ActionResult<{ sectionId: string }>> {
  try {
    const session = await requireAuth()
    if (!session) return fail('Unauthorized. Please log in.')

    const inputParsed = CreateSectionInputSchema.safeParse(rawInput)
    if (!inputParsed.success) {
      return fail(inputParsed.error.errors.map((e) => e.message).join(', '))
    }
    const input = inputParsed.data

    // Validate section type strictly
    const typeParsed = sectionTypeSchema.safeParse(input.type)
    if (!typeParsed.success) {
      return fail(`Invalid section type: ${input.type}`)
    }

    // Validate content per section type
    let parsedContent: unknown
    try {
      parsedContent = parseSectionContent(typeParsed.data, input.content)
    } catch (e) {
      if (e instanceof z.ZodError) {
        return fail('Section content validation failed: ' + e.errors.map((err) => err.message).join(', '))
      }
      return fail('Section content is invalid.')
    }

    // Verify revision is not published
    const revision = await prisma.pageRevision.findUnique({
      where: { id: revisionId },
      select: { pageId: true },
    })
    if (!revision) return fail('Revision not found.')

    const page = await prisma.page.findUnique({
      where: { id: revision.pageId },
      select: { publishedRevisionId: true },
    })
    if (page?.publishedRevisionId === revisionId) {
      return fail('Cannot modify the published revision directly. Create a new draft first.')
    }

    // Verify mediaId
    if (input.mediaId) {
      const media = await prisma.media.findUnique({ where: { id: input.mediaId } })
      if (!media) return fail('Media not found. Please select a valid media item.')
    }

    const section = await prisma.pageSection.create({
      data: {
        revisionId,
        type: typeParsed.data,
        sortOrder: input.sortOrder,
        isVisible: input.isVisible,
        content: parsedContent as any,
        mediaId: input.mediaId ?? null,
      },
    })

    return ok({ sectionId: section.id })
  } catch (error) {
    console.error('[addSection]', error)
    return fail('Failed to add section.')
  }
}

/**
 * Update section content and/or media.
 * - Re-validates content against the section's existing type.
 * - Verifies section belongs to a draft (not published) revision.
 */
export async function updateSectionContent(
  sectionId: string,
  rawInput: unknown
): Promise<ActionResult<undefined>> {
  try {
    const session = await requireAuth()
    if (!session) return fail('Unauthorized. Please log in.')

    const inputParsed = UpdateSectionContentInputSchema.safeParse(rawInput)
    if (!inputParsed.success) {
      return fail(inputParsed.error.errors.map((e) => e.message).join(', '))
    }

    const section = await prisma.pageSection.findUnique({
      where: { id: sectionId },
      select: { id: true, type: true, revisionId: true, sortOrder: true },
    })
    if (!section) return fail('Section not found.')

    const revision = await prisma.pageRevision.findUnique({
      where: { id: section.revisionId },
      select: { pageId: true },
    })
    if (!revision) return fail('Revision not found.')

    const page = await prisma.page.findUnique({
      where: { id: revision.pageId },
      select: { id: true, path: true, publishedRevisionId: true },
    })
    if (!page) return fail('Page not found.')

    let targetSectionId = sectionId

    // If this section belongs to the live published revision, automatically create a draft
    if (page.publishedRevisionId === section.revisionId) {
      const draftResult = await createDraftRevision(page.id)
      if (!draftResult.success) {
        return fail('Failed to initialize draft revision.')
      }
      const clonedSection = await prisma.pageSection.findFirst({
        where: {
          revisionId: draftResult.data.revisionId,
          sortOrder: section.sortOrder,
          type: section.type,
        },
        select: { id: true },
      })
      if (!clonedSection) {
        return fail('Failed to locate section in draft revision.')
      }
      targetSectionId = clonedSection.id
    } else {
      await verifyRevisionIsEditable(section.revisionId)
    }

    // Validate content against this section's type
    let parsedContent: unknown
    try {
      parsedContent = parseSectionContent(section.type, inputParsed.data.content)
    } catch (e) {
      if (e instanceof z.ZodError) {
        return fail('Section content invalid: ' + e.errors.map((err) => err.message).join(', '))
      }
      return fail('Section content is invalid.')
    }

    // Verify mediaId
    if (inputParsed.data.mediaId) {
      const media = await prisma.media.findUnique({ where: { id: inputParsed.data.mediaId } })
      if (!media) return fail('Media not found.')
    }

    await prisma.pageSection.update({
      where: { id: targetSectionId },
      data: {
        content: parsedContent as any,
        mediaId: inputParsed.data.mediaId ?? null,
      },
    })

    revalidatePath(page.path)
    revalidatePath('/admin/pages')
    revalidatePath(`/admin/pages/${page.id}`)
    return ok(undefined)
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('EDITABLE_ERROR:')) {
      return fail(error.message.replace('EDITABLE_ERROR:', ''))
    }
    console.error('[updateSectionContent]', error)
    return fail('Failed to update section.')
  }
}

/**
 * Toggle a section's visibility.
 */
export async function toggleSectionVisibility(
  sectionId: string
): Promise<ActionResult<{ isVisible: boolean }>> {
  try {
    const session = await requireAuth()
    if (!session) return fail('Unauthorized. Please log in.')

    const section = await prisma.pageSection.findUnique({
      where: { id: sectionId },
      select: { isVisible: true, revisionId: true },
    })
    if (!section) return fail('Section not found.')

    await verifyRevisionIsEditable(section.revisionId)

    const updated = await prisma.pageSection.update({
      where: { id: sectionId },
      data: { isVisible: !section.isVisible },
    })

    return ok({ isVisible: updated.isVisible })
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('EDITABLE_ERROR:')) {
      return fail(error.message.replace('EDITABLE_ERROR:', ''))
    }
    console.error('[toggleSectionVisibility]', error)
    return fail('Failed to toggle section visibility.')
  }
}

/**
 * Delete a section from a draft revision.
 */
export async function deleteSection(sectionId: string): Promise<ActionResult<undefined>> {
  try {
    const session = await requireAuth()
    if (!session) return fail('Unauthorized. Please log in.')

    const section = await prisma.pageSection.findUnique({
      where: { id: sectionId },
      select: { revisionId: true },
    })
    if (!section) return fail('Section not found.')

    await verifyRevisionIsEditable(section.revisionId)

    await prisma.pageSection.delete({ where: { id: sectionId } })
    return ok(undefined)
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('EDITABLE_ERROR:')) {
      return fail(error.message.replace('EDITABLE_ERROR:', ''))
    }
    console.error('[deleteSection]', error)
    return fail('Failed to delete section.')
  }
}

/**
 * Reorder sections within a draft revision.
 * Accepts an array of { id, sortOrder } pairs.
 */
export async function reorderSections(
  revisionId: string,
  rawInput: unknown
): Promise<ActionResult<undefined>> {
  try {
    const session = await requireAuth()
    if (!session) return fail('Unauthorized. Please log in.')

    const parsed = ReorderSectionsInputSchema.safeParse(rawInput)
    if (!parsed.success) {
      return fail(parsed.error.errors.map((e) => e.message).join(', '))
    }

    await verifyRevisionIsEditable(revisionId)

    // Verify all section IDs belong to this revision
    const sectionIds = parsed.data.map((item) => item.id)
    const sections = await prisma.pageSection.findMany({
      where: { id: { in: sectionIds }, revisionId },
      select: { id: true },
    })
    if (sections.length !== sectionIds.length) {
      return fail('One or more section IDs do not belong to this revision.')
    }

    await prisma.$transaction(
      parsed.data.map((item) =>
        prisma.pageSection.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        })
      )
    )

    return ok(undefined)
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('EDITABLE_ERROR:')) {
      return fail(error.message.replace('EDITABLE_ERROR:', ''))
    }
    console.error('[reorderSections]', error)
    return fail('Failed to reorder sections.')
  }
}

// ─── CONTENT REFERENCE ACTIONS ────────────────────────────────────────────────

/**
 * Add a content reference to a CONTENT_REFERENCE section.
 * Validates:
 * - Section exists and is CONTENT_REFERENCE type
 * - Target entity exists
 * - Section belongs to a draft revision
 */
export async function addContentReference(
  sectionId: string,
  rawInput: unknown
): Promise<ActionResult<{ referenceId: string }>> {
  try {
    const session = await requireAuth()
    if (!session) return fail('Unauthorized. Please log in.')

    const parsed = ContentReferenceInputSchema.safeParse(rawInput)
    if (!parsed.success) {
      return fail(parsed.error.errors.map((e) => e.message).join(', '))
    }

    const section = await prisma.pageSection.findUnique({
      where: { id: sectionId },
      select: { type: true, revisionId: true },
    })
    if (!section) return fail('Section not found.')
    if (section.type !== 'CONTENT_REFERENCE') {
      return fail('Content references can only be added to CONTENT_REFERENCE sections.')
    }

    await verifyRevisionIsEditable(section.revisionId)

    // Validate target existence
    const validationError = await validateReferenceTarget(parsed.data)
    if (validationError) return fail(validationError)

    const reference = await prisma.pageSectionReference.create({
      data: {
        sectionId,
        sortOrder: parsed.data.sortOrder,
        articleId: parsed.data.articleId ?? null,
        faqId: parsed.data.faqId ?? null,
        teamMemberId: parsed.data.teamMemberId ?? null,
        jobPostingId: parsed.data.jobPostingId ?? null,
      },
    })

    return ok({ referenceId: reference.id })
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('EDITABLE_ERROR:')) {
      return fail(error.message.replace('EDITABLE_ERROR:', ''))
    }
    console.error('[addContentReference]', error)
    return fail('Failed to add content reference.')
  }
}

/**
 * Remove a content reference.
 */
export async function removeContentReference(
  referenceId: string
): Promise<ActionResult<undefined>> {
  try {
    const session = await requireAuth()
    if (!session) return fail('Unauthorized. Please log in.')

    const reference = await prisma.pageSectionReference.findUnique({
      where: { id: referenceId },
      include: { section: { select: { revisionId: true } } },
    })
    if (!reference) return fail('Reference not found.')

    await verifyRevisionIsEditable(reference.section.revisionId)

    await prisma.pageSectionReference.delete({ where: { id: referenceId } })
    return ok(undefined)
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('EDITABLE_ERROR:')) {
      return fail(error.message.replace('EDITABLE_ERROR:', ''))
    }
    console.error('[removeContentReference]', error)
    return fail('Failed to remove content reference.')
  }
}

/**
 * Reorder content references within a section.
 */
export async function reorderContentReferences(
  sectionId: string,
  rawInput: unknown
): Promise<ActionResult<undefined>> {
  try {
    const session = await requireAuth()
    if (!session) return fail('Unauthorized. Please log in.')

    const parsed = z
      .array(z.object({ id: z.string().cuid(), sortOrder: z.number().int().min(0) }))
      .min(1)
      .safeParse(rawInput)
    if (!parsed.success) return fail('Invalid reorder input.')

    const section = await prisma.pageSection.findUnique({
      where: { id: sectionId },
      select: { revisionId: true },
    })
    if (!section) return fail('Section not found.')
    await verifyRevisionIsEditable(section.revisionId)

    const ids = parsed.data.map((r) => r.id)
    const refs = await prisma.pageSectionReference.findMany({
      where: { id: { in: ids }, sectionId },
      select: { id: true },
    })
    if (refs.length !== ids.length) {
      return fail('One or more reference IDs do not belong to this section.')
    }

    await prisma.$transaction(
      parsed.data.map((item) =>
        prisma.pageSectionReference.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        })
      )
    )

    return ok(undefined)
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('EDITABLE_ERROR:')) {
      return fail(error.message.replace('EDITABLE_ERROR:', ''))
    }
    console.error('[reorderContentReferences]', error)
    return fail('Failed to reorder references.')
  }
}

// ─── PUBLISH WORKFLOW ─────────────────────────────────────────────────────────

/**
 * Publish a draft revision.
 * ADMIN only.
 *
 * This is an atomic transaction that:
 * 1. Verifies the user is ADMIN.
 * 2. Verifies the revision belongs to the page.
 * 3. Validates every section and its content.
 * 4. Validates all media references.
 * 5. Validates all content references.
 * 6. Validates SEO metadata.
 * 7. Atomically sets Page.publishedRevisionId and Page.status = PUBLISHED.
 * 8. Revalidates the public route.
 */
export async function publishPageRevision(
  pageId: string,
  revisionId: string
): Promise<ActionResult<{ path: string }>> {
  try {
    const session = await requireAdmin()
    if (!session) return fail('Unauthorized. Admin permission required to publish pages.')

    // Load the full revision for validation
    const revision = await getPageRevision(revisionId)
    if (!revision) return fail('Revision not found.')
    if (revision.pageId !== pageId) return fail('Revision does not belong to the specified page.')

    const page = await prisma.page.findUnique({
      where: { id: pageId },
      select: { path: true, publishedRevisionId: true, key: true },
    })
    if (!page) return fail('Page not found.')

    // Validate all sections
    const sectionErrors: string[] = []
    for (const section of revision.sections) {
      try {
        parseSectionContent(section.type, section.content)
      } catch (e) {
        if (e instanceof z.ZodError) {
          sectionErrors.push(
            `Section [${section.type}] at position ${section.sortOrder}: ${e.errors.map((err) => err.message).join(', ')}`
          )
        } else {
          sectionErrors.push(`Section [${section.type}] has invalid content.`)
        }
      }

      // Validate media reference
      if (section.mediaId) {
        const media = await prisma.media.findUnique({ where: { id: section.mediaId } })
        if (!media) {
          sectionErrors.push(`Section [${section.type}] references a non-existent media item.`)
        }
      }

      // Validate content references
      for (const ref of section.references) {
        const refError = await validateReferenceTarget({
          articleId: ref.articleId,
          faqId: ref.faqId,
          teamMemberId: ref.teamMemberId,
          jobPostingId: ref.jobPostingId,
          sortOrder: ref.sortOrder,
        })
        if (refError) {
          sectionErrors.push(`Section reference error: ${refError}`)
        }
      }
    }

    if (sectionErrors.length > 0) {
      return fail('Publish validation failed:\n' + sectionErrors.join('\n'))
    }

    // Validate SEO
    const seoResult = SeoSchema.safeParse({
      seoTitle: revision.seoTitle,
      metaDescription: revision.metaDescription,
      canonicalUrl: revision.canonicalUrl,
      ogImageId: revision.ogImageId,
    })
    if (!seoResult.success) {
      return fail('SEO validation failed: ' + seoResult.error.errors.map((e) => e.message).join(', '))
    }

    // Validate ogImageId
    if (revision.ogImageId) {
      const media = await prisma.media.findUnique({ where: { id: revision.ogImageId } })
      if (!media) return fail('OG image not found. Please select a valid media item.')
    }

    // Atomically publish
    await prisma.$transaction(async (tx) => {
      await tx.page.update({
        where: { id: pageId },
        data: {
          publishedRevisionId: revisionId,
          status: 'PUBLISHED',
        },
      })
    })

    // Revalidate public route
    revalidatePath(page.path)
    revalidatePath('/admin/pages')

    return ok({ path: page.path })
  } catch (error) {
    console.error('[publishPageRevision]', error)
    return fail('Failed to publish page.')
  }
}

// ─── ROLLBACK ────────────────────────────────────────────────────────────────

/**
 * Roll back the published revision pointer to a previous revision.
 * ADMIN only. Does not delete any revision.
 */
export async function rollbackPageToRevision(
  pageId: string,
  revisionId: string
): Promise<ActionResult<{ path: string }>> {
  try {
    const session = await requireAdmin()
    if (!session) return fail('Unauthorized. Admin permission required to roll back pages.')

    const page = await prisma.page.findUnique({
      where: { id: pageId },
      select: { path: true },
    })
    if (!page) return fail('Page not found.')

    // Verify revision belongs to this page
    const revision = await prisma.pageRevision.findFirst({
      where: { id: revisionId, pageId },
      select: { id: true, version: true },
    })
    if (!revision) return fail('Revision not found or does not belong to this page.')

    // Validate all sections before switching live pointer
    const revisionDetail = await getPageRevision(revisionId)
    if (!revisionDetail) return fail('Could not load revision for validation.')

    for (const section of revisionDetail.sections) {
      try {
        parseSectionContent(section.type, section.content)
      } catch {
        return fail(
          `Revision v${revision.version} contains invalid section content and cannot be used for rollback.`
        )
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.page.update({
        where: { id: pageId },
        data: {
          publishedRevisionId: revisionId,
          status: 'PUBLISHED',
        },
      })
    })

    revalidatePath(page.path)
    revalidatePath('/admin/pages')

    return ok({ path: page.path })
  } catch (error) {
    console.error('[rollbackPageToRevision]', error)
    return fail('Failed to roll back page.')
  }
}

// ─── ARCHIVE ─────────────────────────────────────────────────────────────────

/**
 * Archive a page. ADMIN only. Protected pages cannot be archived.
 */
export async function archivePage(pageId: string): Promise<ActionResult<undefined>> {
  try {
    const session = await requireAdmin()
    if (!session) return fail('Unauthorized. Admin permission required to archive pages.')

    const page = await prisma.page.findUnique({
      where: { id: pageId },
      select: { key: true, path: true, status: true },
    })
    if (!page) return fail('Page not found.')
    if (PROTECTED_PAGE_KEYS.has(page.key)) {
      return fail(`The page "${page.key}" is a protected core page and cannot be archived.`)
    }
    if (page.status === 'ARCHIVED') {
      return fail('This page is already archived.')
    }

    await prisma.page.update({
      where: { id: pageId },
      data: { status: 'ARCHIVED' },
    })

    revalidatePath(page.path)
    revalidatePath('/admin/pages')

    return ok(undefined)
  } catch (error) {
    console.error('[archivePage]', error)
    return fail('Failed to archive page.')
  }
}

// ─── PREVIEW DATA ─────────────────────────────────────────────────────────────

/**
 * Get a draft revision for preview rendering.
 * Requires an authenticated session — never exposed publicly.
 * Returns null if the revision doesn't belong to the page or user is not authenticated.
 */
export async function getPreviewRevision(
  pageId: string,
  revisionId: string
): Promise<ActionResult<PageRevisionDetail>> {
  try {
    const session = await requireAuth()
    if (!session) return fail('Unauthorized. Please log in to preview drafts.')

    const revision = await getDraftRevisionForPreview(pageId, revisionId)
    if (!revision) return fail('Revision not found or does not belong to this page.')

    return ok(revision)
  } catch (error) {
    console.error('[getPreviewRevision]', error)
    return fail('Failed to load preview.')
  }
}

// ─── INTERNAL HELPERS ─────────────────────────────────────────────────────────

/**
 * Verify that a revision is editable (i.e. not the currently published revision).
 * Throws an error with a EDITABLE_ERROR: prefix if the check fails.
 */
async function verifyRevisionIsEditable(revisionId: string): Promise<void> {
  const revision = await prisma.pageRevision.findUnique({
    where: { id: revisionId },
    select: { pageId: true },
  })
  if (!revision) throw new Error('EDITABLE_ERROR:Revision not found.')

  const page = await prisma.page.findUnique({
    where: { id: revision.pageId },
    select: { publishedRevisionId: true },
  })
  if (page?.publishedRevisionId === revisionId) {
    throw new Error('EDITABLE_ERROR:Cannot modify the published revision directly. Create a new draft first.')
  }
}

/**
 * Validate that a reference target exists and is an appropriate entity.
 * Returns an error message string if invalid, or null if valid.
 */
async function validateReferenceTarget(
  data: {
    articleId?: string | null
    faqId?: string | null
    teamMemberId?: string | null
    jobPostingId?: string | null
    sortOrder?: number
  }
): Promise<string | null> {
  if (data.articleId) {
    const article = await prisma.article.findUnique({
      where: { id: data.articleId },
      select: { id: true },
    })
    if (!article) return `Referenced article (ID: ${data.articleId}) does not exist.`
  }
  if (data.faqId) {
    const faq = await prisma.faq.findUnique({
      where: { id: data.faqId },
      select: { id: true },
    })
    if (!faq) return `Referenced FAQ (ID: ${data.faqId}) does not exist.`
  }
  if (data.teamMemberId) {
    const member = await prisma.teamMember.findUnique({
      where: { id: data.teamMemberId },
      select: { id: true },
    })
    if (!member) return `Referenced team member (ID: ${data.teamMemberId}) does not exist.`
  }
  if (data.jobPostingId) {
    const job = await prisma.jobPosting.findUnique({
      where: { id: data.jobPostingId },
      select: { id: true },
    })
    if (!job) return `Referenced job posting (ID: ${data.jobPostingId}) does not exist.`
  }
  return null
}

export async function searchContentReferences(query: string) {
  const session = await requirePermission('pages:edit').catch(() => null)
    if (!session) return { success: false, error: 'Unauthorized.' }

  const [articles, faqs, team, jobs] = await Promise.all([
    prisma.article.findMany({ where: { title: { contains: query, mode: 'insensitive' } }, take: 5, select: { id: true, title: true } }),
    prisma.faq.findMany({ where: { question: { contains: query, mode: 'insensitive' } }, take: 5, select: { id: true, question: true } }),
    prisma.teamMember.findMany({ where: { name: { contains: query, mode: 'insensitive' } }, take: 5, select: { id: true, name: true, designation: true } }),
    prisma.jobPosting.findMany({ where: { title: { contains: query, mode: 'insensitive' } }, take: 5, select: { id: true, title: true } })
  ])

  return { success: true, data: { articles, faqs, team, jobs } }
}
import { CreateServiceIndustryPageSchema } from '@/lib/validations/page'

export async function createServiceOrIndustryPage(rawInput: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await requireAdmin()
    if (!session) return fail('Unauthorized. Admin permission required to create pages.')
    const parsed = CreateServiceIndustryPageSchema.safeParse(rawInput)
    if (!parsed.success) return { success: false, error: 'Validation failed' }
    
    const { type, name, slug } = parsed.data
    const reserved = ['new', 'edit', 'delete']
    if (reserved.includes(slug)) return { success: false, error: 'This slug is reserved and cannot be used.' }
    
    const path = type === 'SERVICE' ? '/services/' + slug : '/industries/' + slug
    const key = type + '_' + slug.replace(/-/g, '_').toUpperCase()
    
    const existing = await prisma.page.findFirst({ where: { OR: [{ path }, { key }] } })
    if (existing) return { success: false, error: 'A page with this URL or Key already exists.' }
    
    const page = await prisma.page.create({
      data: { key, path, status: 'DRAFT' }
    })
    
    const revision = await prisma.pageRevision.create({
      data: { pageId: page.id, version: 1, seoTitle: name + ' | LabourAxis' }
    })
    
    let sortOrder = 0

    if (type === 'SERVICE') {
      // 1. HERO
      await prisma.pageSection.create({
        data: {
          revisionId: revision.id,
          type: 'HERO',
          sortOrder: sortOrder++,
          content: {
            eyebrow: 'Statutory Compliance',
            heading: name,
            description: 'Comprehensive compliance management, structured processes, and advisory support for industrial establishments and growing enterprises.',
            primaryCta: { label: 'Discuss Your Requirement', url: '/contact' },
            secondaryCta: { label: 'Check Your Compliance', url: '/compliance-health-check' }
          }
        }
      })

      // 2. HIGHLIGHTS (FEATURE_LIST)
      await prisma.pageSection.create({
        data: {
          revisionId: revision.id,
          type: 'FEATURE_LIST',
          sortOrder: sortOrder++,
          content: {
            heading: 'Highlights',
            features: [
              { title: 'Statutory Process Setup' },
              { title: 'Policies & Registers Governance' },
              { title: 'Contractor Compliance Audits' },
              { title: 'Inspection Readiness Support' },
              { title: 'Monthly Returns & Operations' }
            ]
          }
        }
      })

      // 3. THE CHALLENGE (TEXT_IMAGE)
      await prisma.pageSection.create({
        data: {
          revisionId: revision.id,
          type: 'TEXT_IMAGE',
          sortOrder: sortOrder++,
          content: {
            heading: 'The Challenge',
            body: `<p>Many organizations expand operations before formalizing structured statutory compliance processes.</p><ul><li>Inconsistent register maintenance across departments</li><li>Complex contractor compliance and billing verification</li><li>Difficulty keeping track of evolving statutory filing deadlines</li><li>Risk of regulatory inspection notices and monetary penalties</li></ul><p>LabourAxis helps transition ad-hoc compliance into a reliable, structured, and audit-ready framework.</p>`,
            imagePosition: 'right'
          }
        }
      })

      // 4. OUR SERVICES / WHAT WE HELP WITH (FEATURE_LIST)
      await prisma.pageSection.create({
        data: {
          revisionId: revision.id,
          type: 'FEATURE_LIST',
          sortOrder: sortOrder++,
          content: {
            heading: 'Our Services',
            features: [
              { title: 'Diagnostic Health Check', description: 'Comprehensive review of existing documentation, licenses, and statutory registrations.' },
              { title: 'Registers & Records Setup', description: 'Establishment of standardized physical and electronic statutory registers.' },
              { title: 'Vendor & Contractor Audits', description: 'Monthly wage sheet scrutiny, challan reconciliation, and remittance verification.' },
              { title: 'License & Registration Advisory', description: 'Timely filing for new registrations, amendments, and periodic license renewals.' },
              { title: 'Notice & Inspection Assistance', description: 'Expert guidance on drafting replies, compiling evidence, and liaison support.' },
              { title: 'Recurring Monthly Filings', description: 'End-to-end statutory preparation, challan generation, and portal submissions.' }
            ]
          }
        }
      })

      // 5. WHO WE SUPPORT (FEATURE_LIST)
      await prisma.pageSection.create({
        data: {
          revisionId: revision.id,
          type: 'FEATURE_LIST',
          sortOrder: sortOrder++,
          content: {
            heading: 'Who We Support',
            features: [
              { title: 'Growing Enterprises', description: 'Companies expanding headcount needing repeatable statutory routines.' },
              { title: 'MSMEs & Businesses', description: 'Organizations seeking proactive risk reduction and regulatory clarity.' },
              { title: 'Industrial & Factory Units', description: 'Establishments subject to extensive statutory safety and operational laws.' },
              { title: 'Principal Employers', description: 'Organizations engaging multiple contractors requiring vendor governance.' }
            ]
          }
        }
      })

      // 6. DELIVERABLES & COMMON GAPS (FEATURE_LIST)
      await prisma.pageSection.create({
        data: {
          revisionId: revision.id,
          type: 'FEATURE_LIST',
          sortOrder: sortOrder++,
          content: {
            heading: 'Deliverables & Common Gaps',
            features: [
              { title: 'Quarterly Diagnostic Health Scorecard' },
              { title: 'Standardized Statutory Registers' },
              { title: 'Contractor Compliance Summary Reports' },
              { title: 'Statutory Filing Confirmation Archives' },
              { title: 'Missing or outdated statutory registers' },
              { title: 'Unverified contractor PF/ESIC deposits' },
              { title: 'Lapsed establishment licenses' },
              { title: 'Incomplete employee nomination records' }
            ]
          }
        }
      })

      // 7. CTA BANNER
      await prisma.pageSection.create({
        data: {
          revisionId: revision.id,
          type: 'CTA_BANNER',
          sortOrder: sortOrder++,
          content: {
            heading: 'Ready to establish a structured statutory compliance framework?',
            description: 'Speak with our senior compliance specialists for a diagnostic review.',
            primaryCta: { label: 'Discuss Your Requirement', url: '/contact' }
          }
        }
      })
    } else {
      // INDUSTRY TEMPLATE
      // 1. HERO
      await prisma.pageSection.create({
        data: {
          revisionId: revision.id,
          type: 'HERO',
          sortOrder: sortOrder++,
          content: {
            eyebrow: name,
            heading: `${name} Compliance & Workforce Advisory`,
            description: `Specialized statutory compliance and HR operations frameworks designed specifically for the ${name.toLowerCase()} sector.`,
            primaryCta: { label: 'Request Industry Consultation', url: '/contact' }
          }
        }
      })

      // 2. INDUSTRY CHALLENGES (FEATURE_LIST)
      await prisma.pageSection.create({
        data: {
          revisionId: revision.id,
          type: 'FEATURE_LIST',
          sortOrder: sortOrder++,
          content: {
            heading: 'Industry Challenges',
            features: [
              { title: 'Workforce Volatility', description: 'Managing high turnover and seasonal demand while staying statutory compliant.' },
              { title: 'Contractor Management', description: 'Ensuring multi-tier vendor compliance with CLRA and wage requirements.' },
              { title: 'Operational Audits', description: 'Handling recurring regulatory inspections and factory safety norms.' }
            ]
          }
        }
      })

      // 3. HR & COMPLIANCE REQUIREMENTS (TEXT_IMAGE)
      await prisma.pageSection.create({
        data: {
          revisionId: revision.id,
          type: 'TEXT_IMAGE',
          sortOrder: sortOrder++,
          content: {
            heading: 'HR & Compliance Requirements',
            body: `<h3>Core Statutory Focus</h3><ul><li>Establishment and factory licensing and timely renewals</li><li>Contract labour licensing, wage registers, and challan tracking</li><li>Workplace health, safety registers, and accident reporting</li><li>Standing orders and grievance redressal mechanisms</li></ul>`,
            imagePosition: 'right'
          }
        }
      })

      // 4. CORE ENGAGEMENT AREAS (FEATURE_LIST)
      await prisma.pageSection.create({
        data: {
          revisionId: revision.id,
          type: 'FEATURE_LIST',
          sortOrder: sortOrder++,
          content: {
            heading: 'Core Engagement Areas',
            features: [
              { title: 'Statutory Health Audit', description: 'Comprehensive diagnostic of existing registrations and compliance status.' },
              { title: 'Vendor Governance Systems', description: 'Structured verification for outsourced and third-party staffing.' },
              { title: 'Liaison & Notice Advisory', description: 'Expert guidance during statutory visits, audits, and inquiries.' }
            ]
          }
        }
      })

      // 5. WHO WE SUPPORT (FEATURE_LIST)
      await prisma.pageSection.create({
        data: {
          revisionId: revision.id,
          type: 'FEATURE_LIST',
          sortOrder: sortOrder++,
          content: {
            heading: 'Who We Support',
            features: [
              { title: 'Operating Plants & Factories' },
              { title: 'Logistics & Warehousing Hubs' },
              { title: 'Commercial & Multi-Branch Units' },
              { title: 'Infrastructure & Project Sites' }
            ]
          }
        }
      })

      // 6. CTA BANNER
      await prisma.pageSection.create({
        data: {
          revisionId: revision.id,
          type: 'CTA_BANNER',
          sortOrder: sortOrder++,
          content: {
            heading: `Build a resilient compliance structure for your ${name.toLowerCase()} enterprise.`,
            description: 'Connect with our industry specialists for a tailored compliance roadmap.',
            primaryCta: { label: 'Contact Us', url: '/contact' }
          }
        }
      })
    }
    
    revalidatePath('/admin/pages')
    return { success: true, data: { id: page.id } }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create page' }
  }
}
