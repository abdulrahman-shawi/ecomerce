"use server"

import { prisma } from "@/lib/prisma";
import { getProductImageUrl } from "@/lib/vercel-blob";

export interface HomeProduct {
  id: number;
  name: string;
  description: string | null;
  image: string;
  price: number;
  originalPrice: number | null;
  badge: string | null;
  categoryName: string | null;
}

export interface HomeCategory {
  id: number;
  name: string;
  slug: string | null;
  image: string;
}

export async function getHomePageData() {
  // Fetch categories
  const categories = await prisma.category.findMany({
    take: 6,
    orderBy: { createdAt: "desc" },
  });

  // Fetch featured products (latest 8 active products with images & stock)
  const products = await prisma.product.findMany({
    where: { isActive: true },
    take: 12,
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

  // Fetch Vercel Blob images for all products in parallel
  const blobImageUrls = await Promise.all(
    products.map((p) => getProductImageUrl(p.id))
  );

  // Map products to home product type
  const featuredProducts: HomeProduct[] = products.map((p, idx) => {
    const stock = p.stocks[0];

    // Priority: Vercel Blob → DB main image → first DB image → placeholder
    const blobUrl = blobImageUrls[idx];
    const dbImage = p.images.find((img) => img.type === "main")?.url
      || p.images[0]?.url;
    const image = blobUrl || dbImage || "/images/products/placeholder.jpg";

    const price = stock ? stock.price * (1 - stock.discount / 100) : p.affiliatePrice;
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

  // Sort bestsellers by number of orders
  const bestSellers = [...featuredProducts]
    .sort((a, b) => {
      const aOrders = products.find((p) => p.id === a.id)?.orderItems.length ?? 0;
      const bOrders = products.find((p) => p.id === b.id)?.orderItems.length ?? 0;
      return bOrders - aOrders;
    })
    .slice(0, 8);

  // Map categories
  const homeCategories: HomeCategory[] = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    image: "/images/categories/placeholder.jpg",
  }));

  return {
    featuredProducts,
    bestSellers,
    categories: homeCategories,
  };
}

function getBadge(product: {
  orderItems: unknown[];
  createdAt: Date;
  stocks: { discount: number }[];
}): string | null {
  if (product.orderItems.length > 5) return "الأكثر مبيعاً";
  const now = new Date();
  const daysSinceCreated = (now.getTime() - product.createdAt.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceCreated <= 30) return "جديد";
  if (product.stocks[0]?.discount > 0) return "عرض";
  return null;
}
