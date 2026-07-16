interface CalculateAffiliateCommissionInput {
  affiliatePrice?: number | null;
  affiliateCommissionRate?: number | null;
  linkCommissionRate?: number | null;
  basePrice: number;
  quantity: number;
}

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

export function calculateAffiliateCommissionAmount({
  affiliatePrice,
  affiliateCommissionRate,
  linkCommissionRate,
  basePrice,
  quantity,
}: CalculateAffiliateCommissionInput): number {
  const normalizedQuantity = Number.isFinite(quantity) && quantity > 0 ? quantity : 0;
  const fixedCommission = Number(affiliatePrice ?? 0);

  if (fixedCommission > 0) {
    return roundCurrency(fixedCommission * normalizedQuantity);
  }

  const commissionRate = affiliateCommissionRate ?? linkCommissionRate ?? 10;
  return roundCurrency((basePrice * normalizedQuantity * commissionRate) / 100);
}