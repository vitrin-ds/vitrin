"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/button/button";
import { CardProductVerticalSmall } from "@/components/ui/card-product/card-product-vertical-small";
import { Rating } from "@/components/ui/rating/rating";
import { Toggle } from "@/components/ui/toggle/toggle";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/format/money";
import { attributeDiffers, type CompareAttribute, type CompareProduct } from "./compare-types";

// Figma Patterns › Compare Products › Compare View (31513:5575): a label column (200px) and one
// column per product (240px, gap 16), radius 16 with a 1px border-default. The header row holds
// "Compare (3)" and a Card.Product.Vertical.Small per product; then Price, Rating and the
// attribute rows (label title-small, values body-medium text-secondary, padding 12 · 16), every
// other row on surface-secondary. A real <table>: products are column headers, attributes row
// headers. Below desktop it scrolls sideways with the label column sticky. "Only differences"
// (Toggle) hides rows where every product matches (Figma Do: "Highlight differences").

export interface CompareTableLabels {
  caption: string;
  title: (count: number) => string;
  price: string;
  rating: string;
  ratingCount: (count: number, locale: string) => string;
  remove: string;
  removeName: (name: string) => string;
  onlyDifferences: string;
  missing: string;
}

export const COMPARE_TABLE_LABELS: CompareTableLabels = {
  caption: "Product comparison",
  title: (count) => `Compare (${count})`,
  price: "Price",
  rating: "Rating",
  ratingCount: (count, locale) => `(${new Intl.NumberFormat(locale).format(count)})`,
  remove: "Remove",
  removeName: (name) => `Remove ${name}`,
  onlyDifferences: "Only show differences",
  missing: "—",
};

export const COMPARE_TABLE_DEFAULTS = { locale: "en" } as const;

export interface CompareTableProps {
  products: readonly CompareProduct[];
  attributes: readonly CompareAttribute[];
  onRemove?: (id: string) => void;
  locale?: string;
  labels?: CompareTableLabels;
  className?: string;
}

const LABEL_CELL = "sticky left-0 z-10 w-120 px-16 py-12 text-left align-top tablet:w-200";
const VALUE_CELL = "min-w-160 px-8 py-12 text-left align-top tablet:min-w-240";

export function CompareTable({
  products,
  attributes,
  onRemove,
  locale = COMPARE_TABLE_DEFAULTS.locale,
  labels = COMPARE_TABLE_LABELS,
  className,
}: CompareTableProps) {
  const id = useId();
  const [onlyDifferences, setOnlyDifferences] = useState(false);
  const rows = onlyDifferences
    ? attributes.filter((a) => attributeDiffers(products, a.id))
    : attributes;

  const body = [
    {
      key: "price",
      label: labels.price,
      cell: (p: CompareProduct) => formatMoney(p.price, locale),
    },
    {
      key: "rating",
      label: labels.rating,
      cell: (p: CompareProduct) =>
        p.rating ? (
          <span className="inline-flex flex-wrap items-center gap-4">
            <Rating value={p.rating.value} size="sm" locale={locale} />
            <span>{labels.ratingCount(p.rating.count, locale)}</span>
          </span>
        ) : (
          labels.missing
        ),
    },
    ...rows.map((attribute) => ({
      key: attribute.id,
      label: attribute.label,
      cell: (p: CompareProduct) => p.attributes[attribute.id] ?? labels.missing,
    })),
  ];

  return (
    <div className={cn("flex flex-col gap-16", className)}>
      <Toggle
        label={labels.onlyDifferences}
        checked={onlyDifferences}
        onChange={(event) => setOnlyDifferences(event.currentTarget.checked)}
        aria-controls={id}
      />
      {/* Focusable so keyboard users can scroll it (axe scrollable-region-focusable). */}
      <div
        role="region"
        aria-labelledby={`${id}-caption`}
        tabIndex={0}
        className="relative overflow-x-auto rounded-surface border border-border-default bg-surface-primary"
      >
        <table id={id} className="w-full border-separate border-spacing-0">
          <caption id={`${id}-caption`} className="sr-only">
            {labels.caption}
          </caption>
          <thead>
            <tr>
              <td className={cn(LABEL_CELL, "bg-surface-primary py-16 text-title-sm")}>
                {labels.title(products.length)}
              </td>
              {products.map((product) => (
                <th key={product.id} scope="col" className={cn(VALUE_CELL, "py-16")}>
                  <div className="flex flex-col gap-8">
                    <CardProductVerticalSmall
                      name={product.name}
                      href={product.href}
                      category={product.category}
                      image={product.image}
                      price={product.price}
                      compareAt={product.compareAt}
                      label={product.label}
                      locale={locale}
                    />
                    {onRemove && (
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon="delete"
                        aria-label={labels.removeName(product.name)}
                        onClick={() => onRemove(product.id)}
                        className="self-start"
                      >
                        {labels.remove}
                      </Button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {body.map((row, index) => {
              const surface = index % 2 === 0 ? "bg-surface-secondary" : "bg-surface-primary";
              return (
                <tr key={row.key}>
                  <th
                    scope="row"
                    className={cn(LABEL_CELL, surface, "text-title-sm text-text-primary")}
                  >
                    {row.label}
                  </th>
                  {products.map((product) => (
                    <td
                      key={product.id}
                      className={cn(VALUE_CELL, surface, "text-body-md text-text-secondary")}
                    >
                      {row.cell(product)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
