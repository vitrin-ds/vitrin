import type { CurrencyCode } from "@/lib/api/types/catalog";
import type { PriceRange } from "./filter-types";

// Price-range text for chips and sheet summaries. Filter bounds are whole major units, so they
// are formatted with Intl without decimals ("€25", not "€25.00"); never concatenated by hand.

const formatters = new Map<string, Intl.NumberFormat>();

export function formatWholeAmount(amount: number, currency: CurrencyCode, locale: string): string {
  const key = `${locale}|${currency}`;
  let f = formatters.get(key);
  if (!f) {
    f = new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    formatters.set(key, f);
  }
  return f.format(amount);
}

export interface PriceRangeLabels {
  between: (min: string, max: string) => string;
  from: (min: string) => string;
  upTo: (max: string) => string;
}

export const PRICE_RANGE_LABELS: PriceRangeLabels = {
  between: (min, max) => `${min} – ${max}`,
  from: (min) => `From ${min}`,
  upTo: (max) => `Up to ${max}`,
};

/** "€25 – €50" · "From €25" · "Up to €50"; "" for an open range. */
export function formatPriceRange(
  { min, max }: PriceRange,
  currency: CurrencyCode,
  locale: string,
  labels: PriceRangeLabels = PRICE_RANGE_LABELS,
): string {
  const lo = min === null ? null : formatWholeAmount(min, currency, locale);
  const hi = max === null ? null : formatWholeAmount(max, currency, locale);
  if (lo && hi) return labels.between(lo, hi);
  if (lo) return labels.from(lo);
  if (hi) return labels.upTo(hi);
  return "";
}
