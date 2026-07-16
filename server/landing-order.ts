"use server";

import { calculateAffiliateCommissionAmount } from "@/lib/affiliate-commission";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export interface LandingOrderInput {
  productId: number;
  quantity: number;
  customerId?: string | null;
  authToken?: string;
  name: string;
  phone: string;
  country: "SY";
  city: string;
  address: string;
  notes?: string;
}

interface QuantityDiscountTier {
  minQty: number;
  discountPercent: number;
}

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

function normalizeQuantityDiscountTiers(value: unknown): QuantityDiscountTier[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((tier: any) => {
      const minQty = Number(tier?.minQty ?? tier?.quantity ?? tier?.fromQuantity ?? tier?.minQuantity ?? 0);
      const discountPercent = Number(tier?.discountPercent ?? tier?.discount ?? tier?.percent ?? 0);

      if (!Number.isFinite(minQty) || minQty < 1 || !Number.isFinite(discountPercent) || discountPercent <= 0) {
        return null;
      }

      return {
        minQty: Math.floor(minQty),
        discountPercent,
      };
    })
    .filter((tier): tier is QuantityDiscountTier => tier !== null)
    .sort((a, b) => a.minQty - b.minQty);
}

function getAppliedQuantityDiscountTier(tiers: QuantityDiscountTier[], quantity: number): QuantityDiscountTier | null {
  if (quantity < 1) return null;

  return tiers
    .filter((tier) => tier.minQty <= quantity)
    .sort((a, b) => b.minQty - a.minQty)[0] ?? null;
}

export async function createLandingOrder(input: LandingOrderInput) {
  try {
    const { productId, quantity, customerId, authToken, name, phone, city, address, notes } = input;
    const country = "SY";

    if (!productId || !quantity || !name || !phone || !city || !address) {
      return { success: false, error: "يرجى تعبئة جميع الحقول المطلوبة" };
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { stocks: true, landingPage: true },
    });

    if (!product || !product.isActive) {
      return { success: false, error: "المنتج غير موجود أو غير نشط" };
    }

    const stockCountry = "سوريا";
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
    const originalUnitPrice = firstStock?.price ?? product.affiliatePrice;
    const stockDiscount =
      firstStock && firstStock.price > firstStock.discount ? firstStock.discount : 0;
    const baseUnitPrice = Math.max(originalUnitPrice - stockDiscount, 0);
    const quantityDiscountTiers = normalizeQuantityDiscountTiers(product.landingPage?.quantityDiscountTiers);
    const appliedQuantityDiscountTier = getAppliedQuantityDiscountTier(quantityDiscountTiers, quantity);
    const unitPrice = appliedQuantityDiscountTier
      ? Math.max(0, Math.round(baseUnitPrice * (1 - appliedQuantityDiscountTier.discountPercent / 100)))
      : baseUnitPrice;
    const totalPrice = unitPrice * quantity;
    const totalDiscount = Math.max(originalUnitPrice * quantity - totalPrice, 0);
    const totalAmount = originalUnitPrice * quantity;
    const authPayload = authToken ? verifyToken(authToken) : null;
    const authenticatedCustomerId = authPayload?.userId ?? customerId ?? null;

    const { order } = await prisma.$transaction(async (tx) => {
      let customer = authenticatedCustomerId
        ? await tx.customer.findUnique({ where: { id: authenticatedCustomerId } })
        : null;

      if (customer) {
        customer = await tx.customer.update({
          where: { id: customer.id },
          data: {
            status: "المتجر",
            country,
            city,
            source: customer.source ?? "landing_page",
            ...(!customer.phone.includes(phone) ? { phone: { push: phone } } : {}),
          },
        });
      } else {
        customer = await tx.customer.findFirst({
          where: {
            name,
            phone: { has: phone },
          },
        });

        if (!customer) {
          const existingByPhone = await tx.customer.findFirst({
            where: { phone: { has: phone } },
          });
          const existingByName = await tx.customer.findUnique({ where: { name } });
          customer = existingByPhone ?? existingByName;
        }

        if (customer) {
          customer = await tx.customer.update({
            where: { id: customer.id },
            data: {
              status: "المتجر",
              country,
              city,
              source: customer.source ?? "landing_page",
              ...(!customer.phone.includes(phone) ? { phone: { push: phone } } : {}),
            },
          });
        } else {
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
                    status: "المتجر",
                    country,
                    city,
                    source: customer.source ?? "landing_page",
                    ...(!customer.phone.includes(phone) ? { phone: { push: phone } } : {}),
                  },
                });
              }
            }
            if (!customer) {
              throw new Error(createErr?.message || "فشل إنشاء العميل");
            }
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
          totalAmount,
          finalAmount: totalPrice,
          discount: totalDiscount,
          paymentMethod: "CASH",
          receiverName: name,
          receiverPhone: [phone],
          country,
          city,
          fullAddress: address,
          deliveryNotes: notes,
          status: "المتجر",
          customerId: customer.id,
          warehouseId: warehouse.id,
        },
      });

      // Create order item
      const affiliateLinkId = affiliateLink?.productId === productId ? affiliateLink.id : null;
      await tx.orderItem.create({
        data: {
          quantity,
          price: unitPrice,
          discount: Math.max(originalUnitPrice - unitPrice, 0),
          productId,
          orderId: order.id,
          affiliateLinkId,
        },
      });

      // Create commission if affiliate link matches
      if (affiliateLinkId && affiliateLink) {
        const commissionAmount = calculateAffiliateCommissionAmount({
          affiliatePrice: product.affiliatePrice,
          affiliateCommissionRate: product.affiliateCommissionRate,
          linkCommissionRate: affiliateLink.commissionRate,
          basePrice: unitPrice,
          quantity,
        });

        await tx.commission.create({
          data: {
            affiliateLinkId: affiliateLink.id,
            orderId: order.id,
            amount: commissionAmount,
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
