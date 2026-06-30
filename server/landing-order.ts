"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export interface LandingOrderInput {
  productId: number;
  quantity: number;
  name: string;
  phone: string;
  country: "SY" | "TR";
  city: string;
  address: string;
  notes?: string;
}

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

export async function createLandingOrder(input: LandingOrderInput) {
  try {
    const { productId, quantity, name, phone, country, city, address, notes } = input;

    if (!productId || !quantity || !name || !phone || !country || !city || !address) {
      return { success: false, error: "يرجى تعبئة جميع الحقول المطلوبة" };
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { stocks: true },
    });

    if (!product || !product.isActive) {
      return { success: false, error: "المنتج غير موجود أو غير نشط" };
    }

    const stockCountry = country === "TR" ? "تركيا" : "سوريا";
    const warehouses = await prisma.warehouse.findMany();
    const warehouse =
      warehouses.find(
        (w) =>
          w.location.toLowerCase().includes(stockCountry.toLowerCase()) ||
          w.name.toLowerCase().includes(stockCountry.toLowerCase())
      ) ?? warehouses[0];

    if (!warehouse) {
      return { success: false, error: "لا يوجد مستودع متاح" };
    }

    const stocks = await prisma.productStock.findMany({
      where: { productId, warehouseId: warehouse.id },
      orderBy: { quantity: "desc" },
    });

    const totalAvailable = stocks.reduce((sum, s) => sum + s.quantity, 0);
    if (totalAvailable < quantity) {
      return {
        success: false,
        error: `الكمية غير متوفرة. المتاح: ${totalAvailable}، المطلوب: ${quantity}`,
      };
    }

    // Read affiliate code
    const cookieStore = await cookies();
    const affiliateCode = cookieStore.get("affiliate-code")?.value || null;
    let affiliateLink: {
      id: string;
      userId: string;
      commissionRate: number;
      productId: number;
    } | null = null;
    if (affiliateCode) {
      affiliateLink = await prisma.affiliateLink.findUnique({
        where: { uniqueCode: affiliateCode },
        select: { id: true, userId: true, commissionRate: true, productId: true },
      });
    }

    const firstStock = stocks[0];
    const unitPrice = firstStock ? firstStock.discount : product.affiliatePrice;
    const totalPrice = unitPrice * quantity;

    const { order } = await prisma.$transaction(async (tx) => {
      // Find or create customer
      let customer = await tx.customer.findFirst({
        where: { phone: { has: phone } },
      });

      if (!customer) {
        try {
          customer = await tx.customer.create({
            data: {
              name,
              phone: [phone],
              status: "المتجر",
              phonestatus: "معلق",
              country,
              city,
              source: "landing_page",
            },
          });
        } catch (createErr: any) {
          if (createErr?.code === "P2002") {
            customer = await tx.customer.findUnique({ where: { name } });
            if (customer) {
              customer = await tx.customer.update({
                where: { id: customer.id },
                data: {
                  phone: { push: phone },
                  country,
                  city,
                },
              });
            }
          }
          if (!customer) {
            throw new Error(createErr?.message || "فشل إنشاء العميل");
          }
        }
      }

      // Deduct stock
      let remaining = quantity;
      for (const stock of stocks) {
        if (remaining <= 0) break;
        const deduct = Math.min(stock.quantity, remaining);
        await tx.productStock.update({
          where: { id: stock.id },
          data: { quantity: { decrement: deduct } },
        });
        remaining -= deduct;
      }

      // Create order
      const order = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          totalAmount: totalPrice,
          finalAmount: totalPrice,
          discount: 0,
          paymentMethod: "CASH",
          receiverName: name,
          receiverPhone: [phone],
          country,
          city,
          fullAddress: address,
          deliveryNotes: notes,
          status: "المتجر",
          customerId: customer.id,
          userId: affiliateLink?.productId === productId ? affiliateLink.userId : undefined,
          warehouseId: warehouse.id,
        },
      });

      // Create order item
      const affiliateLinkId = affiliateLink?.productId === productId ? affiliateLink.id : null;
      await tx.orderItem.create({
        data: {
          quantity,
          price: unitPrice,
          discount: 0,
          productId,
          orderId: order.id,
          affiliateLinkId,
        },
      });

      // Create commission if affiliate link matches
      if (affiliateLinkId && affiliateLink) {
        const commissionRate =
          product.affiliateCommissionRate ?? affiliateLink.commissionRate ?? 10;
        const basePrice = product.affiliatePrice > 0 ? product.affiliatePrice : unitPrice;
        const commissionAmount = (basePrice * quantity * commissionRate) / 100;

        await tx.commission.create({
          data: {
            affiliateLinkId: affiliateLink.id,
            orderId: order.id,
            amount: Math.round(commissionAmount * 100) / 100,
            status: "PENDING",
          },
        });

        await tx.affiliateLink.update({
          where: { id: affiliateLink.id },
          data: { conversions: { increment: 1 } },
        });
      }

      return { order };
    });

    revalidatePath("/");

    return { success: true, orderNumber: order.orderNumber };
  } catch (error: any) {
    console.error("Landing order error:", error);
    return { success: false, error: error.message || "حدث خطأ أثناء إنشاء الطلب" };
  }
}
