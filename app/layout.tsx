import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";
import ClientProviders from "@/component/ClientProviders";

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["400", "500", "700", "800", "900"],
  variable: "--font-tajawal",
});

export const metadata: Metadata = {
  title: "SKYNOVA | متجر العناية بالبشرة والشعر",
  description: "وجهتك الأولى لمنتجات العناية بالبشرة والشعر. نقدم لكِ أفضل المنتجات الأصلية بأسعار مميزة مع توصيل سريع.",
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
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
