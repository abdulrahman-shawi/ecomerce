export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { Metadata } from "next";
import LandingOrder from "./LandingOrder";
import { getLandingProduct } from "@/server/products";
import { getServerCountry } from "@/lib/region";
import { getGeneralSettings } from "@/server/settings";
import { getProductReviews } from "@/server/reviews";

interface LandingPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: LandingPageProps): Promise<Metadata> {
  const product = await getLandingProduct(params.slug, getServerCountry());

  if (!product) {
    return {
      title: "العرض غير متوفر | SKYNOVA",
      description: "عذراً، العرض المطلوب غير متوفر حالياً.",
    };
  }

  const title = product.landingPage?.heroTitle || product.name;
  const description = product.landingPage?.heroDescription || product.description || `احصل على ${product.name} بأفضل سعر مع توصيل سريع ودفع عند الاستلام.`;

  return {
    title: `${title} - عرض خاص | SKYNOVA`,
    description,
    openGraph: {
      title: `${title} - عرض خاص | SKYNOVA`,
      description,
      images: [{ url: product.image, width: 800, height: 800, alt: product.name }],
      type: "website",
      locale: "ar_AR",
    },
  };
}

export default async function LandingPage({ params }: LandingPageProps) {
  const product = await getLandingProduct(params.slug, getServerCountry());

  if (!product) {
    notFound();
  }

  const [settings, reviewsData] = await Promise.all([
    getGeneralSettings(),
    getProductReviews(product.id),
  ]);

  return (
    <LandingOrder
      product={{
        id: product.id,
        name: product.name,
        description: product.description,
        image: product.image,
        images: product.images,
        price: product.price,
        originalPrice: product.originalPrice,
        currency: settings.siteCurrency,
        averageRating: reviewsData.averageRating || product.averageRating,
        totalReviews: reviewsData.totalReviews || product.totalReviews,
        stock: product.stock,
        showInAds: product.showInAds,
        landingPage: product.landingPage,
      }}
      reviews={reviewsData.reviews}
      siteName={settings.siteName}
    />
  );
}
