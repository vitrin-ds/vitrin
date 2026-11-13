import NextLink from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "../icon/icon";

// Figma `Breadcrumb` (single layer): a 20px `home` glyph (weight 200, fill off) as the first node,
// 12px keyboard_arrow_right separators, pill nodes (label-medium, px 8 · py 2, 1px border-neutral,
// radius full) and the current page as an accent pill. Gap 4. Figma draws no hover / focus: hover
// uses the interactive-hover border like the other bordered controls; keyboard focus looks the same.
// Pills are 20px tall, so ::before grows each link's hit area to 44px.

export interface BreadcrumbItem {
  /** Figma `Node [n] Text`. */
  label: string;
  href: string;
}

export interface BreadcrumbProps extends Omit<ComponentPropsWithoutRef<"nav">, "children"> {
  /** Figma Node [2]…[4]: the ancestors between Home and the current page (Figma: up to 5 levels in all). */
  items: readonly BreadcrumbItem[];
  /** Figma `Active Node Text`: the current page, not a link. */
  current: string;
  /** Link of the Home node. */
  homeHref?: string;
  /** Accessible name of the Home node (it has no visible text). */
  homeLabel?: string;
  /** Accessible name of the landmark. */
  label?: string;
}

export const BREADCRUMB_DEFAULTS = {
  homeHref: "/",
  homeLabel: "Home",
  label: "Breadcrumb",
} as const;

const HIT_AREA = "relative before:absolute before:inset-x-0 before:-inset-y-12";

export function Breadcrumb({
  items,
  current,
  homeHref = BREADCRUMB_DEFAULTS.homeHref,
  homeLabel = BREADCRUMB_DEFAULTS.homeLabel,
  label = BREADCRUMB_DEFAULTS.label,
  className,
  ...props
}: BreadcrumbProps) {
  return (
    <nav {...props} aria-label={label} className={className}>
      <ol className="flex flex-wrap items-center gap-4">
        <li className="flex items-center gap-4">
          <NextLink
            href={homeHref}
            aria-label={homeLabel}
            className={cn(
              "flex rounded-4 text-icon-accent hover:text-interactive-hover focus-visible:text-interactive-hover",
              "relative before:absolute before:-inset-12",
            )}
          >
            <Icon name="home" weight={200} fill={false} tone="current" />
          </NextLink>
          <Separator />
        </li>
        {items.map((item) => (
          <li key={item.href} className="flex items-center gap-4">
            <NextLink
              href={item.href}
              className={cn(
                "rounded-full bg-surface-primary px-8 py-2 text-label-md text-text-primary",
                "inset-ring inset-ring-border-neutral hover:inset-ring-interactive-hover focus-visible:inset-ring-interactive-hover",
                HIT_AREA,
              )}
            >
              {item.label}
            </NextLink>
            <Separator />
          </li>
        ))}
        <li>
          <span
            aria-current="page"
            className="block rounded-full bg-surface-accent px-8 py-2 text-label-md text-text-on-accent"
          >
            {current}
          </span>
        </li>
      </ol>
    </nav>
  );
}

function Separator() {
  return <Icon name="keyboard_arrow_right" size="sm" tone="secondary" />;
}
