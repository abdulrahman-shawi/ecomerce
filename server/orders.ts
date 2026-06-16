"use server";

import { prisma } from "@/lib/prisma";

export async function getCustomerOrders(customerId: string) {
  const orders = await prisma.order.findMany({
    where: { customerId },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              images: {
                where: { type: "main" },
                take: 1,
                select: { url: true },
              },
            },
          },
        },
      },
      shipping: {
        select: { name: true, price: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return orders;
}

export async function getOrdersByPhone(phone: string) {
  const customer = await prisma.customer.findFirst({
    where: { phone: { has: phone } },
  });

  if (!customer) return [];

  return getCustomerOrders(customer.id);
}
