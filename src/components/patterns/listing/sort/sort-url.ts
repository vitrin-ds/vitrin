// Sort key ⇄ URLSearchParams (`?sort=price-asc`). The default sort is not written, so the plain
// list URL stays canonical; an unknown value reads as the default. Changing the sort drops `page`
// (the order changed) and keeps every filter param (Figma Sort Do: "Keep filters when the sort
// changes").

export const SORT_KEYS = [
  "relevance",
  "newest",
  "best-sellers",
  "price-asc",
  "price-desc",
  "discount",
  "top-rated",
] as const;

export type SortKey = (typeof SORT_KEYS)[number];

/** Figma Sort Do: "Keep Recommended as the default" (labelled Relevance in the menu). */
export const DEFAULT_SORT: SortKey = "relevance";

export const SORT_PARAM = "sort";
const PAGE_PARAM = "page";

export function isSortKey(raw: string | null): raw is SortKey {
  return raw !== null && (SORT_KEYS as readonly string[]).includes(raw);
}

export function sortFromSearchParams(params: URLSearchParams): SortKey {
  const raw = params.get(SORT_PARAM);
  return isSortKey(raw) ? raw : DEFAULT_SORT;
}

/** Writes the sort into a copy of `base`; other params are kept, `page` is removed. */
export function sortToSearchParams(
  key: SortKey,
  base: URLSearchParams = new URLSearchParams(),
): URLSearchParams {
  const params = new URLSearchParams(base);
  params.delete(PAGE_PARAM);
  if (key === DEFAULT_SORT) params.delete(SORT_PARAM);
  else params.set(SORT_PARAM, key);
  return params;
}
