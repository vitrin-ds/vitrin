import type { SearchOption } from "./search-autocomplete";

// Mock suggestions for stories and tests (no search backend yet).
// Figma WD.08.02 "Search - Keyword entered": three groups of SearchSuggestionList rows.
const POPULAR = [
  "face cleansing tonic",
  "face protective sunscreen",
  "face mask",
  "face cleansing sponge",
  "face cleansing pad",
  "swimming earplugs",
  "face wash gel",
  "surface cleaner",
  "face stone",
];
const PRODUCTS = [
  "Face Cream",
  "Face Cleansing Tonic",
  "Face Mask",
  "Face Cleansing Sponge",
  "Sticky Face Stone",
];
const CATEGORIES = [
  "Skin Cleansing Products",
  "Skin Moisturising Products",
  "Fashion & Accessories",
];

export const SEARCH_FIXTURE_OPTIONS: SearchOption[] = [
  ...POPULAR.map((label, i) => ({
    value: `popular-${i}`,
    label,
    group: "Popular searches",
    icon: "bubble" as const,
  })),
  ...PRODUCTS.map((label, i) => ({
    value: `product-${i}`,
    label,
    group: "Suggested products",
    icon: "bubble" as const,
  })),
  ...CATEGORIES.map((label, i) => ({
    value: `category-${i}`,
    label,
    group: "Suggested categories",
    icon: "close_small" as const,
  })),
];

/** Figma 08.01 "First Focus": a few popular searches before anything is typed. */
export const SEARCH_FIXTURE_FIRST_FOCUS = SEARCH_FIXTURE_OPTIONS.filter(
  (o) => o.group === "Popular searches",
).slice(0, 3);

export function filterSearchFixture(query: string): SearchOption[] {
  const q = query.trim().toLowerCase();
  return q
    ? SEARCH_FIXTURE_OPTIONS.filter((o) => o.label.toLowerCase().includes(q))
    : SEARCH_FIXTURE_FIRST_FOCUS;
}
