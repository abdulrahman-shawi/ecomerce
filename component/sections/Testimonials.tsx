"use client";

import SectionTitle from '@/component/SectionTitle';
import StarRating from '@/component/StarRating';

const testimonials = [
  {
    name: 'سارة أحمد',
    rating: 5,
    text: 'أفضل متجر للعناية بالبشرة! المنتجات أصلية والتوصيل سريع جداً. سيروم فيتامين سي غير بشرتي بالكامل.',
    avatar: 'س',
    color: 'bg-pink',
  },
  {
    name: 'نورة محمد',
    rating: 5,
    text: 'مجموعة الهدايا رائعة! اشتريتها لأختي وكانت سعيدة جداً. التغليف فاخر والمنتجات ممتازة.',
    avatar: 'ن',
    color: 'bg-pink-dark',
  },
  {
    name: 'فاطمة علي',
    rating: 4,
    text: 'شامبو الكيراتين مذهل! شعري أصبح ناعماً ولامعاً من أول استخدام. سأشتريه مرة أخرى بالتأكيد.',
    avatar: 'ف',
    color: 'bg-purple-400',
  },
];

export default function Testimonials() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <SectionTitle title="آراء عملائنا" subtitle="شاهدي ما تقوله عملاؤنا عن منتجاتنا" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-gray-light rounded-2xl p-6 border border-gray-100 hover:shadow-lg hover:shadow-pink/10 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 ${testimonial.color} rounded-full flex items-center justify-center text-white font-bold text-lg`}>
                  {testimonial.avatar}
                </div>
                <div>
                  <h4 className="font-bold text-gray-dark font-tajawal">{testimonial.name}</h4>
                  <StarRating rating={testimonial.rating} />
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed font-tajawal">
                &ldquo;{testimonial.text}&rdquo;
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
