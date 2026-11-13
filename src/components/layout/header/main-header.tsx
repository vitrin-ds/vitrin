import NextLink from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui/badge/badge";
import { Icon } from "@/components/ui/icon/icon";
import { VisuallyHidden } from "@/components/ui/visually-hidden/visually-hidden";
import type { IconName } from "@/components/ui/icon/icon-names";

// Figma `Main Header [Search]` (30558:5175) on `.Base Main Header [Search]`: surface-accent,
// padding 16 · 52 from 1024px (16 all round below), gap 12. Desktop (68px): the logo (36 high),
// the Inner Search field (680px) and the Right actions in one row. Tablet / mobile (104px):
// menu trigger (dehaze) + the logo (24 high) and the Right actions on top, the Bottom Search field full
// width underneath. The `search` slot is rendered once and moves with CSS order, so the field
// never exists twice. Actions are `.Asset Main Header Item`s (MainHeaderAction): a 20px icon in
// icon-on-accent (Weight 200, Fill Off) with an optional label-medium label (labels show from 1024px), gap 4, 24 apart.

export interface MainHeaderLabels {
  /** Names the logo's home link. */
  home: string;
  /** Name of the menu trigger (Figma `.Asset Main Header Item [Menu Trigger]`). */
  menu: string;
}

export const MAIN_HEADER_LABELS: MainHeaderLabels = {
  home: "Home",
  menu: "Menu",
};

export const MAIN_HEADER_DEFAULTS = {
  homeHref: "/",
} as const;

export interface MainHeaderProps {
  /**
   * Figma `Logo`: the store's logo, the way home. 24px high below 1024px and 36px from there; the
   * link is named by `labels.home`: give an image logo alt="", and a text logo a label that
   * contains its text.
   */
  logo: ReactNode;
  /** Figma `Text Input [Inner Search]` / `[Bottom Search]`: the search field (Search & Autocomplete). */
  search?: ReactNode;
  /** Figma `Right`: MainHeaderAction items (store, account, wishlist, cart). */
  actions?: ReactNode;
  /**
   * Figma `Show .Asset Main Header Item [Menu Trigger]`: shows the hamburger below 1024px and is
   * called when it is pressed (the Header opens the Navigation Drawer).
   */
  onMenuClick?: () => void;
  /** Whether the menu the trigger opens is showing (aria-expanded). */
  menuExpanded?: boolean;
  homeHref?: string;
  labels?: MainHeaderLabels;
  className?: string;
}

/** Controls on surface-accent: global ring plus the on-accent inner ring. */
const ON_ACCENT_CONTROL = "relative flex cursor-pointer items-center rounded-4";

export function MainHeader({
  logo,
  search,
  actions,
  onMenuClick,
  menuExpanded,
  homeHref = MAIN_HEADER_DEFAULTS.homeHref,
  labels = MAIN_HEADER_LABELS,
  className,
}: MainHeaderProps) {
  return (
    <div className={cn("bg-surface-accent", className)}>
      <div className="mx-auto flex max-w-(--breakpoint-wide) flex-wrap items-center justify-between gap-12 p-16 desktop:flex-nowrap desktop:px-52">
        <div className="flex items-center gap-12">
          {onMenuClick && (
            <button
              type="button"
              aria-label={labels.menu}
              aria-haspopup="dialog"
              aria-expanded={menuExpanded}
              onClick={onMenuClick}
              className={cn(ON_ACCENT_CONTROL, "before:absolute before:-inset-12 desktop:hidden")}
            >
              <Icon name="dehaze" tone="on-accent" weight={200} fill={false} />
            </button>
          )}
          <NextLink
            href={homeHref}
            aria-label={labels.home}
            className={cn(ON_ACCENT_CONTROL, "w-80 desktop:w-120")}
          >
            {logo}
          </NextLink>
        </div>
        {search && (
          <div className="order-last basis-full desktop:order-none desktop:max-w-680 desktop:flex-1 desktop:basis-auto">
            {search}
          </div>
        )}
        {actions && <ul className="flex items-center justify-end gap-24">{actions}</ul>}
      </div>
    </div>
  );
}

export interface MainHeaderActionProps {
  /** Figma `Left Icon`. */
  icon: IconName;
  /** Figma `Label Text`; always the accessible name. */
  label: string;
  /** Hides the visible label (Figma `Show Label=false`); below 1024px labels are always hidden. */
  hideLabel?: boolean;
  /** Figma `Show Right Icon`: keyboard_arrow_down after the label, from 1024px. */
  chevron?: boolean;
  /** A link (store finder, account, wishlist) … */
  href?: string;
  /**
   * … or a button (e.g. opening the Mini Cart). With neither, the item is a static note (Figma
   * Checkout header "Secure Checkout"): not interactive, its label shown at every width.
   */
  onClick?: () => void;
  /** Figma `Show Badge`: an item count (cart). 0 hides the badge (Do: "only when items are present"). */
  count?: number;
  /** Accessible name with the count, e.g. "Cart, 3 items". */
  countLabel?: (label: string, count: number) => string;
}

export const MAIN_HEADER_ACTION_LABELS = {
  count: (label: string, count: number) => `${label}, ${count} ${count === 1 ? "item" : "items"}`,
};

/** Figma `.Asset Main Header Item`: one action in the Main Header's Right group. */
export function MainHeaderAction({
  icon,
  label,
  hideLabel = false,
  chevron = false,
  href,
  onClick,
  count,
  countLabel = MAIN_HEADER_ACTION_LABELS.count,
}: MainHeaderActionProps) {
  const hasCount = count !== undefined && count > 0;
  const name = count !== undefined ? countLabel(label, count) : label;
  const showsLabel = !hideLabel;
  if (!href && !onClick) {
    return (
      <li className="flex items-center gap-4 text-label-md text-text-on-accent">
        <Icon name={icon} tone="on-accent" weight={200} fill={false} />
        {showsLabel ? label : <VisuallyHidden>{label}</VisuallyHidden>}
        {chevron && <Icon name="keyboard_arrow_down" tone="on-accent" weight={200} fill={false} />}
      </li>
    );
  }
  const className = cn(
    ON_ACCENT_CONTROL,
    "group/action gap-4 text-label-md text-text-on-accent",
    // 20px glyph, 24px apart below desktop (Figma Faz 4): the hit area grows to a full 44×44
    // without overlapping its neighbours.
    "before:absolute before:-inset-x-12 before:-inset-y-12",
  );
  const content = (
    <>
      <span className="relative flex">
        <Icon name={icon} tone="on-accent" weight={200} fill={false} />
        {hasCount && (
          <Badge count={count} size="small" aria-hidden className="absolute -top-9 -right-9" />
        )}
      </span>
      {showsLabel && (
        <span
          aria-hidden
          className="hidden group-hover/action:underline group-focus-visible/action:underline desktop:inline"
        >
          {label}
        </span>
      )}
      {chevron && (
        <Icon
          name="keyboard_arrow_down"
          tone="on-accent"
          weight={200}
          fill={false}
          className="hidden desktop:inline-flex"
        />
      )}
      {/* The name comes from here, so it never disagrees with the visible label or "99+". */}
      <VisuallyHidden>{name}</VisuallyHidden>
    </>
  );
  return (
    <li className="flex">
      {href ? (
        <NextLink href={href} className={className}>
          {content}
        </NextLink>
      ) : (
        <button type="button" onClick={onClick} className={className}>
          {content}
        </button>
      )}
    </li>
  );
}
