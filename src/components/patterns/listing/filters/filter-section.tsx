"use client";

import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/icon/icon";
import { LinkButton } from "@/components/ui/link/link";

// Figma `.Asset.Filter Panel Title` + `Filter Panel` (PLP WD.04.01.02, Filter Section [Brands] …):
// one collapsible section of the desktop filter sidebar. A 2px border-neutral rule on top, then
// the title row (padding 16, gap 4: title-medium text-primary, the optional "Clear" link in
// label-small text-secondary, the 20px remove / add indicator in icon-primary), then the panel
// and 12 below it. No fill: the sections sit on the page surface (Figma). APG disclosure: the
// title is a button (aria-expanded, aria-controls) whose ::after covers the row, so the whole row
// toggles; Clear sits above that layer and stays its own control.

/**
 * The 2px border-neutral rule on top of a sidebar section, drawn inside its box (Figma strokes are
 * inside: the section keeps its Figma height).
 */
export const FILTER_SECTION_RULE =
  "relative before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-2 before:bg-border-neutral";

export interface FilterSectionProps {
  title: string;
  /** Starts open. */
  defaultOpen?: boolean;
  /** "Clear" for this section, shown when it has applied filters. */
  clear?: { label: string; name: string; onClick: () => void };
  /** The panel adds the 16 inset of `.Asset.Filter Item` rows (off for rows that pad themselves). */
  inset?: boolean;
  headingLevel?: 2 | 3 | 4;
  children: ReactNode;
  className?: string;
}

export function FilterSection({
  title,
  defaultOpen = true,
  clear,
  inset = true,
  headingLevel = 3,
  children,
  className,
}: FilterSectionProps) {
  const id = useId();
  const [open, setOpen] = useState(defaultOpen);
  const Heading = `h${headingLevel}` as const;
  return (
    <section className={cn(FILTER_SECTION_RULE, "pb-12", className)}>
      <div className="relative flex items-center gap-4 p-16">
        <Heading className="min-w-0 flex-1 text-title-md text-text-primary">
          <button
            type="button"
            aria-expanded={open}
            aria-controls={`${id}-panel`}
            onClick={() => setOpen(!open)}
            className="cursor-pointer rounded-4 text-left after:absolute after:inset-0"
          >
            {title}
          </button>
        </Heading>
        {clear && (
          <LinkButton
            size="xs"
            variant="secondary"
            aria-label={clear.name}
            onClick={clear.onClick}
            className="z-10"
          >
            {clear.label}
          </LinkButton>
        )}
        <Icon name={open ? "remove" : "add"} fill={open} tone="primary" />
      </div>
      <div id={`${id}-panel`} hidden={!open} className={cn(inset && "px-16")}>
        {children}
      </div>
    </section>
  );
}
