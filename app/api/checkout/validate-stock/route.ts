import { NextRequest, NextResponse } from "next/server";
import { getWarehouseIdsByCountry } from "@/lib/region";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items } = body;

    if (!items?.length) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    const sourceWarehouseIds = await getWarehouseIdsByCountry("SY");

    if (sourceWarehouseIds.length === 0) {
      return NextResponse.json(
        { error: "No Syria warehouses found" },
        { status: 404 }
      );
    }

    const outOfStock: { id: number; name: string; requested: number; available: number }[] = [];

    for (const item of items) {
      const stocks = await prisma.productStock.findMany({
        where: {
          productId: item.id,
          warehouseId: { in: sourceWarehouseIds },
        },
      });

      const totalAvailable = stocks.reduce((sum, s) => sum + s.quantity, 0);

      if (totalAvailable < item.quantity) {
        outOfStock.push({
          id: item.id,
          name: item.name,
          requested: item.quantity,
          available: totalAvailable,
        });
      }
    }

    return NextResponse.json({
      success: true,
      warehouseName: "Syria Warehouses",
      outOfStock,
      isValid: outOfStock.length === 0,
    });
  } catch (error: any) {
    console.error("Validate stock error:", error);
    return NextResponse.json(
      { error: "Server error", details: error?.message },
      { status: 500 }
    );
  }
}
