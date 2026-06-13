export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { Metadata } from "next";
import Header from "@/component/sections/Header";
import Footer from "@/component/sections/Footer";
import TopBanner from "@/component/sections/TopBanner";
import CartDrawer from "@/component/CartDrawer";
import ProductCard from "@/component/ProductCard";
import { getProductsByCategory } from "@/server/products";
import { getServerCountry } from "@/lib/region";

interface CategoryPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const data = await getProductsByCategory(params.slug, getServerCountry());
  
  if (!data) {
    return {
      title: "القسم غير موجود | SKYNOVA",
      description: "عذراً، القسم الذي تبحثين عنه غير متوفر حالياً.",
    };
  }

  const title = `منتجات ${data.categoryName} | SKYNOVA`;
  const description = `تصفحي أفضل منتجات ${data.categoryName} بأسعار مميزة. ${data.products.length} منتج متوفر مع توصيل سريع ودفع عند الاستلام.`;
  const url = `https://skynova.store/category/${params.slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: "website",
      locale: "ar_AR",
      siteName: "SKYNOVA",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
    alternates: {
      canonical: url,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = params;
  const country = getServerCountry();
  const data = await getProductsByCategory(slug, country);

  if (!data) {
    notFound();
  }

  const { categoryName, products } = data;

  return (
    <div dir="rtl" className="font-tajawal min-h-screen bg-white">
      <TopBanner />
      <Header />
      <main className="py-20 bg-gray-light min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-dark mb-2 font-tajawal">
            {categoryName}
          </h1>
          <p className="text-gray-500 mb-10 font-tajawal">
            {products.length} منتج{products.length !== 1 ? "ات" : ""}
          </p>

          {products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg font-tajawal">
                لا توجد منتجات في هذا القسم حالياً
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
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
