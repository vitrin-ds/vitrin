"use client";

import { cva } from "class-variance-authority";
import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "../icon/icon";
import { Progress } from "../progress/progress";
import { useActiveSection } from "./use-active-section";

// Figma `TableOfContents` (Layout) for long-form pages, a <nav> of in-page anchor links built
// from the article's H2s, each with an anchor id:
// - Sidebar (`.Base.TableOfContents`, desktop): title (title-small), optional reading progress
//   (4px bar + label-small caption in text-tertiary), gap 16, then the `.TableOfContents.Item` rows.
// - Sticky Bar (`.Base.TableOfContents.Sticky`, tablet/mobile): surface-primary, 1px
//   border-default, radius 12, padding 12 / 16; caption (label-small, text-tertiary), the current
//   section (title-small) and a chevron; tapping it opens the full list (disclosure, Esc closes).
//   The page makes it sticky.
// `.TableOfContents.Item` (State): a 2px left rule, padding 8 / 12. Default (read, or not tracked)
// label-medium text-secondary · Active surface-secondary + border-accent, title-small text-primary,
// `aria-current="location"` · Upcoming (after the active one) label-medium text-tertiary.
// Without `activeId` the active section follows the scroll (useActiveSection).

export const tableOfContentsItemVariants = cva(
  "flex border-l-2 px-12 py-8 motion-safe:transition-colors",
  {
    variants: {
      state: {
        default:
          "border-border-default text-label-md text-text-secondary hover:text-text-primary focus-visible:text-text-primary",
        active: "border-border-accent bg-surface-secondary text-title-sm text-text-primary",
        upcoming:
          "border-border-default text-label-md text-text-tertiary hover:text-text-primary focus-visible:text-text-primary",
      },
      // Sticky Bar list (tablet/mobile): rows grow to the 44px touch target.
      touch: { true: "min-h-44 items-center", false: "" },
    },
  },
);

export type TableOfContentsItemState = "default" | "active" | "upcoming";

export interface TableOfContentsEntry {
  /** Anchor id of the section heading (an H2 of the article). */
  id: string;
  /** Figma `Label Text`: the heading text, shortened if needed. */
  label: string;
}

export interface TableOfContentsLabels {
  title: string;
  /** Sidebar caption under the progress bar. */
  progress: (percent: number, minutesLeft?: number) => string;
  /** Sticky Bar caption above the current section. */
  caption: (percent?: number) => string;
  /** Accessible name of the progress bar. */
  progressLabel: string;
}

export const TABLE_OF_CONTENTS_LABELS: TableOfContentsLabels = {
  title: "On this page",
  progress: (percent, minutesLeft) =>
    minutesLeft != null ? `${percent}% read · about ${minutesLeft} min left` : `${percent}% read`,
  caption: (percent) => (percent != null ? `On this page · ${percent}% read` : "On this page"),
  progressLabel: "Reading progress",
};

export const TABLE_OF_CONTENTS_DEFAULTS = { layout: "sidebar", headingLevel: 2 } as const;

export interface TableOfContentsProps {
  /** Sections, in page order (Figma: one level, up to 10). */
  items: readonly TableOfContentsEntry[];
  /**
   * Current section. Leave it out to follow the scroll position; `null` marks none (all Default).
   */
  activeId?: string | null;
  /** Figma `Layout`: Sidebar on desktop, Sticky Bar on tablet/mobile. */
  layout?: "sidebar" | "sticky-bar";
  /** Figma `Show Progress`: reading progress 0–100 (articles only, not legal/help lists). */
  progress?: number;
  /** Estimated minutes left, shown next to the progress. */
  minutesLeft?: number;
  /** Level of the Sidebar title. */
  headingLevel?: 2 | 3 | 4;
  labels?: TableOfContentsLabels;
  className?: string;
}

function itemState(index: number, activeIndex: number): TableOfContentsItemState {
  if (activeIndex < 0 || index < activeIndex) return "default";
  return index === activeIndex ? "active" : "upcoming";
}

