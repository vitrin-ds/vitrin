import type { CurrencyCode } from "@/lib/api/types/catalog";

// Pattern-local filter model (PLP filters). Kept apart from
// src/lib/api so the PLP can map its facets onto it; the URL helpers in filter-url.ts
// serialise it to query strings that search engines can crawl.

export interface FilterOption {
  /** URL-safe value, e.g. "aurell". */
  value: string;
  /** Visible text, e.g. "Aurell". */
  label: string;
  /** Result count shown next to the label (Figma Do: "Show result counts next to options"). */
  count?: number;
  /**
   * Swatch for swatch facets: an image (a crop of the product in that shade, the catalogue's
   * default) or a CSS colour from the catalogue (data, not a token).
   */
  swatch?: FilterSwatch;
}

/** A swatch image. Decorative next to the option's label, so it has no alt of its own. */
export interface FilterSwatchImage {
  src: string;
  width: number;
  height: number;
}

export type FilterSwatch = string | FilterSwatchImage;

interface FacetBase {
  /** URL key, e.g. "brand". Must be unique and not one of the reserved keys (price, page, sort). */
  id: string;
  /** Figma `.Asset.Filter Panel Title` text, e.g. "Brands". */
  label: string;
}

/** A multi-select list of options with counts. */
export interface CheckboxFacet extends FacetBase {
  kind: "checkbox";
  options: readonly FilterOption[];
}

/** A multi-select list of colours or shade images (Figma Filter Item with `ColorBox`). */
export interface SwatchFacet extends FacetBase {
  kind: "swatch";
  options: readonly (FilterOption & { swatch: FilterSwatch })[];
}

/** Min / max price in whole major units (Range Slider + two number inputs). */
export interface PriceFacet extends FacetBase {
  kind: "price";
  currency: CurrencyCode;
  /** Catalogue bounds: the slider's ends, the inputs' placeholders and limits. */
  min: number;
  max: number;
}

/** An on / off flag, e.g. "Only in stock". */
export interface ToggleFacet extends FacetBase {
  kind: "toggle";
}

export type FilterFacet = CheckboxFacet | SwatchFacet | PriceFacet | ToggleFacet;

export interface PriceRange {
  /** Whole major units; null = open. */
  min: number | null;
  max: number | null;
}

/** The applied filters. Immutable: helpers return new objects. */
export interface FilterValue {
  /** Selected option values per checkbox / swatch facet id. */
  selected: Readonly<Record<string, readonly string[]>>;
  /** The price facet's range. */
  price: PriceRange;
  /** Ids of the toggle facets that are on. */
  flags: readonly string[];
}

export const EMPTY_FILTERS: FilterValue = {
  selected: {},
  price: { min: null, max: null },
  flags: [],
};
