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

    // Create or find customer by phone
    let customer = await prisma.customer.findFirst({
      where: { phone: { has: phone } },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name,
          phone: [phone],
          country,
          city,
        },
      });
    }

    // Generate Google Maps link if coordinates exist
    let googleMapsLink: string | undefined;
    if (lat != null && lng != null) {
      googleMapsLink = `https://www.google.com/maps?q=${lat},${lng}`;
    }

    // Create order
    const order = await prisma.order.create({
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

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
