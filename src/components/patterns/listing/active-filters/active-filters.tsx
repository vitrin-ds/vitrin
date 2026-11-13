"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Chip } from "@/components/ui/chip/chip";
import { LinkButton } from "@/components/ui/link/link";
import { VisuallyHidden } from "@/components/ui/visually-hidden/visually-hidden";
import { cn } from "@/lib/cn";

// Active filters (PLP frames; Figma has only the Filter Panel Assets): a ".Asset.Filter Panel
// Title" row (title + Clear all) over a wrapping row of Light chips with a cancel button, gap 8.
// Built from Chip and LinkButton (Clear all is drawn as a link but is an action, not navigation). Rules from the Figma Do / Don't:
// - every applied filter is a removable chip; labels wrap, never truncate;
// - Clear all only from 2 applied filters;
// - removing a chip moves focus to the next chip (or, when none are left, the status that says
//   so), so keyboard users never land on <body>; a polite status announces the new count.
// Layout Stacked (sidebar, 31511:16637): the title row over the chips. Layout Inline (PLP
// tablet / mobile Selected Filters, 31066:254028): one wrapping row, py 16 · px 12 · gap 8, the
// title as a "Selected:" label (title-small) before the chips and Clear all after them.

export interface ActiveFilterItem {
  /** Stable id, passed back to `onRemove`. */
  id: string;
  /** Chip text, e.g. "Red" or "€25 – €50". Under 20 characters (Chip). */
  label: string;
}

export interface ActiveFiltersLabels {
  heading: string;
  clearAll: string;
  /** Accessible name of Clear all. */
  clearAllName: string;
  /** Name of the chip list. */
  list: string;
  /** Layout Inline: the label before the chips. Defaults to "Selected:". */
  inlineHeading?: string;
  /** Status after a change, e.g. "3 filters applied". */
  status: (count: number) => string;
  /** Name of a chip's remove button: "Remove filter: Red". */
  remove: (label: string) => string;
}

export const ACTIVE_FILTERS_LABELS: ActiveFiltersLabels = {
  heading: "Selected filters",
  inlineHeading: "Selected:",
  clearAll: "Clear all",
  clearAllName: "Clear all filters",
  list: "Applied filters",
  status: (count) =>
    count === 0 ? "No filters applied" : `${count} ${count === 1 ? "filter" : "filters"} applied`,
  remove: (label) => `Remove filter: ${label}`,
};

/** Figma Do: "Offer Clear all when 2+ filters are applied". */
export const ACTIVE_FILTERS_DEFAULTS = {
  clearAllFrom: 2,
  headingLevel: 3,
  layout: "stacked",
} as const;

export type ActiveFiltersLayout = "stacked" | "inline";

export interface ActiveFiltersProps {
  items: readonly ActiveFilterItem[];
  onRemove: (id: string) => void;
  onClearAll: () => void;
  /** Stacked (title row over the chips, sidebar) or Inline (one row, above the grid). */
  layout?: ActiveFiltersLayout;
  /** Hides the heading row text visually (the list keeps its name), e.g. above the grid. */
  hideHeading?: boolean;
  headingLevel?: 2 | 3 | 4;
  labels?: ActiveFiltersLabels;
  className?: string;
}

export function ActiveFilters({
  items,
  onRemove,
  onClearAll,
  layout = ACTIVE_FILTERS_DEFAULTS.layout,
  hideHeading = false,
  headingLevel = ACTIVE_FILTERS_DEFAULTS.headingLevel,
  labels = ACTIVE_FILTERS_LABELS,
  className,
}: ActiveFiltersProps) {
  const id = useId();
  const listRef = useRef<HTMLUListElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const emptyRef = useRef<HTMLDivElement>(null);
  /** Index to focus once the parent has removed the item(s). */
  const pendingFocus = useRef<number | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const Heading = `h${headingLevel}` as const;

  // After a removal: the chip now at the same index, else the last one, else the heading.
  useEffect(() => {
    const index = pendingFocus.current;
    if (index === null) return;
    pendingFocus.current = null;
    const buttons = listRef.current?.querySelectorAll<HTMLButtonElement>("li button") ?? [];
    const target = buttons[Math.min(index, buttons.length - 1)];
    (target ?? headingRef.current ?? emptyRef.current)?.focus();
  }, [items]);

  function remove(index: number, itemId: string) {
    onRemove(itemId);
    pendingFocus.current = index;
    setAnnouncement(labels.status(items.length - 1));
  }

  function clearAll() {
    onClearAll();
    pendingFocus.current = 0;
    setAnnouncement(labels.status(0));
  }

  const status = (
    <VisuallyHidden role="status" aria-live="polite">
      {announcement}
    </VisuallyHidden>
  );

  // Nothing applied: only the status remains; it takes focus after the last chip goes, so focus
  // never falls back to <body>.
  if (items.length === 0) {
    return (
      <div ref={emptyRef} tabIndex={-1}>
        {status}
      </div>
    );
  }

  const chips = (
    <ul ref={listRef} aria-label={labels.list} className="flex flex-wrap gap-8">
      {items.map((item, index) => (
        <li key={item.id} className="flex">
          <Chip
            color="light"
            onRemove={() => remove(index, item.id)}
            labels={{ remove: labels.remove }}
          >
            {item.label}
          </Chip>
        </li>
      ))}
    </ul>
  );
  const clearAllLink = items.length >= ACTIVE_FILTERS_DEFAULTS.clearAllFrom && (
    <LinkButton
      variant={layout === "inline" ? "neutral" : "secondary"}
      size={layout === "inline" ? "default" : "xs"}
      aria-label={labels.clearAllName}
      onClick={clearAll}
    >
      {labels.clearAll}
    </LinkButton>
  );

  if (layout === "inline") {
    return (
      <section
        aria-labelledby={`${id}-heading`}
        className={cn("flex flex-wrap items-center gap-8 px-12 py-16", className)}
      >
        <Heading
          ref={headingRef}
          id={`${id}-heading`}
          tabIndex={-1}
          className="rounded-4 text-title-sm text-text-primary"
        >
          <span aria-hidden>{labels.inlineHeading ?? ACTIVE_FILTERS_LABELS.inlineHeading}</span>
          <span className="sr-only">{labels.heading}</span>
        </Heading>
        {chips}
        {clearAllLink}
        {status}
      </section>
    );
  }

  return (
    // Stacked (Figma Selected Filters): the `.Asset.Filter Panel Title` row (padding 16), then the
    // chips 12 below it (px 16) and 16 under them.
    <section
      aria-labelledby={`${id}-heading`}
      className={cn("flex flex-col gap-12 pb-16", className)}
    >
      <div className="flex items-center gap-4 p-16">
        <Heading
          ref={headingRef}
          id={`${id}-heading`}
          tabIndex={-1}
          className={hideHeading ? "sr-only" : "flex-1 rounded-4 text-title-md text-text-primary"}
        >
          {labels.heading}
        </Heading>
        {clearAllLink}
      </div>
      <div className="px-16">{chips}</div>
      {status}
    </section>
  );
}
