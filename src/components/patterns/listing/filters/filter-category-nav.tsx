"use client";

import NextLink from "next/link";
import { useId, useState } from "react";
import { Icon } from "@/components/ui/icon/icon";
import { cn } from "@/lib/cn";

// Figma PLP `Filter Section [Categories]` (PLP 31063:168630): the category tree of
// the filter panel. Unlike the other facets these rows are navigation, not filters: each row is a
// link to that category's own list (crawlable by search engines), so the section is a <nav>, not a
// checkbox group. A row is the `.Asset.Filter Item` (36px, px 16, gap 8): the name (label-large
// text-primary) and its count (body-medium text-accent); a parent row ends with the add / remove
// disclosure button (APG disclosure: aria-expanded, aria-controls) that shows its subcategories,
// indented 16 (Figma `Sub Category Panel`). The current category is marked with aria-current and
// drawn in text-accent; the branch holding it starts open. ::before grows links and the toggle
// to a 44px hit area (touch targets are at least 44×44).

export interface CategoryNavItem {
  id: string;
  label: string;
  href: string;
  /** Products in the category and its subcategories. */
  count?: number;
  /** The category of the page. */
  current?: boolean;
  children?: readonly CategoryNavItem[];
}

export interface FilterCategoryNavLabels {
  /** Name of the <nav>. */
  nav: string;
  /** Name of a row's disclosure button, e.g. "Lips subcategories". */
  toggle: (label: string) => string;
  /** Count after the label, e.g. "(2,300)". */
  count: (count: number, locale: string) => string;
}

export const FILTER_CATEGORY_NAV_LABELS: FilterCategoryNavLabels = {
  nav: "Categories",
  toggle: (label) => `${label} subcategories`,
  count: (count, locale) => `(${new Intl.NumberFormat(locale).format(count)})`,
};

export const FILTER_CATEGORY_NAV_DEFAULTS = { locale: "en" } as const;

export interface FilterCategoryNavProps {
  items: readonly CategoryNavItem[];
  locale?: string;
  labels?: FilterCategoryNavLabels;
  className?: string;
}

/** True when the item or one of its descendants is the current category. */
export function holdsCurrent(item: CategoryNavItem): boolean {
  return Boolean(item.current) || (item.children ?? []).some(holdsCurrent);
}

/** The current item's label, searched depth first. */
export function currentCategoryLabel(items: readonly CategoryNavItem[]): string | undefined {
  for (const item of items) {
    if (item.current) return item.label;
    const nested = currentCategoryLabel(item.children ?? []);
    if (nested) return nested;
  }
  return undefined;
}

export function FilterCategoryNav({
  items,
  locale = FILTER_CATEGORY_NAV_DEFAULTS.locale,
  labels = FILTER_CATEGORY_NAV_LABELS,
  className,
}: FilterCategoryNavProps) {
  return (
    <nav aria-label={labels.nav} className={className}>
      <ul className="flex flex-col">
        {items.map((item) => (
          <CategoryRow key={item.id} item={item} locale={locale} labels={labels} />
        ))}
      </ul>
    </nav>
  );
}

function CategoryRow({
  item,
  locale,
  labels,
}: {
  item: CategoryNavItem;
  locale: string;
  labels: FilterCategoryNavLabels;
}) {
  const panelId = useId();
  const children = item.children ?? [];
  const [open, setOpen] = useState(() => holdsCurrent(item));

  return (
    <li className="flex flex-col">
      <div className="flex h-36 items-center gap-8 px-16">
        <NextLink
          href={item.href}
          aria-current={item.current ? "page" : undefined}
          className={cn(
            "relative flex min-w-0 flex-1 items-center gap-8 rounded-4 before:absolute before:inset-x-0 before:-inset-y-4",
            "text-label-lg hover:text-interactive-hover",
            item.current ? "text-text-accent" : "text-text-primary",
          )}
        >
          <span className="truncate">{item.label}</span>
          {/* Separates label and count in the accessible name; not rendered in the flex row. */}{" "}
          {item.count !== undefined && (
            <span className="shrink-0 text-body-md text-text-accent">
              {labels.count(item.count, locale)}
            </span>
          )}
        </NextLink>
        {children.length > 0 && (
          <button
            type="button"
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={labels.toggle(item.label)}
            onClick={() => setOpen(!open)}
            className="relative flex shrink-0 cursor-pointer rounded-4 before:absolute before:-inset-12"
          >
            <Icon name={open ? "remove" : "add"} tone="accent" />
          </button>
        )}
      </div>
      {children.length > 0 && (
        <ul id={panelId} hidden={!open} className="flex flex-col pl-16">
          {children.map((child) => (
            <CategoryRow key={child.id} item={child} locale={locale} labels={labels} />
          ))}
        </ul>
      )}
    </li>
  );
}
