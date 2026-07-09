import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

function getAuthenticatedUserId(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  const authToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length).trim()
    : null;

  if (!authToken) return null;

  const payload = verifyToken(authToken);
  return payload?.userId ?? null;
}

export async function PUT(request: NextRequest) {
  try {
    const userId = getAuthenticatedUserId(request);

    if (!userId) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const body = await request.json();
    const name = String(body.name || "").trim();
    const phone = String(body.phone || "").trim();
    const country = body.country ? String(body.country).trim() : null;
    const city = body.city ? String(body.city).trim() : null;

    if (!name || !phone) {
      return NextResponse.json(
        { error: "الاسم ورقم الهاتف مطلوبان" },
        { status: 400 }
      );
    }

    const updatedCustomer = await prisma.customer.update({
      where: { id: userId },
      data: {
        name,
        phone: [phone],
        country,
        countryCode: country,
        city,
        status: "المتجر",
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedCustomer.id,
        name: updatedCustomer.name,
        phone: updatedCustomer.phone[0] ?? null,
        country: updatedCustomer.country ?? null,
        city: updatedCustomer.city ?? null,
      },
    });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "الاسم مستخدم مسبقاً، اختر اسماً آخر" },
        { status: 409 }
      );
    }

    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء تحديث البيانات" },
      { status: 500 }
    );
  }
}