import prisma from '@/lib/prisma'
import { PageStatus, SectionType } from '@prisma/client'

// ─── TYPES ───────────────────────────────────────────────────────────────────

export interface AdminPageListItem {
  id: string
  key: string
  path: string
  status: PageStatus
  publishedRevisionId: string | null
  revisionCount: number
  latestVersion: number | null
  publishedVersion: number | null
  hasDraft: boolean
  updatedAt: Date
  createdAt: Date
}

export interface AdminPageDetail {
  id: string
  key: string
  path: string
  status: PageStatus
  publishedRevisionId: string | null
  revisions: PageRevisionSummary[]
  publishedRevision: PageRevisionDetail | null
  createdAt: Date
  updatedAt: Date
}

export interface PageRevisionSummary {
  id: string
  pageId: string
  version: number
  seoTitle: string | null
  metaDescription: string | null
  canonicalUrl: string | null
  ogImageId: string | null
  createdById: string | null
  createdAt: Date
  sectionCount: number
  isPublished: boolean
}

export interface PageRevisionDetail {
  id: string
  pageId: string
  version: number
  seoTitle: string | null
  metaDescription: string | null
  canonicalUrl: string | null
  ogImageId: string | null
  ogImage: { id: string; url: string; altText: string | null } | null
  createdById: string | null
  createdBy: { id: string; name: string | null; email: string } | null
  createdAt: Date
  sections: PageSectionDetail[]
  isPublished?: boolean
}

export interface PageSectionDetail {
  id: string
  revisionId: string
  type: SectionType
  sortOrder: number
  isVisible: boolean
  schemaVersion: number
  content: Record<string, unknown>
  mediaId: string | null
  media: { id: string; url: string; altText: string | null } | null
  references: PageSectionReferenceDetail[]
}

export interface PageSectionReferenceDetail {
  id: string
  sectionId: string
  sortOrder: number
  articleId: string | null
  faqId: string | null
  teamMemberId: string | null
  jobPostingId: string | null
  article: { id: string; title: string; slug: string; published: boolean } | null
  faq: { id: string; question: string; published: boolean } | null
  teamMember: { id: string; name: string; designation: string; isActive: boolean } | null
  jobPosting: { id: string; title: string; slug: string; status: string } | null
}

export interface PublicPageData {
  id: string
  key: string
  path: string
  revision: PageRevisionDetail
}

// ─── SECTION INCLUDES HELPER ──────────────────────────────────────────────────

const sectionIncludes = {
  media: { select: { id: true, url: true, altText: true } },
  references: {
    orderBy: { sortOrder: 'asc' as const },
    include: {
      article: { select: { id: true, title: true, slug: true, published: true } },
      faq: { select: { id: true, question: true, published: true } },
      teamMember: { select: { id: true, name: true, designation: true, isActive: true } },
      jobPosting: { select: { id: true, title: true, slug: true, status: true } },
    },
  },
}

const revisionIncludes = {
  ogImage: { select: { id: true, url: true, altText: true } },
  createdBy: { select: { id: true, name: true, email: true } },
  sections: {
    orderBy: { sortOrder: 'asc' as const },
    include: sectionIncludes,
  },
}

// ─── ADMIN DATA ACCESS ────────────────────────────────────────────────────────

/**
 * List all pages for the admin panel, ordered by path.
 */
export async function getAdminPages(): Promise<AdminPageListItem[]> {
  const pages = await prisma.page.findMany({
    orderBy: { path: 'asc' },
    include: {
      revisions: {
        select: { id: true, version: true },
        orderBy: { version: 'desc' },
      },
    },
  })

  return pages.map((page) => {
    const publishedRev = page.revisions.find(r => r.id === page.publishedRevisionId)
    const hasDraft = publishedRev 
      ? page.revisions.some(r => r.version > publishedRev.version)
      : page.revisions.length > 0
    
    return {
      id: page.id,
      key: page.key,
      path: page.path,
      status: page.status,
      publishedRevisionId: page.publishedRevisionId,
      revisionCount: page.revisions.length,
      latestVersion: page.revisions[0]?.version ?? null,
      publishedVersion: publishedRev?.version ?? null,
      hasDraft,
      updatedAt: page.updatedAt,
      createdAt: page.createdAt,
    }
  })
}

/**
 * Get a single page with all revisions for the admin panel.
 */
export async function getAdminPageById(id: string): Promise<AdminPageDetail | null> {
  const page = await prisma.page.findUnique({
    where: { id },
    include: {
      publishedRevision: { include: revisionIncludes },
      revisions: {
        orderBy: { version: 'desc' },
        include: {
          _count: { select: { sections: true } },
        },
      },
    },
  })

  if (!page) return null

  return {
    id: page.id,
    key: page.key,
    path: page.path,
    status: page.status,
    publishedRevisionId: page.publishedRevisionId,
    revisions: page.revisions.map((rev) => ({
      id: rev.id,
      pageId: rev.pageId,
      version: rev.version,
      seoTitle: rev.seoTitle,
      metaDescription: rev.metaDescription,
      canonicalUrl: rev.canonicalUrl,
      ogImageId: rev.ogImageId,
      createdById: rev.createdById,
      createdAt: rev.createdAt,
      sectionCount: rev._count.sections,
      isPublished: rev.id === page.publishedRevisionId,
    })),
    publishedRevision: page.publishedRevision
      ? mapRevisionToDetail(page.publishedRevision, page.publishedRevisionId)
      : null,
    createdAt: page.createdAt,
    updatedAt: page.updatedAt,
  }
}

