import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
      email,
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

    // Execute everything in a single transaction
    const { customer, order } = await prisma.$transaction(async (tx) => {
      // 1. Search for existing customer by phone
      let customer = await tx.customer.findFirst({
        where: { phone: { has: phone } },
      });

      // 2. If not found, create a new customer
      if (!customer) {
        try {
          customer = await tx.customer.create({
            data: {
              name,
              phone: [phone],
              status: "فرصة جديدة",
              phonestatus: "معلق",
              country,
              city,
            },
          });
        } catch (createErr: any) {
          // If name is duplicate (P2002), find existing customer by name and update phone
          if (createErr?.code === "P2002") {
            customer = await tx.customer.findUnique({
              where: { name },
            });
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

      // 3. Generate Google Maps link if coordinates exist
      let googleMapsLink: string | undefined;
      if (lat != null && lng != null) {
        googleMapsLink = `https://www.google.com/maps?q=${lat},${lng}`;
      }

      // 4. Create the order linked to the customer
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
          status: "PENDING",
          customerId: customer.id,
          items: {
            create: items.map((item: any) => ({
              quantity: item.quantity,
              price: item.price,
              discount: 0,
              productId: item.id,
            })),
          },
        },
        include: {
          items: true,
        },
      });

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
