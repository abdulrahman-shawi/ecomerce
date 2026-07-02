"use server";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

const orderInclude = {
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
} as const;

export async function getCustomerOrders(customerId: string) {
  const orders = await prisma.order.findMany({
    where: { customerId },
    include: orderInclude,
    orderBy: { createdAt: "desc" },
  });

  return orders;
}

export async function getOrdersForAccount(name: string, phone?: string | null) {
  const filters: Prisma.OrderWhereInput[] = [
    { customer: { is: { name } } },
    { receiverName: name },
  ];

  if (phone) {
    filters.push(
      { customer: { is: { phone: { has: phone } } } },
      { receiverPhone: { has: phone } }
    );
  }

  return prisma.order.findMany({
    where: {
      OR: filters,
    },
    include: orderInclude,
    orderBy: { createdAt: "desc" },
  });
}

export async function getOrdersByPhone(phone: string) {
  const customer = await prisma.customer.findFirst({
    where: { phone: { has: phone } },
  });

  if (!customer) return [];

  return getCustomerOrders(customer.id);
}
