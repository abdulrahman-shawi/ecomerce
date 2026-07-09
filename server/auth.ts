"use server";

import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/jwt";

const STORE_LOGIN_NAME = "skynova";

async function getAvailableCustomerName(baseName: string, phone: string): Promise<string> {
  const normalizedBaseName = baseName.trim() || STORE_LOGIN_NAME;
  const existingBase = await prisma.customer.findUnique({
    where: { name: normalizedBaseName },
    select: { id: true },
  });

  if (!existingBase) {
    return normalizedBaseName;
  }

  const digitsOnlyPhone = phone.replace(/\D/g, "");
  const suffix = digitsOnlyPhone.slice(-6) || Date.now().toString().slice(-6);
  const fallbackName = `${normalizedBaseName}-${suffix}`;

  const existingFallback = await prisma.customer.findUnique({
    where: { name: fallbackName },
    select: { id: true },
  });

  if (!existingFallback) {
    return fallbackName;
  }

  return `${fallbackName}-${Date.now().toString().slice(-4)}`;
}

export interface AuthUser {
  id: string;
  name: string;
  phone: string | null;
  country: string | null;
  city: string | null;
  token: string;
}

export async function loginUser(
  username: string,
  phone: string
): Promise<{ success: true; user: AuthUser } | { success: false; error: string }> {
  try {
    const normalizedUsername = username.trim().toLowerCase();
    const normalizedPhone = phone.trim();

    if (normalizedUsername !== STORE_LOGIN_NAME) {
      return { success: false, error: "الاسم أو رقم الهاتف غير صحيح" };
    }

    let customer = await prisma.customer.findFirst({
      where: {
        phone: { has: normalizedPhone },
      },
    });

    if (!customer) {
      const customerName = await getAvailableCustomerName(STORE_LOGIN_NAME, normalizedPhone);

      customer = await prisma.customer.create({
        data: {
          name: customerName,
          phone: [normalizedPhone],
          status: "المتجر",
        },
      });
    }

    const token = signToken(customer.id, normalizedPhone);

    return {
      success: true,
      user: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone[0] ?? null,
        country: customer.country ?? null,
        city: customer.city ?? null,
        token,
      },
    };
  } catch {
    return { success: false, error: "حدث خطأ أثناء تسجيل الدخول" };
  }
}
