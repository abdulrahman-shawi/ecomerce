"use server";

import { prisma } from "@/lib/prisma";

export async function getGeneralSettings() {
  const settings = await prisma.generalSetting.findFirst({
    orderBy: { createdAt: "desc" },
  });

  return {
    siteName: settings?.siteName || "SKYNOVA",
    companyEmail: settings?.companyEmail || "",
    companyPhone: settings?.companyPhone || "",
    siteCurrency: settings?.siteCurrency || "USD",
    usdToTryRate: settings?.usdToTryRate || 0,
  };
}
