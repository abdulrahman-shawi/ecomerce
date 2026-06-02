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
    let customer;
    try {
      customer = await prisma.customer.findFirst({
        where: { phone: { has: phone } },
      });
    } catch (findErr) {
      console.error("Customer find error:", findErr);
    }

    if (!customer) {
      try {
        customer = await prisma.customer.create({
          data: {
            name,
            phone: [phone],
            country,
            city,
          },
        });
      } catch (createErr: any) {
        console.error("Customer create error:", createErr);
        // If name already exists, try to find by name and update phone
        if (createErr?.code === "P2002") {
          customer = await prisma.customer.findUnique({
            where: { name },
          });
          if (customer) {
            customer = await prisma.customer.update({
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
          return NextResponse.json(
            { error: "Failed to create customer", details: createErr?.message || "Unknown error" },
            { status: 500 }
          );
        }
      }
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
  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
