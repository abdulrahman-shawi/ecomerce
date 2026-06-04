"use server";

import { prisma } from "@/lib/prisma";
import { HomeProduct } from "./home";

export async function searchProducts(query: string): Promise<HomeProduct[]> {
  const trimmed = query.trim();

  if (!trimmed) {
    return [];
  }

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      OR: [
        { name: { contains: trimmed, mode: "insensitive" } },
        { description: { contains: trimmed, mode: "insensitive" } },
        { seoSlug: { contains: trimmed, mode: "insensitive" } },
        {
          category: {
            name: { contains: trimmed, mode: "insensitive" },
          },
        },
      ],
    },
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      images: true,
      stocks: {
        orderBy: { price: "asc" },
        take: 1,
      },
      orderItems: true,
    },
  });

  return products.map((p) => {
    const stock = p.stocks[0];
    const image =
      p.images.find((img) => img.type === "main")?.url ||
      p.images[0]?.url ||
      "/images/products/placeholder.jpg";

    const price = stock
      ? stock.price * (1 - stock.discount / 100)
      : p.affiliatePrice;
    const originalPrice = stock && stock.discount > 0 ? stock.price : null;

    return {
      id: p.id,
      name: p.name,
      description: p.description,
      image,
      price: Math.round(price),
      originalPrice: originalPrice ? Math.round(originalPrice) : null,
      badge: getBadge(p),
      categoryName: p.category?.name ?? null,
    };
  });
}

export async function getProductsByCategory(
  slug: string
): Promise<{ categoryName: string; products: HomeProduct[] } | null> {
  const category = await prisma.category.findUnique({
    where: { slug },
  });

  if (!category) {
    // جرب البحث بالـ id إذا لم يكن slug موجوداً
    const catById = await prisma.category.findUnique({
      where: { id: parseInt(slug) || 0 },
    });
    if (!catById) return null;
    return fetchCategoryProducts(catById);
  }

  return fetchCategoryProducts(category);
}

async function fetchCategoryProducts(category: { id: number; name: string }) {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      categoryId: category.id,
    },
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      images: true,
      stocks: {
        orderBy: { price: "asc" },
        take: 1,
      },
      orderItems: true,
    },
  });

  const mapped: HomeProduct[] = products.map((p) => {
    const stock = p.stocks[0];
    const image =
      p.images.find((img) => img.type === "main")?.url ||
      p.images[0]?.url ||
      "/images/products/placeholder.jpg";

    const price = stock
      ? stock.price * (1 - stock.discount / 100)
      : p.affiliatePrice;
    const originalPrice = stock && stock.discount > 0 ? stock.price : null;

    return {
      id: p.id,
      name: p.name,
      description: p.description,
      image,
      price: Math.round(price),
      originalPrice: originalPrice ? Math.round(originalPrice) : null,
      badge: getBadge(p),
      categoryName: p.category?.name ?? null,
    };
  });

  return { categoryName: category.name, products: mapped };
}

function getBadge(product: {
  orderItems: unknown[];
  createdAt: Date;
  stocks: { discount: number }[];
}): string | null {
  if (product.orderItems.length > 5) return "الأكثر مبيعاً";
  const now = new Date();
  const daysSinceCreated =
    (now.getTime() - product.createdAt.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceCreated <= 30) return "جديد";
  if (product.stocks[0]?.discount > 0) return "عرض";
  return null;
}
