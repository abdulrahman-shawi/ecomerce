"use server";

import { prisma } from "@/lib/prisma";

export interface GeneralSettings {
  siteName: string;
  companyEmail: string;
  companyPhone: string;
  siteCurrency: string;
  usdToTryRate: number;
  facebookUrl: string;
  instagramUrl: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  topBannerText: string;
}

const defaults: GeneralSettings = {
  siteName: "SKYNOVA",
  companyEmail: "",
  companyPhone: "",
  siteCurrency: "USD",
  usdToTryRate: 0,
  facebookUrl: "",
  instagramUrl: "",
  logo: "",
  primaryColor: "#10b981",
  secondaryColor: "#0f766e",
  topBannerText: "",
};

export async function getGeneralSettings(): Promise<GeneralSettings> {
  const settings = await prisma.generalSetting.findFirst({
    orderBy: { createdAt: "desc" },
  });

  if (!settings) return defaults;

  return {
    siteName: settings.siteName || defaults.siteName,
    companyEmail: settings.companyEmail || defaults.companyEmail,
    companyPhone: settings.companyPhone || defaults.companyPhone,
    siteCurrency: settings.siteCurrency || defaults.siteCurrency,
    usdToTryRate: settings.usdToTryRate ?? defaults.usdToTryRate,
    facebookUrl: settings.facebookUrl || defaults.facebookUrl,
    instagramUrl: settings.instagramUrl || defaults.instagramUrl,
    logo: settings.logo || defaults.logo,
    primaryColor: settings.primaryColor || defaults.primaryColor,
    secondaryColor: settings.secondaryColor || defaults.secondaryColor,
    topBannerText: settings.topBannerText || defaults.topBannerText,
  };
}
