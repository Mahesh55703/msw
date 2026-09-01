import { MetadataRoute } from "next";
import prisma from "@/lib/prisma";
import { servicesData } from "@/data/services";
import { industriesData } from "@/data/industries";
import { resourcesData } from "@/data/resources";
import { safeFetchJobs } from "@/lib/db/careers";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.labouraxis.com";

  // 1. Static Core Routes
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/about",
    "/team",
    "/careers",
    "/contact",
    "/compliance-health-check",
    "/services",
    "/industries",
    "/resources",
    "/resources/articles",
    "/resources/guides",
    "/resources/checklists",
    "/resources/updates",
    "/resources/faqs",
    "/privacy-policy",
    "/terms",
    "/disclaimer",
  ].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  // 2. Dynamic Service Routes
  const serviceRoutes: MetadataRoute.Sitemap = servicesData.map((service) => ({
    url: `${siteUrl}/services/${service.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  // 3. Dynamic Industry Routes
  const industryRoutes: MetadataRoute.Sitemap = industriesData.map((industry) => ({
    url: `${siteUrl}/industries/${industry.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  // 4. Dynamic Published Resources (Prisma DB + Static Fallback)
  let dbArticles: { slug: string; category: string; updatedAt: Date; publishedAt: Date | null }[] = [];
  let unpublishedSlugs: Set<string> = new Set();
  try {
    const [publishedItems, drafts] = await Promise.all([
      prisma.article.findMany({
        where: { published: true, category: { not: 'faqs' } },
        select: { slug: true, category: true, updatedAt: true, publishedAt: true },
      }),
      prisma.article.findMany({
        where: { published: false },
        select: { slug: true },
      }),
    ]);
    dbArticles = publishedItems;
    unpublishedSlugs = new Set(drafts.map((d) => d.slug));
  } catch (e) {
    console.error("Prisma error in sitemap generation", e);
  }

  const resourceMap = new Map<string, { url: string; lastModified: Date; changeFrequency: "monthly"; priority: number }>();

  // Add static resources (excluding any explicitly unpublished in DB)
  for (const resource of resourcesData) {
    if (unpublishedSlugs.has(resource.slug)) continue;
    if (resource.type === 'faq') continue; // Do not create individual pages for FAQs
    const cat = resource.type === 'guide' ? 'guides' : resource.type === 'checklist' ? 'checklists' : resource.type === 'update' ? 'updates' : 'articles';
    resourceMap.set(resource.slug, {
      url: `${siteUrl}/resources/${cat}/${resource.slug}`,
      lastModified: resource.updatedAt ? new Date(resource.updatedAt) : new Date(resource.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    });
  }

  // Override/append with published DB articles
  for (const article of dbArticles) {
    resourceMap.set(article.slug, {
      url: `${siteUrl}/resources/${article.category}/${article.slug}`,
      lastModified: article.updatedAt || article.publishedAt || new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    });
  }

  const resourceRoutes = Array.from(resourceMap.values());

  // 5. Dynamic Published Active Careers (only PUBLISHED & not expired)
  let careerRoutes: MetadataRoute.Sitemap = [];
  try {
    const { jobs } = await safeFetchJobs({ where: { status: "published" } });
    careerRoutes = jobs
      .filter((j) => j.isCurrentlyActive)
      .map((job) => ({
        url: `${siteUrl}/careers/${job.slug}`,
        lastModified: job.updatedAt || job.publishedAt || new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));
  } catch (e) {
    console.error("Error in careers sitemap generation", e);
  }

  return [...staticRoutes, ...serviceRoutes, ...industryRoutes, ...resourceRoutes, ...careerRoutes];
}