/**
 * Get a single page by its unique key (e.g. 'HOME', 'ABOUT').
 */
export async function getAdminPageByKey(key: string): Promise<AdminPageDetail | null> {
  const page = await prisma.page.findUnique({ where: { key } })
  if (!page) return null
  return getAdminPageById(page.id)
}

/**
 * Get a specific revision with full section data (admin use).
 */
export async function getPageRevision(revisionId: string): Promise<PageRevisionDetail | null> {
  const revision = await prisma.pageRevision.findUnique({
    where: { id: revisionId },
    include: revisionIncludes,
  })

  if (!revision) return null

  // Verify if this revision is the published one
  const page = await prisma.page.findUnique({
    where: { id: revision.pageId },
    select: { publishedRevisionId: true },
  })

  return mapRevisionToDetail(revision, page?.publishedRevisionId ?? null)
}

/**
 * Get the full revision history for a page (admin).
 */
export async function getPageRevisionHistory(pageId: string): Promise<PageRevisionSummary[]> {
  const page = await prisma.page.findUnique({
    where: { id: pageId },
    select: { publishedRevisionId: true },
  })

  const revisions = await prisma.pageRevision.findMany({
    where: { pageId },
    orderBy: { version: 'desc' },
    include: {
      _count: { select: { sections: true } },
    },
  })

  return revisions.map((rev) => ({
    id: rev.id,
    pageId: rev.pageId,
    version: rev.version,
    seoTitle: rev.seoTitle,
    metaDescription: rev.metaDescription,
    canonicalUrl: rev.canonicalUrl,
    ogImageId: rev.ogImageId,
    createdById: rev.createdById,
    createdAt: rev.createdAt,
    sectionCount: rev._count.sections,
    isPublished: rev.id === page?.publishedRevisionId,
  }))
}

// ─── PUBLIC DATA ACCESS ───────────────────────────────────────────────────────

/**
 * Get a page for public rendering — ONLY returns the published revision.
 * NEVER returns draft data to public callers.
 */
export async function getPublicPageByPath(path: string): Promise<PublicPageData | null> {
  const page = await prisma.page.findUnique({
    where: { path, status: 'PUBLISHED' },
    include: {
      publishedRevision: { include: revisionIncludes },
    },
  })

  if (!page || !page.publishedRevision) return null

  return {
    id: page.id,
    key: page.key,
    path: page.path,
    revision: mapRevisionToDetail(page.publishedRevision, page.publishedRevisionId),
  }
}

/**
 * Get the published revision for a page (public renderer).
 */
export async function getPublishedRevision(pageId: string): Promise<PageRevisionDetail | null> {
  const page = await prisma.page.findUnique({
    where: { id: pageId, status: 'PUBLISHED' },
    include: {
      publishedRevision: { include: revisionIncludes },
    },
  })

  if (!page?.publishedRevision) return null
  return mapRevisionToDetail(page.publishedRevision, page.publishedRevisionId)
}

/**
 * Get a draft revision for preview — for authenticated admin use ONLY.
 * Never exposed to public rendering.
 */
export async function getDraftRevisionForPreview(
  pageId: string,
  revisionId: string
): Promise<PageRevisionDetail | null> {
  const revision = await prisma.pageRevision.findFirst({
    where: {
      id: revisionId,
      pageId, // must belong to the specified page
    },
    include: revisionIncludes,
  })

  if (!revision) return null

  const page = await prisma.page.findUnique({
    where: { id: pageId },
    select: { publishedRevisionId: true },
  })

  return mapRevisionToDetail(revision, page?.publishedRevisionId ?? null)
}

// ─── INTERNAL MAPPER ──────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRevisionToDetail(revision: any, publishedRevisionId: string | null): PageRevisionDetail {
  return {
    id: revision.id,
    pageId: revision.pageId,
    version: revision.version,
    seoTitle: revision.seoTitle,
    metaDescription: revision.metaDescription,
    canonicalUrl: revision.canonicalUrl,
    ogImageId: revision.ogImageId,
    ogImage: revision.ogImage ?? null,
    createdById: revision.createdById,
    createdBy: revision.createdBy ?? null,
    createdAt: revision.createdAt,
    isPublished: revision.id === publishedRevisionId,
    sections: (revision.sections ?? []).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (section: any): PageSectionDetail => ({
        id: section.id,
        revisionId: section.revisionId,
        type: section.type as SectionType,
        sortOrder: section.sortOrder,
        isVisible: section.isVisible,
        schemaVersion: section.schemaVersion,
        content: (section.content ?? {}) as Record<string, unknown>,
        mediaId: section.mediaId,
        media: section.media ?? null,
        references: (section.references ?? []).map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (ref: any): PageSectionReferenceDetail => ({
            id: ref.id,
            sectionId: ref.sectionId,
            sortOrder: ref.sortOrder,
            articleId: ref.articleId,
            faqId: ref.faqId,
            teamMemberId: ref.teamMemberId,
            jobPostingId: ref.jobPostingId,
            article: ref.article ?? null,
            faq: ref.faq ?? null,
            teamMember: ref.teamMember ?? null,
            jobPosting: ref.jobPosting ?? null,
          })
        ),
      })
    ),
  }
}
