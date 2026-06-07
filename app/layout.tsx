import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";
import ClientProviders from "@/component/ClientProviders";
import AffiliateTracker from "@/component/AffiliateTracker";

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["400", "500", "700", "800", "900"],
  variable: "--font-tajawal",
});

export const metadata: Metadata = {
  title: {
    default: "SKYNOVA | متجر العناية بالبشرة والشعر",
    template: "%s | SKYNOVA",
  },
  description:
    "وجهتك الأولى لمنتجات العناية بالبشرة والشعر. نقدم لكِ أفضل المنتجات الأصلية بأسعار مميزة مع توصيل سريع.",
  keywords: [
    "عناية بالبشرة",
    "عناية بالشعر",
    "منتجات تجميل",
    "مكياج",
    "عناية شخصية",
    "SKYNOVA",
  ],
  authors: [{ name: "SKYNOVA" }],
  creator: "SKYNOVA",
  publisher: "SKYNOVA",
  metadataBase: new URL("https://skynova.store"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "SKYNOVA | متجر العناية بالبشرة والشعر",
    description:
      "وجهتك الأولى لمنتجات العناية بالبشرة والشعر. نقدم لكِ أفضل المنتجات الأصلية بأسعار مميزة مع توصيل سريع.",
    url: "https://skynova.store",
    siteName: "SKYNOVA",
    locale: "ar_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SKYNOVA | متجر العناية بالبشرة والشعر",
    description:
      "وجهتك الأولى لمنتجات العناية بالبشرة والشعر. نقدم لكِ أفضل المنتجات الأصلية بأسعار مميزة مع توصيل سريع.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "YOUR_GOOGLE_VERIFICATION_CODE", // استبدلي هذا بكود التحقق من Google Search Console
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${tajawal.variable} font-tajawal antialiased`}>
        <ClientProviders>
          <AffiliateTracker />
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
