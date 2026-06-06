"use client";

import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import Header from "@/component/sections/Header";
import Footer from "@/component/sections/Footer";
import ProductCard from "@/component/ProductCard";
import { Heart, ShoppingBag } from "lucide-react";
import Link from "next/link";

export default function WishlistPage() {
  const { wishlistItems, wishlistCount } = useWishlist();
  const { addToCart } = useCart();

  const handleAddAllToCart = () => {
    wishlistItems.forEach((item) => {
      addToCart({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
      });
    });
  };

  return (
    <div dir="rtl" className="font-tajawal min-h-screen bg-gray-light">
      <Header />

      <main className="pt-8 pb-20">
        <div className="max-w-7xl mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
            <Link href="/" className="hover:text-pink transition-colors">
              الرئيسية
            </Link>
            <span>/</span>
            <span className="text-gray-dark font-medium">المفضلة</span>
          </nav>

          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-pink-50 flex items-center justify-center">
                <Heart className="w-6 h-6 text-pink" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-dark font-tajawal">
                  قائمة المفضلة
                </h1>
                <p className="text-gray-500 text-sm mt-0.5">
                  {wishlistCount} {wishlistCount === 1 ? "منتج" : "منتجات"} في قائمتك
                </p>
              </div>
            </div>

            {wishlistCount > 0 && (
              <button
                onClick={handleAddAllToCart}
                className="hidden sm:flex items-center gap-2 bg-pink text-white px-6 py-2.5 rounded-full hover:bg-pink-dark transition-colors font-medium text-sm"
              >
                <ShoppingBag size={18} />
                إضافة الكل للسلة
              </button>
            )}
          </div>

          {wishlistCount === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-24 h-24 rounded-full bg-pink-50 flex items-center justify-center mb-6">
                <Heart className="w-12 h-12 text-pink/40" />
              </div>
              <h2 className="text-xl font-bold text-gray-dark mb-2 font-tajawal">
                قائمة المفضلة فارغة
              </h2>
              <p className="text-gray-500 max-w-md mb-8 leading-relaxed">
                لم تقومي بإضافة أي منتجات إلى المفضلة بعد. تصفحي منتجاتنا واضغطي على أيقونة القلب لحفظ المنتجات التي تعجبك.
              </p>
              <Link
                href="/"
                className="bg-pink text-white px-8 py-3 rounded-full hover:bg-pink-dark transition-colors font-medium inline-flex items-center gap-2"
              >
                <ShoppingBag size={18} />
                تصفح المنتجات
              </Link>
            </div>
          ) : (
            /* Products Grid */
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {wishlistItems.map((product) => (
                <ProductCard
                  key={product.id}
                  product={{
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    originalPrice: product.originalPrice,
                    image: product.image,
                    badge: product.badge,
                    description: product.description,
                    seoSlug: product.seoSlug,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
