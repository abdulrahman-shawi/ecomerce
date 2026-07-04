"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { formatPrice, getCurrencySymbol } from "@/lib/currency";
import { citiesByCountry } from "@/lib/cities";
import { createLandingOrder } from "@/server/landing-order";
import { useAuth } from "@/context/AuthContext";
import StarRating from "@/component/StarRating";
import {
  Phone,
  MapPin,
  User,
  Package,
  CheckCircle,
  ShieldCheck,
  Truck,
  CreditCard,
  Clock,
  ChevronLeft,
  Star,
  Loader2,
  X,
} from "lucide-react";

interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
}

interface LandingFeature {
  title: string;
  description: string;
}

interface LandingProduct {
  id: number;
  name: string;
  description: string | null;
  image: string;
  images: string[];
  price: number;
  originalPrice: number | null;
  currency: string;
  averageRating?: number;
  totalReviews?: number;
  stock: number;
  showInAds: boolean;
  landingPage: {
    heroTitle: string | null;
    heroSubtitle: string | null;
    heroDescription: string | null;
    badgeText: string | null;
    discountPercent: number | null;
    features: LandingFeature[];
    showReviews: boolean;
    showGuarantee: boolean;
    guaranteeTitle: string | null;
    guaranteeText: string | null;
    ctaText: string | null;
    isActive: boolean;
  } | null;
}

interface LandingOrderProps {
  product: LandingProduct;
  reviews: Review[];
  siteName: string;
}

const defaultTrustBadges = [
  { icon: Truck, text: "توصيل سريع لجميع المناطق" },
  { icon: CreditCard, text: "دفع عند الاستلام" },
  { icon: ShieldCheck, text: "ضمان جودة المنتج" },
  { icon: Clock, text: "استلام خلال 2-5 أيام" },
];

const defaultFeatures = [
  { title: "جودة عالية", description: "منتج أصلي 100% مختبر ومعتمد." },
  { title: "نتائج فورية", description: "شاهدي الفرق من أول استخدام." },
  { title: "تركيبة آمنة", description: "مناسب لجميع أنواع البشرة والشعر." },
  { title: "عبوة اقتصادية", description: "كمية تكفي معكِ لفترة طويلة." },
];

