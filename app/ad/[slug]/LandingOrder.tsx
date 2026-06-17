"use client";

import { useState } from "react";
import Image from "next/image";
import { formatPrice, getCurrencySymbol } from "@/lib/currency";
import { createLandingOrder } from "@/server/landing-order";
import { Phone, MapPin, User, Package, CheckCircle } from "lucide-react";

interface LandingProduct {
  id: number;
  name: string;
  description: string | null;
  image: string;
  price: number;
  originalPrice: number | null;
  currency: string;
}

interface LandingOrderProps {
  product: LandingProduct;
}

export default function LandingOrder({ product }: LandingOrderProps) {
  const [quantity, setQuantity] = useState(1);
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
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const res = await createLandingOrder({
      productId: product.id,
      quantity,
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
    } else {
      setResult({ success: false, message: res.error || "حدث خطأ أثناء إرسال الطلب" });
    }
  };

  if (result?.success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4" dir="rtl">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2 font-tajawal">تم إرسال الطلب!</h2>
          <p className="text-gray-600 mb-4 font-tajawal">{result.message}</p>
          {result.orderNumber && (
            <p className="text-sm text-gray-500 font-tajawal mb-6">
              رقم الطلب: <span className="font-bold text-gray-800">{result.orderNumber}</span>
            </p>
          )}
          <button
            onClick={() => setResult(null)}
            className="bg-pink hover:bg-pink-dark text-white px-6 py-2 rounded-full font-bold transition-colors font-tajawal"
          >
            طلب آخر
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="relative aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden shadow-lg bg-gray-100">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div className="text-right">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 font-tajawal leading-tight">
                {product.name}
              </h1>
              {product.description && (
                <div
                  className="text-gray-600 text-base mb-6 leading-relaxed font-tajawal"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              )}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl font-bold text-pink-dark font-tajawal">
                  {formatPrice(totalPrice, product.currency)}
                </span>
                {hasDiscount && (
                  <span className="text-xl text-gray-400 line-through font-tajawal">
                    {formatPrice((product.originalPrice || product.price) * quantity, product.currency)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500 font-tajawal">
                <span className="flex items-center gap-1">
                  <Package size={16} />
                  توصيل سريع
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle size={16} />
                  دفع عند الاستلام
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Form */}
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center font-tajawal">
            اطلب الآن بخطوة واحدة
          </h2>

          {result && !result.success && (
            <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-lg font-tajawal">
              {result.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1 font-tajawal">الاسم الكامل *</label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border rounded-lg pr-10 pl-3 py-3 focus:outline-none focus:ring-2 focus:ring-pink font-tajawal"
                  placeholder="أدخل اسمك الكامل"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1 font-tajawal">رقم الهاتف *</label>
              <div className="relative">
                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full border rounded-lg pr-10 pl-3 py-3 focus:outline-none focus:ring-2 focus:ring-pink font-tajawal"
                  placeholder="مثال: 0991234567"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1 font-tajawal">الدولة *</label>
                <select
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value as "SY" | "TR" })}
                  className="w-full border rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-pink font-tajawal"
                >
                  <option value="SY">سوريا</option>
                  <option value="TR">تركيا</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1 font-tajawal">المدينة *</label>
                <input
                  type="text"
                  required
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full border rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-pink font-tajawal"
                  placeholder="المدينة"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1 font-tajawal">العنوان بالتفصيل *</label>
              <div className="relative">
                <MapPin className="absolute right-3 top-3 text-gray-400" size={18} />
                <textarea
                  required
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full border rounded-lg pr-10 pl-3 py-3 focus:outline-none focus:ring-2 focus:ring-pink font-tajawal min-h-[80px]"
                  placeholder="المنطقة، الشارع، رقم البناء..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1 font-tajawal">ملاحظات إضافية</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full border rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-pink font-tajawal min-h-[80px]"
                placeholder="أي ملاحظات خاصة بالتوصيل..."
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1 font-tajawal">الكمية</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 rounded-lg border hover:bg-gray-50 font-bold text-lg"
                >
                  -
                </button>
                <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-10 h-10 rounded-lg border hover:bg-gray-50 font-bold text-lg"
                >
                  +
                </button>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
              <span className="font-bold text-gray-700 font-tajawal">الإجمالي:</span>
              <span className="text-2xl font-bold text-pink-dark font-tajawal">
                {formatPrice(totalPrice, product.currency)}
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-pink hover:bg-pink-dark text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:shadow-lg hover:shadow-pink/30 font-tajawal disabled:opacity-50"
            >
              {loading ? "جاري إرسال الطلب..." : `اطلب الآن - ${formatPrice(totalPrice, product.currency)}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
