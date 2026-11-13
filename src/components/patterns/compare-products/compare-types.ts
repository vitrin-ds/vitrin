import type { ImageAsset, Money } from "@/lib/api/types/catalog";

// Pattern-local compare model (Figma Patterns › Compare Products, 30407:67051).

export interface CompareProduct {
  id: string;
  name: string;
  href: string;
  category?: string;
  image?: ImageAsset;
  price: Money;
  compareAt?: Money;
  /** Figma Do: "Don't hide price or rating". */
  rating?: { value: number; count: number };
  /** Promo label on the card, e.g. "New". */
  label?: string;
  /** Attribute values by attribute id; a missing value shows as "—". */
  attributes: Readonly<Record<string, string>>;
}

/** One table row, in the same order for every product (Figma Do). */
export interface CompareAttribute {
  id: string;
  label: string;
}

/** Figma Do: "Limit comparison to 3 products (2 on mobile)". */
export const COMPARE_MAX = { desktop: 3, mobile: 2 } as const;

export type CompareToggleResult =
  | { ids: readonly string[]; status: "added" | "removed" }
  /** The tray is full: nothing changed; tell the user why. */
  | { ids: readonly string[]; status: "full" };

/** Adds or removes a product from the selection, never past `max`. */
export function toggleCompare(
  ids: readonly string[],
  id: string,
  max: number = COMPARE_MAX.desktop,
): CompareToggleResult {
  if (ids.includes(id)) return { ids: ids.filter((x) => x !== id), status: "removed" };
  if (ids.length >= max) return { ids, status: "full" };
  return { ids: [...ids, id], status: "added" };
}

/** True when the products don't all share the same value for the attribute. */
export function attributeDiffers(
  products: readonly CompareProduct[],
  attributeId: string,
): boolean {
  return new Set(products.map((p) => p.attributes[attributeId] ?? "")).size > 1;
}
