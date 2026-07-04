import type { MetadataRoute } from "next";
import { getGeneralSettings } from "@/server/settings";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const settings = await getGeneralSettings();
  const siteName = settings.siteName || "SKYNOVA";

  return {
    name: siteName,
    short_name: siteName,
    description:
      "متجر SKYNOVA لمنتجات العناية بالبشرة والشعر مع تجربة قابلة للتثبيت كتطبيق.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#fff7fb",
    theme_color: "#7f305d",
    lang: "ar",
    dir: "rtl",
    icons: [
      {
        src: "/icon?size=192",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon?size=512",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}