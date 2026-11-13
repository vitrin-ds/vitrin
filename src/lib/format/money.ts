import type { Money } from "@/lib/api/types/catalog";

// Prices are formatted, never concatenated. Minor units → major with the
// currency's own fraction digits. Whole amounts drop the decimals ("€28", not "€28.00"; decided
// 10 Nov 2026); other amounts keep them ("€28.50").

const formatters = new Map<string, Intl.NumberFormat>();

function formatter(locale: string, currency: string): Intl.NumberFormat {
  const key = `${locale}|${currency}`;
  let cached = formatters.get(key);
  if (!cached) {
    cached = new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      trailingZeroDisplay: "stripIfInteger",
    });
    formatters.set(key, cached);
  }
  return cached;
}

/** `formatMoney({ amount: 7000, currency: "EUR" })` → "€70" (en) · "70 €" (de); 7050 → "€70.50". */
export function formatMoney(money: Money, locale = "en"): string {
  const f = formatter(locale, money.currency);
  const digits = f.resolvedOptions().maximumFractionDigits ?? 2;
  return f.format(money.amount / 10 ** digits);
}

/** Whole-number percentage saved, for "−20%" labels. 0 when there is no discount. */
export function discountPercent(price: Money, compareAt: Money | undefined): number {
  if (!compareAt || compareAt.amount <= price.amount || compareAt.amount === 0) return 0;
  return Math.round((1 - price.amount / compareAt.amount) * 100);
}
