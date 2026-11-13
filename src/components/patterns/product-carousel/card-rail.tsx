"use client";

import { cva, type VariantProps } from "class-variance-authority";
import {
  Children,
  isValidElement,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  SLIDER_PAGINATION_LABELS,
  SliderPagination,
  type SliderPaginationLabels,
} from "@/components/ui/pagination/slider-pagination";
import { cn } from "@/lib/cn";

// The scrolling part of a card carousel: a horizontal list of cards and the Slider Pagination
// Bar under it once the list overflows. Product Carousel puts a Section Header above it; the
// account overview (Figma WD.03.P002 Rewards / Saved) puts it in an Account Section.
// - Item width: Medium 260 (Card.Product.Vertical on Home), Small 180 (Card.Rewards), Third: three
//   product cards across the account column (Figma 240 · 232 · 211), Review 334 (Card.UserReview,
//   PDP 06.01), Sixth: six product cards across the content width from 1024px, 252 below (PDP
//   "You may also like", Figma 220 · 252).
// - Pagination: `always`, or `desktop` (PDP reviews: Figma hides the bar below 1024px).
// - Gap (list → bar): Medium 20 (Home), Small 8 (account).
// - Layout: `inline` keeps the list in its column; `page` (Home, Figma List [Cards]) bleeds it to
//   the viewport edges, so scrolled cards stay visible left and right, while the first card lines
//   up with the content column; from 1024px five cards fill the content width.
//
// Accessibility: a plain list (a scroller, not a rotating carousel; nothing moves on its own).
// Every card link is in the tab order and focusing one scrolls it into view, so the rail needs no
// keyboard handling; the arrows are a pointer convenience. Touch users swipe (scroll-snap). Arrow
// scrolling is instant with reduced motion.

export const cardRailVariants = cva("flex flex-col", {
  variants: {
    gap: { md: "gap-20", sm: "gap-8" },
  },
});

export const cardRailItemVariants = cva("flex shrink-0 snap-start", {
  variants: {
    itemWidth: {
      md: "w-260",
      sm: "w-180",
      third: "w-240 tablet:w-232 desktop:w-211",
      // Five across the content width from 1024px; 260 below.
      fifth: "w-260 desktop:rail-item-fifth",
      sixth: "w-252 desktop:rail-item-sixth",
      review: "w-334",
    },
  },
});

export const cardRailListVariants = cva(
  // No native scrollbar: the Slider Pagination Bar under the list shows the position. `relative`
  // contains absolutely positioned card parts (sr-only text), so they can't widen the page.
  "relative scrollbar-none flex snap-x snap-mandatory gap-8 overflow-x-auto overscroll-x-contain",
  {
    variants: {
      layout: { inline: "", page: "rail-bleed" },
    },
  },
);

export const CARD_RAIL_DEFAULTS = {
  gap: "md",
  itemWidth: "md",
  layout: "inline",
} as const satisfies Required<
  VariantProps<typeof cardRailVariants> &
    VariantProps<typeof cardRailItemVariants> &
    VariantProps<typeof cardRailListVariants>
>;

export interface CardRailProps {
  /** The cards, one per list item, in order. */
  children: ReactNode;
  itemWidth?: NonNullable<VariantProps<typeof cardRailItemVariants>["itemWidth"]>;
  gap?: NonNullable<VariantProps<typeof cardRailVariants>["gap"]>;
  /** `desktop`: the Slider Pagination Bar shows from 1024px only. */
  pagination?: "always" | "desktop";
  /** `page`: bleeds to the viewport edges (a rail on the page width, e.g. Home). */
  layout?: NonNullable<VariantProps<typeof cardRailListVariants>["layout"]>;
  labels?: SliderPaginationLabels;
  /**
   * Names the list and makes it focusable, for cards with nothing focusable inside
   * (Card.Rewards): keyboard users then scroll it with the arrow keys.
   */
  label?: string;
  className?: string;
}

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

export function CardRail({
  children,
  itemWidth = CARD_RAIL_DEFAULTS.itemWidth,
  gap = CARD_RAIL_DEFAULTS.gap,
  layout = CARD_RAIL_DEFAULTS.layout,
  pagination = "always",
  labels = SLIDER_PAGINATION_LABELS,
  label,
  className,
}: CardRailProps) {
  const railRef = useRef<HTMLUListElement>(null);
  const [position, setPosition] = useState({ current: 1, total: 1 });
  const items = Children.toArray(children);

  /** One scroll step = one card + the gap, read from the layout. */
  const stepSize = useCallback(() => {
    const cards = railRef.current?.children;
    if (!cards || cards.length < 2) return 0;
    return (cards[1] as HTMLElement).offsetLeft - (cards[0] as HTMLElement).offsetLeft;
  }, []);

  const measure = useCallback(() => {
    const rail = railRef.current;
    const step = stepSize();
    if (!rail || step <= 0) return setPosition({ current: 1, total: 1 });
    const overflow = Math.max(rail.scrollWidth - rail.clientWidth, 0);
    const total = Math.ceil(overflow / step) + 1;
    const current = Math.min(Math.round(rail.scrollLeft / step) + 1, total);
    setPosition((prev) =>
      prev.current === current && prev.total === total ? prev : { current, total },
    );
  }, [stepSize]);

  useEffect(() => {
    measure();
    if (typeof ResizeObserver !== "function" || !railRef.current) return;
    const observer = new ResizeObserver(measure);
    observer.observe(railRef.current);
    return () => observer.disconnect();
  }, [measure, items.length]);

  function scrollBySteps(direction: 1 | -1) {
    const rail = railRef.current;
    if (!rail) return;
    const reduce =
      typeof window.matchMedia === "function" && window.matchMedia(REDUCED_MOTION).matches;
    rail.scrollBy({ left: direction * stepSize(), behavior: reduce ? "auto" : "smooth" });
  }

  if (items.length === 0) return null;

  return (
    <div className={cn(cardRailVariants({ gap }), className)}>
      <ul
        ref={railRef}
        onScroll={measure}
        // Cards without links (Card.Rewards) leave nothing to focus: the list itself takes focus
        // so keyboard users can scroll it (WCAG 2.1.1, axe scrollable-region-focusable).
        tabIndex={label ? 0 : undefined}
        aria-label={label}
        className={cardRailListVariants({ layout })}
      >
        {items.map((item, i) => (
          <li
            key={isValidElement(item) && item.key !== null ? item.key : i}
            className={cardRailItemVariants({ itemWidth })}
          >
            {item}
          </li>
        ))}
      </ul>
      {/* Server HTML has total 1: the bar appears once the rail is measured and overflows. */}
      {position.total > 1 && (
        <SliderPagination
          current={position.current}
          total={position.total}
          onPrevious={() => scrollBySteps(-1)}
          onNext={() => scrollBySteps(1)}
          labels={labels}
          className={pagination === "desktop" ? "hidden desktop:flex" : undefined}
        />
      )}
    </div>
  );
}
