"use client";

import type { CategoryNavItem } from "@/components/patterns/listing/filters/filter-category-nav";
import type { FilterFacet, FilterValue } from "@/components/patterns/listing/filters/filter-types";
import { countActiveFilters } from "@/components/patterns/listing/filters/filter-url";
import type { SortKey } from "@/components/patterns/listing/sort/sort-url";
import { CardProductVertical } from "@/components/ui/card-product/card-product-vertical";
import { EmptyState, type EmptyStateAction } from "@/components/ui/empty-state/empty-state";
import type { IconName } from "@/components/ui/icon/icon-names";
import { Pagination } from "@/components/ui/pagination/pagination";
import { VisuallyHidden } from "@/components/ui/visually-hidden/visually-hidden";
import type { ImageAsset, Money } from "@/lib/api/types/catalog";
import { cn } from "@/lib/cn";
import { ProductListSidebar, ProductListToolbar } from "./product-list-controls";
import { PRODUCT_LIST_LABELS, type ProductListLabels } from "./product-list-labels";

// 04 Product List / 08 Search results, the list section (Figma WD.04.01.01 7769:4622 · WT
// 7908:78520 · WM 7908:78518, empty WD.04.03.01 31098:90074): on a page grid, the Filter sidebar
// in columns 1–3 and the list in 4–12 from desktop; the Filter / Sort bar, the applied chips and
// the grid (2 · 3 · 4 columns) below 1024px; then the pagination (crawlable links). Controlled:
// the products, the filters and the sort come in; changes go out through `onFiltersChange` /
// `onSortChange` and the pages are links (`pageHref`). Product cards add to the cart and save to
// the wishlist through `onAddToCart` / `wishlist` when given.

/** One product card: the catalogue product mapped to Card.Product.Vertical. */
export interface ProductListItem {
  id: string;
  /** The shown variant, which Add to cart adds. */
  variantId: string;
  /** False when every variant is out of stock (no Add to cart). */
  inStock: boolean;
  name: string;
  href: string;
  category?: string;
  image?: ImageAsset;
  price: Money;
  compareAt?: Money;
  /** The first promotional badge, as text. */
  label?: string;
  rating?: { value: number; reviewCount: number };
  swatches?: { src: string; name: string }[];
}

export interface ProductListEmpty {
  icon?: IconName;
  title: string;
  body?: string;
  action?: EmptyStateAction;
}

export interface ProductListProps {
  items: readonly ProductListItem[];
  /** Results of the applied filters, over all pages. */
  total: number;
  page: number;
  pageCount: number;
  pageSize: number;
  /** The link of a page: pagination is plain links, so search engines can crawl it. */
  pageHref: (page: number) => string;
  facets: readonly FilterFacet[];
  filters: FilterValue;
  sort: SortKey;
  onFiltersChange: (filters: FilterValue) => void;
  onSortChange: (sort: SortKey) => void;
  /** Results a draft in the mobile filter sheet would give; default `total`. */
  countFor?: (draft: FilterValue) => number;
  /** The Categories tree above the facets. */
  categories?: readonly CategoryNavItem[];
  /** The list's heading for screen readers, e.g. "Serums products". */
  heading: string;
  /** Shown instead of the grid when the page has no products. */
  empty: ProductListEmpty;
  onAddToCart?: (item: ProductListItem) => void;
  wishlist?: { has: (id: string) => boolean; onToggle: (item: ProductListItem) => void };
  /** The first cards load with `priority` (the LCP image). */
  priorityCount?: number;
  locale?: string;
  labels?: ProductListLabels;
  className?: string;
}

export const PRODUCT_LIST_DEFAULTS = { priorityCount: 2, locale: "en" } as const;

export function ProductList({
  items,
  total,
  page,
  pageCount,
  pageSize,
  pageHref,
  facets,
  filters,
  sort,
  onFiltersChange,
  onSortChange,
  countFor = () => total,
  categories,
  heading,
  empty,
  onAddToCart,
  wishlist,
  priorityCount = PRODUCT_LIST_DEFAULTS.priorityCount,
  locale = PRODUCT_LIST_DEFAULTS.locale,
  labels: L = PRODUCT_LIST_LABELS,
  className,
}: ProductListProps) {
  // Below desktop the applied chips (py 16) already space the grid from the Filter / Sort bar.
  const hasChips = countActiveFilters(filters, facets) > 0;
  const from = (page - 1) * pageSize + 1;
  const to = from + items.length - 1;
  const controls = { facets, filters, onFiltersChange, categories, labels: L };

  return (
    <div className={cn("page-grid", className)}>
      <ProductListSidebar {...controls} className="hidden desktop:col-span-3 desktop:flex" />

      <section aria-label={heading} className="col-span-full flex flex-col desktop:col-span-9">
        <VisuallyHidden as="h2">{heading}</VisuallyHidden>
        <ProductListToolbar
          {...controls}
          sort={sort}
          onSortChange={onSortChange}
          total={total}
          countFor={countFor}
          locale={locale}
        />

        {items.length > 0 ? (
          <ul
            className={cn(
              "grid grid-cols-2 gap-8 tablet:grid-cols-3 desktop:grid-cols-4 desktop:pt-0",
              !hasChips && "pt-16",
            )}
          >
            {items.map((item, index) => (
              <li key={item.id} className="flex min-w-0">
                <CardProductVertical
                  name={item.name}
                  href={item.href}
                  category={item.category}
                  image={item.image}
                  price={item.price}
                  compareAt={item.compareAt}
                  label={item.label}
                  rating={item.rating}
                  swatches={item.swatches}
                  priority={index < priorityCount}
                  className="w-full"
                  wishlist={
                    wishlist && {
                      saved: wishlist.has(item.id),
                      onToggle: () => wishlist.onToggle(item),
                    }
                  }
                  onAddToCart={onAddToCart && item.inStock ? () => onAddToCart(item) : undefined}
                />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={empty.icon ?? "search"}
            title={empty.title}
            body={empty.body}
            primaryAction={empty.action}
            className={cn(!hasChips && "mt-16")}
          />
        )}

        <Pagination
          page={page}
          pageCount={pageCount}
          hrefFor={pageHref}
          rangeText={items.length > 0 ? L.range(from, to, total) : undefined}
          className="pt-20"
        />
      </section>
    </div>
  );
}
