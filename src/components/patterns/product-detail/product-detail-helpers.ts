import type { Money, Product, ProductVariant } from "@/lib/api/types/catalog";

// Pure mappers of the product-detail block: the variant axis and titles, EU unit prices and the
// discount of the shown variant. Unit-tested through the site's pdp-view tests.

/** The variant axis (the products have one): "shade" / "size". */
export function variantAxis(product: Pick<Product, "variants">): string | undefined {
  return product.variants[0]?.options[0]?.name;
}

/** "Rosewood", "50 ml": the variant's option values. */
export function variantTitle(variant: Pick<ProductVariant, "options">): string {
  return variant.options.map((option) => option.value).join(" / ");
}

const VOLUME = /^(\d+(?:[.,]\d+)?)\s*ml$/i;

/**
 * Price per 100 ml for a size like "50 ml" (EU unit pricing, Figma "€54/100ml"); undefined for
 * other options (shades) or unparsable sizes.
 */
export function unitPrice(variant: Pick<ProductVariant, "options" | "price">): Money | undefined {
  const size = variant.options.find((option) => option.name === "size");
  const match = size && VOLUME.exec(size.value.trim());
  if (!match) return undefined;
  const millilitres = Number(match[1]!.replace(",", "."));
  if (!(millilitres > 0)) return undefined;
  return {
    amount: Math.round((variant.price.amount * 100) / millilitres),
    currency: variant.price.currency,
  };
}

/** Whole-percent discount of a variant on sale, else 0. */
export function discountPercent(variant: Pick<ProductVariant, "price" | "compareAtPrice">): number {
  const compareAt = variant.compareAtPrice?.amount ?? 0;
  return compareAt > variant.price.amount
    ? Math.round(((compareAt - variant.price.amount) / compareAt) * 100)
    : 0;
}

/** The amount saved on a variant on sale. */
export function saving(
  variant: Pick<ProductVariant, "price" | "compareAtPrice">,
): Money | undefined {
  const compareAt = variant.compareAtPrice;
  return compareAt && compareAt.amount > variant.price.amount
    ? { amount: compareAt.amount - variant.price.amount, currency: variant.price.currency }
    : undefined;
}
