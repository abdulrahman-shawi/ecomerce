import type { Metadata, Viewport } from "next";
import { Tajawal } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import ClientProviders from "@/component/ClientProviders";
import AffiliateTracker from "@/component/AffiliateTracker";
import { getGeneralSettings } from "@/server/settings";

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["400", "500", "700", "800", "900"],
  variable: "--font-tajawal",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getGeneralSettings();
  const siteName = settings.siteName || "SKYNOVA";
  const title = `${siteName} | متجر العناية بالبشرة والشعر`;
  const description = "وجهتك الأولى لمنتجات العناية بالبشرة والشعر. نقدم لكِ أفضل المنتجات الأصلية بأسعار مميزة مع توصيل سريع.";

  return {
    title: {
      default: title,
      template: `%s | ${siteName}`,
    },
    manifest: "/manifest.webmanifest",
    description,
    keywords: [
      "عناية بالبشرة",
      "عناية بالشعر",
      "منتجات تجميل",
      "مكياج",
      "عناية شخصية",
      siteName,
    ],
    authors: [{ name: siteName }],
    creator: siteName,
    publisher: siteName,
    metadataBase: new URL("https://skynova.store"),
    alternates: {
      canonical: "/",
    },
    openGraph: {
      title,
      description,
      url: "https://skynova.store",
      siteName,
      locale: "ar_AR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: siteName,
    },
    applicationName: siteName,
    themeColor: "#7f305d",
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
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${tajawal.variable} font-tajawal antialiased`}>
        {/* Meta Pixel Code */}
        <Script
          id="meta-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '2268225340616696');
fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=2268225340616696&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        {/* End Meta Pixel Code */}
        <ClientProviders>
          <AffiliateTracker />
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
