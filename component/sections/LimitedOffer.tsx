"use client";

import CountdownTimer from '@/component/CountdownTimer';

export default function LimitedOffer() {
  return (
    <section className="py-20 bg-gradient-to-br from-pink to-pink-dark relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full" />
      <div className="absolute bottom-10 left-10 w-48 h-48 bg-white/10 rounded-full" />
      <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-white/5 rounded-full" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* Text */}
          <div className="text-center md:text-right text-white">
            <span className="bg-white/20 px-4 py-1.5 rounded-full text-sm font-medium mb-4 inline-block font-tajawal">
              عرض محدود
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4 font-tajawal leading-tight">
              خصم يصل إلى<br />50% على المجموعات
            </h2>
            <p className="text-white/80 text-lg mb-8 font-tajawal">
              لا تفوتي الفرصة! احصلي على منتجاتك المفضلة بأسعار خيالية
            </p>
            <CountdownTimer />
            <button className="mt-8 bg-white text-pink-dark px-8 py-3.5 rounded-full font-bold hover:bg-gray-100 transition-colors font-tajawal shadow-lg">
              تسوقي الآن
            </button>
          </div>

          {/* Image */}
          <div className="hidden md:flex justify-center">
            <img
              src="/images/products/gift-set.jpg"
              alt="عرض محدود"
              className="w-full max-w-md rounded-3xl shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
