import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const VISITOR_COOKIE_NAME = "ad-visitor-id";
const VISITOR_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function detectBrowser(userAgent: string | null) {
  if (!userAgent) return null;

  if (/edg/i.test(userAgent)) return "Edge";
  if (/opr|opera/i.test(userAgent)) return "Opera";
  if (/chrome|crios/i.test(userAgent) && !/edg|opr|opera/i.test(userAgent)) return "Chrome";
  if (/firefox|fxios/i.test(userAgent)) return "Firefox";
  if (/safari/i.test(userAgent) && !/chrome|crios|android/i.test(userAgent)) return "Safari";

  return "Other";
}

function detectOs(userAgent: string | null) {
  if (!userAgent) return null;

  if (/windows/i.test(userAgent)) return "Windows";
  if (/android/i.test(userAgent)) return "Android";
  if (/iphone|ipad|ipod/i.test(userAgent)) return "iOS";
  if (/mac os x|macintosh/i.test(userAgent)) return "macOS";
  if (/linux/i.test(userAgent)) return "Linux";

  return "Other";
}

function detectDeviceType(userAgent: string | null) {
  if (!userAgent) return null;

  if (/ipad|tablet|playbook|silk/i.test(userAgent)) return "Tablet";
  if (/mobi|android|iphone|ipod|phone/i.test(userAgent)) return "Mobile";

  return "Desktop";
}

function normalizeLocale(acceptLanguage: string | null) {
  if (!acceptLanguage) return null;

  const primaryLocale = acceptLanguage.split(",")[0]?.trim();
  return primaryLocale || null;
}

async function adPageVisitsTableExists() {
  const result = await prisma.$queryRaw<Array<{ regclass: string | null }>>`
    SELECT to_regclass('public.ad_page_visits') AS regclass
  `;

  return Boolean(result[0]?.regclass);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const productId = Number(body?.productId);
    const path = typeof body?.path === "string" ? body.path.trim() : "";

    if (!Number.isInteger(productId) || productId <= 0 || !path) {
      return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 });
    }

    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        isActive: true,
        showInAds: true,
        landingPage: {
          is: {
            isActive: true,
          },
        },
      },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json({ success: false, error: "Ad page is unavailable" }, { status: 404 });
    }

    if (!(await adPageVisitsTableExists())) {
      return NextResponse.json({ success: true, tracked: false, reason: "missing_table" }, { status: 202 });
    }

    const existingVisitorId = request.cookies.get(VISITOR_COOKIE_NAME)?.value;
    const visitorId = existingVisitorId || randomUUID();
    const userAgent = request.headers.get("user-agent");
    const referrer = request.headers.get("referer");
    const locale = normalizeLocale(request.headers.get("accept-language"));

    await prisma.adPageVisit.create({
      data: {
        productId,
        visitorId,
        path,
        referrer,
        userAgent,
        browser: detectBrowser(userAgent),
        os: detectOs(userAgent),
        deviceType: detectDeviceType(userAgent),
        locale,
      },
    });

    const response = NextResponse.json({ success: true, tracked: true });

    if (!existingVisitorId) {
      response.cookies.set({
        name: VISITOR_COOKIE_NAME,
        value: visitorId,
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: VISITOR_COOKIE_MAX_AGE,
        path: "/",
      });
    }

    return response;
  } catch {
    return NextResponse.json({ success: false, error: "Unable to track ad visit" }, { status: 500 });
  }
}