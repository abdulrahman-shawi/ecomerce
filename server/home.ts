"use server"

import { prisma } from "@/lib/prisma";
import { getWarehouseIdsByCountry, type CountryCode } from "@/lib/region";

export interface HomeProduct {
  id: number;
  name: string;
  description: string | null;
  image: string;
  price: number;
  originalPrice: number | null;
  badge: string | null;
  categoryName: string | null;
  seoSlug?: string | null;
  averageRating?: number;
  totalReviews?: number;
  stock: number;
}

export interface HomeCategory {
  id: number;
  name: string;
  slug: string | null;
  image: string;
}

export async function getHomePageData(country?: string) {
  const activeCountry: CountryCode = country === "TR" ? "TR" : "SY";
  const warehouseIds = await getWarehouseIdsByCountry(activeCountry);

  // Fetch categories
  const categories = await prisma.category.findMany({
    take: 6,
    orderBy: { createdAt: "desc" },
  });

  // Fetch featured products available in warehouses matching the selected country
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      stocks: {
        some: {
          warehouseId: { in: warehouseIds },
        },
      },
    },
    take: 12,
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      images: true,
      stocks: {
        where: {
          warehouseId: { in: warehouseIds },
        },
        orderBy: { price: "asc" },
      },
      orderItems: true,
      reviews: { where: { isApproved: true } },
    },
  });

  // Map products to home product type
  const featuredProducts: HomeProduct[] = products.map((p) => {
    const stock = p.stocks[0];
    const image = p.images.find((img) => img.type === "main")?.url
      || p.images[0]?.url
      || "/images/products/placeholder.jpg";

    const price = stock ? stock.discount : p.affiliatePrice;
    const originalPrice = stock?.price ?? null;
    const totalStock = p.stocks.reduce((sum, s) => sum + s.quantity, 0);

    const approvedReviews = p.reviews ?? [];
    const totalReviews = approvedReviews.length;
    const averageRating =
      totalReviews > 0
        ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;

    return {
      id: p.id,
      name: p.name,
      description: p.description,
      image,
      price: Math.round(price),
      originalPrice: originalPrice ? Math.round(originalPrice) : null,
      badge: getBadge(p),
      categoryName: p.category?.name ?? null,
      seoSlug: p.seoSlug,
      averageRating: totalReviews > 0 ? Math.round(averageRating * 10) / 10 : undefined,
      totalReviews: totalReviews > 0 ? totalReviews : undefined,
      stock: totalStock,
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
    image: c.image ?? "/images/categories/placeholder.jpg",
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
