"use client";

import { Children, useId, type ReactNode } from "react";
import {
  SLIDER_PAGINATION_LABELS,
  type SliderPaginationLabels,
} from "@/components/ui/pagination/slider-pagination";
import { cn } from "@/lib/cn";
import {
  SectionHeader,
  type SectionHeaderAction,
  type SectionHeaderProps,
} from "../section-header/section-header";
import { CardRail } from "./card-rail";

// The card rails of Home 07 (New Arrivals 30198:193329, Your Daily Edit 30198:193542): the
// section Title, a horizontal list of cards (Card.Product.Vertical, ~262 wide, gap 8; the list
// runs past the content edge) and the Slider Pagination Bar (gap 20 above it). Same approach as
// Recently Viewed, generalised: any cards come in as children, so a Server Component can render
// them and only the scrolling (CardRail) is client code.
//
// Accessibility: a <section> named by its heading holding the rail's plain list (see CardRail).

export type ProductCarouselLabels = SliderPaginationLabels;

export const PRODUCT_CAROUSEL_LABELS: ProductCarouselLabels = {
  ...SLIDER_PAGINATION_LABELS,
  progress: "Carousel position",
  previous: "Scroll back",
  next: "Scroll forward",
};

export interface ProductCarouselProps {
  /** Section heading (h2). */
  title: string;
  /** Figma body text under the title. */
  description?: string;
  /** Figma `Options`: the link to the full list ("View All"). */
  action?: SectionHeaderAction;
  /** Section Header size: Large on Home (default), Medium in a narrower column (Intermediary). */
  headerSize?: Extract<SectionHeaderProps["size"], "lg" | "md">;
  /** The cards, one per list item, in order. */
  children: ReactNode;
  /**
   * `page` (Home): the rail bleeds to the viewport edges and fits five cards across the content
   * width from 1024px. `inline` (default): the rail stays in its column, 260-wide cards.
   */
  layout?: "inline" | "page";
  /** Cards across the content width on a `page` rail from 1024px: 5 (Home) or 6 (PDP). */
  perRow?: 5 | 6;
  /** Gap between the title, the list and the bar: Medium 20 (Home) or Small 8 (PDP 06.01). */
  gap?: "md" | "sm";
  /** `desktop`: no Slider Pagination Bar below 1024px (PDP: Figma WM hides it). */
  pagination?: "always" | "desktop";
  labels?: ProductCarouselLabels;
  className?: string;
}

export function ProductCarousel({
  title,
  description,
  action,
  headerSize = "lg",
  children,
  layout = "inline",
  perRow = 5,
  gap = "md",
  pagination = "always",
  labels = PRODUCT_CAROUSEL_LABELS,
  className,
}: ProductCarouselProps) {
  const id = useId();
  const titleId = `${id}-title`;
  if (Children.toArray(children).length === 0) return null;

  return (
    <section
      aria-labelledby={titleId}
      className={cn("flex flex-col", gap === "sm" ? "gap-8" : "gap-20", className)}
    >
      <SectionHeader
        id={titleId}
        title={title}
        description={description}
        action={action}
        size={headerSize}
      />
      <CardRail
        labels={labels}
        layout={layout}
        gap={gap}
        pagination={pagination}
        itemWidth={layout === "page" ? (perRow === 6 ? "sixth" : "fifth") : "md"}
      >
        {children}
      </CardRail>
    </section>
  );
}
