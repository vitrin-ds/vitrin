"use client";

import { useState } from "react";
import { ActiveFilters } from "@/components/patterns/listing/active-filters/active-filters";
import type { CategoryNavItem } from "@/components/patterns/listing/filters/filter-category-nav";
import { formatPriceRange } from "@/components/patterns/listing/filters/filter-format";
import { FilterSheet } from "@/components/patterns/listing/filters/filter-sheet";
import { FilterSidebar } from "@/components/patterns/listing/filters/filter-sidebar";
import type { FilterFacet, FilterValue } from "@/components/patterns/listing/filters/filter-types";
import {
  appliedFilters,
  clearFacet,
  countActiveFilters,
  removeAppliedFilter,
} from "@/components/patterns/listing/filters/filter-url";
import { FILTERS_LABELS } from "@/components/patterns/listing/filters/filters-labels";
import { Sort, SortSheet } from "@/components/patterns/listing/sort/sort";
import type { SortKey } from "@/components/patterns/listing/sort/sort-url";
import { Button } from "@/components/ui/button/button";
import type { ProductListLabels } from "./product-list-labels";

// The product list's controls: the filter sidebar (desktop, Figma Left Sidebar, columns 1–3) and
// the list toolbar (count + Sort on desktop; Filter / Sort buttons, their sheets and the applied
// chips below 1024px). Controlled: they show `filters` / `sort` and report changes; the caller
// decides what a change does (a new URL, a client query …).

export interface ProductListControlsProps {
  facets: readonly FilterFacet[];
  filters: FilterValue;
  sort: SortKey;
  onFiltersChange: (filters: FilterValue) => void;
  onSortChange: (sort: SortKey) => void;
  /** The Categories tree above the facets. */
  categories?: readonly CategoryNavItem[];
  locale: string;
  labels: ProductListLabels;
}

function categoriesProps(items: readonly CategoryNavItem[] | undefined, L: ProductListLabels) {
  return items && items.length > 0
    ? {
        items,
        labels: {
          nav: L.categories,
          toggle: L.categoryToggle,
          count: (count: number, locale: string) =>
            `(${new Intl.NumberFormat(locale).format(count)})`,
        },
      }
    : undefined;
}

export function ProductListSidebar({
  facets,
  filters,
  onFiltersChange,
  categories,
  labels,
  className,
}: Pick<
  ProductListControlsProps,
  "facets" | "filters" | "onFiltersChange" | "categories" | "labels"
> & { className?: string }) {
  return (
    <FilterSidebar
      facets={facets}
      value={filters}
      onChange={onFiltersChange}
      categories={categoriesProps(categories, labels)}
      className={className}
    />
  );
}

export interface ProductListToolbarProps extends ProductListControlsProps {
  /** Results of the applied filters. */
  total: number;
  /** Results a draft in the filter sheet would give (its Apply button). */
  countFor: (draft: FilterValue) => number;
}

/** Figma Right Content › Top (+ tablet / mobile Selected Filters). */
export function ProductListToolbar({
  facets,
  filters,
  sort,
  onFiltersChange,
  onSortChange,
  categories,
  total,
  countFor,
  locale,
  labels: L,
}: ProductListToolbarProps) {
  const [sheet, setSheet] = useState<"filter" | "sort" | null>(null);
  const [draft, setDraft] = useState<FilterValue | null>(null);
  const applied = appliedFilters(filters, facets, (range, facet) =>
    formatPriceRange(range, facet.currency, locale, FILTERS_LABELS.priceRange),
  );

  function close() {
    setSheet(null);
    setDraft(null);
  }

  return (
    <div className="flex flex-col">
      {/* Desktop: "2,300 Products" + the Sort text menu. Below desktop the count is visually
          in the page header; this status still announces new totals to screen readers. */}
      <div className="flex items-center justify-between gap-16 desktop:p-16">
        <p role="status" className="sr-only text-title-sm text-text-accent desktop:not-sr-only">
          {L.count(total)}
        </p>
        <Sort value={sort} onChange={onSortChange} className="hidden desktop:block" />
      </div>

      {/* Below desktop: Filter (n) + Sort buttons in a bordered bar (Figma Top, tablet/mobile). */}
      <div className="flex gap-8 rounded-card bg-surface-primary p-12 inset-ring inset-ring-border-neutral desktop:hidden">
        <Button
          variant="outline"
          size="sm"
          leftIcon="instant_mix"
          aria-haspopup="dialog"
          className="flex-1"
          onClick={() => setSheet("filter")}
        >
          {L.filter(countActiveFilters(filters, facets))}
        </Button>
        <Button
          variant="outline"
          size="sm"
          leftIcon="swap_vert"
          aria-haspopup="dialog"
          className="flex-1"
          onClick={() => setSheet("sort")}
        >
          {L.sort}
        </Button>
      </div>
      <div className="desktop:hidden">
        <ActiveFilters
          layout="inline"
          headingLevel={2}
          items={applied}
          onRemove={(id) => onFiltersChange(removeAppliedFilter(filters, facets, id))}
          onClearAll={() => onFiltersChange(facets.reduce(clearFacet, filters))}
        />
      </div>

      <FilterSheet
        open={sheet === "filter"}
        onClose={close}
        facets={facets}
        value={filters}
        onApply={onFiltersChange}
        resultCount={countFor(draft ?? filters)}
        onDraftChange={setDraft}
        categories={categoriesProps(categories, L)}
        locale={locale}
      />
      <SortSheet open={sheet === "sort"} onClose={close} value={sort} onApply={onSortChange} />
    </div>
  );
}
