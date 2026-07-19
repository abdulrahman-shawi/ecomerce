import { prisma } from "@/lib/prisma";

export type CountryCode = "LB" | "SY" | "TR" | "IQ";

const SYRIA_COUNTRY: CountryCode = "SY";

const COUNTRY_SEARCH_TERMS: Record<CountryCode, string[]> = {
  LB: ["LB", "LEB", "LEBANON", "لبنان"],
  SY: ["SY", "SYR", "SYRIA", "سوريا", "سورية"],
  TR: ["TR", "TUR", "TURKEY", "TURKIYE", "T\u00dcRKIYE", "تركيا"],
  IQ: ["IQ", "IRQ", "IRAQ", "العراق"],
};

export function normalizeCountryCode(value: string | null | undefined): CountryCode {
  const normalizedValue = String(value || "").trim().toUpperCase();

  if (normalizedValue in COUNTRY_SEARCH_TERMS) {
    return normalizedValue as CountryCode;
  }

  return SYRIA_COUNTRY;
}

function warehouseMatchesCountry(
  warehouse: { name: string | null; location: string | null },
  country: CountryCode
) {
  const haystack = `${warehouse.name || ""} ${warehouse.location || ""}`.toUpperCase();
  return COUNTRY_SEARCH_TERMS[country].some((term) => haystack.includes(term.toUpperCase()));
}

export async function findWarehousesByCountry(country: CountryCode) {
  const warehouses = await prisma.warehouse.findMany();
  return warehouses.filter((warehouse) => warehouseMatchesCountry(warehouse, country));
}

export async function getPreferredWarehouseByCountry(country: CountryCode) {
  const warehouses = await findWarehousesByCountry(country);
  return warehouses[0] ?? null;
}

export function getServerCountry(): CountryCode {
  return SYRIA_COUNTRY;
}

/**
 * Returns warehouse ids matching the given country based on warehouse
 * `location` or `name` containing any configured aliases for that country.
 */
export async function getWarehouseIdsByCountry(
  country: CountryCode
): Promise<number[]> {
  const warehouses = await findWarehousesByCountry(country);
  return warehouses.map((warehouse) => warehouse.id);
}
