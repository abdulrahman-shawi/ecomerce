"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/jwt";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  token: string;
}

export async function loginUser(email: string, password: string): Promise<{ success: true; user: AuthUser } | { success: false; error: string }> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { success: false, error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" };
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return { success: false, error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" };
    }

    const token = signToken(user.id, user.email);

    return {
      success: true,
      user: {
        id: user.id,
        name: user.username,
        email: user.email,
        phone: user.phone ?? null,
        token,
      },
    };
  } catch {
    return { success: false, error: "حدث خطأ أثناء تسجيل الدخول" };
  }
}

export async function registerUser(
  name: string,
  email: string,
  password: string
): Promise<{ success: true; user: AuthUser } | { success: false; error: string }> {
  try {
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return { success: false, error: "البريد الإلكتروني مسجل مسبقاً" };
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        username: name,
        email,
        password: hashedPassword,
      },
    });

    const token = signToken(user.id, user.email);

    return {
      success: true,
      user: {
        id: user.id,
        name: user.username,
        email: user.email,
        phone: user.phone ?? null,
        token,
      },
    };
  } catch {
    return { success: false, error: "حدث خطأ أثناء إنشاء الحساب" };
  }
}
