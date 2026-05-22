"use client";

import { Phone, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer id="footer" className="bg-gray-dark text-white pt-16 pb-6">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* About */}
          <div>
            <h3 className="text-3xl font-bold text-pink mb-4 font-tajawal">SKYNOVA</h3>
            <p className="text-gray-400 leading-relaxed text-sm font-tajawal">
              وجهتك الأولى لمنتجات العناية بالبشرة والشعر. نقدم لكِ أفضل المنتجات الأصلية بأسعار مميزة مع توصيل سريع لجميع أنحاء المملكة.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-4 font-tajawal">روابط سريعة</h4>
            <ul className="space-y-3">
              {['الرئيسية', 'منتجاتنا', 'العروض', 'من نحن'].map((link) => (
                <li key={link}>
                  <button className="text-gray-400 hover:text-pink transition-colors text-sm font-tajawal">
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-bold text-lg mb-4 font-tajawal">خدمة العملاء</h4>
            <ul className="space-y-3">
              {['الشحن والتوصيل', 'سياسة الإرجاع', 'الأسئلة الشائعة', 'الشروط والأحكام'].map((link) => (
                <li key={link}>
                  <button className="text-gray-400 hover:text-pink transition-colors text-sm font-tajawal">
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-lg mb-4 font-tajawal">تواصل معنا</h4>
            <div className="space-y-3">
              <a
                href="https://wa.me/966500000000"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-400 hover:text-pink transition-colors text-sm font-tajawal"
              >
                <MessageCircle size={18} />
                واتساب
              </a>
              <a
                href="#"
                className="flex items-center gap-2 text-gray-400 hover:text-pink transition-colors text-sm font-tajawal"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                إنستغرام
              </a>
              <a
                href="tel:+966500000000"
                className="flex items-center gap-2 text-gray-400 hover:text-pink transition-colors text-sm font-tajawal"
              >
                <Phone size={18} />
                0500000000
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-700 pt-6 text-center">
          <p className="text-gray-500 text-sm font-tajawal">
            © 2026 SKYNOVA. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
}
