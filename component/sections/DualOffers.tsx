"use client";

export default function DualOffers() {
  return (
    <section id="offers" className="py-10 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Offer Card 1 */}
          <div className="relative overflow-hidden rounded-3xl h-[280px] md:h-[320px] group">
            <img
              src="/images/hero/hero1.jpg"
              alt="مجموعة العناية بالبشرة"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-black/60 to-transparent" />
            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-right text-white">
              <span className="text-pink-light text-sm font-medium mb-2 block font-tajawal">عرض خاص</span>
              <h3 className="text-2xl md:text-3xl font-bold mb-3 font-tajawal">
                مجموعة العناية<br />بالبشرة
              </h3>
              <p className="text-pink-light text-lg font-bold mb-4 font-tajawal">خصم 25%</p>
              <button className="bg-pink text-white px-6 py-2.5 rounded-full font-medium hover:bg-pink-dark transition-colors font-tajawal">
                اكتشفي المزيد
              </button>
            </div>
          </div>

          {/* Offer Card 2 */}
          <div className="relative overflow-hidden rounded-3xl h-[280px] md:h-[320px] group">
            <img
              src="/images/hero/hero3.jpg"
              alt="أدوات التجميل الاحترافية"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-black/60 to-transparent" />
            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-right text-white">
              <span className="text-pink-light text-sm font-medium mb-2 block font-tajawal">تشكيلة جديدة</span>
              <h3 className="text-2xl md:text-3xl font-bold mb-3 font-tajawal">
                أدوات التجميل<br />الاحترافية
              </h3>
              <p className="text-pink-light text-lg font-bold mb-4 font-tajawal">ابدئي رحلتك</p>
              <button className="bg-pink text-white px-6 py-2.5 rounded-full font-medium hover:bg-pink-dark transition-colors font-tajawal">
                اكتشفي المزيد
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
