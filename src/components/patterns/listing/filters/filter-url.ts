import type { FilterFacet, FilterValue, PriceRange } from "./filter-types";
import { EMPTY_FILTERS } from "./filter-types";

// Filters ⇄ URLSearchParams, so every filtered list is a crawlable, shareable URL:
//   ?brand=aurell,velora&color=plum&price_min=25&price_max=50&in_stock=1
// Values follow the facet order (stable URLs, no duplicate pages); unknown keys and values are
// dropped. Changing filters removes `page` (the result set changed) and keeps every other param
// (sort, search query) untouched (Figma Sort Do: "Keep filters when the sort changes").

export const PRICE_MIN_PARAM = "price_min";
export const PRICE_MAX_PARAM = "price_max";
export const PAGE_PARAM = "page";
const LIST_SEPARATOR = ",";
const FLAG_ON = "1";

function priceRangeFromParams(params: URLSearchParams): PriceRange {
  return {
    min: parseWhole(params.get(PRICE_MIN_PARAM)),
    max: parseWhole(params.get(PRICE_MAX_PARAM)),
  };
}

/** Whole, non-negative numbers only; anything else reads as "open". */
export function parseWhole(raw: string | null): number | null {
  if (raw === null || raw.trim() === "") return null;
  const number = Number(raw);
  return Number.isInteger(number) && number >= 0 ? number : null;
}

/** Reads the filters from a query string, keeping only facets and values that exist. */
export function filtersFromSearchParams(
  params: URLSearchParams,
  facets: readonly FilterFacet[],
): FilterValue {
  const selected: Record<string, readonly string[]> = {};
  const flags: string[] = [];
  let price = EMPTY_FILTERS.price;

  for (const facet of facets) {
    if (facet.kind === "price") {
      price = normalisePrice(priceRangeFromParams(params));
    } else if (facet.kind === "toggle") {
      if (params.get(facet.id) === FLAG_ON) flags.push(facet.id);
    } else {
      const wanted = new Set((params.get(facet.id) ?? "").split(LIST_SEPARATOR));
      const values = facet.options.map((o) => o.value).filter((v) => wanted.has(v));
      if (values.length > 0) selected[facet.id] = values;
    }
  }
  return { selected, price, flags };
}

/**
 * Writes the filters into a copy of `base` (other params are kept). Empty facets are removed, so
 * "no filters" is the clean list URL.
 */
export function filtersToSearchParams(
  value: FilterValue,
  facets: readonly FilterFacet[],
  base: URLSearchParams = new URLSearchParams(),
): URLSearchParams {
  const params = new URLSearchParams(base);
  params.delete(PAGE_PARAM);

  for (const facet of facets) {
    if (facet.kind === "price") {
      const { min, max } = normalisePrice(value.price);
      setOrDelete(params, PRICE_MIN_PARAM, min === null ? null : String(min));
      setOrDelete(params, PRICE_MAX_PARAM, max === null ? null : String(max));
    } else if (facet.kind === "toggle") {
      setOrDelete(params, facet.id, value.flags.includes(facet.id) ? FLAG_ON : null);
    } else {
      const chosen = new Set(value.selected[facet.id] ?? []);
      const ordered = facet.options.map((o) => o.value).filter((v) => chosen.has(v));
      setOrDelete(params, facet.id, ordered.length > 0 ? ordered.join(LIST_SEPARATOR) : null);
    }
  }
  return params;
}

function setOrDelete(params: URLSearchParams, key: string, value: string | null) {
  if (value === null) params.delete(key);
  else params.set(key, value);
}

/** Swaps min and max when they were entered the wrong way round. */
export function normalisePrice({ min, max }: PriceRange): PriceRange {
  if (min !== null && max !== null && min > max) return { min: max, max: min };
  return { min, max };
}

/** Adds or removes one option of a checkbox / swatch facet. */
export function toggleOption(value: FilterValue, facetId: string, option: string): FilterValue {
  const current = value.selected[facetId] ?? [];
  const next = current.includes(option)
    ? current.filter((v) => v !== option)
    : [...current, option];
  return withSelected(value, facetId, next);
}

function withSelected(value: FilterValue, facetId: string, next: readonly string[]): FilterValue {
  const selected = Object.fromEntries(
    Object.entries({ ...value.selected, [facetId]: next }).filter(([, v]) => v.length > 0),
  );
  return { ...value, selected };
}

/** Turns a toggle facet on or off. */
export function setFlag(value: FilterValue, facetId: string, on: boolean): FilterValue {
  const flags = value.flags.filter((id) => id !== facetId);
  return { ...value, flags: on ? [...flags, facetId] : flags };
}

/** Clears one facet (Figma `.Asset.Filter Panel Title` "Clear"). */
export function clearFacet(value: FilterValue, facet: FilterFacet): FilterValue {
  if (facet.kind === "price") return { ...value, price: EMPTY_FILTERS.price };
  if (facet.kind === "toggle") return setFlag(value, facet.id, false);
  return withSelected(value, facet.id, []);
}

/** How many filters of a facet are applied (a price range counts as one). */
export function facetActiveCount(value: FilterValue, facet: FilterFacet): number {
  if (facet.kind === "price") return value.price.min !== null || value.price.max !== null ? 1 : 0;
  if (facet.kind === "toggle") return value.flags.includes(facet.id) ? 1 : 0;
  return value.selected[facet.id]?.length ?? 0;
}

export function countActiveFilters(value: FilterValue, facets: readonly FilterFacet[]): number {
  return facets.reduce((sum, facet) => sum + facetActiveCount(value, facet), 0);
}

/** One applied filter, as the Active Filters chips show it. */
export interface AppliedFilter {
  /** Stable id: "facet:value", "price" or the flag id. */
  id: string;
  facetId: string;
  label: string;
}

/**
 * Lists the applied filters in facet order. `formatPrice` turns the range into chip text
 * (Intl, in the page locale), e.g. "€25 – €50".
 */
export function appliedFilters(
  value: FilterValue,
  facets: readonly FilterFacet[],
  formatPrice: (range: PriceRange, facet: Extract<FilterFacet, { kind: "price" }>) => string,
): AppliedFilter[] {
  return facets.flatMap((facet): AppliedFilter[] => {
    if (facet.kind === "price") {
      return facetActiveCount(value, facet) > 0
        ? [{ id: facet.id, facetId: facet.id, label: formatPrice(value.price, facet) }]
        : [];
    }
    if (facet.kind === "toggle") {
      return value.flags.includes(facet.id)
        ? [{ id: facet.id, facetId: facet.id, label: facet.label }]
        : [];
    }
    const chosen = new Set(value.selected[facet.id] ?? []);
    return facet.options
      .filter((o) => chosen.has(o.value))
      .map((o) => ({ id: `${facet.id}:${o.value}`, facetId: facet.id, label: o.label }));
  });
}

/** Removes one applied filter by its `AppliedFilter.id`. */
export function removeAppliedFilter(
  value: FilterValue,
  facets: readonly FilterFacet[],
  id: string,
): FilterValue {
  const [facetId, option] = id.split(":");
  const facet = facets.find((f) => f.id === facetId);
  if (!facet) return value;
  if (option !== undefined && (facet.kind === "checkbox" || facet.kind === "swatch")) {
    return toggleOption(value, facet.id, option);
  }
  return clearFacet(value, facet);
}
