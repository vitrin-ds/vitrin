import type { CategoryNavItem } from "./filter-category-nav";
import type { FilterFacet, FilterValue } from "./filter-types";

/** The PLP Categories section (Figma Filter Section [Categories] 31063:168630), on Lipstick. */
export const FILTER_CATEGORIES: readonly CategoryNavItem[] = [
  {
    id: "lips",
    label: "Lip Makeup",
    href: "/c/make-up/lip-makeup",
    count: 2300,
    children: [
      {
        id: "liquid-lipstick",
        label: "Liquid Lipstick",
        href: "/c/make-up/lip-makeup/liquid-lipstick",
        count: 840,
        current: true,
      },
      {
        id: "lip-pencil",
        label: "Lip Pencil",
        href: "/c/make-up/lip-makeup/lip-pencil",
        count: 610,
      },
      { id: "lip-gloss", label: "Lip Gloss", href: "/c/make-up/lip-makeup/lip-gloss", count: 850 },
    ],
  },
  {
    id: "eyes",
    label: "Eye Makeup",
    href: "/c/make-up/eye-makeup",
    count: 1840,
    children: [
      { id: "mascara", label: "Mascara", href: "/c/make-up/eye-makeup/mascara", count: 920 },
      { id: "eyeliner", label: "Eyeliner", href: "/c/make-up/eye-makeup/eyeliner", count: 920 },
    ],
  },
  { id: "face", label: "Face Makeup", href: "/c/make-up/face-makeup", count: 1210 },
];

// Placeholder facets from the Figma PLP frames. Shade swatches are images, a
// crop of the product in that shade, never hex values: here the mock
// placeholders from scripts/build-mock-swatches.py.

const swatch = (slug: string) => ({ src: `/mock/swatches/${slug}.webp`, width: 96, height: 96 });

export const FILTER_FACETS: readonly FilterFacet[] = [
  { kind: "toggle", id: "in_stock", label: "Only in stock" },
  {
    kind: "checkbox",
    id: "category",
    label: "Categories",
    options: [
      { value: "lip-makeup", label: "Lip Makeup", count: 2300 },
      { value: "eye-makeup", label: "Eye Makeup", count: 1840 },
      { value: "face-makeup", label: "Face Makeup", count: 1210 },
      { value: "nail-care", label: "Nail Care", count: 640 },
      { value: "treatments", label: "Treatments", count: 0 },
    ],
  },
  {
    kind: "checkbox",
    id: "brand",
    label: "Brands",
    options: [
      { value: "aurell", label: "Aurell", count: 2300 },
      { value: "everyn", label: "Everyn", count: 812 },
      { value: "velora", label: "Velora", count: 460 },
      { value: "nuve", label: "Nuve", count: 128 },
      { value: "serein", label: "Serein", count: 42 },
    ],
  },
  { kind: "price", id: "price", label: "Price", currency: "EUR", min: 5, max: 250 },
  {
    kind: "swatch",
    id: "color",
    label: "Colour",
    options: [
      { value: "coral", label: "Coral", count: 96, swatch: swatch("coral") },
      { value: "plum", label: "Plum", count: 210, swatch: swatch("plum") },
      { value: "berry", label: "Berry", count: 74, swatch: swatch("berry") },
      { value: "rosewood", label: "Rosewood", count: 158, swatch: swatch("rosewood") },
      { value: "nude", label: "Nude", count: 301, swatch: swatch("nude") },
    ],
  },
];

export const FILTERS_APPLIED: FilterValue = {
  selected: { brand: ["aurell", "velora"], color: ["plum"] },
  price: { min: 25, max: 50 },
  flags: ["in_stock"],
};

/** A fake result count for stories and tests: fewer results the more filters are applied. */
export function mockResultCount(value: FilterValue): number {
  const applied =
    Object.values(value.selected).reduce((sum, v) => sum + v.length, 0) +
    value.flags.length +
    (value.price.min !== null || value.price.max !== null ? 1 : 0);
  return Math.max(0, 1284 - applied * 214);
}
