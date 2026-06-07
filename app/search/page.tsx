export const dynamic = "force-dynamic";

import { searchProducts } from "@/server/products";
import ProductCard from "@/component/ProductCard";
import { Search, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface SearchPageProps {
  searchParams: { q?: string };
}

export async function generateMetadata({ searchParams }: SearchPageProps) {
  const query = searchParams.q || "";
  return {
    title: query ? `نتائج البحث عن "${query}" | SKYNOVA` : "البحث | SKYNOVA",
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || "";
  const products = query ? await searchProducts(query) : [];

  return (
    <div className="min-h-screen bg-gray-light font-tajawal">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link
            href="/"
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-dark" />
          </Link>
          <h1 className="text-xl font-bold text-gray-dark font-tajawal">
            نتائج البحث
          </h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Search info */}
        <div className="mb-8">
          {query ? (
            <div className="flex items-center gap-2 text-gray-600">
              <Search size={20} className="text-pink" />
              <p className="font-tajawal">
                نتائج البحث عن: <span className="font-bold text-gray-dark">"{query}"</span>
              </p>
              <span className="text-sm text-gray-400">
                ({products.length} نتيجة)
              </span>
            </div>
          ) : (
            <p className="text-gray-500 font-tajawal text-center py-8">
              يرجى إدخال كلمة بحث في حقل البحث أعلاه
            </p>
          )}
        </div>

        {/* Results */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : query ? (
          <div className="text-center py-20">
            <Search size={64} className="mx-auto text-gray-200 mb-4" />
            <h2 className="text-xl font-bold text-gray-dark font-tajawal mb-2">
              لا توجد نتائج
            </h2>
            <p className="text-gray-400 font-tajawal max-w-md mx-auto">
              لم نجد أي منتجات تطابق "{query}". جربي استخدام كلمات مختلفة أو تصفحي الفئات.
            </p>
            <Link
              href="/"
              className="inline-block mt-6 bg-pink text-white px-8 py-3 rounded-full font-bold hover:bg-pink-dark transition-colors font-tajawal"
            >
              العودة للرئيسية
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
