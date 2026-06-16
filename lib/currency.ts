export function formatPrice(price: number, currency: string = "USD"): string {
  const symbol = getCurrencySymbol(currency);
  return `${price.toFixed(2)} ${symbol}`;
}

export function getCurrencySymbol(currency: string = "USD"): string {
  const symbols: Record<string, string> = {
    USD: "$",
    TRY: "₺",
    SYP: "ل.س",
    SAR: "ر.س",
    AED: "د.إ",
    EUR: "€",
    GBP: "£",
  };

  return symbols[currency.toUpperCase()] || currency.toUpperCase();
}
