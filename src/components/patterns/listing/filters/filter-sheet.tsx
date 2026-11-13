"use client";

import { useEffect, useRef, useState } from "react";
import { BottomSheet } from "@/components/ui/bottom-sheet/bottom-sheet";
import { Button } from "@/components/ui/button/button";
import { List, ListItem } from "@/components/ui/list/list";
import {
  currentCategoryLabel,
  FILTER_CATEGORY_NAV_LABELS,
  FilterCategoryNav,
  type FilterCategoryNavProps,
} from "./filter-category-nav";
import { FilterFacetControls } from "./filter-facet";
import { formatPriceRange } from "./filter-format";
import type { FilterFacet, FilterValue } from "./filter-types";
import { clearFacet, facetActiveCount } from "./filter-url";
import { FILTERS_LABELS, type FiltersLabels } from "./filters-labels";

// PLP filters, mobile: a Bottom Sheet ("Filter Options")
// with one row per facet (Figma `List`: title-small label, the current choice in label-small
// text-accent, keyboard_arrow_right) and the sheet footer bar: Clear all (Outline) + "Show 428
// Products" (Filled). A row opens that facet inside the sheet (the sheet's back button returns).
// Choices are a draft until Apply (Figma Do: "on Apply on mobile"); closing discards them.
// The rows are the DS List (5504:9291): a button row per facet (Current Selected = the summary,
// Right Icon = keyboard_arrow_right), and a static row holding the Checkbox for on / off facets.
// `categories` (optional) adds a first "Categories" row (Figma WM.04.01.02: Categories · All ›)
// whose view lists the category links (FilterCategoryNav); following one navigates away.

/** View id of the categories row (not a facet id: facet ids are URL keys). */
const CATEGORIES_VIEW = "__categories";

export interface FilterSheetProps {
  open: boolean;
  onClose: () => void;
  facets: readonly FilterFacet[];
  /** The applied filters; the sheet edits a copy. */
  value: FilterValue;
  /** Apply: the draft becomes the value and the sheet closes. */
  onApply: (value: FilterValue) => void;
  /** Results for the current draft (the parent recounts on `onDraftChange`). */
  resultCount: number;
  onDraftChange?: (draft: FilterValue) => void;
  locale?: string;
  labels?: FiltersLabels;
  /** The category tree, as a first row that opens the category links. */
  categories?: FilterCategoryNavProps;
}

export function FilterSheet({
  open,
  onClose,
  facets,
  value,
  onApply,
  resultCount,
  onDraftChange,
  locale = "en",
  labels = FILTERS_LABELS,
  categories,
}: FilterSheetProps) {
  const [draft, setDraft] = useState(value);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [wasOpen, setWasOpen] = useState(open);
  const detailRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const returnTo = useRef<string | null>(null);

  // Each opening starts from the applied filters, on the facet list.
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setDraft(value);
      setActiveId(null);
    }
  }

  // Keep focus inside the sheet when the view switches: into the facet, back onto its row.
  useEffect(() => {
    if (activeId !== null) {
      detailRef.current?.querySelector<HTMLElement>("input, button, a[href]")?.focus();
    } else if (returnTo.current !== null) {
      listRef.current?.querySelector<HTMLElement>(`[data-facet="${returnTo.current}"]`)?.focus();
      returnTo.current = null;
    }
  }, [activeId]);

  const active = facets.find((f) => f.id === activeId);
  const categoriesTitle = categories?.labels?.nav ?? FILTER_CATEGORY_NAV_LABELS.nav;
  const showCategories = activeId === CATEGORIES_VIEW && categories !== undefined;

  function update(next: FilterValue) {
    setDraft(next);
    onDraftChange?.(next);
  }

  function summary(facet: FilterFacet): string {
    const count = facetActiveCount(draft, facet);
    if (count === 0) return labels.summaryNone;
    if (facet.kind === "price") {
      return formatPriceRange(draft.price, facet.currency, locale, labels.priceRange);
    }
    if (facet.kind === "toggle") return labels.summaryOn;
    if (count === 1) {
      const chosen = draft.selected[facet.id]?.[0];
      return facet.options.find((o) => o.value === chosen)?.label ?? labels.summarySelected(1);
    }
    return labels.summarySelected(count);
  }

  function back() {
    returnTo.current = activeId;
    setActiveId(null);
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      state="full"
      title={active ? active.label : showCategories ? categoriesTitle : labels.heading}
      onBack={active || showCategories ? back : undefined}
      footer={
        <div className="flex gap-8">
          <Button variant="outline" onClick={() => update(facets.reduce(clearFacet, draft))}>
            {labels.clearAll}
          </Button>
          <Button
            className="flex-1"
            onClick={() => {
              onApply(draft);
              onClose();
            }}
          >
            {labels.showResults(resultCount, locale)}
          </Button>
        </div>
      }
    >
      <div className="py-16">
        {showCategories ? (
          <div ref={detailRef}>
            <FilterCategoryNav locale={locale} {...categories} />
          </div>
        ) : active ? (
          <div ref={detailRef} className="flex flex-col gap-8 px-16">
            {facetActiveCount(draft, active) > 0 && (
              <Button
                variant="ghost"
                size="sm"
                aria-label={labels.clearFacet(active.label)}
                onClick={() => update(clearFacet(draft, active))}
                className="self-end"
              >
                {labels.clear}
              </Button>
            )}
            <FilterFacetControls
              facet={active}
              value={draft}
              onChange={update}
              locale={locale}
              labels={labels.facet}
            />
          </div>
        ) : (
          <List ref={listRef}>
            {categories && categories.items.length > 0 && (
              <ListItem
                data-facet={CATEGORIES_VIEW}
                title={categoriesTitle}
                currentSelected={currentCategoryLabel(categories.items) ?? labels.summaryNone}
                rightIcon="keyboard_arrow_right"
                onClick={() => setActiveId(CATEGORIES_VIEW)}
              />
            )}
            {facets.map((facet) =>
              facet.kind === "toggle" ? (
                <ListItem key={facet.id}>
                  <FilterFacetControls
                    facet={facet}
                    value={draft}
                    onChange={update}
                    locale={locale}
                    labels={labels.facet}
                  />
                </ListItem>
              ) : (
                <ListItem
                  key={facet.id}
                  data-facet={facet.id}
                  title={facet.label}
                  currentSelected={summary(facet)}
                  rightIcon="keyboard_arrow_right"
                  onClick={() => setActiveId(facet.id)}
                />
              ),
            )}
          </List>
        )}
      </div>
    </BottomSheet>
  );
}
