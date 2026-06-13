import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerCountry, getWarehouseIdsByCountry } from "@/lib/region";

export async function GET() {
  const country = getServerCountry();
  const warehouseIds = await getWarehouseIdsByCountry(country);

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      stocks: {
        some: {
          warehouseId: { in: warehouseIds },
        },
      },
    },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ products });
}
