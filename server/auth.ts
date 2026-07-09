"use server";

import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/jwt";

const STORE_LOGIN_NAME = "skynova";

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
  phone: string,
  name?: string
): Promise<{ success: true; user: AuthUser } | { success: false; error: string }> {
  try {
    const normalizedUsername = username.trim().toLowerCase();
    const normalizedPhone = phone.trim();
    const normalizedName = name?.trim();

    if (normalizedUsername !== STORE_LOGIN_NAME) {
      return { success: false, error: "الاسم أو رقم الهاتف غير صحيح" };
    }

    let customer = await prisma.customer.findFirst({
      where: {
        phone: { has: normalizedPhone },
      },
    });

    if (!customer) {
      if (!normalizedName) {
        return { success: false, error: "الرجاء إدخال الاسم لإكمال التسجيل" };
      }

      const existingByName = await prisma.customer.findUnique({
        where: { name: normalizedName },
      });

      if (existingByName) {
        return { success: false, error: "الاسم مستخدم مسبقاً، أدخل اسماً مختلفاً" };
      }

      customer = await prisma.customer.create({
        data: {
          name: normalizedName,
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
