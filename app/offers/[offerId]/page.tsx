export const dynamic = "force-dynamic";

import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Tag } from "lucide-react";
import Header from "@/component/sections/Header";
import Footer from "@/component/sections/Footer";
import TopBanner from "@/component/sections/TopBanner";
import CartDrawer from "@/component/CartDrawer";
import ProductCard from "@/component/ProductCard";
import { getOfferProducts } from "@/server/home";
import { getServerCountry } from "@/lib/region";

interface OfferPageProps {
  params: { offerId: string };
}

export async function generateMetadata({ params }: OfferPageProps): Promise<Metadata> {
  const offer = await getOfferProducts(params.offerId, getServerCountry());

  if (!offer) {
    return {
      title: "العرض غير موجود | SKYNOVA",
      description: "العرض الذي تبحثين عنه غير متوفر حالياً.",
    };
  }

  return {
    title: `${offer.title} | SKYNOVA`,
    description: offer.description,
  };
}

export default async function OfferPage({ params }: OfferPageProps) {
  const offer = await getOfferProducts(params.offerId, getServerCountry());

  if (!offer) {
    notFound();
  }

  return (
    <div dir="rtl" className="font-tajawal min-h-screen bg-white">
      <TopBanner />
      <Header />

      <main className="py-12 bg-gray-light min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
            <div>
              <div className="flex items-center gap-2 text-pink mb-3">
                <Tag size={18} />
                <span className="font-medium">{offer.badge}</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-dark mb-2">
                {offer.title}
              </h1>
              <p className="text-gray-500 max-w-2xl leading-8">
                {offer.description}
              </p>
            </div>

            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-gray-200 bg-white text-gray-700 hover:border-pink hover:text-pink transition-colors"
            >
              <ArrowLeft size={18} />
              العودة للرئيسية
            </Link>
          </div>

          {offer.products.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center shadow-sm">
              <h2 className="text-2xl font-bold text-gray-dark mb-3">لا توجد منتجات لهذا العرض حالياً</h2>
              <p className="text-gray-500">تحققي من المنتجات المرتبطة بهذا العرض أو من توفرها في مستودعات البلد الحالي.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {offer.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
      <CartDrawer />
    </div>
  );
}