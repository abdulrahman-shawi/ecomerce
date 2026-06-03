"use client";

import { Truck, ShieldCheck, CreditCard, Headphones } from 'lucide-react';

const features = [
  {
    icon: Truck,
    title: 'شحن مجاني',
    desc: 'للطلبات فوق 299$',
  },
  {
    icon: ShieldCheck,
    title: 'منتجات أصلية',
    desc: '100% مضمونة',
  },
  {
    icon: CreditCard,
    title: 'دفع آمن',
    desc: 'طرق دفع متعددة',
  },
  {
    icon: Headphones,
    title: 'خدمة عملاء',
    desc: 'متاحة 24/7',
  },
];

export default function Features() {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`flex flex-col items-center text-center p-6 ${
                index < features.length - 1 ? 'md:border-l md:border-gray-100' : ''
              } ${index % 2 === 0 ? 'border-l border-gray-100 md:border-l' : ''}`}
            >
              <div className="bg-pink-50 p-4 rounded-full mb-4">
                <feature.icon className="text-pink" size={28} />
              </div>
              <h3 className="font-bold text-gray-dark mb-1 font-tajawal">
                {feature.title}
              </h3>
              <p className="text-gray-500 text-sm font-tajawal">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
