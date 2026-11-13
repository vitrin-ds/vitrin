/** A whole-number discount as a localised percentage: "20%" in English, "%20" in Turkish. */
export function formatDiscount(discount: number, locale = "en"): string {
  return new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 0 }).format(
    discount / 100,
  );
}
