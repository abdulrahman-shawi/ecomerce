"use server";

import { prisma } from "@/lib/prisma";

function normalizeSlug(slug: string) {
  return decodeURIComponent(slug)
    .replace(/[-\s_]+/g, "")
    .toLowerCase();
}

export async function getPageBySlug(slug: string) {
  const normalized = normalizeSlug(slug);

  const pages = await prisma.page.findMany({
    where: { isPublished: true },
  });

  return (
    pages.find((page) => normalizeSlug(page.slug) === normalized) || null
  );
}

export async function getPublishedPages() {
  return prisma.page.findMany({
    where: { isPublished: true },
    select: {
      id: true,
      slug: true,
      title: true,
    },
    orderBy: { createdAt: "asc" },
  });
}
