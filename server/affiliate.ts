"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signToken, verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";

export interface AffiliateUser {
  id: string;
  username: string;
  email: string;
  phone: string | null;
  token: string;
}

function generateAffiliateCode(): string {
  return "AFF" + Math.random().toString(36).substring(2, 8).toUpperCase();
}

function generateUniqueCode(): string {
  return "LNK" + Math.random().toString(36).substring(2, 10).toUpperCase();
}

// ─── 1. Register Affiliate ───
export async function registerAffiliate(
  username: string,
  email: string,
  password: string,
  phone?: string
): Promise<{ success: true; user: AffiliateUser } | { success: false; error: string }> {
  try {
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return { success: false, error: "البريد الإلكتروني مسجل مسبقاً" };
    }

    const existingName = await prisma.user.findFirst({ where: { username } });
    if (existingName) {
      return { success: false, error: "اسم المستخدم مسجل مسبقاً" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    let affiliateCode = generateAffiliateCode();

    // Ensure unique affiliateCode
    while (await prisma.user.findUnique({ where: { affiliateCode } })) {
      affiliateCode = generateAffiliateCode();
    }

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        phone: phone || null,
        isAffiliate: true,
        affiliateCode,
        accountType: "STAFF",
      },
    });

    const token = signToken(user.id, user.email);

    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        token,
      },
    };
  } catch (err: any) {
    console.error("AFFILIATE REGISTER ERROR:", err?.message || err);
    return { success: false, error: "حدث خطأ أثناء التسجيل" };
  }
}

// ─── 2. Login Affiliate ───
export async function loginAffiliate(
  email: string,
  password: string
): Promise<{ success: true; user: AffiliateUser } | { success: false; error: string }> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.isAffiliate) {
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
        username: user.username,
        email: user.email,
        phone: user.phone,
        token,
      },
    };
  } catch {
    return { success: false, error: "حدث خطأ أثناء تسجيل الدخول" };
  }
}

// ─── 3. Create Affiliate Link ───
export async function createAffiliateLink(
  userId: string,
  productId: number,
  commissionRate?: number
): Promise<{ success: true; link: { id: string; uniqueCode: string; productName: string } } | { success: false; error: string }> {
  try {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return { success: false, error: "المنتج غير موجود" };
    }

    let uniqueCode = generateUniqueCode();
    while (await prisma.affiliateLink.findUnique({ where: { uniqueCode } })) {
      uniqueCode = generateUniqueCode();
    }

    const link = await prisma.affiliateLink.create({
      data: {
        userId,
        productId,
        uniqueCode,
        commissionRate: commissionRate ?? 10,
      },
    });

    return {
      success: true,
      link: {
        id: link.id,
        uniqueCode: link.uniqueCode,
        productName: product.name,
      },
    };
  } catch (err: any) {
    console.error("CREATE LINK ERROR:", err?.message || err);
    return { success: false, error: "حدث خطأ أثناء إنشاء الرابط" };
  }
}

// ─── 4. Get Affiliate Links ───
export async function getAffiliateLinks(userId: string) {
  return prisma.affiliateLink.findMany({
    where: { userId },
    include: { product: { select: { id: true, name: true, affiliatePrice: true } } },
    orderBy: { createdAt: "desc" },
  });
}

// ─── 5. Get Dashboard Stats ───
export async function getAffiliateDashboard(userId: string) {
  const links = await prisma.affiliateLink.findMany({
    where: { userId },
    include: {
      product: { select: { name: true } },
      _count: { select: { commissions: true } },
    },
  });

  const commissions = await prisma.commission.findMany({
    where: {
      affiliateLink: { userId },
    },
  });

  const totalClicks = links.reduce((sum, l) => sum + l.clicks, 0);
  const totalConversions = links.reduce((sum, l) => sum + l.conversions, 0);
  const totalCommissions = commissions.reduce((sum, c) => sum + c.amount, 0);
  const pendingCommissions = commissions
    .filter((c) => c.status === "PENDING")
    .reduce((sum, c) => sum + c.amount, 0);
  const paidCommissions = commissions
    .filter((c) => c.status === "PAID")
    .reduce((sum, c) => sum + c.amount, 0);

  return {
    totalClicks,
    totalConversions,
    totalCommissions,
    pendingCommissions,
    paidCommissions,
    linksCount: links.length,
    links,
  };
}

// ─── 6. Get Commissions ───
export async function getAffiliateCommissions(userId: string) {
  return prisma.commission.findMany({
    where: {
      affiliateLink: { userId },
    },
    include: {
      affiliateLink: {
        include: {
          product: { select: { name: true } },
        },
      },
      order: { select: { orderNumber: true, createdAt: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

// ─── 7. Get Current Affiliate from Cookie ───
export async function getCurrentAffiliate(): Promise<AffiliateUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("affiliate-token")?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId, isAffiliate: true },
    select: { id: true, username: true, email: true, phone: true },
  });

  if (!user) return null;

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    phone: user.phone,
    token,
  };
}

// ─── 8. Track Click ───
export async function trackAffiliateClick(uniqueCode: string): Promise<{ productId: number; productSlug: string | null } | null> {
  try {
    const link = await prisma.affiliateLink.findUnique({
      where: { uniqueCode },
      include: { product: { select: { id: true, seoSlug: true } } },
    });

    if (!link) return null;

    await prisma.affiliateLink.update({
      where: { id: link.id },
      data: { clicks: { increment: 1 } },
    });

    return {
      productId: link.productId,
      productSlug: link.product.seoSlug,
    };
  } catch {
    return null;
  }
}

// ─── 9. Process Commission on Order ───
export async function processAffiliateCommission(
  orderId: number,
  affiliateCode: string
): Promise<void> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
            affiliateLink: true,
          },
        },
      },
    });

    if (!order) return;

    for (const item of order.items) {
      if (!item.affiliateLinkId) continue;

      const link = await prisma.affiliateLink.findUnique({
        where: { id: item.affiliateLinkId },
      });

      if (!link) continue;

      const productPrice =
        item.product.affiliatePrice > 0
          ? item.product.affiliatePrice
          : item.price;

      const commissionRate =
        item.product.affiliateCommissionRate != null
          ? item.product.affiliateCommissionRate
          : link.commissionRate;

      const commissionAmount = (productPrice * item.quantity * commissionRate) / 100;

      await prisma.commission.create({
        data: {
          affiliateLinkId: link.id,
          orderId: order.id,
          amount: Math.round(commissionAmount * 100) / 100,
          status: "PENDING",
        },
      });

      await prisma.affiliateLink.update({
        where: { id: link.id },
        data: { conversions: { increment: 1 } },
      });
    }
  } catch (err: any) {
    console.error("PROCESS COMMISSION ERROR:", err?.message || err);
  }
}
