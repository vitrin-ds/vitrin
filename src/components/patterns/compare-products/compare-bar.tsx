"use client";

import { useId } from "react";
import { CloseButton } from "@/components/base/modal/close-button";
import { Button, ButtonLink } from "@/components/ui/button/button";
import { ProductImage } from "@/components/ui/card-product/card-product-parts";
import { cn } from "@/lib/cn";
import { COMPARE_MAX, type CompareProduct } from "./compare-types";

// Figma Patterns › Compare Products › Compare Bar (31513:6064): a bar fixed to the bottom of the
// product list (surface-raised, shadow/up, padding 16 · 40, gap 16) with 56px thumbnails
// (radius 8; empty slots in surface-accent-subtle), "3 of 3 products selected" (body-medium,
// text-secondary), Clear (Ghost) and Compare (Filled). Compare opens the compare view in the same
// tab (Figma Don't: "open compare in a new tab") and needs 2 products. Each thumbnail has a
// remove button; the count is a polite status so adding / removing is announced.

export interface CompareBarLabels {
  region: string;
  status: (count: number, max: number) => string;
  remove: (name: string) => string;
  clear: string;
  clearName: string;
  compare: string;
}

export const COMPARE_BAR_LABELS: CompareBarLabels = {
  region: "Compare products",
  status: (count, max) => `${count} of ${max} products selected`,
  remove: (name) => `Remove ${name} from comparison`,
  clear: "Clear",
  clearName: "Clear comparison",
  compare: "Compare",
};

export const COMPARE_BAR_DEFAULTS = { max: COMPARE_MAX.desktop, minToCompare: 2 } as const;

export interface CompareBarProps {
  products: readonly CompareProduct[];
  /** Slots shown (Figma: 3; 2 on mobile). */
  max?: number;
  onRemove: (id: string) => void;
  onClear: () => void;
  /** The compare view (same tab) … */
  compareHref?: string;
  /** … or an in-page action. */
  onCompare?: () => void;
  labels?: CompareBarLabels;
  className?: string;
}

export function CompareBar({
  products,
  max = COMPARE_BAR_DEFAULTS.max,
  onRemove,
  onClear,
  compareHref,
  onCompare,
  labels = COMPARE_BAR_LABELS,
  className,
}: CompareBarProps) {
  const statusId = useId();
  const canCompare = products.length >= COMPARE_BAR_DEFAULTS.minToCompare;
  const empty = Math.max(0, max - products.length);
  if (products.length === 0) return null;

  return (
    <section
      aria-label={labels.region}
      className={cn(
        "fixed inset-x-0 bottom-0 z-20 flex flex-wrap items-center gap-16 bg-surface-raised px-16 py-16 shadow-up desktop:px-40",
        className,
      )}
    >
      <ul className="flex gap-8">
        {products.slice(0, max).map((product) => (
          <li key={product.id} className="relative size-56 shrink-0">
            <ProductImage
              image={product.image}
              ratio="1/1"
              sizes="56px"
              className="overflow-hidden rounded-8"
            />
            <CloseButton
              label={labels.remove(product.name)}
              onClick={() => onRemove(product.id)}
              className="absolute -top-8 -right-8"
            />
          </li>
        ))}
        {Array.from({ length: empty }, (_, index) => (
          <li
            key={`empty-${index}`}
            aria-hidden
            className="size-56 rounded-8 bg-surface-accent-subtle"
          />
        ))}
      </ul>
      <p id={statusId} role="status" className="min-w-0 flex-1 text-body-md text-text-secondary">
        {labels.status(products.length, max)}
      </p>
      <div className="flex items-center gap-16">
        <Button variant="ghost" aria-label={labels.clearName} onClick={onClear}>
          {labels.clear}
        </Button>
        {compareHref && canCompare ? (
          <ButtonLink href={compareHref} aria-describedby={statusId}>
            {labels.compare}
          </ButtonLink>
        ) : (
          <Button disabled={!canCompare} onClick={onCompare} aria-describedby={statusId}>
            {labels.compare}
          </Button>
        )}
      </div>
    </section>
  );
}
