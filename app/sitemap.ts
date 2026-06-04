import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://skynova.store";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/checkout`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // Active categories
  const categories = await prisma.category.findMany({
    select: { slug: true, id: true, createdAt: true },
  });

  const categoryPages: MetadataRoute.Sitemap = categories
    .filter((c) => c.slug)
    .map((category) => ({
      url: `${baseUrl}/category/${category.slug}`,
      lastModified: category.createdAt,
      changeFrequency: "daily",
      priority: 0.8,
    }));

  // Active products
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { seoSlug: true, id: true, createdAt: true },
  });

  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${baseUrl}/product/${product.seoSlug ?? product.id}`,
    lastModified: product.createdAt,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  return [...staticPages, ...categoryPages, ...productPages];
}
