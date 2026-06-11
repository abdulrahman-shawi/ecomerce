import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      phone,
      country,
      city,
      address,
      notes,
      lat,
      lng,
      items,
      totalPrice,
    } = body;

    if (!name || !phone || !country || !city || !address || !items?.length) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // ─── Read affiliate code from body (most reliable) or cookie ───
    const cookieStore = await cookies();
    const cookieCode = cookieStore.get("affiliate-code")?.value;
    const bodyCode = body.affiliateCode;
    const affiliateCode = bodyCode || cookieCode || null;
    let affiliateLink: { id: string; commissionRate: number; productId: number } | null = null;

    if (affiliateCode) {
      affiliateLink = await prisma.affiliateLink.findUnique({
        where: { uniqueCode: affiliateCode },
        select: { id: true, commissionRate: true, productId: true },
      });
    }

    const stockCountry = country === "TR" ? "تركيا" : "سوريا";

    const { customer, order } = await prisma.$transaction(async (tx) => {
      // ─── 1. Find or create customer ───
      let customer = await tx.customer.findFirst({
        where: { phone: { has: phone } },
      });

      if (!customer) {
        try {
          customer = await tx.customer.create({
            data: {
              name,
              phone: [phone],
              status: "المتجر ",
              phonestatus: "معلق",
              country,
              city,
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
            throw new Error(
              `Failed to create customer: ${createErr?.message || "Unknown error"}`
            );
          }
        }
      }

      // ─── 2. Determine warehouse by country ───
      const warehouses = await tx.warehouse.findMany();
      const warehouse = warehouses.find((w) =>
        w.location.toLowerCase().includes(stockCountry.toLowerCase()) ||
        w.name.toLowerCase().includes(stockCountry.toLowerCase())
      ) ?? warehouses[0];

      if (!warehouse) {
        throw new Error("No warehouse found");
      }

      // ─── 3. Validate & deduct stock ───
      for (const item of items) {
        const stocks = await tx.productStock.findMany({
          where: {
            productId: item.id,
            warehouseId: warehouse.id,
          },
          orderBy: { quantity: "desc" },
        });

        const totalAvailable = stocks.reduce((sum, s) => sum + s.quantity, 0);
        if (totalAvailable < item.quantity) {
          throw new Error(
            `Insufficient stock for product ${item.name}. Available: ${totalAvailable}, Requested: ${item.quantity}`
          );
        }

        let remaining = item.quantity;
        for (const stock of stocks) {
          if (remaining <= 0) break;
          const deduct = Math.min(stock.quantity, remaining);
          await tx.productStock.update({
            where: { id: stock.id },
            data: { quantity: { decrement: deduct } },
          });
          remaining -= deduct;
        }
      }

      // ─── 4. Update customer status ───
      customer = await tx.customer.update({
        where: { id: customer.id },
        data: { status: "تم البيع" },
      });

      // ─── 5. Generate Google Maps link ───
      let googleMapsLink: string | undefined;
      if (lat != null && lng != null) {
        googleMapsLink = `https://www.google.com/maps?q=${lat},${lng}`;
      }

      // ─── 6. Create order (without items first) ───
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
          deliveryNotes: notes || undefined,
          googleMapsLink,
          status: "المتجر",
          customerId: customer.id,
          warehouseId: warehouse.id,
        },
      });

      // ─── 7. Create order items with affiliate link tracking ───
      for (const item of items) {
        const itemAffiliateLinkId =
          affiliateLink && affiliateLink.productId === item.id
            ? affiliateLink.id
            : null;

        await tx.orderItem.create({
          data: {
            quantity: item.quantity,
            price: item.price,
            discount: 0,
            productId: item.id,
            orderId: order.id,
            affiliateLinkId: itemAffiliateLinkId,
          },
        });
      }

      // ─── 8. Create commission if affiliate link matches ───
      if (affiliateLink) {
        const matchedItem = items.find((i: any) => i.id === affiliateLink!.productId);
        if (matchedItem) {
          const product = await tx.product.findUnique({
            where: { id: matchedItem.id },
            select: { affiliatePrice: true, affiliateCommissionRate: true },
          });

          const basePrice =
            product && product.affiliatePrice > 0
              ? product.affiliatePrice
              : matchedItem.price;

          const commissionRate =
            product && product.affiliateCommissionRate != null
              ? product.affiliateCommissionRate
              : affiliateLink.commissionRate;

          const commissionAmount =
            (basePrice * matchedItem.quantity * commissionRate) / 100;

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
      }

      return { customer, order };
    });

    return NextResponse.json(
      { success: true, order, customer },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
