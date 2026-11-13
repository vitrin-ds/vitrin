"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";
import { ActiveFilters } from "@/components/patterns/listing/active-filters/active-filters";
import {
  FILTER_CATEGORY_NAV_LABELS,
  FilterCategoryNav,
  type FilterCategoryNavProps,
} from "./filter-category-nav";
import { FilterFacetControls } from "./filter-facet";
import { formatPriceRange } from "./filter-format";
import { FILTER_SECTION_RULE, FilterSection } from "./filter-section";
import type { FilterFacet, FilterValue } from "./filter-types";
import { appliedFilters, clearFacet, facetActiveCount, removeAppliedFilter } from "./filter-url";
import { FILTERS_LABELS, type FiltersLabels } from "./filters-labels";

// PLP WD.04.01.02 Filter Options (desktop): a left
// sidebar in columns 1–3 (334px) on the page surface (no fill). From the top: the "Filter Options"
// title (`.Asset.Filter Panel Title`, padding 16), Selected Filters (Active Filters, a 2px rule on
// top), the on / off facets as Checkboxes (Only in stock, padding 20 · 16, gap 12), then one
// FilterSection per facet (Categories, Brands, Price, Colour) with its own Clear. Changes apply
// at once on desktop (Figma Do: "Apply instantly on desktop").
// `categories` (optional) adds the Categories section after the on / off facets (PLP Filter
// Section [Categories] 31063:168630): category links, not a filter (FilterCategoryNav).

const FILTER_CATEGORY_NAV_TITLE = FILTER_CATEGORY_NAV_LABELS.nav;

export const FILTER_SIDEBAR_DEFAULTS = {
  /** Figma Don't: "use more than 8 facets by default": the rest start collapsed. */
  openFacets: 8,
  locale: "en",
} as const;

export interface FilterSidebarProps {
  facets: readonly FilterFacet[];
  value: FilterValue;
  onChange: (value: FilterValue) => void;
  locale?: string;
  labels?: FiltersLabels;
  /** The category tree, shown as the Categories section (links to other lists). */
  categories?: FilterCategoryNavProps;
  className?: string;
}

export function FilterSidebar({
  facets,
  value,
  onChange,
  categories,
  locale = FILTER_SIDEBAR_DEFAULTS.locale,
  labels = FILTERS_LABELS,
  className,
}: FilterSidebarProps) {
  const id = useId();
  const toggles = facets.filter((f) => f.kind === "toggle");
  const groups = facets.filter((f) => f.kind !== "toggle");
  const applied = appliedFilters(value, facets, (range, facet) =>
    formatPriceRange(range, facet.currency, locale, labels.priceRange),
  );

  return (
    <aside aria-labelledby={`${id}-heading`} className={cn("flex-col", className)}>
      <h2 id={`${id}-heading`} className="p-16 text-title-md text-text-primary">
        {labels.heading}
      </h2>
      <ActiveFilters
        items={applied}
        onRemove={(itemId) => onChange(removeAppliedFilter(value, facets, itemId))}
        onClearAll={() => onChange(facets.reduce(clearFacet, value))}
        labels={labels.activeFilters}
        className={FILTER_SECTION_RULE}
      />
      {toggles.length > 0 && (
        <div className="flex flex-col gap-12 px-16 py-20">
          {toggles.map((facet) => (
            <FilterFacetControls
              key={facet.id}
              facet={facet}
              value={value}
              onChange={onChange}
              locale={locale}
              labels={labels.facet}
            />
          ))}
        </div>
      )}
      {categories && categories.items.length > 0 && (
        <FilterSection title={categories.labels?.nav ?? FILTER_CATEGORY_NAV_TITLE} inset={false}>
          <FilterCategoryNav locale={locale} {...categories} />
        </FilterSection>
      )}
      {groups.map((facet, index) => (
        <FilterSection
          key={facet.id}
          title={facet.label}
          defaultOpen={index < FILTER_SIDEBAR_DEFAULTS.openFacets}
          inset={facet.kind !== "price"}
          clear={
            facetActiveCount(value, facet) > 0
              ? {
                  label: labels.clear,
                  name: labels.clearFacet(facet.label),
                  onClick: () => onChange(clearFacet(value, facet)),
                }
              : undefined
          }
        >
          <FilterFacetControls
            facet={facet}
            value={value}
            onChange={onChange}
            locale={locale}
            labels={labels.facet}
          />
        </FilterSection>
      ))}
    </aside>
  );
}