export default function LandingOrder({ product, reviews, siteName }: LandingOrderProps) {
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(product.image);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    country: "SY" as "SY" | "TR",
    city: "",
    address: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; orderNumber?: string } | null>(null);

  const currencySymbol = getCurrencySymbol(product.currency);
  const totalPrice = product.price * quantity;
  const lp = product.landingPage;
  const heroTitle = lp?.heroTitle || product.name;
  const heroSubtitle = lp?.heroSubtitle || null;
  const heroDescription = lp?.heroDescription || product.description;
  const badgeText = lp?.badgeText || "عرض محدود";
  const ctaText = lp?.ctaText || `اطلب الآن`;
  const guaranteeTitle = lp?.guaranteeTitle || "ضمان استرجاع خلال 14 يوماً";
  const guaranteeText =
    lp?.guaranteeText ||
    "إذا لم تكوني راضية عن المنتج، يمكنكِ استرجاعه واسترداد قيمته خلال 14 يوماً من تاريخ الاستلام.";
  const features = lp?.features?.length ? lp.features : defaultFeatures;
  const showReviews = lp?.showReviews ?? true;
  const showGuarantee = lp?.showGuarantee ?? true;

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const computedDiscountPercent = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;
  const discountPercent = lp?.discountPercent ?? computedDiscountPercent;

  useEffect(() => {
    setSelectedImage(product.image);
  }, [product.image]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const authToken = typeof window !== "undefined" ? localStorage.getItem("ecommerce-auth-token") : null;

    const res = await createLandingOrder({
      productId: product.id,
      quantity,
      customerId: user?.id ?? null,
      authToken: authToken ?? undefined,
      name: form.name,
      phone: form.phone,
      country: form.country,
      city: form.city,
      address: form.address,
      notes: form.notes,
    });

    setLoading(false);

    if (res.success) {
      setResult({
        success: true,
        message: "تم استلام طلبك بنجاح! سنتواصل معك قريباً لتأكيد الطلب.",
        orderNumber: res.orderNumber,
      });
      setForm({ name: "", phone: "", country: "SY", city: "", address: "", notes: "" });
      setQuantity(1);
      setShowForm(false);
    } else {
      setResult({ success: false, message: res.error || "حدث خطأ أثناء إرسال الطلب" });
    }
  };

  const OrderForm = ({ inModal = false }: { inModal?: boolean }) => (
    <form onSubmit={handleSubmit} className="space-y-4">
      {result && !result.success && (
        <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm font-tajawal">{result.message}</div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 font-tajawal">الاسم الكامل *</label>
        <div className="relative">
          <User className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border border-gray-200 rounded-xl pr-10 pl-3 py-3 focus:outline-none focus:ring-2 focus:ring-pink focus:border-transparent font-tajawal bg-gray-50"
            placeholder="أدخل اسمك الكامل"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 font-tajawal">رقم الهاتف *</label>
        <div className="relative">
          <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="tel"
            required
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full border border-gray-200 rounded-xl pr-10 pl-3 py-3 focus:outline-none focus:ring-2 focus:ring-pink focus:border-transparent font-tajawal bg-gray-50"
            placeholder="مثال: 0991234567"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 font-tajawal">الدولة *</label>
          <select
            value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value as "SY" | "TR", city: "" })}
            className="w-full border border-gray-200 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-pink focus:border-transparent font-tajawal bg-gray-50"
          >
            <option value="SY">سوريا</option>
            <option value="TR">تركيا</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 font-tajawal">المدينة *</label>
          <select
            required
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-pink focus:border-transparent font-tajawal bg-gray-50"
          >
            <option value="">اختر المدينة</option>
            {(citiesByCountry[form.country] || []).map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 font-tajawal">العنوان بالتفصيل *</label>
        <div className="relative">
          <MapPin className="absolute right-3 top-3 text-gray-400" size={18} />
          <textarea
            required
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="w-full border border-gray-200 rounded-xl pr-10 pl-3 py-3 focus:outline-none focus:ring-2 focus:ring-pink focus:border-transparent font-tajawal bg-gray-50 min-h-[80px]"
            placeholder="المنطقة، الشارع، رقم البناء..."
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 font-tajawal">ملاحظات إضافية</label>
        <textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          className="w-full border border-gray-200 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-pink focus:border-transparent font-tajawal bg-gray-50 min-h-[80px]"
          placeholder="أي ملاحظات خاصة بالتوصيل..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 font-tajawal">الكمية</label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="w-10 h-10 rounded-xl border border-gray-200 hover:bg-pink hover:text-white hover:border-pink font-bold text-lg transition-colors"
          >
            -
          </button>
          <span className="w-12 text-center font-bold text-lg">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            className="w-10 h-10 rounded-xl border border-gray-200 hover:bg-pink hover:text-white hover:border-pink font-bold text-lg transition-colors"
          >
            +
          </button>
        </div>
      </div>

      <div className="bg-pink-50 rounded-xl p-4 border border-pink-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-600 font-tajawal">سعر الوحدة:</span>
          <span className="font-bold font-tajawal">{formatPrice(product.price, product.currency)}</span>
        </div>
        <div className="flex items-center justify-between text-lg">
          <span className="font-bold text-gray-800 font-tajawal">الإجمالي:</span>
          <span className="text-2xl font-bold text-pink-dark font-tajawal">{formatPrice(totalPrice, product.currency)}</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-pink hover:bg-pink-dark text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:shadow-lg hover:shadow-pink/30 font-tajawal disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 className="animate-spin" size={20} /> : null}
        {loading ? "جاري إرسال الطلب..." : `${ctaText} - ${formatPrice(totalPrice, product.currency)}`}
      </button>

      {!inModal && (
        <p className="text-xs text-center text-gray-400 font-tajawal">
          بالضغط على الزر فإنك توافق على شروط الطلب والتوصيل.
        </p>
      )}
    </form>
  );

  if (result?.success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-white p-4" dir="rtl">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center border border-pink-100">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2 font-tajawal">تم إرسال الطلب بنجاح!</h2>
          <p className="text-gray-600 mb-4 font-tajawal">{result.message}</p>
          {result.orderNumber && (
            <p className="text-sm text-gray-500 font-tajawal mb-6">
              رقم الطلب: <span className="font-bold text-gray-800">{result.orderNumber}</span>
            </p>
          )}
          <button
            onClick={() => setResult(null)}
            className="bg-pink hover:bg-pink-dark text-white px-8 py-3 rounded-full font-bold transition-colors font-tajawal"
          >
            طلب آخر
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* Top Bar */}
      <div className="bg-gray-900 text-white py-2.5 text-center text-sm font-tajawal">
        {badgeText} — شحن مجاني للطلبات فوق 299{currencySymbol}
      </div>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-pink-50 via-white to-pink-100/50 py-10 md:py-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            {/* Product Visual */}
            <div className="order-1 lg:order-2">
              <div className="relative">
                {discountPercent > 0 && (
                  <div className="absolute -top-4 -right-4 z-10 bg-red-500 text-white font-bold px-4 py-2 rounded-full shadow-lg font-tajawal">
                    خصم {discountPercent}%
                  </div>
                )}
                <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl bg-white border border-pink-100">
                  <Image
                    src={selectedImage}
                    alt={product.name}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>

                {product.images.length > 1 && (
                  <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                    {product.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(img)}
                        className={`relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-colors ${
                          selectedImage === img ? "border-pink" : "border-transparent"
                        }`}
                      >
                        <Image src={img} alt={`صورة ${idx + 1}`} fill className="object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="order-2 lg:order-1 text-right">
              <div className="inline-flex items-center gap-2 bg-pink/10 text-pink-dark px-4 py-1.5 rounded-full text-sm font-medium mb-4 font-tajawal">
                <Star size={14} className="fill-yellow-400 text-yellow-400" />
                {product.averageRating ? `${product.averageRating} (${product.totalReviews} تقييم)` : "منتج مميز"}
              </div>

              {heroSubtitle && (
                <p className="text-pink-dark font-medium text-lg mb-2 font-tajawal">{heroSubtitle}</p>
              )}

              <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4 font-tajawal leading-tight">
                {heroTitle}
              </h1>

              {heroDescription && (
                <div
                  className="text-gray-600 text-lg mb-6 leading-relaxed font-tajawal"
                  dangerouslySetInnerHTML={{ __html: heroDescription }}
                />
              )}

              <div className="flex items-center gap-4 mb-6">
                <span className="text-4xl font-bold text-pink-dark font-tajawal">
                  {formatPrice(product.price, product.currency)}
                </span>
                {hasDiscount && (
                  <span className="text-2xl text-gray-400 line-through font-tajawal">
                    {formatPrice(product.originalPrice!, product.currency)}
                  </span>
                )}
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-3 mb-8">
                {defaultTrustBadges.map((badge, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100"
                  >
                    <badge.icon size={20} className="text-pink" />
                    <span className="text-sm font-medium text-gray-700 font-tajawal">{badge.text}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowForm(true)}
                className="hidden lg:inline-flex bg-pink hover:bg-pink-dark text-white px-10 py-4 rounded-full font-bold text-xl transition-all duration-300 hover:shadow-xl hover:shadow-pink/30 font-tajawal items-center gap-2"
              >
                {ctaText}
                <ChevronLeft size={24} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky CTA Mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 z-40 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-gray-500 font-tajawal">السعر الإجمالي</p>
          <p className="text-xl font-bold text-pink-dark font-tajawal">{formatPrice(totalPrice, product.currency)}</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-pink hover:bg-pink-dark text-white px-6 py-3 rounded-xl font-bold font-tajawal transition-colors"
        >
          اطلب الآن
        </button>
      </div>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-10 font-tajawal">
            لماذا {product.name}؟
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="bg-gray-50 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow border border-gray-100"
              >
                <div className="w-12 h-12 bg-pink/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="text-pink" size={24} />
                </div>
                <h3 className="font-bold text-gray-800 mb-2 font-tajawal">{feature.title}</h3>
                <p className="text-sm text-gray-500 font-tajawal">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Order Form Section Desktop */}
      <section id="order-form" className="py-16 pb-28 lg:pb-16 bg-gradient-to-br from-gray-50 to-pink-50/30">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10 border border-pink-100">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-2 font-tajawal">
              {ctaText} الآن
            </h2>
            <p className="text-center text-gray-500 mb-8 font-tajawal">
              املئي النموذج وسنتواصل معكِ خلال دقائق لتأكيد الطلب
            </p>
            <OrderForm />
          </div>
        </div>
      </section>

      {/* Reviews */}
      {showReviews && reviews.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-10 font-tajawal">
              ماذا قالت عملاؤنا؟
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {reviews.slice(0, 6).map((review) => (
                <div
                  key={review.id}
                  className="bg-gray-50 rounded-2xl p-6 border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-gray-800 font-tajawal">{review.name}</span>
                    <StarRating rating={review.rating} size={14} />
                  </div>
                  {review.comment && (
                    <p className="text-gray-600 text-sm leading-relaxed font-tajawal">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Guarantee */}
      {showGuarantee && (
        <section className="py-16 bg-gray-900 text-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <ShieldCheck className="w-16 h-16 text-pink mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold mb-4 font-tajawal">{guaranteeTitle}</h2>
            <p className="text-gray-300 text-lg font-tajawal">{guaranteeText}</p>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-8 text-center">
        <p className="text-gray-500 font-tajawal">
          © {new Date().getFullYear()} {siteName || "SKYNOVA"}. جميع الحقوق محفوظة.
        </p>
      </footer>

      {/* Mobile Order Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowForm(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold font-tajawal">إتمام الطلب</h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={24} />
              </button>
            </div>
            <OrderForm inModal />
          </div>
        </div>
      )}
    </div>
  );
}
