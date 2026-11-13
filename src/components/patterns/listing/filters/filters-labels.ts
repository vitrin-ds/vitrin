import {
  ACTIVE_FILTERS_LABELS,
  type ActiveFiltersLabels,
} from "@/components/patterns/listing/active-filters/active-filters";
import { FILTER_FACET_LABELS, type FilterFacetLabels } from "./filter-facet";
import { PRICE_RANGE_LABELS, type PriceRangeLabels } from "./filter-format";

export interface FiltersLabels {
  /** Figma `.Asset.Filter Panel Title` "Filter Options" (sidebar heading, sheet title). */
  heading: string;
  /** Mobile trigger text, with the applied count. */
  open: (count: number) => string;
  /** Visible "Clear" on a facet. */
  clear: string;
  /** Its accessible name, e.g. "Clear Brands". */
  clearFacet: (facet: string) => string;
  /** Sheet secondary action. */
  clearAll: string;
  /** Sheet primary action, e.g. "Show 428 products". */
  showResults: (count: number, locale: string) => string;
  /** Sheet row summary when nothing is chosen. */
  summaryNone: string;
  /** Sheet row summary for several options, e.g. "3 selected". */
  summarySelected: (count: number) => string;
  /** Sheet row summary for a toggle that is on. */
  summaryOn: string;
  facet: FilterFacetLabels;
  priceRange: PriceRangeLabels;
  activeFilters: ActiveFiltersLabels;
}

export const FILTERS_LABELS: FiltersLabels = {
  heading: "Filter options",
  open: (count) => (count > 0 ? `Filters (${count})` : "Filters"),
  clear: "Clear",
  clearFacet: (facet) => `Clear ${facet}`,
  clearAll: "Clear all",
  showResults: (count, locale) =>
    `Show ${new Intl.NumberFormat(locale).format(count)} ${count === 1 ? "product" : "products"}`,
  summaryNone: "All",
  summarySelected: (count) => `${count} selected`,
  summaryOn: "On",
  facet: FILTER_FACET_LABELS,
  priceRange: PRICE_RANGE_LABELS,
  activeFilters: ACTIVE_FILTERS_LABELS,
};
