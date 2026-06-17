export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { Metadata } from "next";
import LandingOrder from "./LandingOrder";
import { getProductBySlug } from "@/server/products";
import { getServerCountry } from "@/lib/region";
import { getGeneralSettings } from "@/server/settings";

interface LandingPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: LandingPageProps): Promise<Metadata> {
  const product = await getProductBySlug(params.slug, getServerCountry());

  if (!product) {
    return {
      title: "العرض غير متوفر | SKYNOVA",
      description: "عذراً، العرض المطلوب غير متوفر حالياً.",
    };
  }

  return {
    title: `${product.name} - عرض خاص | SKYNOVA`,
    description: product.description ?? `احصل على ${product.name} بأفضل سعر مع توصيل سريع ودفع عند الاستلام.`,
  };
}

export default async function LandingPage({ params }: LandingPageProps) {
  const [product, settings] = await Promise.all([
    getProductBySlug(params.slug, getServerCountry()),
    getGeneralSettings(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <LandingOrder
      product={{
        id: product.id,
        name: product.name,
        description: product.description,
        image: product.image,
        price: product.price,
        originalPrice: product.originalPrice,
        currency: settings.siteCurrency,
      }}
    />
  );
}
