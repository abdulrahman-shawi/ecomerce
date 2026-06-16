"use server";

import { prisma } from "@/lib/prisma";

export async function getPageBySlug(slug: string) {
  return prisma.page.findUnique({
    where: {
      slug,
      isPublished: true,
    },
  });
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
