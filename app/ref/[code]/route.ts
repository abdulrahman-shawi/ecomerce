import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  const code = params.code;

  try {
    const link = await prisma.affiliateLink.findUnique({
      where: { uniqueCode: code },
      include: {
        product: {
          select: { id: true, seoSlug: true, isActive: true },
        },
      },
    });

    if (!link || !link.product?.isActive) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Increment clicks
    await prisma.affiliateLink.update({
      where: { id: link.id },
      data: { clicks: { increment: 1 } },
    });

    const productUrl = link.product.seoSlug
      ? `/product/${link.product.seoSlug}`
      : `/product/${link.product.id}`;

    const response = NextResponse.rewrite(new URL(productUrl, request.url));

    // Set affiliate cookie for 30 days
    // Using sameSite: "none" + secure for maximum compatibility in production
    response.cookies.set("affiliate-code", code, {
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
      httpOnly: false,
      sameSite: "none",
      secure: true,
    });

    return response;
  } catch {
    return NextResponse.redirect(new URL("/", request.url));
  }
}
