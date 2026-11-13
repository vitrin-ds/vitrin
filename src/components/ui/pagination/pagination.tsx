import { cva } from "class-variance-authority";
import NextLink from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "../icon/icon";

// Figma `Pagination Bar` (composition of `.Asset Page`): an optional range text (label-large) on
// the left, then prev · pages · next as 36×36 items (radius 8, gap 8). Inactive page: surface-
// primary + 1px border-neutral, hover border interactive-hover. Active page: interactive-default
// fill, text-inverse, hover interactive-hover. Disabled: surface-disabled + border-disabled. Focus:
// a 2px interactive-focus-ring border (on the interactive-active fill when active). Pages are
// links (`?page=2`) so listings stay crawlable. The ellipsis is plain text, not a
// bordered item. ::before grows each item to a 44px hit area.

/** Figma Don't: "Don't show all pages if more than 7-8 — use truncation". */
export const PAGINATION_MAX_ITEMS = 7;

export type PaginationRangeItem = number | "ellipsis";

/** First and last page always, the current page with its neighbours, ellipses in the gaps. */
export function paginationRange(page: number, pageCount: number): PaginationRangeItem[] {
  if (pageCount <= PAGINATION_MAX_ITEMS) return Array.from({ length: pageCount }, (_, i) => i + 1);
  const edge = PAGINATION_MAX_ITEMS - 2; // pages shown next to one end, before the ellipsis
  if (page <= edge - 1) return [...range(1, edge), "ellipsis", pageCount];
  if (page >= pageCount - edge + 2)
    return [1, "ellipsis", ...range(pageCount - edge + 1, pageCount)];
  return [1, "ellipsis", page - 1, page, page + 1, "ellipsis", pageCount];
}

function range(from: number, to: number): number[] {
  return Array.from({ length: to - from + 1 }, (_, i) => from + i);
}

export const pageItemVariants = cva(
  [
    "relative flex size-36 items-center justify-center rounded-control text-label-lg tabular-nums",
    "before:absolute before:-inset-4",
  ],
  {
    variants: {
      state: {
        default:
          "bg-surface-primary text-text-primary inset-ring inset-ring-border-neutral hover:inset-ring-interactive-hover focus-visible:inset-ring-2 focus-visible:inset-ring-interactive-focus-ring",
        active:
          "bg-interactive-default text-text-inverse hover:bg-interactive-hover focus-visible:bg-interactive-active focus-visible:inset-ring-2 focus-visible:inset-ring-interactive-focus-ring",
        disabled:
          "cursor-not-allowed bg-surface-disabled text-text-disabled inset-ring inset-ring-border-disabled",
      },
    },
  },
);

export interface PaginationLabels {
  nav: string;
  previous: string;
  next: string;
  page: (page: number) => string;
}

export const PAGINATION_LABELS: PaginationLabels = {
  nav: "Pagination",
  previous: "Previous page",
  next: "Next page",
  page: (page) => `Page ${page}`,
};

export interface PaginationProps extends Omit<ComponentPropsWithoutRef<"nav">, "children"> {
  /** Current page, 1-based. */
  page: number;
  pageCount: number;
  /** URL of a page, e.g. `(p) => \`/c/skincare?page=${p}\``. */
  hrefFor: (page: number) => string;
  /** The range text on the left, e.g. "1–24 of 230". */
  rangeText?: ReactNode;
  labels?: PaginationLabels;
}

/** Figma Don't: "Don't use for fewer than 2 pages" — renders nothing then. */
export function Pagination({
  page,
  pageCount,
  hrefFor,
  rangeText,
  labels = PAGINATION_LABELS,
  className,
  ...props
}: PaginationProps) {
  if (pageCount < 2) return null;
  const current = Math.min(Math.max(page, 1), pageCount);

  return (
    <nav
      {...props}
      aria-label={labels.nav}
      className={cn("flex flex-wrap items-center justify-between gap-16", className)}
    >
      {rangeText && <p className="text-label-lg text-text-primary">{rangeText}</p>}
      <ol className="flex items-center gap-8">
        <li>
          <Step
            icon="keyboard_arrow_left"
            label={labels.previous}
            href={current > 1 ? hrefFor(current - 1) : undefined}
          />
        </li>
        {paginationRange(current, pageCount).map((item, i) =>
          item === "ellipsis" ? (
            <li
              key={`ellipsis-${i}`}
              aria-hidden
              className="flex size-36 items-center justify-center text-label-lg text-text-primary"
            >
              …
            </li>
          ) : (
            <li key={item}>
              <NextLink
                href={hrefFor(item)}
                aria-label={labels.page(item)}
                aria-current={item === current ? "page" : undefined}
                className={pageItemVariants({ state: item === current ? "active" : "default" })}
              >
                {item}
              </NextLink>
            </li>
          ),
        )}
        <li>
          <Step
            icon="keyboard_arrow_right"
            label={labels.next}
            href={current < pageCount ? hrefFor(current + 1) : undefined}
          />
        </li>
      </ol>
    </nav>
  );
}

/** Prev / next: a link, or a disabled placeholder at the ends. */
function Step({
  icon,
  label,
  href,
}: {
  icon: "keyboard_arrow_left" | "keyboard_arrow_right";
  label: string;
  href?: string;
}) {
  const glyph = <Icon name={icon} size="16" tone="current" />;
  if (!href) {
    return (
      <span
        role="link"
        aria-disabled="true"
        aria-label={label}
        className={pageItemVariants({ state: "disabled" })}
      >
        {glyph}
      </span>
    );
  }
  return (
    <NextLink href={href} aria-label={label} className={pageItemVariants({ state: "default" })}>
      {glyph}
    </NextLink>
  );
}
