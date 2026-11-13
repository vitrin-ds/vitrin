"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/cn";
import { MegaMenuLinkItem } from "./mega-menu-link-item";
import { MegaMenuTitleItem } from "./mega-menu-title-item";
import type {
  MegaMenuAside,
  MegaMenuContent,
  MegaMenuGroup,
  MegaMenuShowcaseSection,
} from "./header-types";

// Figma Mega Menu compositions (30403:158192): a full-width raised panel under the Navigation Bar.
// Links Only (30677:8834) is link columns; Trending Product (30677:11642) and Trending Brand
// (30677:12496) Showcase add the `aside`, a 600px (brands: 524px) surface-tertiary zone (padding 20, gap 12) with a
// Title Item over its cards; Subcategory Showcase (30621:14514) swaps the columns for a sidebar of
// Title Items (210px, border-r, the selected one on surface-secondary with the arrow) next to that
// section's Card.Category.Horizontal grid (padding 20). The sidebar is a vertical tablist (APG
// Tabs, automatic activation): hover, focus or arrow keys select a section. Body padding 0 · 52 (0 · 40 with an aside); each `Column` takes an
// equal share, padding 20 · 20 · 40, gap 20 between Link Groups, a 1px border-neutral between
// columns. Link Group (gap 8): a MegaMenuTitleItem over MegaMenuLinkItems (Default, then the Small
// action links with the arrow). `Menu Footer`: surface-secondary,
// a 1px border-default on top, padding 12 · 52. The panel has a 1px border-neutral top edge, so
// the column dividers meet a line under the Navigation Bar. Raised surface + shadow-md (raised surfaces always carry a shadow; Figma
// draws surface-primary). Group titles are not headings, so a menu never adds to the page outline;
// each list is labelled by its title.

export interface MegaMenuProps extends MegaMenuContent {
  /** id for the Navigation Bar button's aria-controls. */
  id?: string;
  className?: string;
}

export function MegaMenu({ id, columns, aside, showcase, footer, className }: MegaMenuProps) {
  return (
    // border-t: the columns' vertical dividers start at a line, not in mid-air.
    <div
      id={id}
      className={cn("border-t border-border-neutral bg-surface-raised shadow-md", className)}
    >
      <div className={cn("mx-auto flex max-w-(--breakpoint-wide)", aside ? "px-40" : "px-52")}>
        {showcase ? (
          <MegaMenuShowcase sections={showcase} />
        ) : (
          columns.map((column, i) => (
            <div
              key={column.map((group) => group.id).join("-") || i}
              className="flex min-w-0 flex-1 flex-col gap-20 border-l border-border-neutral px-20 pt-20 pb-40 first:border-l-0"
            >
              {column.map((group) => (
                <MegaMenuLinkGroup key={group.id} group={group} />
              ))}
            </div>
          ))
        )}
        {aside && <MegaMenuAsideZone aside={aside} />}
      </div>
      {footer && (
        <div className="border-t border-border-default bg-surface-secondary">
          <p className="mx-auto max-w-(--breakpoint-wide) px-52 py-12 text-label-md text-text-accent">
            {footer}
          </p>
        </div>
      )}
    </div>
  );
}

function MegaMenuAsideZone({ aside }: { aside: MegaMenuAside }) {
  const titleId = useId();
  return (
    <section
      aria-labelledby={titleId}
      className={cn(
        "flex shrink-0 flex-col gap-12 bg-surface-tertiary p-20",
        aside.size === "brands" ? "w-524" : "w-600",
      )}
    >
      <MegaMenuTitleItem id={titleId} label={aside.title} />
      {aside.content}
    </section>
  );
}

function MegaMenuShowcase({ sections }: { sections: readonly MegaMenuShowcaseSection[] }) {
  const baseId = useId();
  const [selected, setSelected] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const select = (index: number) => {
    const next = (index + sections.length) % sections.length;
    setSelected(next);
    tabs.current[next]?.focus();
  };
  const onKeyDown = (event: KeyboardEvent) => {
    const keys: Record<string, number> = {
      ArrowDown: selected + 1,
      ArrowUp: selected - 1,
      Home: 0,
      End: sections.length - 1,
    };
    if (!(event.key in keys)) return;
    event.preventDefault();
    select(keys[event.key]!);
  };
  const current = sections[selected];
  return (
    <>
      <div
        role="tablist"
        aria-orientation="vertical"
        onKeyDown={onKeyDown}
        className="flex w-210 shrink-0 flex-col gap-4 border-r border-border-neutral py-20 pr-12"
      >
        {sections.map((section, i) => (
          <MegaMenuTitleItem
            as="button"
            key={section.id}
            ref={(node: HTMLButtonElement | null) => {
              tabs.current[i] = node;
            }}
            role="tab"
            id={`${baseId}-tab-${section.id}`}
            label={section.title}
            chevron={!section.hideRightIcon}
            selected={i === selected}
            aria-selected={i === selected}
            aria-controls={`${baseId}-panel`}
            tabIndex={i === selected ? 0 : -1}
            onMouseEnter={() => setSelected(i)}
            onFocus={() => setSelected(i)}
          />
        ))}
      </div>
      {current && (
        <div
          role="tabpanel"
          id={`${baseId}-panel`}
          aria-labelledby={`${baseId}-tab-${current.id}`}
          className="min-w-0 flex-1 p-20"
        >
          {current.content}
        </div>
      )}
    </>
  );
}

function MegaMenuLinkGroup({ group }: { group: MegaMenuGroup }) {
  const titleId = useId();
  return (
    <div className="flex flex-col gap-8">
      <MegaMenuTitleItem id={titleId} label={group.title} />
      <ul aria-labelledby={titleId} className="flex flex-col">
        {group.links.map((link) => (
          <li key={link.id}>
            <MegaMenuLinkItem href={link.href} label={link.label} />
          </li>
        ))}
        {group.actions?.map((link) => (
          <li key={link.id}>
            <MegaMenuLinkItem
              href={link.href}
              label={link.label}
              size="sm"
              chevron={!link.hideRightIcon}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