export interface TableOfContentsItemProps {
  entry: TableOfContentsEntry;
  /** Figma `State`. */
  state?: TableOfContentsItemState;
  /** 44px rows for touch layouts. */
  touch?: boolean;
  onNavigate?: () => void;
}

/** Figma `.TableOfContents.Item`: one in-page link. */
export function TableOfContentsItem({
  entry,
  state = "default",
  touch = false,
  onNavigate,
}: TableOfContentsItemProps) {
  return (
    <li>
      <a
        href={`#${entry.id}`}
        aria-current={state === "active" ? "location" : undefined}
        onClick={onNavigate}
        className={tableOfContentsItemVariants({ state, touch })}
      >
        {entry.label}
      </a>
    </li>
  );
}

export function TableOfContents({
  items,
  activeId,
  layout = TABLE_OF_CONTENTS_DEFAULTS.layout,
  progress,
  minutesLeft,
  headingLevel = TABLE_OF_CONTENTS_DEFAULTS.headingLevel,
  labels = TABLE_OF_CONTENTS_LABELS,
  className,
}: TableOfContentsProps) {
  const id = useId();
  const spied = useActiveSection(
    items.map((item) => item.id),
    activeId === undefined,
  );
  const current = activeId === undefined ? spied : (activeId ?? undefined);
  const activeIndex = items.findIndex((item) => item.id === current);
  const percent = progress == null ? undefined : Math.round(Math.min(Math.max(progress, 0), 100));

  const bar = percent != null && (
    <Progress
      value={percent}
      size="4x"
      label={labels.progressLabel}
      valueText={labels.progress(percent, minutesLeft)}
    />
  );

  if (layout === "sticky-bar") {
    return (
      <StickyBar
        id={id}
        items={items}
        activeIndex={activeIndex}
        caption={labels.caption(percent)}
        title={labels.title}
        bar={bar}
        className={className}
      />
    );
  }

  const Heading = `h${headingLevel}` as const;
  return (
    <nav aria-labelledby={`${id}-title`} className={cn("flex flex-col gap-16", className)}>
      <Heading id={`${id}-title`} className="text-title-sm text-text-primary">
        {labels.title}
      </Heading>
      {percent != null && (
        <div className="flex flex-col gap-8">
          {bar}
          <p aria-hidden className="text-label-sm text-text-tertiary">
            {labels.progress(percent, minutesLeft)}
          </p>
        </div>
      )}
      <ol className="flex flex-col">
        {items.map((entry, i) => (
          <TableOfContentsItem key={entry.id} entry={entry} state={itemState(i, activeIndex)} />
        ))}
      </ol>
    </nav>
  );
}

interface StickyBarProps {
  id: string;
  items: readonly TableOfContentsEntry[];
  activeIndex: number;
  caption: string;
  title: string;
  bar: ReactNode;
  className?: string;
}

function StickyBar({ id, items, activeIndex, caption, title, bar, className }: StickyBarProps) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const currentLabel = (items[activeIndex] ?? items[0])?.label;

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "Escape" || !open) return;
    setOpen(false);
    buttonRef.current?.focus();
  };

  return (
    <nav
      aria-label={title}
      onKeyDown={onKeyDown}
      className={cn(
        "flex flex-col rounded-12 border border-border-default bg-surface-primary",
        className,
      )}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "flex cursor-pointer items-center gap-8 rounded-12 px-16 pt-12 text-left",
          bar ? "pb-8" : "pb-12",
        )}
      >
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-label-sm text-text-tertiary">{caption}</span>
          <span className="text-title-sm text-text-primary">{currentLabel}</span>
        </span>
        <Icon
          name="keyboard_arrow_right"
          tone="accent"
          className={cn("shrink-0 motion-safe:transition-transform", open && "rotate-90")}
        />
      </button>
      {bar && <div className="px-16 pb-12">{bar}</div>}
      <ol id={`${id}-list`} hidden={!open} className="flex flex-col px-16 pb-12">
        {items.map((entry, i) => (
          <TableOfContentsItem
            key={entry.id}
            entry={entry}
            state={itemState(i, activeIndex)}
            touch
            onNavigate={() => setOpen(false)}
          />
        ))}
      </ol>
    </nav>
  );
}
