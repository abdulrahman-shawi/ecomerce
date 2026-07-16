import { prisma } from "@/lib/prisma";

export type CountryCode = "TR" | "SY";

const SYRIA_COUNTRY: CountryCode = "SY";

export function getServerCountry(): CountryCode {
  return SYRIA_COUNTRY;
}

/**
 * Returns warehouse ids matching the given country based on warehouse
 * `location` or `name` containing "تركيا" for TR or "سوريا" for SY.
 * If no warehouses match, returns all warehouse ids as a fallback.
 */
export async function getWarehouseIdsByCountry(
  country: CountryCode
): Promise<number[]> {
  const warehouses = await prisma.warehouse.findMany();
  const stockCountry = country === "TR" ? "سوريا" : "سوريا";

  const matching = warehouses.filter(
    (w) =>
      w.location.toLowerCase().includes(stockCountry.toLowerCase()) ||
      w.name.toLowerCase().includes(stockCountry.toLowerCase())
  );

  const ids = matching.map((w) => w.id);
  return ids.length > 0 ? ids : warehouses.map((w) => w.id);
}
