import { MetadataRoute } from "next";
import { servicesData } from "@/data/services";
import { industriesData } from "@/data/industries";
import { resourcesData } from "@/data/resources";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.labouraxis.com";

  // Static routes
  const staticRoutes = [
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

  // Dynamic service routes
  const serviceRoutes = servicesData.map((service) => ({
    url: `${siteUrl}/services/${service.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  // Dynamic industry routes
  const industryRoutes = industriesData.map((industry) => ({
    url: `${siteUrl}/industries/${industry.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  // Dynamic resource routes
  const resourceRoutes = resourcesData.map((resource) => ({
    url: `${siteUrl}/resources/${resource.category}/${resource.slug}`,
    lastModified: resource.updatedAt ? new Date(resource.updatedAt) : new Date(resource.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...serviceRoutes, ...industryRoutes, ...resourceRoutes];
}
