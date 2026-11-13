"use client";

import { cn } from "@/lib/cn";
import { Icon } from "../icon/icon";

// The carousel pagination of Figma Hero Banner (Split) and Banner [Wide]: 20px
// keyboard_arrow_left / _right glyphs in icon-accent around either
// - Dots: 12px page dots in icon-disabled, the current one a 36 × 12 pill in icon-accent; or
// - Fraction: "1 / 2" in title-small text-primary.
// Figma spaces the items 3px apart (off the spacing scale); code uses gap-4.
// Hit areas: each arrow grows outwards to 44 × 44 with ::before; a dot keeps 16 × 44 so the
// targets never overlap. The arrows reach every slide too, so the narrow dots are covered by the
// WCAG 2.5.8 "equivalent control" exception. Dots are buttons named "Slide n of m" with
// aria-current on the visible one (APG carousel, picker buttons).

export interface CarouselPaginationLabels {
  previous: string;
  next: string;
  /** Name of a dot, e.g. "Slide 2 of 4". */
  slide: (n: number, total: number) => string;
  /** Visible fraction, e.g. "1 / 2". */
  fraction: (n: number, total: number) => string;
}

export const CAROUSEL_PAGINATION_LABELS: CarouselPaginationLabels = {
  previous: "Previous slide",
  next: "Next slide",
  slide: (n, total) => `Slide ${n} of ${total}`,
  fraction: (n, total) => `${n} / ${total}`,
};

export const CAROUSEL_PAGINATION_DEFAULTS = { variant: "dots" } as const;

export interface CarouselPaginationProps {
  /** Zero-based index of the visible slide. */
  index: number;
  count: number;
  onPrevious: () => void;
  onNext: () => void;
  /** Dots only: show slide `i`. */
  onSelect?: (i: number) => void;
  /** Dots (Hero Banner) or Fraction (Banner [Wide]). */
  variant?: "dots" | "fraction";
  /** id of the slides container the buttons control. */
  controls?: string;
  labels?: CarouselPaginationLabels;
  className?: string;
}

const ARROW =
  "relative flex size-20 shrink-0 cursor-pointer items-center justify-center rounded-4 text-icon-accent hover:text-interactive-hover before:absolute before:-inset-y-12";

export function CarouselPagination({
  index,
  count,
  onPrevious,
  onNext,
  onSelect,
  variant = CAROUSEL_PAGINATION_DEFAULTS.variant,
  controls,
  labels = CAROUSEL_PAGINATION_LABELS,
  className,
}: CarouselPaginationProps) {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <button
        type="button"
        aria-label={labels.previous}
        aria-controls={controls}
        onClick={onPrevious}
        className={cn(ARROW, "before:right-0 before:-left-24")}
      >
        <Icon name="keyboard_arrow_left" tone="current" />
      </button>
      {variant === "fraction" ? (
        <p className="text-title-sm text-text-primary tabular-nums">
          {labels.fraction(index + 1, count)}
        </p>
      ) : (
        Array.from({ length: count }, (_, i) => (
          <button
            key={i}
            type="button"
            aria-label={labels.slide(i + 1, count)}
            aria-current={i === index ? "true" : undefined}
            aria-controls={controls}
            onClick={() => onSelect?.(i)}
            className={cn(
              "relative h-12 shrink-0 cursor-pointer rounded-full before:absolute before:-inset-x-2 before:-inset-y-16",
              i === index ? "w-36 bg-icon-accent" : "w-12 bg-icon-disabled hover:bg-icon-secondary",
            )}
          />
        ))
      )}
      <button
        type="button"
        aria-label={labels.next}
        aria-controls={controls}
        onClick={onNext}
        className={cn(ARROW, "before:-right-24 before:left-0")}
      >
        <Icon name="keyboard_arrow_right" tone="current" />
      </button>
    </div>
  );
}
