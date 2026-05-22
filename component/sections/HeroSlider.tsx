"use client";

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  {
    welcome: 'مجموعة العناية الفاخرة',
    title: 'اكتشفي سر الجمال الطبيعي',
    desc: 'منتجات طبيعية 100% للعناية ببشرتك وشعرك',
    image: '/images/hero/hero1.jpg',
  },
  {
    welcome: 'عرض محدود',
    title: 'خصم 30% على جميع المنتجات',
    desc: 'استخدمي كود: GLAM30',
    image: '/images/hero/hero2.jpg',
  },
  {
    welcome: 'منتجات جديدة',
    title: 'وصل حديثاً - تشكيلة الربيع',
    desc: 'اكتشفي أحدث منتجات العناية بالبشرة',
    image: '/images/hero/hero3.jpg',
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goTo = (index: number) => setCurrent(index);
  const next = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prev = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <section id="hero" className="relative h-[500px] md:h-[600px] overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-pink-50 via-pink-100/50 to-pink-50" />

      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === current ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 h-full flex items-center">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center w-full">
              {/* Text */}
              <div
                className={`text-center md:text-right transition-all duration-700 ${
                  index === current
                    ? 'translate-x-0 opacity-100'
                    : 'translate-x-10 opacity-0'
                }`}
              >
                <span className="text-pink-dark font-medium text-sm md:text-base mb-3 block font-tajawal">
                  {slide.welcome}
                </span>
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-gray-dark leading-tight mb-4 font-tajawal">
                  {slide.title}
                </h2>
                <p className="text-gray-500 text-base md:text-lg mb-8 font-tajawal">
                  {slide.desc}
                </p>
                <button className="bg-pink text-white px-8 py-3.5 rounded-full font-bold hover:bg-pink-dark transition-all duration-300 hover:shadow-lg hover:shadow-pink/30 font-tajawal">
                  تسوقي الآن
                </button>
              </div>

              {/* Image */}
              <div
                className={`hidden md:block transition-all duration-700 delay-200 ${
                  index === current
                    ? 'translate-x-0 opacity-100'
                    : '-translate-x-10 opacity-0'
                }`}
              >
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-[450px] object-cover rounded-3xl shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-pink hover:text-white transition-all z-10"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-pink hover:text-white transition-all z-10"
      >
        <ChevronRight size={24} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goTo(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === current
                ? 'bg-pink w-8'
                : 'bg-pink/30 hover:bg-pink/50'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
