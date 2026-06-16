"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Phone, MessageCircle, Mail } from "lucide-react";

interface FooterPage {
  id: string;
  slug: string;
  title: string;
}

interface GeneralSettings {
  siteName: string;
  companyEmail: string;
  companyPhone: string;
  siteCurrency: string;
  usdToTryRate: number;
}

const quickLinks = [
  { label: "الرئيسية", href: "/" },
  { label: "منتجاتنا", href: "/#products" },
  { label: "العروض", href: "/#offers" },
  { label: "من نحن", href: "/من-نحن" },
];

export default function Footer() {
  const [pages, setPages] = useState<FooterPage[]>([]);
  const [settings, setSettings] = useState<GeneralSettings>({
    siteName: "SKYNOVA",
    companyEmail: "",
    companyPhone: "",
    siteCurrency: "USD",
    usdToTryRate: 0,
  });

  useEffect(() => {
    fetch("/api/pages")
      .then((res) => res.json())
      .then((data: FooterPage[]) => setPages(data))
      .catch(() => setPages([]));

    fetch("/api/settings")
      .then((res) => res.json())
      .then((data: GeneralSettings) => setSettings(data))
      .catch(() => {});
  }, []);

  const whatsappLink = settings.companyPhone
    ? `https://wa.me/${settings.companyPhone.replace(/\D/g, "")}`
    : "#";
  const telLink = settings.companyPhone
    ? `tel:${settings.companyPhone}`
    : "#";

  return (
    <footer id="footer" className="bg-gray-dark text-white pt-16 pb-6">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* About */}
          <div>
            <h3 className="text-3xl font-bold text-pink mb-4 font-tajawal">
              {settings.siteName}
            </h3>
            <p className="text-gray-400 leading-relaxed text-sm font-tajawal">
              وجهتك الأولى لمنتجات العناية بالبشرة والشعر. نقدم لكِ أفضل المنتجات
              الأصلية بأسعار مميزة مع توصيل سريع لجميع أنحاء المملكة.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-4 font-tajawal">روابط سريعة</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-pink transition-colors text-sm font-tajawal"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service / Static Pages */}
          <div>
            <h4 className="font-bold text-lg mb-4 font-tajawal">خدمة العملاء</h4>
            <ul className="space-y-3">
              {pages.map((page) => (
                <li key={page.id}>
                  <Link
                    href={`/${encodeURIComponent(page.slug)}`}
                    className="text-gray-400 hover:text-pink transition-colors text-sm font-tajawal"
                  >
                    {page.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-lg mb-4 font-tajawal">تواصل معنا</h4>
            <div className="space-y-3">
              {settings.companyPhone && (
                <>
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gray-400 hover:text-pink transition-colors text-sm font-tajawal"
                  >
                    <MessageCircle size={18} />
                    واتساب
                  </a>
                  <a
                    href={telLink}
                    className="flex items-center gap-2 text-gray-400 hover:text-pink transition-colors text-sm font-tajawal"
                  >
                    <Phone size={18} />
                    {settings.companyPhone}
                  </a>
                </>
              )}
              {settings.companyEmail && (
                <a
                  href={`mailto:${settings.companyEmail}`}
                  className="flex items-center gap-2 text-gray-400 hover:text-pink transition-colors text-sm font-tajawal"
                >
                  <Mail size={18} />
                  {settings.companyEmail}
                </a>
              )}
              <a
                href="#"
                className="flex items-center gap-2 text-gray-400 hover:text-pink transition-colors text-sm font-tajawal"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
                إنستغرام
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-700 pt-6 text-center">
          <p className="text-gray-500 text-sm font-tajawal">
            © 2026 {settings.siteName}. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
}
